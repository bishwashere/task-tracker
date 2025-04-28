"use server";
import { prisma } from "@/lib/prisma";
import { isUserValid } from "./isUserValid";

export const saveComment = async (
  subtaskId: string,
  projectId: string,
  userComment: string,
  commentType: string
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
      (member) => member.userId === userId
    );
    if (!userOrg) {
      return { success: false, message: "Permission denied" };
    }

    const comment = await prisma.comment.create({
      data: {
        subtaskId: subtaskId,
        userId: userId,
        comment: userComment,
        commentType: commentType,
      },
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
    });

    return { success: true, message: "Success", comment };
  } catch (error) {
    console.error("Error while commenting", error);
    return { success: false, message: "An error occurred." };
  }
};

export const sortSubtasks = async (
  data: { subtaskId: string; sortIndex: number }[]
) => {
  try {
    const userId = await isUserValid();
    if (!userId) {
      return { success: false, message: "Unauthorized !" };
    }

    await Promise.all(
      data.map(async ({ subtaskId, sortIndex }) => {
        const p = await prisma.subtaskSortIndex.findFirst({
          where: {
            subtaskId,
            userId,
          },
        });
        if (p) {
          await prisma.subtaskSortIndex.update({
            where: {
              id: p.id,
            },
            data: {
              sortIndex,
            },
          });
        } else {
          await prisma.subtaskSortIndex.create({
            data: {
              subtaskId,
              userId,
              sortIndex,
            },
          });
        }
      })
    );

    return { success: true, message: "Subtasks sorted successfully" };
  } catch (error) {
    console.error("Error sorting subtasks:", error);
    return {
      success: false,
      message: "Something went wrong. Please try again.",
    };
  }
};

export const deleteSubtask = async (subtaskId: string) => {
  try {
    // check for permission
    const userId = await isUserValid();

    if (!userId) {
      return { success: false, message: "Unauthorized !" };
    }

    // check if subtask exists
    const subtask = await prisma.subtask.findUnique({
      where: { id: subtaskId },
    });

    if (!subtask) {
      return { success: false, message: "Subtask not found" };
    }

    await prisma.subtask.delete({
      where: { id: subtaskId },
    });

    // delete all sort indices associated with the subtask
    await prisma.subtaskSortIndex.deleteMany({
      where: { subtaskId: subtaskId },
    });

    // delete all comments associated with the subtask
    await prisma.comment.deleteMany({
      where: { subtaskId: subtaskId },
    });

    return { success: true, message: "Subtask deleted !" };
  } catch (error) {
    console.error("Error deleting subtask:", error);
    return {
      success: false,
      message: "Something went wrong. Please try again.",
    };
  }
};
