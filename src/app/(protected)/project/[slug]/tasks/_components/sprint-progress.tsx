"use client";

import { useState } from "react";
import ProgressBar from "@/components/common/ProgressBar";
import { calculateProgressWithStats } from "@/lib/progress";
import { useGetActiveSprint } from "@/queries/sprint/hooks";
import { Subtask, Task } from "@prisma/client";
import { formatSprintDateRange, formatSprintName } from "@/lib/sprint";
import { useProjectContext } from "../_context";
import EditSprintDialog from "./dialogs/edit-sprint-dialog";
import StartSprintDialog from "./dialogs/start-sprint-dialog";
import { cn } from "@/lib/cn";
import { Play } from "lucide-react";

type Props = {
  projectId: string;
  tasks: Array<Task & { subtasks: Subtask[] }>;
};

const SprintProgress = ({ projectId, tasks }: Props) => {
  const { role, editMode } = useProjectContext();
  const isAdmin = role.toLowerCase() === "admin";
  const { data, isLoading } = useGetActiveSprint(projectId);
  const [startSprintOpen, setStartSprintOpen] = useState(false);
  const sprint = data?.sprint;
  const nextWeekNumber = data?.nextWeekNumber ?? 1;

  if (isLoading) return null;

  if (!sprint) {
    if (!isAdmin) return null;

    return (
      <>
        <div className="mb-4">
          <button
            type="button"
            onClick={() => setStartSprintOpen(true)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md border border-blue-500 bg-blue-500 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-blue-600",
            )}
          >
            <Play className="size-3.5 fill-current" />
            Start Sprint
          </button>
        </div>
        <StartSprintDialog
          projectId={projectId}
          open={startSprintOpen}
          onOpenChange={setStartSprintOpen}
          nextWeekNumber={nextWeekNumber}
        />
      </>
    );
  }

  const sprintTasks = tasks.filter((task) => sprint.taskIds.includes(task.id));
  const stats = calculateProgressWithStats(sprintTasks);

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-start gap-1">
          {isAdmin && editMode && (
            <EditSprintDialog projectId={projectId} sprint={sprint} />
          )}
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Sprint Progress</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {formatSprintName(sprint.name)} •{" "}
              {formatSprintDateRange(new Date(sprint.startDate), new Date(sprint.endDate))}
            </p>
          </div>
        </div>
        <span className="text-2xl font-bold text-green-600">
          {Math.round(stats.progress)}%
        </span>
      </div>
      <ProgressBar progress={stats.progress} className="h-6" showPercentage={false} />
      <p className="text-sm text-gray-600 mt-2">
        {stats.totalSubtasks} subtasks • {stats.completedSubtasks} done •{" "}
        {stats.pendingSubtasks} pending
      </p>
    </div>
  );
};

export default SprintProgress;
