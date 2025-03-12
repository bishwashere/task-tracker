"use server";

import { prisma } from "@/lib/prisma";

export const getAISuggestedTasksByProjectId = async (projectId: string) => {
  try {
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
