"use server";
import { auth } from "@/lib/auth"
import Points from "@/page/Points";
import { redirect } from "next/navigation"

export default async function Page({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
    const session = await auth();
    const { fromProject } = await searchParams;
    let projectId: string | null = null;
    if(typeof fromProject === "string") projectId = fromProject;
    if (!session) redirect('/login');

    return <Points projectId={projectId} session={session} />
}