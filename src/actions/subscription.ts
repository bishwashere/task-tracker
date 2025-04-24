"use server";

import createProtectedServerAction from "@/lib/create-protected-server-action";
import { prisma } from "@/lib/prisma";
import { User } from "@prisma/client";

export const getUserSubscription = createProtectedServerAction(
  async (user: User) => {
    const subscription = await prisma.subscription.findFirst({
      where: {
        userId: user.id,
      },
    });

    if (!subscription) {
      // if there is no subscription, assume user has not claimed the free trial
      const subscription = await prisma.subscription.create({
        data: {
          currentPeriodStart: new Date(),
          // 7 day trial
          currentPeriodEnd: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          userId: user.id,
          status: "trial",
        },
      });

      return subscription;
    }

    return subscription;
  },
);
