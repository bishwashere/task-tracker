import React from "react";
import ProfileMenu from "@/components/common/profile-menu";
import { useProjectContext } from "../_context";

export const ProjectHeader = ({
  projectName,
  projectId,
  points,
  onEditButtonClick,
}: {
  projectName: string;
  projectId?: string;
  points?: number;
  onEditButtonClick?: () => void;
}) => {
  const { role, projectData } = useProjectContext();
  const isAdmin = role.toLowerCase() === "admin";

  return (
    <div className="relative z-50 flex justify-between items-center mb-5 flex-col sm:flex-row">
      <div className="hidden sm:block">
        <h1 className="text-2xl font-bold">{projectName}: Task List</h1>
      </div>
      <ProfileMenu
        showSettings={false}
        onEditButtonClick={isAdmin ? onEditButtonClick : undefined}
        showInsightsOption={isAdmin}
        organizationId={projectData?.project?.organizationId}
        points={points}
      />
    </div>
  );
};
