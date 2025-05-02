"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export type SaveSubtaskProps = {
  projectId: string;
  taskId: string;
  subTaskName: string;
  dueDate: Date;
  points: number;
  assignedUserId?: string | null;
};

export const saveSubTask = async ({
  projectId,
  taskId,
  subTaskName,
  dueDate,
  points,
  assignedUserId,
}: SaveSubtaskProps) => {
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
        subtaskSortIndex: true,
      },
    });

    return { success: true, message: "Task Added!", subTask };
  } catch (error) {
    console.error("Error adding subtask:", error);
    return {
      success: false,
      message: "An error occurred while adding the subtask.",
    };
  }
};

export const deleteSubtask = async (subtaskId: string) => {
  try {
    // check for permission
    const user = await auth();
    if (!user || !user.user || !user.user.id) {
      return { success: false, message: "Unauthorized !" };
    }

    const userId = user.user.id;

    // check if subtask exists
    const subtask = await prisma.subtask.findUnique({
      where: { id: subtaskId },
    });

    if (!subtask) {
      return { success: false, message: "Subtask not found" };
    }

    // Delete in correct order to maintain referential integrity

    // 1. Delete all comments associated with the subtask
    await prisma.comment.deleteMany({
      where: { subtaskId },
    });

    // 2. Delete all sort indices associated with the subtask
    await prisma.subtaskSortIndex.deleteMany({
      where: { subtaskId },
    });

    // 3. Finally delete the subtask itself
    await prisma.subtask.delete({
      where: { id: subtaskId },
    });

    return { success: true, message: "Subtask deleted successfully" };
  } catch (error) {
    console.error("Error deleting subtask:", error);
    return {
      success: false,
      message: "An error occurred while deleting the subtask",
    };
  }
};

export type EditSubTaskProps = {
  taskId: string;
  projectId: string;
  subTaskId: string;
  subTaskName: string;
  dueDate: Date;
  points: number;
  assignedUserId: string | null;
};

export const editSubTask = async ({
  taskId,
  projectId,
  subTaskId,
  subTaskName,
  dueDate,
  points,
  assignedUserId,
}: EditSubTaskProps) => {
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

    return { success: true, message: "Subtask Edited !", subTask };
  } catch (error) {
    console.error("Error adding subtask:", error);
    return {
      success: false,
      message: "An error occurred while adding the subtask.",
    };
  }
};

export type ToggleSubtaskPriorityProps = {
  projectId: string;
  subtaskId: string;
  priority: number;
};
export const toggleSubtaskPriority = async ({
  projectId,
  subtaskId,
  priority,
}: ToggleSubtaskPriorityProps) => {
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

export type UpdateSubtaskStatusProps = {
  subtaskId: string;
  status: string;
};

export const updateSubtaskStatus = async ({
  subtaskId,
  status,
}: UpdateSubtaskStatusProps) => {
  const user = await auth();
  if (!user || !user.user || !user.user.id) {
    return { success: false, message: "Unauthorized !" };
  }

  const userId = user.user.id;

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

export type SaveSubtaskTagProps = {
  subtaskId: string;
  projectId: string;
  tagName: string;
  tagColor: string;
};
export const saveSubTaskTag = async ({
  subtaskId,
  projectId,
  tagName,
  tagColor,
}: SaveSubtaskTagProps) => {
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
