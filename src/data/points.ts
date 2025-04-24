"use server";
import { isUserValid } from "@/actions/isUserValid";
import { prisma } from "@/lib/prisma";

export const getPoints = async () => {
  const userId = await isUserValid();
  if (!userId) {
    return { success: false, message: "Unauthorized !" };
  }
  try {
    const points = await prisma.pointsEarned.findMany({
      where: {
        userId: userId,
      },
    });
    return { success: true, points };
  } catch (error) {
    console.error("Error fetching user organizations:", error);
    return { success: false, message: "Failed to fetch organizations" };
  }
};
