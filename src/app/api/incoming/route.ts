"use server";

import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const POST = async (req: Request) => {
    const data: { status: number, success: boolean, id: string, results: string[] } = await req.json();
    console.log(data)
    if (data.success && data.id && data.results) {
        await prisma.insight.update({
            where: {
                projectId: data.id,
            },
            data: {
                insights: data.results,
            }
        })
    }

    return NextResponse.json({ success: true });
}