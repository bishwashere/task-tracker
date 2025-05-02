"use server";
import { auth } from "@/lib/auth";
import React from "react";
import { redirect } from "next/navigation";
import Home from "./_components";

const Page = async () => {
  const user = await auth();
  if (user) {
    redirect("/dashboard");
  }
  return <Home />;
};

export default Page;
