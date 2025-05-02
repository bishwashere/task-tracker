"use server";

import { ai } from "@/lib/ai";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * First find the project
 * check if ai has suggested any tasks, if suggested return them else create and return them
 */
export const getAISuggestedTasksByProjectId = async (projectId: string) => {
  try {
    const project = await prisma.project.findUnique({
      where: {
        id: projectId,
      },
    });

    if (!project) {
      return {
        success: false,
        message: "Project not found",
      };
    }

    if (!project.hasAiSuggestTasks) {
      const suggestedTasks = await ai.suggestProjectTasks({
        projectName: project.name,
        projectDescription: project.description || "",
      });

      await prisma.aISuggestedTask.createMany({
        data: (suggestedTasks || []).map((task) => ({
          name: task.title,
          description: task.description,
          projectId: projectId,
        })),
      });

      await prisma.project.update({
        where: {
          id: projectId,
        },
        data: {
          hasAiSuggestTasks: true,
        },
      });

      // return the newly created tasks from db

      const tasks = await prisma.aISuggestedTask.findMany({
        where: {
          projectId: projectId,
        },
      });
      return { success: true, tasks };
    }

    const tasks = await prisma.aISuggestedTask.findMany({
      where: {
        projectId: projectId,
      },
    });
    return { success: true, tasks };
  } catch (error) {
    console.error("Error fetching AI suggested tasks:", error);
    return {
      success: false,
      message: "Something went wrong. Please try again.",
    };
  }
};

export const deleteAISuggestedTask = async (taskId: string) => {
  try {
    await prisma.aISuggestedTask.delete({
      where: {
        id: taskId,
      },
    });
    return { success: true, message: "Task deleted !" };
  } catch (error) {
    console.error("Error deleting AI suggested task:", error);
    return {
      success: false,
      message: "Something went wrong. Please try again.",
    };
  }
};

export const getAISuggestedSubtasks = async (taskId: string) => {
  const task = await prisma.task.findUnique({
    where: {
      id: taskId,
    },
    include: {
      project: true,
    },
  });

  if (!task) {
    return {
      success: false,
      message: "Task not found",
    };
  }

  const subtasks = await ai.suggestProjectSubtasks({
    projectName: task.project.name,
    taskTitle: task.name,
    taskDescription: task.description || "",
    projectDescription: task.project.description || "",
  });

  await prisma.task.update({
    where: {
      id: taskId,
    },
    data: {
      hasAISuggestions: true,
    },
  });

  return { success: true, subtasks };
};

export type SaveTaskProps = {
  projectId: string;
  taskTitle: string;
  taskDescription: string;
};

export const saveTask = async ({
  projectId,
  taskTitle,
  taskDescription,
}: SaveTaskProps) => {
  const user = await auth();
  if (!user || !user.user || !user.user.id) {
    return { success: false, message: "Unauthorized !" };
  }

  const userId = user.user.id;

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
      (member) => member.userId === userId
    );

    if (!userOrg || userOrg.role !== "ADMIN") {
      return { success: false, message: "Permission denied" };
    }

    // Get the count of existing tasks in the project for sorting
    const tasksCount = await prisma.task.count({
      where: { projectId },
    });

    // Create a new task
    const task = await prisma.task.create({
      data: {
        name: taskTitle,
        description: taskDescription,
        projectId,
        taskSortIndex: {
          create: {
            sortIndex: tasksCount, // Use the count as the sort index
            userId,
          },
        },
      },
      include: {
        subtasks: true,
        taskSortIndex: true,
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

export type EditTaskProps = {
  projectId: string;
  taskId: string;
  taskTitle: string;
  taskDescription: string;
};

export const editTask = async ({
  projectId,
  taskId,
  taskTitle,
  taskDescription,
}: EditTaskProps) => {
  const user = await auth();
  if (!user || !user.user || !user.user.id) {
    return { success: false, message: "Unauthorized !" };
  }
  const userId = user.user.id;

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
      (member) => member.userId === userId
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

export const deleteTask = async (taskId: string) => {
  try {
    const user = await auth();
    if (!user || !user.user || !user.user.id) {
      return { success: false, message: "Unauthorized!" };
    }

    const userId = user.user.id;

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

export const sortTasks = async (
  data: { taskId: string; sortIndex: number }[]
) => {
  try {
    const user = await auth();

    if (!user || !user.user || !user.user.id) {
      return { success: false, message: "Unauthorized !" };
    }

    const userId = user.user.id;

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
      })
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
