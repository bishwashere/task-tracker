"use server";

import { prisma } from "@/lib/prisma";
import { isUserValid } from "./isUserValid";
import { ai } from "@/lib/ai";

export const addProject = async (
  organizationId: string,
  projectName: string,
  projectDescription: string
) => {
  const userId = await isUserValid();
  if (!userId) {
    return { success: false, message: "Unauthorized !" };
  }
  try {
    // Check if the logged-in user is an admin in the organization
    const adminCheck = await prisma.userOrganization.findFirst({
      where: {
        userId: userId,
        organizationId,
        role: "ADMIN",
      },
    });
    if (!adminCheck) {
      return {
        success: false,
        message: "Only admins can add users to the organization.",
      };
    }

    // Create the project
    const project = await prisma.project.create({
      data: {
        name: projectName,
        description: projectDescription,
        organizationId,
      },
    });

    const suggestedTasks = await ai.suggestProjectTasks({
      projectName,
      projectDescription,
    });

    // Prepare data for bulk write
    const tasksData = suggestedTasks.map((task) => ({
      name: task.title,
      description: task.description,
      projectId: project.id,
    }));

    // Save suggested tasks to the database using bulk write
    await prisma.aISuggestedTask.createMany({
      data: tasksData,
    });

    return { success: true, message: "Project added !", project };
  } catch (error) {
    console.error("Error adding project:", error);
    return {
      success: false,
      message: "Something went wrong. Please try again.",
    };
  }
};
