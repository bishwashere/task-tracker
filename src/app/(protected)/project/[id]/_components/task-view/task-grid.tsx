import { cn } from "@/lib/cn";
import { Subtask, Task, User } from "@prisma/client";
import { useParams, useRouter } from "next/navigation";
import { useProjectContext } from "../../_context";
import { useToggleSubtaskPriority } from "@/queries/subtask/hooks";
import { Circle, CircleCheck, ListChecks, MessageSquare, Star } from "lucide-react";
import SprintTaskToggle, { taskHasPendingWork } from "../sprint-task-toggle";
import { useProjectSprints } from "@/queries/sprint/hooks";
import { getTaskSprintInfo, isTaskInSprint } from "@/lib/sprint";
import TaskSprintLabel from "../task-sprint-label";

export const TaskGrid = ({
  tasks,
}: {
  tasks: Array<Task & {
    subtasks: Array<Subtask & {
      issueCount: number;
      assignedUser: {
        name: string | null
        image: string | null
      } | null
      subtaskSortIndex: { sortIndex: number }[]
    }>
    taskSortIndex: { sortIndex: number }[]
  }>
}) => {
  const { role } = useProjectContext()
  const router = useRouter()
  const togglePriority = useToggleSubtaskPriority()
  const { id } = useParams() as { id: string }
  const { data: projectSprints = [] } = useProjectSprints(id)
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">

      {tasks
        .sort(
          (a, b) =>
            (b?.taskSortIndex?.[0]?.sortIndex || 0) -
            (a?.taskSortIndex?.[0]?.sortIndex || 0),
        )
        .map((task, i) => {
          const sprintInfo = getTaskSprintInfo(task.id, task.subtasks, projectSprints);
          const inSprint = isTaskInSprint(task.id, projectSprints);
          const hasPendingWork = taskHasPendingWork(task.subtasks);

          return (
          <div
            key={i}
            className={cn(
              "mb-4 p-3 rounded-lg border bg-white shadow-sm hover:shadow-md transition-all duration-150 relative",
              inSprint ? "border-green-300 hover:border-green-400" : "border-border hover:border-blue-200/50",
            )}
          >
            <div className="flex justify-between items-start gap-2 flex-wrap">
              <h3 className="text-lg font-bold cursor-pointer flex-1">{task.name}</h3>
              <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
                {task.subtasks.length > 0 && (
                  <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                    <ListChecks className="size-3.5 shrink-0" aria-hidden />
                    {task.subtasks.length}
                  </span>
                )}
                <TaskSprintLabel sprintInfo={sprintInfo} />
                <SprintTaskToggle
                  projectId={id}
                  taskId={task.id}
                  hasPendingWork={hasPendingWork}
                />
              </div>
            </div>

            <ul className="list-none space-y-1.5 mt-3">
              {task.subtasks.map((subtask) => (
                <li
                  key={subtask.id}
                  className={cn(
                    "px-2.5 py-1.5 rounded-md border shadow-sm flex justify-between items-center transition-colors duration-150",
                    subtask.status === "done"
                      ? "bg-green-50 border-green-200/80 text-green-800 hover:bg-green-100"
                      : "bg-white border-border text-foreground hover:bg-muted/40",
                  )}
                >
                  <span
                    className="cursor-pointer inline-flex items-center gap-1.5 min-w-0"
                    onClick={() => router.push(`/project/subtask/${subtask.id}`)}
                  >
                    {subtask.status === "done" ? (
                      <CircleCheck className="size-3.5 text-green-600 shrink-0" aria-hidden />
                    ) : (
                      <Circle className="size-3.5 text-muted-foreground shrink-0" aria-hidden />
                    )}
                    <span className="truncate">{subtask.name}</span>
                  </span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {(subtask.issueCount || 0) > 0 && (
                      <span className="text-xs text-white bg-red-500 px-1.5 py-0.5 inline-flex items-center gap-0.5 rounded-full">
                        <MessageSquare className="size-3" aria-hidden />
                        {subtask.issueCount}
                      </span>
                    )}
                    {role === "admin" && (
                      <button
                        onClick={() => togglePriority.mutate({
                          projectId: id,
                          subtaskId: subtask.id,
                          priority: subtask.priority === 0 ? 1 : 0,
                          taskId: task.id
                        })}
                        className={cn(
                          "rounded p-0.5",
                          subtask.priority
                            ? "text-yellow-500 hover:text-yellow-600"
                            : "text-gray-400 hover:text-gray-600",
                        )}
                        aria-label={subtask.priority ? "Remove priority" : "Mark as priority"}
                      >
                        <Star className={cn("size-3.5", subtask.priority && "fill-current")} />
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
          );
        })}
    </div>
  );
};

