"use server";

import desiredOutcomes from "@/constants/desiredOutcomes";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export type CreateInsightsProps = {
    projectId: string;
    desiredOutcome?: string[];
}

export type UpdateDesiredOutComeProps = {
    projectId: string;
    newDesiredOutcome: string[];
}

export type GetInsightsFromSubredditsKeywordsProps = {
    prompt: string;
    projectId: string;
    desiredOutcome: string;
}

export const getInsights = async (projectId: string) => {
    try {
        const user = await auth();
        if (!user || !user.user || !user.user.id) {
            return { success: false, message: "Unauthorized !" };
        } else {
            const insights = await prisma.insight.findFirst({
                where: {
                    projectId: projectId,
                }
            });
            return { success: true, insights: insights };
        }
    } catch {
        return { success: false, message: "Failed to get insights." }
    }
}

export const createInsights = async ({ projectId, desiredOutcome }: CreateInsightsProps) => {
    try {
        const user = await auth();
        if (!user || !user.user || !user.user.id) {
            return { success: false, message: "Unauthorized !" };
        } else {
            const insights = await prisma.insight.create({
                data: {
                    projectId: projectId,
                    desiredOutcome: desiredOutcome ? desiredOutcome : Array(desiredOutcomes[0]),
                }
            });
            return { success: true, insights: insights };
        }
    } catch {
        return { success: false, message: "Failed to create insights." }
    }
}

export const updateDesiredOutCome = async ({ projectId, newDesiredOutcome }: UpdateDesiredOutComeProps) => {
    try {
        const user = await auth();
        if (!user || !user.user || !user.user.id) {
            return { success: false, message: "Unauthorized !" };
        } else {
            const res = await prisma.insight.update({
                where: {
                    projectId: projectId,
                },
                data: {
                    desiredOutcome: newDesiredOutcome,
                }
            });
            return { success: true, message: 'Updated desired outcome.', insights: res };
        }
    } catch {
        return { success: false, message: "Failed to update insights." }
    }
}

export const getInsightsFromSubredditsKeywords = async ({ prompt, projectId, desiredOutcome }: GetInsightsFromSubredditsKeywordsProps) => {
    try {
        const user = await auth();
        if (!user || !user.user || !user.user.id) {
            return { success: false, message: "Unauthorized !" };
        } else {
            const res = await fetch(`${process.env.OLIVEDRIFT_KEYWORD_SUBREDDIT_URL}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${process.env.OLIVEDRIFT_API_KEY}`
                },
                body: JSON.stringify({ text: prompt })
            })
            const resData: { success: boolean, subreddits: string[], keywords: string[] } = await res.json();
            if (resData.success) {
                const res = await fetch(`${process.env.OLIVEDRIFT_INSIGHTS_URL}`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${process.env.OLIVEDRIFT_API_KEY}`
                    },
                    body: JSON.stringify({
                        subreddits: resData.subreddits,
                        keywords: resData.keywords,
                        webhookUrl: process.env.WEBHOOK_URL,
                        id: projectId,
                        desiredOutcome: desiredOutcome,
                    })
                });
                const data = await res.json();
                if (data.success) return { success: true };
                else return { success: false };
            } else {
                return { success: false };
            }
        }
    } catch {
        return { success: false };
    }
}