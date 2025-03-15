"use server";

import { ai } from "@/lib/ai";
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
