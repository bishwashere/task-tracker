import { SubtaskType, TaskType } from "@/types/organization";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import AddSubtask from "./AddSubtaskPopup";
import toast from "react-hot-toast";
import { togglePriority } from "@/actions/task";
import AISubtaskDialog from "../common/AISubtaskGenerator";

export const TaskGrid = ({
  tasks,
  setTasks,
  projectId,
  role,
  editMode,
}: {
  tasks: TaskType[];
  setTasks: React.Dispatch<React.SetStateAction<TaskType[]>>;
  projectId: string;
  role: "admin" | "member";
  editMode: boolean;
}) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const priorityToggle = async (
    taskId: string,
    subtaskId: string,
    priority: number,
  ) => {
    setLoading(true);
    const res = await togglePriority(
      subtaskId,
      projectId,
      priority === 0 ? 1 : 0,
    );
    if (res.success) {
      const updatedSubtask = res.updatedSubtask as SubtaskType;
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === taskId
            ? {
                ...task,
                subtasks: task.subtasks.map((subtask) =>
                  subtask.id === updatedSubtask.id ? updatedSubtask : subtask,
                ),
              }
            : task,
        ),
      );
    } else {
      toast.error(res.message || "An error Occurred");
    }
    setLoading(false);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
      {tasks.map((task) => (
        <div
          key={task.id}
          className="mb-6 p-4 rounded hover:bg-gray-50 border border-gray-200 relative"
        >
          <div className="flex justify-between items-start gap-4">
            <h3
              className="text-lg font-bold cursor-pointer flex-1"
              // onClick={() =>
              //   router.push(`/${role === 'admin' ? 'admin' : 'user'}/subtasks/${task.id}`)
              // }
            >
              {task.name}
            </h3>

            {role === "admin" && editMode && (
              <AddSubtask
                setTasks={setTasks}
                taskId={task.id}
                projectId={projectId}
                showText={false}
                showAi={!task.hasAISuggestions}
              />
            )}
          </div>

          <ul className="list-none space-y-2 mt-4">
            {task.subtasks.map((subtask) => (
              <li
                key={subtask.id}
                className={`p-2 rounded shadow-md flex justify-between items-center ${
                  subtask.status === "done"
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
                  {" "}
                  {(subtask.issueCount || 0) > 0 && (
                    <span className="text-xs text-white bg-red-500 px-1 py-0.5 inline-flex items-center rounded-full aspect-square">
                      {subtask.issueCount}
                    </span>
                  )}
                  {role === "admin" && (
                    <button
                      onClick={() =>
                        priorityToggle(task.id, subtask.id, subtask.priority)
                      }
                      className={`text-sm rounded ${
                        subtask.priority
                          ? "text-yellow-500 hover:text-yellow-600"
                          : "text-gray-500 hover:text-gray-600"
                      }`}
                      disabled={loading}
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
