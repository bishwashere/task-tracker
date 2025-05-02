"use server";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Points from "./_components";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const session = await auth();
  const { user } = await searchParams as {
    user: string;
  }
  if (!session) redirect("/login");

  return <Points user={user} />;
}
