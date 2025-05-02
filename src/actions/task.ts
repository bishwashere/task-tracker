"use server";
import { prisma } from "@/lib/prisma";
import { isUserValid } from "./isUserValid";
import { revalidatePath } from "next/cache";

export const saveTask = async (
  projectId: string,
  taskTitle: string,
  taskDescription: string,
) => {
  const userId = await isUserValid();
  if (!userId) {
    return { success: false, message: "Unauthorized !" };
  }
  try {
    // Fetch project and organization
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { organization: { include: { members: true } } },
    });

    if (!project) {
      return { success: false, message: "Project not found" };
    }

    // Check if the user is an admin in the organization
    const userOrg = project.organization.members.find(
      (member) => member.userId === userId,
    );

    if (!userOrg || userOrg.role !== "ADMIN") {
      return { success: false, message: "Permission denied" };
    }

    // Create a new task
    const task = await prisma.task.create({
      data: {
        name: taskTitle,
        description: taskDescription,
        projectId,
      },
      include: {
        subtasks: true,
      },
    });

    return { success: true, message: "Task Added!", task };
  } catch (error) {
    console.error("Error adding task:", error);
    return {
      success: false,
      message: "An error occurred while adding the task.",
    };
  }
};

export const editTask = async (
  projectId: string,
  taskId: string,
  taskTitle: string,
  taskDescription: string,
) => {
  const userId = await isUserValid();
  if (!userId) {
    return { success: false, message: "Unauthorized !" };
  }
  try {
    // Fetch project and organization
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { organization: { include: { members: true } } },
    });

    if (!project) {
      return { success: false, message: "Project not found" };
    }

    // Check if the user is an admin in the organization
    const userOrg = project.organization.members.find(
      (member) => member.userId === userId,
    );

    if (!userOrg || userOrg.role !== "ADMIN") {
      return { success: false, message: "Permission denied" };
    }

    // Create a new task
    const task = await prisma.task.update({
      where: {
        id: taskId,
      },
      data: {
        name: taskTitle,
        description: taskDescription,
        projectId,
      },
      include: {
        subtasks: true,
      },
    });

    return { success: true, message: "Task Edited !", task };
  } catch (error) {
    console.error("Error adding task:", error);
    return {
      success: false,
      message: "An error occurred while adding the task.",
    };
  }
};

export const saveSubTask = async (
  taskId: string,
  projectId: string,
  subTaskName: string,
  dueDate: Date,
  points: number,
  assignedUserId?: string | null,
) => {
  const userId = await isUserValid();
  if (!userId) {
    return { success: false, message: "Unauthorized !" };
  }
  try {
    // Fetch project and organization
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { organization: { include: { members: true } } },
    });

    if (!project) {
      return { success: false, message: "Project not found" };
    }

    // Check if the user is an admin in the organization
    const userOrg = project.organization.members.find(
      (member) => member.userId === userId,
    );

    if (!userOrg || userOrg.role !== "ADMIN") {
      return { success: false, message: "Permission denied" };
    }

    // Create a new task
    const subTask = await prisma.subtask.create({
      data: {
        name: subTaskName,
        dueDate,
        points,
        assignedUserId: assignedUserId === "" ? null : assignedUserId,
        taskId,
      },
      include: {
        assignedUser: true,
      },
    });

    // Revalidate the cache to reflect the new subtask
    revalidatePath(`/tasks/${taskId}`);

    return { success: true, message: "Task Added!", subTask };
  } catch (error) {
    console.error("Error adding subtask:", error);
    return {
      success: false,
      message: "An error occurred while adding the subtask.",
    };
  }
};

export const editSubTask = async (
  taskId: string,
  projectId: string,
  subTaskId: string,
  subTaskName: string,
  dueDate: Date,
  points: number,
  assignedUserId: string | null,
) => {
  const userId = await isUserValid();
  if (!userId) {
    return { success: false, message: "Unauthorized !" };
  }
  try {
    // Fetch project and organization
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { organization: { include: { members: true } } },
    });

    if (!project) {
      return { success: false, message: "Project not found" };
    }

    // Check if the user is an admin in the organization
    const userOrg = project.organization.members.find(
      (member) => member.userId === userId,
    );

    if (!userOrg || userOrg.role !== "ADMIN") {
      return { success: false, message: "Permission denied" };
    }

    // Create a new task
    const subTask = await prisma.subtask.update({
      where: { id: subTaskId },
      data: {
        name: subTaskName,
        dueDate,
        points,
        assignedUserId: assignedUserId === "" ? null : assignedUserId,
        taskId,
      },
      include: {
        assignedUser: true,
      },
    });

    // Revalidate the cache to reflect the new subtask
    revalidatePath(`/tasks/${taskId}`);

    return { success: true, message: "Subtask Edited !", subTask };
  } catch (error) {
    console.error("Error adding subtask:", error);
    return {
      success: false,
      message: "An error occurred while adding the subtask.",
    };
  }
};

export const saveTaskTag = async (
  subtaskId: string,
  projectId: string,
  tagName: string,
  tagColor: string,
) => {
  const userId = await isUserValid();
  if (!userId) {
    return { success: false, message: "Unauthorized !" };
  }
  try {
    // Fetch project and organization
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { organization: { include: { members: true } } },
    });

    if (!project) {
      return { success: false, message: "Project not found" };
    }

    const updatedSubtask = await prisma.subtask.update({
      where: { id: subtaskId },
      data: {
        tagName: tagName,
        tagColor: tagColor,
      },
    });

    return { success: true, message: "Tag Added!", updatedSubtask };
  } catch (error) {
    console.error("Error adding tag:", error);
    return { success: false, message: "An error occurred." };
  }
};

export const togglePriority = async (
  subtaskId: string,
  projectId: string,
  priority: number,
) => {
  const userId = await isUserValid();
  if (!userId) {
    return { success: false, message: "Unauthorized !" };
  }
  try {
    // Fetch project and organization
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { organization: { include: { members: true } } },
    });

    if (!project) {
      return { success: false, message: "Project not found" };
    }

    // Check if the user is an admin in the organization
    const userOrg = project.organization.members.find(
      (member) => member.userId === userId,
    );

    if (!userOrg) {
      return { success: false, message: "Permission denied" };
    }

    const updatedSubtask = await prisma.subtask.update({
      where: { id: subtaskId },
      data: {
        priority: priority,
      },
    });

    return { success: true, updatedSubtask };
  } catch (error) {
    console.error("Error while toggling priority", error);
    return { success: false, message: "An error occurred." };
  }
};

export const updateSubtaskStatus = async (
  subtaskId: string,
  status: string,
) => {
  const userId = await isUserValid();
  if (!userId) {
    return { success: false, message: "Unauthorized !" };
  }
  try {
    // Fetch the subtask along with its related task and organization
    const subtask = await prisma.subtask.findUnique({
      where: { id: subtaskId },
      include: {
        task: {
          select: {
            project: {
              select: {
                organization: {
                  select: {
                    id: true,
                    name: true,
                    members: {
                      select: {
                        userId: true,
                        role: true,
                      },
                    },
                  },
                },
                id: true,
                name: true,
              },
            },
            name: true,
          },
        },
        comments: {
          select: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
            comment: true,
            createdAt: true,
          },
        },
      },
    });

    // Check if the subtask exists
    if (!subtask) {
      return { success: false, error: "No Subtask found!" };
    }
    // Get organization and members
    const organization = subtask.task?.project?.organization;
    if (!organization) {
      return { success: false, message: "Organization not found" };
    }
    // Fetch organization members
    const isAdmin = organization.members.some(
      (member) => member.userId === userId && member.role === "ADMIN",
    );
    const isAssignedUser = subtask.assignedUserId === userId;
    // Check if the user is authorized
    if (!(isAdmin || isAssignedUser)) {
      return {
        success: false,
        message: "Forbidden: You do not have permission to view this subtask",
      };
    }
    await prisma.pointsEarned.create({
      data: {
        userId: subtask.assignedUserId ? subtask.assignedUserId : userId,
        organizationId: subtask.task.project.id,
        organizationName: subtask.task.project.organization.name,
        projectId: subtask.task.project.id,
        projectName: subtask.task.project.name,
        taskId: subtask.taskId,
        taskName: subtask.task.name,
        subtaskId: subtaskId,
        subtaskName: subtask.name,
        points: subtask.points <= 0 ? 1 : subtask.points,
      },
    });
    const updatedSubtask = await prisma.subtask.update({
      where: { id: subtaskId },
      data: {
        status: status,
        completedAt: status === "done" ? new Date() : null,
      },
      include: {
        assignedUser: {
          select: {
            name: true,
            image: true,
            id: true,
          },
        },
      },
    });

    return { success: true, message: "Success", updatedSubtask };
  } catch (error) {
    console.error("Error while toggling priority", error);
    return { success: false, message: "An error occurred." };
  }
};

export const assignUserToSubtask = async (
  subtaskId: string,
  projectId: string,
  memberUserId: string,
) => {
  const userId = await isUserValid();
  if (!userId) {
    return { success: false, message: "Unauthorized !" };
  }
  try {
    // Fetch project and organization
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { organization: { include: { members: true } } },
    });

    if (!project) {
      return { success: false, message: "Project not found" };
    }

    // Check if the user is an admin in the organization
    const userOrg = project.organization.members.find(
      (member) => member.userId === userId,
    );

    if (!userOrg || userOrg.role !== "ADMIN") {
      return { success: false, message: "Permission denied" };
    }

    const updatedSubtask = await prisma.subtask.update({
      where: { id: subtaskId },
      data: {
        assignedUserId: memberUserId,
      },
    });

    return { success: true, message: "Success", updatedSubtask };
  } catch (error) {
    console.error("Error while assigning user", error);
    return { success: false, message: "An error occurred." };
  }
};

export const sortTasks = async (
  data: { taskId: string; sortIndex: number }[],
) => {
  try {
    const userId = await isUserValid();
    if (!userId) {
      return { success: false, message: "Unauthorized !" };
    }
    await Promise.all(
      data.map(async ({ taskId, sortIndex }) => {
        const p = await prisma.taskSortIndex.findFirst({
          where: {
            taskId,
            userId,
          },
        });
        if (p) {
          await prisma.taskSortIndex.update({
            where: {
              id: p.id,
            },
            data: {
              sortIndex,
            },
          });
        } else {
          await prisma.taskSortIndex.create({
            data: {
              taskId,
              userId,
              sortIndex,
            },
          });
        }
      }),
    );
    return { success: true, message: "Tasks sorted successfully" };
  } catch (error) {
    console.error("Error sorting tasks:", error);
    return {
      success: false,
      message: "Something went wrong. Please try again.",
    };
  }
};

export const deleteTask = async (taskId: string) => {
  try {
    const userId = await isUserValid();
    if (!userId) {
      return { success: false, message: "Unauthorized!" };
    }

    // First, delete all subtasks and their related records
    const subtasks = await prisma.subtask.findMany({
      where: { taskId },
    });

    for (const subtask of subtasks) {
      // Delete subtask sort indices
      await prisma.subtaskSortIndex.deleteMany({
        where: { subtaskId: subtask.id },
      });

      // Delete the subtask
      await prisma.subtask.delete({
        where: { id: subtask.id },
      });
    }

    // Delete task sort indices
    await prisma.taskSortIndex.deleteMany({
      where: { taskId },
    });

    // Finally, delete the task
    await prisma.task.delete({
      where: { id: taskId },
    });

    return { success: true, message: "Task deleted successfully" };
  } catch (error) {
    console.error("Error deleting task:", error);
    return {
      success: false,
      message: "Something went wrong. Please try again.",
    };
  }
};
