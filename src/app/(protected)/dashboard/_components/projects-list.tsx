import Loading from "@/components/ui/loading";
import { useDashboardContext } from "@/context/dashboard-context";
import { useListUserProjectByOrganizationId } from "@/queries/project/hooks";
import React from "react";
import DashboardDraggableProjectList from "./draggable-project-list";
import { FolderOpen } from "lucide-react";

type Props = {
  activeSprintOnly?: boolean;
};

const ProjectsList = ({ activeSprintOnly = true }: Props) => {
  const { selectedOrg } = useDashboardContext();
  const projects = useListUserProjectByOrganizationId(
    selectedOrg?.organization?.id || "",
  );

  if (projects.isLoading) return <Loading className="h-48" />;

  const visibleProjects =
    projects.data?.filter((project) =>
      activeSprintOnly ? project.hasActiveSprint : true,
    ) ?? [];

  return (
    <>
      {selectedOrg && visibleProjects.length ? (
        <DashboardDraggableProjectList
          projects={visibleProjects.map((p) => ({
            ...p,
            projectSummary:
              activeSprintOnly && p.hasActiveSprint
                ? { done: p.sprintDone, pending: p.sprintPending }
                : p.projectSummary[0] ?? null,
          }))}
        />
      ) : (
        <div className="h-48 flex flex-col items-center justify-center gap-2 text-muted-foreground">
          <FolderOpen className="size-8 opacity-50" aria-hidden />
          <p className="text-center text-lg">
            {activeSprintOnly
              ? "No projects with an active sprint."
              : "No projects found, add one!"}
          </p>
        </div>
      )}
    </>
  );
};

export default ProjectsList;
