"use server";

import { isUserValid } from "@/actions/isUserValid";
import { prisma } from "@/lib/prisma";

export const fetchProjectData = async (projectId: string) => {
  const userId = await isUserValid();
  if (!userId) {
    return { success: false, error: "Unauthorized !" };
  }
  try {
    //Get the organization ID from the project ID
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true, organizationId: true },
    });

    if (!project) {
      return { success: false, message: "Project not found." };
    }

    const organizationId = project.organizationId;

    //Check if the user is an admin or member in the organization
    const userOrganization = await prisma.userOrganization.findFirst({
      where: {
        userId: userId,
        organizationId: organizationId,
      },
      select: { role: true },
    });

    if (!userOrganization) {
      return {
        success: false,
        message: "You are not part of this organization.",
      };
    }

    const isAdmin = userOrganization.role === "ADMIN";

    let tasksWithSubtasks;

    if (isAdmin) {
      //Admin: Fetch all tasks, subtasks, and subtask tags
      tasksWithSubtasks = await prisma.task.findMany({
        where: { projectId: projectId },
        include: {
          subtasks: {
            include: {
              assignedUser: {
                select: {
                  name: true,
                  image: true,
                },
              },
              comments: {
                where: {
                  commentType: "issue",
                  resolved: false,
                },
              },
              subtaskSortIndex: {
                where: { userId },
                select: { sortIndex: true },
              },
            },
          },
          taskSortIndex: {
            where: { userId },
            select: { sortIndex: true },
          },
        },
      });

      // Add unresolved issue count to each subtask
      tasksWithSubtasks = tasksWithSubtasks.map((task) => ({
        ...task,
        subtasks: task.subtasks.map((subtask) => ({
          ...subtask,
          issueCount: subtask.comments.length,
          comments: undefined, // Remove the comments array since we now have the count
        })),
      }));

      //Fetch all organization members for admin
      const organizationMembers = await prisma.user.findMany({
        where: {
          organizations: {
            some: { organizationId: organizationId },
          },
        },
        select: {
          id: true,
          name: true,
          email: true,
        },
      });

      //Fetch points for that project
      const pointsData = await prisma.pointsEarned.findMany({
        where: {
          projectId: projectId,
          userId: userId,
        },
      });
      const pointsEarned = pointsData.reduce(
        (total, data) => total + data.points,
        0
      );
      return {
        success: true,
        tasks: tasksWithSubtasks,
        members: organizationMembers,
        role: "admin",
        pointsEarned: pointsEarned,
      };
    } else {
      //Member: Fetch only assigned subtasks
      const assignedSubtasks = await prisma.subtask.findMany({
        where: {
          assignedUserId: userId,
          task: { projectId: projectId },
        },
        include: {
          task: {
            include: {
              taskSortIndex: {
                where: { userId },
                select: { sortIndex: true },
              },
              subtasks: {
                where: { assignedUserId: userId },
                include: {
                  assignedUser: {
                    select: {
                      name: true,
                    },
                  },
                  subtaskSortIndex: {
                    where: { userId },
                    select: { sortIndex: true },
                  },
                },
              },
            },
          },
        },
      });
      const tasksWithSubtasks = Array.from(
        new Map(
          assignedSubtasks.map((subtask) => [subtask.task.id, subtask.task])
        ).values()
      );
      //Fetch points for that project
      const pointsData = await prisma.pointsEarned.findMany({
        where: {
          projectId: projectId,
          userId: userId,
        },
      });
      const pointsEarned = pointsData.reduce(
        (total, data) => total + data.points,
        0
      );
      return {
        success: true,
        tasks: tasksWithSubtasks,
        role: "member",
        pointsEarned: pointsEarned,
      };
    }
  } catch (error) {
    console.error("Error fetching project data:", error);
    return {
      success: false,
      message: "Something went wrong. Please try again.",
    };
  }
};
