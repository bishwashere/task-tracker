"use server";
import { auth } from "@/lib/auth"
import Subtask from "@/pages/Subtask";
import { redirect } from "next/navigation"

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params;
  const session = await auth();

  if (!session) redirect('/login');

  return <Subtask subtaskId={id} />

}