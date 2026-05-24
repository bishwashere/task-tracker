"use server";

import { ai } from "@/lib/ai";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculateProgressWithStats } from "@/lib/progress";
import { isMongoObjectId, slugifyProjectName } from "@/lib/project-slug";
import { z } from "zod";

async function generateUniqueProjectSlug(name: string) {
  const base = slugifyProjectName(name);
  let slug = base;
  let suffix = 2;

  while (await prisma.project.findUnique({ where: { slug } })) {
    slug = `${base}-${suffix}`;
    suffix += 1;
  }

  return slug;
}

async function findProjectBySlugOrId(slugOrId: string) {
  if (isMongoObjectId(slugOrId)) {
    return prisma.project.findUnique({ where: { id: slugOrId } });
  }

  return prisma.project.findUnique({ where: { slug: slugOrId } });
}

export type AddProjectProps = {
  organizationId: string;
  projectName: string;
  projectDescription: string;
  goal?: string;
  focusArea?: string;
  mainGoal?: string;
};

// todo non admin are able to add project
export const addProject = async ({
  organizationId,
  projectName,
  projectDescription,
  goal,
  focusArea,
  mainGoal,
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
        slug: await generateUniqueProjectSlug(projectName),
        description: projectDescription,
        organizationId,
        goal,
        focusArea,
        mainGoal,
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
        projectSummary: true, 
      },
    });

    // save summary, just trigger it
    projects.map(async (project) => {
      saveProjectSummary(project.id);
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

export const getProjectById = async (slugOrId: string) => {
  const user = await auth();
  if (!user || !user.user || !user.user.id) {
    return { success: false, error: "Unauthorized !" };
  }

  const userId = user.user.id;
  try {
    const project = await findProjectBySlugOrId(slugOrId);

    if (!project) {
      return { success: false, message: "Project not found." };
    }

    const projectId = project.id;
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
        project: project,
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
        project: project,
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

export const saveProjectSummary = async (projectId: string) => {
  const user = await auth();
  if (!user || !user.user || !user.user.id) {
    return { success: false, message: "Unauthorized !" };
  }

  const summary = await prisma.projectSummary.findFirst({
    where: { projectId },
  });

  // if summary is generated 1 hour ago continue
  if (
    summary?.updatedAt &&
    summary.updatedAt > new Date(Date.now() - 1000 * 60 * 60)
  ) {
    return { success: true, message: "Summary already generated" };
  }

  try {
    // Fetch project and organization
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        tasks: {
          include: {
            subtasks: true,
          },
        },
      },
    });

    const prompt = `
    Summarize this project content into two sections.
    1. "done" - max 3 short points
    2. "pending" - max 3 short points

    user short paraphrase only no full sentences. Avoid generic or repeated items.

    output as 
    \`\`\`json
    {
      "done": [],
      "pending": []
    }
    \`\`\`

    Strictly follow the format. Do not include any additional messages, explanations, or formatting—just return the JSON response in the specified format."
    ${JSON.stringify(project)}
    `;

    const resp = (await ai.generate(prompt)) as {
      done: string[];
      pending: string[];
    };

    const schema = z.object({
      done: z.array(z.string()),
      pending: z.array(z.string()),
    });

    console.log("resp", resp);

    const validated = schema.parse(resp);

    await prisma.projectSummary.upsert({
      where: { projectId },
      update: {
        prompt,
        response: JSON.stringify(resp),
        done: validated.done,
        pending: validated.pending,
      },
      create: {
        projectId,
        prompt,
        response: JSON.stringify(resp),
        done: validated.done,
        pending: validated.pending,
      },
    });

    if (!project) {
      return { success: false, message: "Project not found" };
    }
  } catch (error) {
    console.error("Error fetching project data:", error);
    return {
      success: false,
      message: "Something went wrong. Please try again.",
    };
  }
};
