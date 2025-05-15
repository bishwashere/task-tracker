"use client";
import React, { useState } from "react";
import Header from "./header";
import { useDashboardContext } from "@/context/dashboard-context";
import AddOrganizationModal from "./header/add-organization-modal";
import AddProject from "./add-project";
import { useListUserOrganizations } from "@/queries/organizations/hooks";
import Loading from "@/components/ui/loading";
import ProjectsList from "./projects-list";
import GuidedProjectModal from "./guided-project/guided-project-modal";
import GuidedOrganizationModal from "./guided-organization/guided-organization-modal";

const Dashboard = () => {
  const { selectedOrg, guidedMode } = useDashboardContext();
  const org = useListUserOrganizations();

  const [isAddOrganizationModalOpen, setIsAddOrganizationModalOpen] = useState(false);
  const [isGuidedAddOrganizationModalOpen, setIsGuidedAddOrganizationModalOpen] = useState(false);

  const [addProjectModalIsOpen, setAddProjectModalIsOpen] = useState(false);
  const [isGuidedAddProjectModalOpen, setIsGuidedAddProjectModalOpen] = useState(false);

  const openAddOrganizationModal = () => {
    if (guidedMode) setIsGuidedAddOrganizationModalOpen(true);
    else setIsAddOrganizationModalOpen(true);
  }

  const openAddProjectModal = () => {
    if (guidedMode) setIsGuidedAddProjectModalOpen(true)
    else setAddProjectModalIsOpen(true)
  }

  if (org.isLoading) return <Loading />;

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Top Bar */}
      <Header />

      {/* Sample Organization */}
      {!selectedOrg && (
        <div
          className="bg-white p-6 rounded shadow-md border-l-4 border-blue-500 cursor-pointer"
          onClick={openAddOrganizationModal}
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Step 1: Add Organization</h3>
          </div>
          <AddOrganizationModal isOpen={isAddOrganizationModalOpen} onOpenChange={setIsAddOrganizationModalOpen} />
          <GuidedOrganizationModal isOpen={isGuidedAddOrganizationModalOpen} onOpenChange={setIsGuidedAddOrganizationModalOpen} />
        </div>
      )}

      {selectedOrg && selectedOrg.role == "ADMIN" && (
        <>
          <button
            onClick={openAddProjectModal}
            className="bg-blue-500 rounded-md text-white py-1 px-2 cursor-pointer"
          >
            Add a project
          </button>
          <AddProject
            isOpen={addProjectModalIsOpen}
            onOpenChange={setAddProjectModalIsOpen}
          />
          <GuidedProjectModal isOpen={isGuidedAddProjectModalOpen} onOpenChange={setIsGuidedAddProjectModalOpen} />
        </>
      )}

      <ProjectsList />
    </div>
  );
};

export default Dashboard;
