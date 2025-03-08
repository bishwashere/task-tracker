"use server";
import { getProjectById } from "@/data/project";
import { auth } from "@/lib/auth"
import Project from "@/pages/Project"
import { ProjectType } from "@/types/organization";
import Link from "next/link";
import { redirect } from "next/navigation"

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params;
  const session = await auth();

  if (!session) redirect('/login');

  const projectInfo = await getProjectById(id);
  if(projectInfo.success){
    return <Project project={projectInfo.project  as unknown as ProjectType} />
  }
  else {
    return(
      <div className="w-screen h-screen flex flex-col items-center justify-center gap-3">
        <p className="text-3xl font-semibold">Something went wrong :(</p>
        <p className="text-xl font-semibold">Try again !</p>
        <Link href="/dashboard" className="text-white text-lg bg-blue-600 px-4 py-2 rounded-xl mt-10">Go to Dashboard</Link>
      </div>
    )
  }
}