"use server";
import { auth } from "./auth";
import { prisma } from "./prisma";
import { User } from "@prisma/client";

type ActionWithUser<Args extends unknown[], Return> = (
  ...args: [...Args, User]
) => Promise<Return>;

const createProtectedServerAction = <Args extends unknown[], Return>(
  action: ActionWithUser<Args, Return>,
) => {
  return (async (...args: Args) => {
    const session = await auth();
    if (!session || !session.user) {
      throw new Error("Unauthorized, please login first.");
    }

    const user = session.user;

    const userInDb = await prisma.user.findUnique({
      where: { email: user.email as string },
    });

    if (!userInDb) {
      throw new Error("Unauthorized, please login first.");
    }

    return action(...args, userInDb);
  }) as (...args: Args) => Promise<Return>;
};

export default createProtectedServerAction;
