"use client";
import React, { useState, useEffect } from "react";
import Header from "./header";
import { useDashboardContext } from "@/context/dashboard-context";
import { useAppRole } from "@/context/view-as-context";
import AddOrganizationModal from "./header/add-organization-modal";
import AddProject from "./add-project";
import { useListUserOrganizations } from "@/queries/organizations/hooks";
import Loading from "@/components/ui/loading";
import ProjectsList from "./projects-list";
import GuidedProjectModal from "./guided-project/guided-project-modal";
import GuidedOrganizationModal from "./guided-organization/guided-organization-modal";
import OnboardingModal from "./onboarding-modal";
import { useListUserProjectByOrganizationId } from "@/queries/project/hooks";
import { Plus } from "lucide-react";
import { cn } from "@/lib/cn";
import { isOnboardingDismissedForSession } from "@/lib/onboarding-session";
import CelebrationModal from "./celebration-modal";
import { useCelebrationStats } from "@/queries/celebration/hooks";

const Dashboard = () => {
  const { selectedOrg, guidedMode } = useDashboardContext();
  const appRole = useAppRole();
  const org = useListUserOrganizations();
  const projects = useListUserProjectByOrganizationId(
    selectedOrg?.organization?.id || "",
  );

  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isAddOrganizationModalOpen, setIsAddOrganizationModalOpen] = useState(false);
  const [isGuidedAddOrganizationModalOpen, setIsGuidedAddOrganizationModalOpen] = useState(false);

  const [addProjectModalIsOpen, setAddProjectModalIsOpen] = useState(false);
  const [isGuidedAddProjectModalOpen, setIsGuidedAddProjectModalOpen] = useState(false);
  const [activeSprintOnly, setActiveSprintOnly] = useState(true);

  const celebration = useCelebrationStats(selectedOrg?.organization?.id ?? "");

  // Check if onboarding should be shown
  useEffect(() => {
    if (org.isLoading) return;

    if (isOnboardingDismissedForSession()) {
      setIsOnboardingOpen(false);
      return;
    }

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
      {celebration.data?.userId && (
        <CelebrationModal
          subtasks14d={celebration.data.subtasks14d}
          subtasks3d={celebration.data.subtasks3d}
          userId={celebration.data.userId}
        />
      )}
      
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

        {selectedOrg && !isOnboardingOpen && (
          <div className="flex items-center gap-2 flex-wrap">
            <label className="inline-flex items-center gap-2 cursor-pointer select-none">
              <button
                type="button"
                role="switch"
                aria-checked={activeSprintOnly}
                onClick={() => setActiveSprintOnly((prev) => !prev)}
                className={cn(
                  "relative inline-flex h-[26px] w-[46px] shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-green-400",
                  activeSprintOnly ? "bg-green-500" : "bg-zinc-300",
                )}
              >
                <span
                  aria-hidden
                  className={cn(
                    "pointer-events-none inline-block h-[22px] w-[22px] transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out",
                    activeSprintOnly ? "translate-x-5" : "translate-x-0",
                  )}
                />
              </button>
              <span className={cn("text-sm font-medium", activeSprintOnly ? "text-green-700" : "text-muted-foreground")}>
                Active Sprint
              </span>
            </label>

            {appRole === "admin" && (
              <>
                <button
                  onClick={openAddProjectModal}
                  className="bg-blue-500 rounded-md text-white py-1 px-2 cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Plus className="size-4" aria-hidden />
                  Add a project
                </button>
                <AddProject
                  isOpen={addProjectModalIsOpen}
                  onOpenChange={setAddProjectModalIsOpen}
                />
                <GuidedProjectModal
                  isOpen={isGuidedAddProjectModalOpen}
                  onOpenChange={setIsGuidedAddProjectModalOpen}
                />
              </>
            )}
          </div>
        )}

        {!isOnboardingOpen && <ProjectsList activeSprintOnly={activeSprintOnly} />}
      </div>
    </>
  );
};

export default Dashboard;
