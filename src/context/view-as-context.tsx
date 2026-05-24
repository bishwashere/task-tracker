"use client";

import { useDashboardContext } from "@/context/dashboard-context";
import {
  useSetViewAsUser,
  useViewAsState,
} from "@/queries/view-as/hooks";
import { createContext, useContext } from "react";

type ViewAsUser = {
  id: string;
  name: string | null;
  email: string | null;
};

type ViewAsContextValue = {
  isViewingAs: boolean;
  viewingAsUser: ViewAsUser | null;
  setViewAsUser: (userId: string | null) => Promise<void>;
  clearViewAs: () => Promise<void>;
  /** Role used for all in-app permissions (matches server `role`). */
  effectiveRole: "ADMIN" | "MEMBER";
  effectiveRoleLabel: "admin" | "member";
  isRealAdmin: boolean;
  isLoading: boolean;
};

const ViewAsContext = createContext<ViewAsContextValue | null>(null);

export function ViewAsContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { selectedOrg } = useDashboardContext();
  const organizationId =
    selectedOrg?.organization?.id ?? selectedOrg?.organizationId ?? "";
  const { data, isLoading } = useViewAsState(organizationId);
  const setViewAs = useSetViewAsUser(organizationId);

  const isViewingAs = data?.isViewingAs ?? false;
  const viewingAsUser = data?.viewingAsUser ?? null;
  const isRealAdmin = selectedOrg?.role === "ADMIN";
  const effectiveRoleLabel = data?.role ?? (isRealAdmin ? "admin" : "member");
  const effectiveRole = effectiveRoleLabel === "admin" ? "ADMIN" : "MEMBER";

  const setViewAsUser = async (userId: string | null) => {
    await setViewAs.mutateAsync(userId);
  };

  const clearViewAs = async () => {
    await setViewAs.mutateAsync(null);
  };

  return (
    <ViewAsContext.Provider
      value={{
        isViewingAs,
        viewingAsUser,
        setViewAsUser,
        clearViewAs,
        effectiveRole,
        effectiveRoleLabel,
        isRealAdmin,
        isLoading,
      }}
    >
      {children}
    </ViewAsContext.Provider>
  );
}

export function useViewAsContext() {
  const context = useContext(ViewAsContext);
  if (!context) {
    throw new Error("useViewAsContext must be used within ViewAsContextProvider");
  }
  return context;
}

/** Client role for pages without a server role payload (dashboard, points, etc.). */
export function useAppRole() {
  const { effectiveRoleLabel } = useViewAsContext();
  return effectiveRoleLabel;
}

/** @deprecated Use useAppRole() */
export function useEffectiveOrgRole() {
  const { effectiveRole } = useViewAsContext();
  return effectiveRole;
}

export function useIsRealAdmin() {
  const { isRealAdmin } = useViewAsContext();
  return isRealAdmin;
}
