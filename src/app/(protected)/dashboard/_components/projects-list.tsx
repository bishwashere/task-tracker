import Loading from "@/components/ui/loading";
import { useDashboardContext } from "@/context/dashboard-context";
import { useListUserProjectByOrganizationId } from "@/queries/project/hooks";
import React from "react";
import DashboardDraggableProjectList from "./draggable-project-list";
import { FolderOpen } from "lucide-react";

const ProjectsList = () => {
  const { selectedOrg } = useDashboardContext();
  const projects = useListUserProjectByOrganizationId(
    selectedOrg?.organization?.id || "",
  );

  if (projects.isLoading) return <Loading className="h-48" />;
  return (
    <>
      {selectedOrg && projects.data?.length ? (

        <DashboardDraggableProjectList projects={projects.data?.map((p) => ({
          ...p,
          projectSummary: p.projectSummary[0],
        })) || []} />
      ) : (
        <div className="h-48 flex flex-col items-center justify-center gap-2 text-muted-foreground">
          <FolderOpen className="size-8 opacity-50" aria-hidden />
          <p className="text-center text-lg">No projects found, add one!</p>
        </div>
      )}
    </>
  );
};

export default ProjectsList;
