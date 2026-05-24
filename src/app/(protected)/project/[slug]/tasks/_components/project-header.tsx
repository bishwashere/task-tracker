import { Session } from "next-auth";
import React from "react";
import { HiCurrencyDollar } from "react-icons/hi2";
import Link from "next/link";
import ProfileMenu from "@/components/common/profile-menu";
import { useProjectContext } from "../_context";

export const ProjectHeader = ({
  projectName,
  projectId,
  points,
  showPoints = false,
  onEditButtonClick,
}: {
  projectName: string;
  projectId?: string;
  points?: number;
  showPoints?: boolean;
  onEditButtonClick?: () => void;
}) => {
  const { role, projectData } = useProjectContext()
  return (
    <div className="relative z-50 flex justify-between items-center mb-5 flex-col sm:flex-row">
      <div>
        <h1 className="text-2xl font-bold">{projectName}: Task List</h1>
      </div>
      <div className="flex flex-row justify-center items-center gap-5">
        {showPoints && projectId && (
          <Link
            href={role === "admin" ? "/allpoints" : `/points`}
            className="flex flex-row justify-center items-center gap-1"
          >
            <HiCurrencyDollar className="text-3xl text-[#fbbc05]" />
            <p className="text-xl mt-[2px]">{points}</p>
          </Link>
        )}
        <ProfileMenu
          showSettings={false}
          onEditButtonClick={onEditButtonClick}
          showInsightsOption={role === "admin"}
          organizationId={projectData?.project?.organizationId}
        />
      </div>
    </div>
  );
};
