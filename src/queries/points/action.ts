"use server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const getPoints = async (u?: string) => {
  const user = await auth();
  if (!user || !user.user || !user.user.id) {
    return { success: false, message: "Unauthorized !" };
  }

  const userId = u || user.user.id;

  console.log(userId);

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
    return { success: true, points, user: userFromDb };
  } catch (error) {
    console.error("Error fetching user organizations:", error);
    return { success: false, message: "Failed to fetch organizations" };
  }
};
