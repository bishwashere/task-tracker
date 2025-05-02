import { Session } from "next-auth";
import React from "react";
import { HiCurrencyDollar } from "react-icons/hi2";
import Link from "next/link";
import ProfileMenu from "@/components/common/profile-menu";

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
  return (
    <div className="flex justify-between items-center mb-5 flex-col sm:flex-row">
      <h1 className="text-2xl font-bold max-sm:hidden">{projectName}</h1>
      <div className="flex flex-row justify-center items-center gap-5">
        {showPoints && projectId && (
          <Link
            href={`/points?fromProject=${projectId}`}
            className="flex flex-row justify-center items-center gap-1"
          >
            <HiCurrencyDollar className="text-3xl text-[#fbbc05]" />
            <p className="text-xl mt-[2px]">{points}</p>
          </Link>
        )}
        <ProfileMenu
          showSettings={false}
          onEditButtonClick={onEditButtonClick}
        />
      </div>
    </div>
  );
};
