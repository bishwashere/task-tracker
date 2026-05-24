import { cn } from "@/lib/cn";
import { Subtask, Task, User } from "@prisma/client";
import { useParams, useRouter } from "next/navigation";
import { useProjectContext } from "../../_context";
import { useToggleSubtaskPriority } from "@/queries/subtask/hooks";

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
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">

      {tasks
        .sort(
          (a, b) =>
            (b?.taskSortIndex?.[0]?.sortIndex || 0) -
            (a?.taskSortIndex?.[0]?.sortIndex || 0),
        )
        .map((task, i) => (
          <div
            key={i}
            className={cn(
              "mb-4 p-3 rounded-lg border border-border bg-white shadow-sm hover:shadow-md hover:border-blue-200/50 transition-all duration-150 relative",
            )}
          >
            <div className="flex justify-between items-start gap-4">
              <h3 className="text-lg font-bold cursor-pointer flex-1">{task.name}</h3>
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
                    className="cursor-pointer"
                    onClick={() => router.push(`/project/subtask/${subtask.id}`)}
                  >
                    {subtask.name}
                  </span>
                  <div className="space-x-2">
                    {(subtask.issueCount || 0) > 0 && (
                      <span className="text-xs text-white bg-red-500 px-1 py-0.5 inline-flex items-center rounded-full aspect-square">
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
                        className={`text-sm rounded ${subtask.priority
                          ? "text-yellow-500 hover:text-yellow-600"
                          : "text-gray-500 hover:text-gray-600"
                          }`}
                      >
                        {subtask.priority ? "⭐" : "☆"}
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
    </div>
  );
};

