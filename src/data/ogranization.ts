"use server";

import { isUserValid } from "@/actions/isUserValid";
import { prisma } from "@/lib/prisma";

export const getOrganization = async () => {
  const userId = await isUserValid();
  if (!userId) {
    return { error: "Unauthorized!" };
  }

  try {
    // Get the user's roles in organizations
    const memberships = await prisma.userOrganization.findMany({
      where: { userId },
      include: {
        organization: {
          include: {
            members: {
              include: {
                user: {
                  select: { id: true, name: true, email: true },
                },
              },
            },
            projects: {
              include: {
                tasks: {
                  include: {
                    subtasks: {
                      where: { assignedUserId: userId },
                      select: { id: true, status: true },
                    },
                  },
                },
                projectSortIndex: {
                  where: { userId },
                  select: { sortIndex: true },
                },
              },
            },
          },
        },
      },
    });

    // Build result with filtered projects for non-admins
    const organizations = memberships.map(({ role, organization }) => {
      const filteredProjects = organization.projects.filter((project) => {
        if (role === "ADMIN") return true;

        // For MEMBER: check if any subtask in the project is assigned to the user
        return project.tasks.some(
          (task) => task.subtasks && task.subtasks.length > 0,
        );
      });

      return {
        ...organization,
        projects: filteredProjects,
      };
    });

    return { success: true, organizations };
  } catch (error) {
    console.error("Error fetching user organizations:", error);
    return { success: false, message: "Failed to fetch organizations" };
  }
};
