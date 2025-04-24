"use server";
import { prisma } from "@/lib/prisma";
import { isUserValid } from "./isUserValid";

export const saveComment = async (
  subtaskId: string,
  projectId: string,
  userComment: string,
  commentType: string,
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
