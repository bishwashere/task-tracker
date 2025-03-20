"use server";

import { isUserValid } from "@/actions/isUserValid";
import { prisma } from "@/lib/prisma";

export const fetchSubtaskData = async (subtaskId: string) => {
  const userId = await isUserValid();
  if (!userId) {
    return { success: false, error: "Unauthorized !" };
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
                    members: {
                      select: {
                        userId: true,
                        role: true,
                      },
                    },
                  },
                },
                id: true,
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
            commentType: true,
            resolved: true,
            id: true,
          },
        },
        assignedUser: {
          select: {
            name: true,
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
      (member) => member.userId === userId && member.role === "ADMIN"
    );
    const isAssignedUser = subtask.assignedUserId === userId;
    // Check if the user is authorized
    if (!(isAdmin || isAssignedUser)) {
      return {
        success: false,
        message: "Forbidden: You do not have permission to view this subtask",
      };
    }

    return {
      success: true,
      subtask,
      comments: subtask.comments,
    };
  } catch (error) {
    console.error("Error fetching project data:", error);
    return {
      success: false,
      message: "Something went wrong. Please try again.",
    };
  }
};

export const resolveComment = async (commentId: string) => {
  try {
    const comment = await prisma.comment.update({
      where: { id: commentId },
      data: {
        resolved: true,
      },
    });
    return { success: true, comment };
  } catch (error) {
    console.error("Error while resolving comment", error);
    return { success: false, message: "An error occurred." };
  }
};
