"use client"
import { useListUserOrganizations } from "@/queries/organizations/hooks";
import { Organization, UserOrganization } from "@prisma/client";
import { createContext, useContext, useEffect, useState } from "react";

export type Org = UserOrganization & {
  organization: Organization & {
    members: {
      id: string;
      role: string;
      user: {
        id: string;
        name: string | null;
        email: string | null;
        image: string | null;
      };
    }[];
  }
}

type DashboardContext = {
  selectedOrg: Org | null;
  setSelectedOrg: (org: Org) => void;
}

export const DashboardContext = createContext<DashboardContext>({
  selectedOrg: null,
  setSelectedOrg: () => { },
});

export const DashboardContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [selectedOrg, setSelectedOrg] = useState<Org | null>(null);
  const orgs = useListUserOrganizations()

  useEffect(() => {
    if (orgs.isLoading || !orgs.data?.length) return
    const storedId = localStorage.getItem("selectedOrganizationId");
    if (storedId) {
      const selectedOrg = orgs.data?.find((org) => org.id === storedId);
      if (selectedOrg) {
        setSelectedOrg(selectedOrg);
      } else {
        setSelectedOrg(orgs.data[0]);
        localStorage.setItem("selectedOrganizationId", orgs.data[0].id);
      }
    } else {
      setSelectedOrg(orgs.data[0]);
      localStorage.setItem("selectedOrganizationId", orgs.data[0].id);
    }
  }, [orgs.data, orgs.isLoading]);

  useEffect(() => {
    if (selectedOrg) {
      localStorage.setItem("selectedOrganizationId", selectedOrg.id);
    }
  }, [selectedOrg]);

  return (
    <DashboardContext.Provider
      value={{ selectedOrg, setSelectedOrg }}
    >
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboardContext = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error(
      "useDashboardContext must be used within a DashboardContextProvider"
    );
  }
  return context;
}