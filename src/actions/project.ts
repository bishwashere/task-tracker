"use server";

import { prisma } from "@/lib/prisma";
import { isUserValid } from "./isUserValid";

export const addProject = async (organizationId: string, projectName: string) => {
    const userId = await isUserValid();
    if (!userId) {
        return { success: false, message: "Unauthorized !" };
    }
    try {
        // Check if the logged-in user is an admin in the organization
        const adminCheck = await prisma.userOrganization.findFirst({
            where: {
                userId: userId,
                organizationId,
                role: "ADMIN",
            },
        });
        if (!adminCheck) {
            return { success: false, message: "Only admins can add users to the organization." };
        }

        // Create the project
        const project = await prisma.project.create({
            data: {
                name: projectName,
                organizationId,
            },
        });

        return { success: true, message: "Project added !", project };
    } catch (error) {
        console.error("Error adding project:", error);
        return { success: false, message: "Something went wrong. Please try again." };
    }
};
