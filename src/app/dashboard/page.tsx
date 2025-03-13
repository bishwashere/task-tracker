"use server";
import { auth } from "@/lib/auth";
import Dashboard from "@/page/Dashboard";
import { redirect } from "next/navigation";

export default async function Page() {
    const session = await auth()
    if (!session) redirect('/login')
   
    return (
      <Dashboard session={session}/>
    )
  }