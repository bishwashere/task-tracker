"use server";

import { isUserValid } from "@/actions/isUserValid";
import { prisma } from "@/lib/prisma";

export const fetchProjectData = async (projectId: string) => {
    const userId = await isUserValid();
    if (!userId) {
        return {success:false, error: 'Unauthorized !' };
    }
    try {
        //Get the organization ID from the project ID
        const project = await prisma.project.findUnique({
            where: { id: projectId },
            select: { id: true, organizationId: true },
        });

        if (!project) {
            return { success: false, message: "Project not found." };
        }

        const organizationId = project.organizationId;

        //Check if the user is an admin or member in the organization
        const userOrganization = await prisma.userOrganization.findFirst({
            where: {
                userId: userId,
                organizationId: organizationId,
            },
            select: { role: true },
        });

        if (!userOrganization) {
            return { success: false, message: "You are not part of this organization." };
        }

        const isAdmin = userOrganization.role === "ADMIN";

        let tasksWithSubtasks;

        if (isAdmin) {
            //Admin: Fetch all tasks, subtasks, and subtask tags
            tasksWithSubtasks = await prisma.task.findMany({
                where: { projectId: projectId },
                include: {
                    subtasks: true,
                },
            });

            //Fetch all organization members for admin
            const organizationMembers = await prisma.user.findMany({
                where: {
                    organizations: {
                        some: { organizationId: organizationId },
                    },
                },
                select: {
                    id: true,
                    name: true,
                },
            });

            return {
                success: true,
                tasks: tasksWithSubtasks,
                members: organizationMembers,
                role: "admin"
            };
        } else {
            //Member: Fetch only assigned subtasks
            const assignedSubtasks = await prisma.subtask.findMany({
                where: {
                    assignedUserId: userId,
                    task: { projectId: projectId },
                },
                include: {
                    task: {
                        include: {
                            subtasks: {
                                where: { assignedUserId: userId },
                            },
                        },
                    },
                },
            });

            const tasksWithSubtasks = assignedSubtasks.map((subtask) => subtask.task);

            return {
                success: true,
                tasks: tasksWithSubtasks,
                role: "member"
            };
        }
    } catch (error) {
        console.error("Error fetching project data:", error);
        return { success: false, message: "Something went wrong. Please try again." };
    }
};
