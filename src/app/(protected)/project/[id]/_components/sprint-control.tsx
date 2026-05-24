"use client";

import { useState } from "react";
import { useGetActiveSprint } from "@/queries/sprint/hooks";
import { differenceInCalendarDays, startOfDay } from "date-fns";
import { Loader2, Play } from "lucide-react";
import { cn } from "@/lib/cn";
import StartSprintDialog from "./dialogs/start-sprint-dialog";
import { useProjectContext } from "../_context";
import { formatSprintName } from "@/lib/sprint";

type Props = {
  projectId: string;
};

function getEndsInLabel(endDate: Date) {
  const daysLeft = differenceInCalendarDays(startOfDay(endDate), startOfDay(new Date()));

  if (daysLeft <= 0) return "Ends today";
  if (daysLeft === 1) return "Ends in 1 day";
  return `Ends in ${daysLeft} days`;
}

const SprintControl = ({ projectId }: Props) => {
  const { role } = useProjectContext();
  const isAdmin = role.toLowerCase() === "admin";
  const { data, isLoading } = useGetActiveSprint(projectId);
  const [modalOpen, setModalOpen] = useState(false);

  const sprint = data?.sprint;
  const nextWeekNumber = data?.nextWeekNumber ?? 1;

  if (isLoading) {
    if (!isAdmin) return null;
    return (
      <div className="flex items-center justify-center h-9 w-24">
        <Loader2 className="size-4 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (sprint) {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 px-3 py-1.5 text-right text-sm leading-snug max-w-[220px]">
        <p className="font-semibold text-green-700 truncate">
          Active Sprint : {formatSprintName(sprint.name)}
        </p>
        <p className="text-muted-foreground text-xs">{getEndsInLabel(new Date(sprint.endDate))}</p>
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setModalOpen(true)}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-md border border-blue-500 bg-blue-500 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-blue-600",
        )}
      >
        <Play className="size-3.5 fill-current" />
        Start Sprint
      </button>
      <StartSprintDialog
        projectId={projectId}
        open={modalOpen}
        onOpenChange={setModalOpen}
        nextWeekNumber={nextWeekNumber}
      />
    </>
  );
};

export default SprintControl;
