"use server";

import { getProjectAccessContext } from "@/lib/effective-user";
import { prisma } from "@/lib/prisma";
import {
  getSprintDefaultName,
  MAX_ACTIVE_SPRINT_TASKS,
  SPRINT_TYPE_VALUES,
  SprintTypeValue,
} from "@/lib/sprint";
import { Sprint, SprintType } from "@prisma/client";
import { z } from "zod";

const startSprintSchema = z.object({
  projectId: z.string(),
  name: z.string().trim().min(1, "Sprint name is required"),
  sprintType: z.enum(SPRINT_TYPE_VALUES),
  durationDays: z.union([z.literal(7), z.literal(14), z.literal(30)]),
  primaryGoal: z.string().trim().optional(),
  targetMetric: z.string().trim().optional(),
  taskIds: z
    .array(z.string())
    .max(
      MAX_ACTIVE_SPRINT_TASKS,
      `A sprint can include at most ${MAX_ACTIVE_SPRINT_TASKS} tasks.`,
    )
    .default([]),
});

export type StartSprintInput = z.infer<typeof startSprintSchema>;

const updateSprintSchema = z.object({
  projectId: z.string(),
  sprintId: z.string(),
  name: z.string().trim().min(1, "Sprint name is required"),
  sprintType: z.enum(SPRINT_TYPE_VALUES),
  durationDays: z.union([z.literal(7), z.literal(14), z.literal(30)]),
  primaryGoal: z.string().trim().optional(),
  targetMetric: z.string().trim().optional(),
});

export type UpdateSprintInput = z.infer<typeof updateSprintSchema>;

async function getProjectAccess(projectId: string) {
  const access = await getProjectAccessContext(projectId);
  if ("error" in access) {
    return access;
  }

  return {
    userId: access.effectiveUserId,
    isAdmin: access.isAdmin,
  };
}

async function expireSprintIfNeeded(sprint: Sprint): Promise<Sprint | null> {
  if (sprint.status !== "ACTIVE" || sprint.endDate >= new Date()) {
    return sprint;
  }

  await prisma.sprint.update({
    where: { id: sprint.id },
    data: { status: "COMPLETED" },
  });

  return null;
}

export type InitialSprintConfig = {
  name: string;
  sprintType: SprintTypeValue;
  durationDays: 7 | 14 | 30;
  primaryGoal?: string;
  targetMetric?: string;
  taskIds?: string[];
};

export async function createActiveSprintForProject(
  projectId: string,
  config: InitialSprintConfig,
) {
  const sprintCount = await prisma.sprint.count({
    where: { projectId },
  });
  const startDate = new Date();
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + config.durationDays);

  return prisma.sprint.create({
    data: {
      projectId,
      name: config.name,
      sprintType: config.sprintType as SprintType,
      weekNumber: sprintCount + 1,
      durationDays: config.durationDays,
      primaryGoal: config.primaryGoal || null,
      targetMetric: config.targetMetric || null,
      taskIds: config.taskIds ?? [],
      startDate,
      endDate,
      status: "ACTIVE",
    },
  });
}

export function getDefaultInitialSprintConfig(options?: {
  primaryGoal?: string;
  targetMetric?: string;
}): InitialSprintConfig {
  return {
    name: getSprintDefaultName("LAUNCH", 1),
    sprintType: "LAUNCH",
    durationDays: 7,
    primaryGoal: options?.primaryGoal,
    targetMetric: options?.targetMetric,
    taskIds: [],
  };
}

export async function autoAssignTaskToActiveSprint(projectId: string, taskId: string) {
  const sprint = await prisma.sprint.findFirst({
    where: { projectId, status: "ACTIVE" },
    orderBy: { createdAt: "desc" },
  });

  if (!sprint) return;

  const active = await expireSprintIfNeeded(sprint);
  if (!active || active.taskIds.includes(taskId)) return;
  if (active.taskIds.length >= MAX_ACTIVE_SPRINT_TASKS) return;

  await prisma.sprint.update({
    where: { id: active.id },
    data: { taskIds: [...active.taskIds, taskId] },
  });
}

export const getActiveSprint = async (projectId: string) => {
  try {
    const access = await getProjectAccess(projectId);
    if ("error" in access) {
      return { success: false, message: access.error };
    }

    const [sprint, sprintCount] = await Promise.all([
      prisma.sprint.findFirst({
        where: { projectId, status: "ACTIVE" },
        orderBy: { createdAt: "desc" },
      }),
      prisma.sprint.count({ where: { projectId } }),
    ]);

    if (!sprint) {
      return { success: true, sprint: null, nextWeekNumber: sprintCount + 1 };
    }

    const active = await expireSprintIfNeeded(sprint);
    return {
      success: true,
      sprint: active,
      nextWeekNumber: sprintCount + 1,
    };
  } catch (error) {
    console.error("Error fetching active sprint:", error);
    return {
      success: false,
      message: "Something went wrong. Please try again.",
    };
  }
};

export const getProjectSprints = async (projectId: string) => {
  try {
    const access = await getProjectAccess(projectId);
    if ("error" in access) {
      return { success: false, message: access.error };
    }

    const sprints = await prisma.sprint.findMany({
      where: { projectId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        taskIds: true,
        status: true,
        createdAt: true,
      },
    });

    return { success: true, sprints };
  } catch (error) {
    console.error("Error fetching project sprints:", error);
    return {
      success: false,
      message: "Something went wrong. Please try again.",
    };
  }
};

export const startSprint = async (input: StartSprintInput) => {
  try {
    const parsed = startSprintSchema.parse(input);
    const access = await getProjectAccess(parsed.projectId);
    if ("error" in access) {
      return { success: false, message: access.error };
    }

    if (!access.isAdmin) {
      return { success: false, message: "Only admins can start a sprint." };
    }

    const existing = await prisma.sprint.findFirst({
      where: { projectId: parsed.projectId, status: "ACTIVE" },
    });

    if (existing) {
      const active = await expireSprintIfNeeded(existing);
      if (active) {
        return { success: false, message: "A sprint is already active." };
      }
    }

    if (parsed.taskIds.length > 0) {
      const tasks = await prisma.task.findMany({
        where: {
          id: { in: parsed.taskIds },
          projectId: parsed.projectId,
        },
        select: { id: true },
      });

      if (tasks.length !== parsed.taskIds.length) {
        return { success: false, message: "One or more selected tasks are invalid." };
      }
    }

    const sprint = await createActiveSprintForProject(parsed.projectId, {
      name: parsed.name,
      sprintType: parsed.sprintType,
      durationDays: parsed.durationDays,
      primaryGoal: parsed.primaryGoal,
      targetMetric: parsed.targetMetric,
      taskIds: parsed.taskIds,
    });

    return { success: true, sprint, message: "Sprint started!" };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, message: error.errors[0]?.message || "Invalid input." };
    }
    console.error("Error starting sprint:", error);
    return {
      success: false,
      message: "Something went wrong. Please try again.",
    };
  }
};

export const updateSprint = async (input: UpdateSprintInput) => {
  try {
    const parsed = updateSprintSchema.parse(input);
    const access = await getProjectAccess(parsed.projectId);
    if ("error" in access) {
      return { success: false, message: access.error };
    }

    if (!access.isAdmin) {
      return { success: false, message: "Only admins can edit a sprint." };
    }

    const sprint = await prisma.sprint.findFirst({
      where: {
        id: parsed.sprintId,
        projectId: parsed.projectId,
        status: "ACTIVE",
      },
    });

    if (!sprint) {
      return { success: false, message: "No active sprint found." };
    }

    const active = await expireSprintIfNeeded(sprint);
    if (!active) {
      return { success: false, message: "No active sprint found." };
    }

    const endDate = new Date(active.startDate);
    endDate.setDate(endDate.getDate() + parsed.durationDays);

    const updated = await prisma.sprint.update({
      where: { id: active.id },
      data: {
        name: parsed.name,
        sprintType: parsed.sprintType as SprintType,
        durationDays: parsed.durationDays,
        primaryGoal: parsed.primaryGoal || null,
        targetMetric: parsed.targetMetric || null,
        endDate,
      },
    });

    return { success: true, sprint: updated, message: "Sprint updated!" };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, message: error.errors[0]?.message || "Invalid input." };
    }
    console.error("Error updating sprint:", error);
    return {
      success: false,
      message: "Something went wrong. Please try again.",
    };
  }
};

export const toggleSprintTask = async (projectId: string, taskId: string) => {
  try {
    const access = await getProjectAccess(projectId);
    if ("error" in access) {
      return { success: false, message: access.error };
    }

    if (!access.isAdmin) {
      return { success: false, message: "Only admins can update sprint tasks." };
    }

    const sprint = await prisma.sprint.findFirst({
      where: { projectId, status: "ACTIVE" },
    });

    if (!sprint) {
      return { success: false, message: "No active sprint found." };
    }

    const active = await expireSprintIfNeeded(sprint);
    if (!active) {
      return { success: false, message: "No active sprint found." };
    }

    const task = await prisma.task.findFirst({
      where: { id: taskId, projectId },
      select: { id: true },
    });

    if (!task) {
      return { success: false, message: "Task not found." };
    }

    const inSprint = active.taskIds.includes(taskId);
    let taskIds = active.taskIds;

    if (inSprint) {
      taskIds = taskIds.filter((id) => id !== taskId);
    } else {
      if (taskIds.length >= MAX_ACTIVE_SPRINT_TASKS) {
        return {
          success: false,
          message: `A sprint can include at most ${MAX_ACTIVE_SPRINT_TASKS} tasks.`,
        };
      }
      taskIds = [...taskIds, taskId];
    }

    const updated = await prisma.sprint.update({
      where: { id: active.id },
      data: { taskIds },
    });

    return { success: true, sprint: updated };
  } catch (error) {
    console.error("Error updating sprint task:", error);
    return {
      success: false,
      message: "Something went wrong. Please try again.",
    };
  }
};
