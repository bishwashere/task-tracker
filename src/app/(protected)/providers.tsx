"use client";

import { ViewAsContextProvider } from "@/context/view-as-context";
import ViewAsBanner from "@/components/common/view-as-banner";

export default function ProtectedProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ViewAsContextProvider>
      <ViewAsBanner />
      {children}
    </ViewAsContextProvider>
  );
}
