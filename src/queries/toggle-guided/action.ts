"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export type SetGuidedModeProps = {
    guidedMode: boolean;
};

export const setGuidedMode = async ( guidedMode: boolean) => {
    try {
        const user = await auth();
        if (!user || !user.user || !user.user.id) {
            return { success: false, message: "Unauthorized !" };
        } else {
            await prisma.user.update({
                where: { id: user.user.id },
                data: { guidedMode: guidedMode }
            });

            return { success: true };
        }
    } catch (error) {
        return { success: false, message: "Failed to fetch." };
    }
}

export const getGuidedInfo = async () => {
    try {
        const user = await auth();
        if (!user || !user.user || !user.user.id) {
            return { success: false, message: "Unauthorized !" };
        } else {
            const userInfo = await prisma.user.findFirst({
                where: { id: user.user.id },
                select: {
                    guidedMode: true,
                }
            });

            return { success: true, guidedMode: userInfo?.guidedMode };
        }
    } catch (error) {
        return { success: false, message: "Failed to fetch." };
    }
};