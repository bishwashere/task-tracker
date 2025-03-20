"use server";
import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";

export const register = async (formData: FormData) => {
  try {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (!email || !password || !confirmPassword) {
      return { success: false, message: "All fields required!" };
    }
    if (password !== confirmPassword) {
      return { sucess: false, message: "Password didnot match!" };
    }
    const existingUser = await prisma.user.findUnique({
      where: { email: String(email) },
    });
    if (existingUser) {
      return { success: false, message: "User already exists." };
    }

    const hashedPassword = await hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name: name,
        email: email,
        password: hashedPassword,
      },
    });

    await prisma.subscription.create({
      data: {
        userId: user.id,
        status: "trialing",
        startedAt: new Date(),
        // 7 days free trial
        endsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        customerId: "",
        subscriptionIdFromStripe: "",
      },
    });

    return { success: true, message: "User registered! Login to continue." };
  } catch {
    return { success: false, message: "Server Error!" };
  }
};
