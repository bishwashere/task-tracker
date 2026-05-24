"use client";

import { useGetActiveSprint, useToggleSprintTask } from "@/queries/sprint/hooks";
import { useProjectContext } from "../_context";
import { cn } from "@/lib/cn";
import { Loader2 } from "lucide-react";

type Props = {
  projectId: string;
  taskId: string;
  hasPendingWork: boolean;
};

const SprintTaskToggle = ({ projectId, taskId, hasPendingWork }: Props) => {
  const { role } = useProjectContext();
  const isAdmin = role.toLowerCase() === "admin";
  const { data } = useGetActiveSprint(projectId);
  const toggle = useToggleSprintTask(projectId);

  const sprint = data?.sprint;
  if (!sprint || !isAdmin || !hasPendingWork) return null;

  const inSprint = sprint.taskIds.includes(taskId);

  return (
    <button
      type="button"
      disabled={toggle.isPending}
      onClick={(e) => {
        e.stopPropagation();
        toggle.mutate(taskId);
      }}
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium transition-colors shrink-0",
        inSprint
          ? "bg-green-100 text-green-800 border border-green-200 hover:bg-green-200"
          : "bg-muted text-muted-foreground border border-border hover:bg-muted/80",
      )}
    >
      {toggle.isPending ? (
        <Loader2 className="size-3 animate-spin" />
      ) : inSprint ? (
        "In sprint"
      ) : (
        "Add to sprint"
      )}
    </button>
  );
};

export default SprintTaskToggle;

export function taskHasPendingWork(subtasks: { status: string }[]) {
  if (subtasks.length === 0) return true;
  return subtasks.some((subtask) => subtask.status !== "done");
}
