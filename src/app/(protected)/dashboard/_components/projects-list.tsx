import Loading from "@/components/ui/loading";
import { useDashboardContext } from "@/context/dashboard-context";
import { useListUserProjectByOrganizationId } from "@/queries/project/hooks";
import React from "react";
import DashboardDraggableProjectList from "./draggable-project-list";

const ProjectsList = () => {
  const { selectedOrg } = useDashboardContext();
  const projects = useListUserProjectByOrganizationId(
    selectedOrg?.organization?.id || "",
  );

  if (projects.isLoading) return <Loading className="h-48" />;
  return (
    <>
      {selectedOrg && projects.data?.length ? (
        <DashboardDraggableProjectList projects={projects.data || []} />
      ) : (
        <div className="h-48 flex flex-col items-center justify-center">
          <p className="text-center text-xl">No projects found, add one !</p>
        </div>
      )}
    </>
  );
};

export default ProjectsList;
