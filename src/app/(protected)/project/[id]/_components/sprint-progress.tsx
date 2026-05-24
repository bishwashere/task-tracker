"use client";

import ProgressBar from "@/components/common/ProgressBar";
import { calculateProgressWithStats } from "@/lib/progress";
import { useGetActiveSprint } from "@/queries/sprint/hooks";
import { Subtask, Task } from "@prisma/client";
import { getSprintTypeMeta, formatSprintName } from "@/lib/sprint";

type Props = {
  projectId: string;
  tasks: Array<Task & { subtasks: Subtask[] }>;
};

const SprintProgress = ({ projectId, tasks }: Props) => {
  const { data, isLoading } = useGetActiveSprint(projectId);
  const sprint = data?.sprint;

  if (isLoading || !sprint) return null;

  const sprintTasks = tasks.filter((task) => sprint.taskIds.includes(task.id));
  const stats = calculateProgressWithStats(sprintTasks);
  const typeMeta = getSprintTypeMeta(sprint.sprintType);

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Sprint Progress</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {typeMeta.label} • Usually owned by {typeMeta.owner}
          </p>
        </div>
        <span className="text-2xl font-bold text-green-600">
          {Math.round(stats.progress)}%
        </span>
      </div>
      <ProgressBar progress={stats.progress} className="h-6" showPercentage={false} />
      <p className="text-sm text-gray-600 mt-2">
        {formatSprintName(sprint.name)} • {stats.totalSubtasks} subtasks • {stats.completedSubtasks} done •{" "}
        {stats.pendingSubtasks} pending
      </p>
    </div>
  );
};

export default SprintProgress;
