"use client";
import React, { useState, useEffect } from "react";
import Header from "./header";
import { useDashboardContext } from "@/context/dashboard-context";
import AddOrganizationModal from "./header/add-organization-modal";
import AddProject from "./add-project";
import { useListUserOrganizations } from "@/queries/organizations/hooks";
import Loading from "@/components/ui/loading";
import ProjectsList from "./projects-list";
import GuidedProjectModal from "./guided-project/guided-project-modal";
import GuidedOrganizationModal from "./guided-organization/guided-organization-modal";
import OnboardingModal from "./onboarding-modal";
import { useListUserProjectByOrganizationId } from "@/queries/project/hooks";

const Dashboard = () => {
  const { selectedOrg, guidedMode } = useDashboardContext();
  const org = useListUserOrganizations();
  const projects = useListUserProjectByOrganizationId(
    selectedOrg?.organization?.id || "",
  );

  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isAddOrganizationModalOpen, setIsAddOrganizationModalOpen] = useState(false);
  const [isGuidedAddOrganizationModalOpen, setIsGuidedAddOrganizationModalOpen] = useState(false);

  const [addProjectModalIsOpen, setAddProjectModalIsOpen] = useState(false);
  const [isGuidedAddProjectModalOpen, setIsGuidedAddProjectModalOpen] = useState(false);

  // Check if onboarding should be shown
  useEffect(() => {
    if (org.isLoading) return;
    
    // Show onboarding if no organizations exist
    const hasNoOrganizations = !org.data || org.data.length === 0;
    
    if (hasNoOrganizations) {
      setIsOnboardingOpen(true);
      return;
    }

    // If we have organizations, check projects for the selected org
    if (selectedOrg) {
      // Only check projects loading if we have a selected org
      if (projects.isLoading) return;
      
      // Show onboarding if organization exists but no projects
      const hasNoProjects = !projects.data || projects.data.length === 0;
      
      if (hasNoProjects) {
        setIsOnboardingOpen(true);
      } else {
        setIsOnboardingOpen(false);
      }
    } else {
      // If no selected org but we have orgs, wait for context to select one
      setIsOnboardingOpen(false);
    }
  }, [org.data, org.isLoading, projects.data, projects.isLoading, selectedOrg]);

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
    <>
      <OnboardingModal isOpen={isOnboardingOpen} onOpenChange={setIsOnboardingOpen} />
      
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Top Bar */}
        <Header />

        {/* Sample Organization */}
        {!selectedOrg && !isOnboardingOpen && (
          <div
            className="bg-white p-4 rounded-lg border border-border shadow-sm border-l-[3px] border-l-blue-500 cursor-pointer hover:shadow-md transition-shadow duration-150"
            onClick={openAddOrganizationModal}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Step 1: Add Organization</h3>
            </div>
            <AddOrganizationModal isOpen={isAddOrganizationModalOpen} onOpenChange={setIsAddOrganizationModalOpen} />
            <GuidedOrganizationModal isOpen={isGuidedAddOrganizationModalOpen} onOpenChange={setIsGuidedAddOrganizationModalOpen} />
          </div>
        )}

        {selectedOrg && selectedOrg.role == "ADMIN" && !isOnboardingOpen && (
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

        {!isOnboardingOpen && <ProjectsList />}
      </div>
    </>
  );
};

export default Dashboard;
