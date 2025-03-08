"use server";

import { isUserValid } from "@/actions/isUserValid";
import { prisma } from "@/lib/prisma";

export const fetchSubtaskData = async (subtaskId: string) => {
    const userId = await isUserValid();
    if (!userId) {
        return { success: false, error: 'Unauthorized !' };
    }
    try {
        // Fetch the subtask along with its related task and organization
        const subtask = await prisma.subtask.findUnique({
            where: { id: subtaskId },
            include: {
                task: {
                    select: {
                        project: {
                            select: {
                                organization: {
                                    select: {
                                        id: true,
                                        members: {
                                            select: {
                                                userId: true,
                                                role: true,
                                            },
                                        },
                                    },
                                },
                                id: true,
                            },
                        },
                        name: true,
                    },
                },
                comments: {
                    select: {
                        user: {
                            select: {
                                name: true,
                                email: true,
                            }
                        },
                        comment: true,
                        createdAt: true,
                    }
                },
            },
        });
        // Check if the subtask exists
        if (!subtask) {
            return { success: false, error: 'No Subtask !' };
        }

        let userName = null;
        //fetch assigned user name
        if(subtask.assignedUserId){
            userName = await prisma.user.findUnique({
                where: { id: subtask.assignedUserId },
                select: {
                    name: true,
                }
            });
        }

        // Get organization and members
        const organization = subtask.task?.project?.organization;
        if (!organization) {
            return {success:false, message:"Organization not found"};
        }

        // Check if the user is an admin or a member of the organization
        const isAuthorized = organization.members.some(
            (member) => member.userId === userId && (member.role === 'ADMIN' || member.role === 'MEMBER')
        );

        if (!isAuthorized) {
            return {success:false, message:"Forbidden: You do not have permission to view this subtask"};
        }

        return {
            success: true,
            subtask,
            comments: subtask.comments,
            assignedUser: userName
        };
    } catch (error) {
        console.error("Error fetching project data:", error);
        return { success: false, message: "Something went wrong. Please try again." };
    }
};
