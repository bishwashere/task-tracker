"use client";
import React, { useState } from "react";
import Header from "./header";
import { useDashboardContext } from "@/context/dashboard-context";
import AddOrganizationModal from "./header/add-organization-modal";
import AddProject from "./add-project";
import { useListUserOrganizations } from "@/queries/organizations/hooks";
import Loading from "@/components/ui/loading";
import ProjectsList from "./projects-list";

const Dashboard = () => {
  const { selectedOrg } = useDashboardContext();
  const [addOrganizationModalIsOpen, setAddOrganizationModalIsOpen] =
    useState(false);
  const [addProjectModalIsOpen, setAddProjectModalIsOpen] = useState(false);
  const org = useListUserOrganizations();

  if (org.isLoading) return <Loading />;

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Top Bar */}
      <Header />

      {/* Sample Organization */}
      {!selectedOrg && (
        <div
          className="bg-white p-6 rounded shadow-md border-l-4 border-blue-500 cursor-pointer"
          onClick={() => setAddOrganizationModalIsOpen(true)}
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Step 1: Add Organization</h3>
          </div>
          <AddOrganizationModal
            isOpen={addOrganizationModalIsOpen}
            onOpenChange={setAddOrganizationModalIsOpen}
          />
        </div>
      )}

      {selectedOrg && selectedOrg.role == "ADMIN" && (
        <>
          <button
            className="bg-blue-500 rounded-md text-white py-1 px-2 cursor-pointer"
            onClick={() => setAddProjectModalIsOpen(true)}
          >
            Add a project
          </button>
          <AddProject
            isOpen={addProjectModalIsOpen}
            onOpenChange={setAddProjectModalIsOpen}
          />
        </>
      )}

      <ProjectsList />
    </div>
  );
};

export default Dashboard;
