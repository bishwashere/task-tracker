"use server";
import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";

export const register = async (formData: FormData) => {
    try {
        const name = formData.get('name') as string;
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;
        const confirmPassword = formData.get('confirmPassword') as string;

        if (!email || !password || !confirmPassword) {
            return { success: false, message: 'All fields required!' }
        }
        if (password !== confirmPassword) {
            return { sucess: false, message: 'Password didnot match!' }
        }
        const existingUser = await prisma.user.findUnique({ where: { email: String(email) } });
        if (existingUser) {
            return { success: false, message: 'User already exists.' }
        }

        const hashedPassword = await hash(password, 10);
        await prisma.user.create({
            data: {
                name: name,
                email: email,
                password: hashedPassword,
            },
        })

        return { success: true, message: 'User registered! Login to continue.' }
    } catch {
        return { success: false, message: 'Server Error!' }
    }
};