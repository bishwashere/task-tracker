"use server";
import { prisma } from "@/lib/prisma";
import { isUserValid } from "./isUserValid";
import { revalidatePath } from "next/cache";

export const saveTask = async (projectId: string, taskTitle: string) => {
    const userId = await isUserValid();
    if (!userId) {
        return { success: false, message: "Unauthorized !" };
    }
    try {
        // Fetch project and organization
        const project = await prisma.project.findUnique({
            where: { id: projectId },
            include: { organization: { include: { members: true } } },
        });

        if (!project) {
            return { success: false, message: "Project not found" };
        }

        // Check if the user is an admin in the organization
        const userOrg = project.organization.members.find(
            (member) => member.userId === userId
        );

        if (!userOrg || userOrg.role !== "ADMIN") {
            return { success: false, message: "Permission denied" };
        }

        // Create a new task
        const task = await prisma.task.create({
            data: {
                name: taskTitle,
                projectId,
            },
            include: {
                subtasks: true,
            }
        });

        return { success: true, message: "Task Added!", task };
    } catch (error) {
        console.error("Error adding task:", error);
        return { success: false, message: "An error occurred while adding the task." };
    }
};

export const saveSubTask = async (taskId: string, projectId: string, subTaskName: string, dueDate: Date, points: number) => {
    const userId = await isUserValid();
    if (!userId) {
        return { success: false, message: "Unauthorized !" };
    }
    try {
        // Fetch project and organization
        const project = await prisma.project.findUnique({
            where: { id: projectId },
            include: { organization: { include: { members: true } } },
        });

        if (!project) {
            return { success: false, message: "Project not found" };
        }

        // Check if the user is an admin in the organization
        const userOrg = project.organization.members.find(
            (member) => member.userId === userId
        );

        if (!userOrg || userOrg.role !== "ADMIN") {
            return { success: false, message: "Permission denied" };
        }

        // Create a new task
        const subTask = await prisma.subtask.create({
            data: {
                name: subTaskName,
                dueDate,
                points,
                assignedUserId: null,
                taskId
            },
        });

        // Revalidate the cache to reflect the new subtask
        revalidatePath(`/tasks/${taskId}`);

        return { success: true, message: "Task Added!", subTask };
    } catch (error) {
        console.error("Error adding subtask:", error);
        return { success: false, message: "An error occurred while adding the subtask." };
    }
};

export const saveTaskTag = async (subtaskId: string, projectId: string, tagName: string, tagColor: string) => {
    const userId = await isUserValid();
    if (!userId) {
        return { success: false, message: "Unauthorized !" };
    }
    try {
        // Fetch project and organization
        const project = await prisma.project.findUnique({
            where: { id: projectId },
            include: { organization: { include: { members: true } } },
        });

        if (!project) {
            return { success: false, message: "Project not found" };
        }

        const updatedSubtask = await prisma.subtask.update({
            where: { id: subtaskId },
            data: {
                tagName: tagName,
                tagColor: tagColor,
            },
        });

        return { success: true, message: "Tag Added!", updatedSubtask };
    } catch (error) {
        console.error("Error adding tag:", error);
        return { success: false, message: "An error occurred." };
    }
};

export const togglePriority = async (subtaskId: string, projectId: string, priority: number) => {
    const userId = await isUserValid();
    if (!userId) {
        return { success: false, message: "Unauthorized !" };
    }
    try {
        // Fetch project and organization
        const project = await prisma.project.findUnique({
            where: { id: projectId },
            include: { organization: { include: { members: true } } },
        });

        if (!project) {
            return { success: false, message: "Project not found" };
        }

        // Check if the user is an admin in the organization
        const userOrg = project.organization.members.find(
            (member) => member.userId === userId
        );

        if (!userOrg || userOrg.role !== "ADMIN") {
            return { success: false, message: "Permission denied" };
        }

        const updatedSubtask = await prisma.subtask.update({
            where: { id: subtaskId },
            data: {
                priority: priority,
            },
        });

        return { success: true, updatedSubtask };
    } catch (error) {
        console.error("Error while toggling priority", error);
        return { success: false, message: "An error occurred." };
    }
};

export const updateSubtaskStatus = async (subtaskId: string, projectId: string, status: string) => {
    const userId = await isUserValid();
    if (!userId) {
        return { success: false, message: "Unauthorized !" };
    }
    try {
        // Fetch project and organization
        const project = await prisma.project.findUnique({
            where: { id: projectId },
            include: { organization: { include: { members: true } } },
        });

        if (!project) {
            return { success: false, message: "Project not found" };
        }

        // // Check if the user is an admin in the organization
        // const userOrg = project.organization.members.find(
        //     (member: any) => member.userId === userId
        // );

        // if (!userOrg || userOrg.role !== "ADMIN") {
        //     return { success: false, message: "Permission denied" };
        // }

        const updatedSubtask = await prisma.subtask.update({
            where: { id: subtaskId },
            data: {
                status: status,
            },
        });

        return { success: true, message: 'Success', updatedSubtask };
    } catch (error) {
        console.error("Error while toggling priority", error);
        return { success: false, message: "An error occurred." };
    }
};

export const assignUserToSubtask = async (subtaskId: string, projectId: string, memberUserId: string) => {
    const userId = await isUserValid();
    if (!userId) {
        return { success: false, message: "Unauthorized !" };
    }
    try {
        // Fetch project and organization
        const project = await prisma.project.findUnique({
            where: { id: projectId },
            include: { organization: { include: { members: true } } },
        });

        if (!project) {
            return { success: false, message: "Project not found" };
        }

        // Check if the user is an admin in the organization
        const userOrg = project.organization.members.find(
            (member) => member.userId === userId
        );

        if (!userOrg || userOrg.role !== "ADMIN") {
            return { success: false, message: "Permission denied" };
        }

        const updatedSubtask = await prisma.subtask.update({
            where: { id: subtaskId },
            data: {
                assignedUserId: memberUserId,
            },
        });

        return { success: true, message: 'Success', updatedSubtask };
    } catch (error) {
        console.error("Error while assigning user", error);
        return { success: false, message: "An error occurred." };
    }
};