"use server";
import { isUserValid } from "@/actions/isUserValid"
import { prisma } from "@/lib/prisma";

export const getOrganization = async () => {
    const userId = await isUserValid();
    if (!userId) {
        return { error: 'Unauthorized !' };
    }
    try {
        const organizations = await prisma.organization.findMany({
            where: {
                members: {
                    some: {
                        userId: userId, // Find where the user is a member
                    },
                },
            },
            include: {
                members: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                            }
                        }
                    },
                },
                projects: {
                    include: {
                        tasks: {
                            select: {
                                id: true,
                                subtasks: {
                                    select: {
                                        id: true,
                                        status: true,
                                    }
                                }
                            }
                        }
                    }
                },
            },
        });

        return { success: true, organizations };
    } catch (error) {
        console.error("Error fetching user organizations:", error);
        return { success: false, message: "Failed to fetch organizations" };
    }
}