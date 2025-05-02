"use server";

import { prisma } from "@/lib/prisma";
import { isUserValid } from "./isUserValid";

export const addProject = async (
  organizationId: string,
  projectName: string,
  projectDescription: string,
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
            userId,
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

export const sortProjects = async (
  data: { projectId: string; sortIndex: number }[],
) => {
  try {
    const userId = await isUserValid();

    if (!userId) {
      return { success: false, message: "Unauthorized !" };
    }
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
      }),
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
