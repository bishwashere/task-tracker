"use server";
import { DashboardContextProvider } from "@/context/dashboard-context";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import React from "react";

type Props = {
  children: React.ReactNode;
};
/**
 * Everything inside this layout will be protected.
 */
const Layout = async (props: Props) => {
  const session = await auth();
  if (!session) redirect("/login");
  return <DashboardContextProvider>{props.children}</DashboardContextProvider>;
};

export default Layout;
