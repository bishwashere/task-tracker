"use server";

import { isUserValid } from "@/actions/isUserValid";
import { prisma } from "@/lib/prisma";

export const getProjectById = async (projectId: string) => {
  const userId = await isUserValid();
  if (!userId) {
    return { error: "Unauthorized !" };
  }
  try {
    // First, find the project to get its organizationId
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: {
        id: true,
        organizationId: true,
        name: true,
        hasAiSuggestTasks: true, // Add this field to always include it
      },
    });

    if (!project) {
      return { success: false, message: "Project not found!" };
    }

    // Check if the user is part of the organization and has the required access
    const userOrg = await prisma.userOrganization.findFirst({
      where: {
        userId: userId,
        organizationId: project.organizationId,
      },
    });

    if (!userOrg) {
      return { success: false, message: "Not a part of organization!" };
    }

    // If the user is a member, check if they have access to the project through subtasks
    if (userOrg.role === "MEMBER") {
      const assignedSubtask = await prisma.subtask.findFirst({
        where: {
          assignedUserId: userId,
          task: { projectId: projectId },
        },
      });

      if (!assignedSubtask) {
        return {
          success: false,
          message: "You do not have access to this project.",
        };
      }
    }

    return { success: true, project };
  } catch (error) {
    console.error("Error fetching project:", error);
    return {
      success: false,
      message: "Something went wrong. Please try again.",
    };
  }
};
