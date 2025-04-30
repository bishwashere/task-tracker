"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculateProgressWithStats } from "@/lib/progress";

export type AddProjectProps = {
  organizationId: string;
  projectName: string;
  projectDescription: string;
};

// todo non admin are able to add project
export const addProject = async ({
  organizationId,
  projectName,
  projectDescription,
}: AddProjectProps) => {
  try {
    const user = await auth();

    if (!user || !user.user || !user.user.id) {
      return { success: false, message: "Unauthorized !" };
    }

    // Check if the logged-in user is an admin in the organization
    const adminCheck = await prisma.userOrganization.findFirst({
      where: {
        userId: user.user.id,
        organizationId,
        role: "ADMIN",
      },
    });

    console.log(adminCheck);

    if (!adminCheck) {
      return {
        success: false,
        message: "Only admins can add users to the organization.",
      };
    }

    const totalProjects = await prisma.project.count({
      where: { organizationId },
    });

    // Create the project
    const project = await prisma.project.create({
      data: {
        name: projectName,
        description: projectDescription,
        organizationId,
        projectSortIndex: {
          create: {
            sortIndex: totalProjects,
            userId: user.user.id,
          },
        },
      },
      include: {
        projectSortIndex: true,
      },
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

export const listAllUserProjectByOrganizationId = async (
  organizationId: string
) => {
  try {
    const user = await auth();
    if (!user || !user.user || !user.user.id) {
      return { success: false, message: "Unauthorized !" };
    }

    const userId = user.user.id;

    const projects = await prisma.project.findMany({
      where: {
        OR: [
          // Include all projects if user is ADMIN
          {
            organization: {
              members: { some: { userId, role: "ADMIN" } },
            },
            organizationId,
          },
          // For MEMBER, include only projects with assigned subtasks
          {
            tasks: {
              some: {
                subtasks: {
                  some: { assignedUserId: userId },
                },
              },
            },
            organizationId,
          },
        ],
      },
      include: {
        tasks: {
          include: {
            subtasks: true,
          },
        },
        projectSortIndex: {
          where: { userId },
          select: { sortIndex: true },
        },
      },
    });

    const projectWithProgress = projects.map(({ tasks, ...project }) => {
      return {
        ...project,
        progress: calculateProgressWithStats(tasks).progress,
        tasksCount: tasks.reduce((sum, task) => sum + task.subtasks.length, 0),
      };
    });

    return { success: true, projects: projectWithProgress };
  } catch (error) {
    console.error("Error fetching user organizations:", error);
    return { success: false, message: "Failed to fetch organizations" };
  }
};

export const sortProjects = async (
  data: { projectId: string; sortIndex: number }[]
) => {
  try {
    const user = await auth();

    if (!user || !user.user || !user.user.id) {
      return { success: false, message: "Unauthorized !" };
    }

    const userId = user.user.id;

    await Promise.all(
      data.map(async ({ projectId, sortIndex }) => {
        const p = await prisma.projectSortIndex.findFirst({
          where: {
            projectId,
            userId,
          },
        });

        if (p) {
          await prisma.projectSortIndex.update({
            where: {
              id: p.id,
            },
            data: {
              sortIndex,
            },
          });
        } else {
          await prisma.projectSortIndex.create({
            data: {
              projectId,
              userId,
              sortIndex,
            },
          });
        }
      })
    );
    return { success: true, message: "Projects sorted successfully" };
  } catch (error) {
    console.error("Error sorting projects:", error);
    return {
      success: false,
      message: "Something went wrong. Please try again.",
    };
  }
};
