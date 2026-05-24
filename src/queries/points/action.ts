"use server";
import { getEffectiveUser } from "@/lib/effective-user";
import { prisma } from "@/lib/prisma";

export const getPoints = async (u?: string, organizationId?: string) => {
  const effective = await getEffectiveUser(organizationId);
  if ("error" in effective) {
    return { success: false, message: effective.error };
  }

  const userId = effective.isViewingAs
    ? effective.effectiveUserId
    : (u || effective.effectiveUserId);

  const userFromDb = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!userFromDb) {
    console.error(userId, "User not found");
    return { success: false, message: "User not found" };
  }

  try {
    const points = await prisma.pointsEarned.findMany({
      where: {
        userId: userId,
      },
    });

    const projectIds = [...new Set(points.map((entry) => entry.projectId))];
    const projects = projectIds.length
      ? await prisma.project.findMany({
          where: { id: { in: projectIds } },
          select: { id: true, slug: true },
        })
      : [];

    const projectSlugs = Object.fromEntries(
      projects.map((project) => [project.id, project.slug]),
    );

    return { success: true, points, user: userFromDb, projectSlugs };
  } catch (error) {
    console.error("Error fetching user organizations:", error);
    return { success: false, message: "Failed to fetch organizations" };
  }
};
