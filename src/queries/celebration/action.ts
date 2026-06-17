"use server";

import { auth } from "@/lib/auth";
import { getEffectiveUser } from "@/lib/effective-user";
import { prisma } from "@/lib/prisma";

const DAYS_14_MS = 14 * 24 * 60 * 60 * 1000;
const DAYS_3_MS = 3 * 24 * 60 * 60 * 1000;

export const getCelebrationStats = async (organizationId: string) => {
  try {
    const user = await auth();
    if (!user?.user?.id) return { success: false, message: "Unauthorized" };

    const effective = await getEffectiveUser(organizationId);
    if ("error" in effective) return { success: false, message: effective.error };

    // Never show celebrations when viewing as another user
    if (effective.isViewingAs) {
      return { success: true, subtasks14d: 0, subtasks3d: 0, userId: user.user.id };
    }

    const userId = effective.effectiveUserId;
    const now = new Date();
    const cutoff14d = new Date(now.getTime() - DAYS_14_MS);
    const cutoff3d = new Date(now.getTime() - DAYS_3_MS);

    const [subtasks14d, subtasks3d] = await Promise.all([
      prisma.subtask.count({
        where: {
          assignedUserId: userId,
          status: "done",
          completedAt: { gte: cutoff14d },
        },
      }),
      prisma.subtask.count({
        where: {
          assignedUserId: userId,
          status: "done",
          completedAt: { gte: cutoff3d },
        },
      }),
    ]);

    return { success: true, subtasks14d, subtasks3d, userId };
  } catch (error) {
    console.error("Error fetching celebration stats:", error);
    return { success: false, message: "Failed to fetch celebration stats" };
  }
};
