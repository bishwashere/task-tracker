"use server";

import createProtectedServerAction from "@/lib/create-protected-server-action";
import { prisma } from "@/lib/prisma";
import { User } from "@prisma/client";

const serializeSubscription = (
  subscription: NonNullable<
    Awaited<ReturnType<typeof prisma.subscription.findUnique>>
  >,
) => ({
  ...subscription,
  currentPeriodStart: subscription.currentPeriodStart?.toISOString() ?? null,
  currentPeriodEnd: subscription.currentPeriodEnd?.toISOString() ?? null,
  createdAt: subscription.createdAt.toISOString(),
  updatedAt: subscription.updatedAt.toISOString(),
});

export const getUserSubscription = createProtectedServerAction(
  async (user: User) => {
    let subscription = await prisma.subscription.findUnique({
      where: { userId: user.id },
    });

    if (!subscription) {
      subscription = await prisma.subscription.create({
        data: {
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          userId: user.id,
          status: "trial",
        },
      });
    }

    return serializeSubscription(subscription);
  },
);
