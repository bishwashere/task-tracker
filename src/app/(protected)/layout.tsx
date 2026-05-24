import { DashboardContextProvider } from "@/context/dashboard-context";
import ProtectedProviders from "./providers";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import React from "react";

type Props = {
  children: React.ReactNode;
};

const Layout = async (props: Props) => {
  const session = await auth();
  if (!session) redirect("/login");
  return (
    <DashboardContextProvider>
      <ProtectedProviders>{props.children}</ProtectedProviders>
    </DashboardContextProvider>
  );
};

export default Layout;
