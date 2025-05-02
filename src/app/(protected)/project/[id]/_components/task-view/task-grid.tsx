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
              "mb-6 p-4 rounded hover:bg-gray-50 border border-gray-200 relative",
            )}
          >
            <div className="flex justify-between items-start gap-4">
              <h3 className="text-lg font-bold cursor-pointer flex-1">{task.name}</h3>
            </div>

            <ul className="list-none space-y-2 mt-4">
              {task.subtasks.map((subtask) => (
                <li
                  key={subtask.id}
                  className={`p-2 rounded shadow-md flex justify-between items-center ${subtask.status === "done"
                    ? "bg-green-200 text-green-700 hover:bg-green-300"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
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

