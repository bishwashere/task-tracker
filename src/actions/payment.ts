"use server";
import { User } from "@prisma/client";
import { stripe } from "@/lib/stripe";
import createProtectedServerAction from "@/lib/create-protected-server-action";
import { prisma } from "@/lib/prisma";

export const createStripeSession = createProtectedServerAction(
  async (pkg: string, user: User) => {
    const res = await stripe.createSession(pkg, user);
    return res?.url;
  },
);

export const getUserSubscription = createProtectedServerAction(
  async (user: User) => {
    const s = await prisma.subscription.findUnique({
      where: { userId: user.id },
    });

    return s;
  },
);

export const hasSession = createProtectedServerAction(
  async (sessionId: string, _user: User) => {
    try {
      const session = await stripe.stripe.checkout.sessions.retrieve(sessionId);
      if (session) {
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  },
);

export const createCustomerPortal = createProtectedServerAction(
  async (user: User) => {
    const url = await stripe.createCustomerPortal(user);
    return url;
  },
);
