import Loading from "@/components/ui/loading";
import { useDashboardContext } from "@/context/dashboard-context";
import { useAppRole } from "@/context/view-as-context";
import { useListUserProjectByOrganizationId } from "@/queries/project/hooks";
import React from "react";
import DashboardDraggableProjectList from "./draggable-project-list";
import { FolderOpen } from "lucide-react";

type Props = {
  activeSprintOnly?: boolean;
};

type ProjectRow = NonNullable<
  ReturnType<typeof useListUserProjectByOrganizationId>["data"]
>[number];

function mapActiveSprintProject(project: ProjectRow) {
  return {
    ...project,
    tasksCount: project.sprintSubtasksCount,
    projectSummary: { done: project.sprintDone, pending: project.sprintPending },
  };
}

function mapRecentlyEndedSprintProject(project: ProjectRow) {
  return {
    ...project,
    tasksCount: project.recentlyEndedSprintSubtasksCount,
    projectSummary: {
      done: project.recentlyEndedSprintDone,
      pending: project.recentlyEndedSprintPending,
    },
  };
}

const ProjectsList = ({ activeSprintOnly = true }: Props) => {
  const { selectedOrg } = useDashboardContext();
  const appRole = useAppRole();
  const isAdmin = appRole === "admin";
  const projects = useListUserProjectByOrganizationId(
    selectedOrg?.organization?.id || "",
  );

  if (projects.isLoading) return <Loading className="h-48" />;

  const allProjects = projects.data ?? [];

  const activeProjects = activeSprintOnly
    ? allProjects.filter((project) =>
        isAdmin ? project.hasActiveSprint : project.isInActiveSprint,
      )
    : allProjects;

  const recentlyEndedProjects =
    activeSprintOnly
      ? allProjects.filter(
          (project) =>
            !(isAdmin ? project.hasActiveSprint : project.isInActiveSprint) &&
            (isAdmin
              ? project.hasRecentlyEndedSprint
              : project.isInRecentlyEndedSprint),
        )
      : [];

  const hasActiveSection = selectedOrg && activeProjects.length > 0;
  const hasEndedSection = selectedOrg && recentlyEndedProjects.length > 0;
  const hasAnySection = hasActiveSection || hasEndedSection;

  return (
    <>
      {hasActiveSection && (
        <DashboardDraggableProjectList
          projects={activeProjects.map(
            activeSprintOnly ? mapActiveSprintProject : (p) => p,
          )}
        />
      )}

      {hasEndedSection && (
        <div className="my-6 flex items-center gap-3" role="separator">
          <div className="h-px flex-1 bg-border" />
          <span className="shrink-0 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Recently ended sprint
          </span>
          <div className="h-px flex-1 bg-border" />
        </div>
      )}

      {hasEndedSection && (
        <DashboardDraggableProjectList
          projects={recentlyEndedProjects.map(mapRecentlyEndedSprintProject)}
          isRecentlyEnded
        />
      )}

      {selectedOrg && !hasAnySection && (
        <div className="h-48 flex flex-col items-center justify-center gap-2 text-muted-foreground">
          <FolderOpen className="size-8 opacity-50" aria-hidden />
          <p className="text-center text-lg">
            {activeSprintOnly
              ? isAdmin
                ? "No projects with an active or recently ended sprint."
                : "No projects in your active or recently ended sprint."
              : "No projects found, add one!"}
          </p>
        </div>
      )}
    </>
  );
};

export default ProjectsList;
