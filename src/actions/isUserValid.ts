"use server";
import { auth } from "@/lib/auth";

export const isUserValid = async () => {
  const session = await auth();
  if (session) {
    const userId = session?.user?.id as string;
    return userId;
  }
  return null;
};
