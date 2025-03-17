import React from "react";
import { SubTaskView } from "@/components/project/SubTaskView";
import { TaskType } from "@/types/organization";
import { User } from "@/types/user";
import AddSubtask from "./AddSubtaskPopup";
import { Session } from "next-auth";
import EditTaskPopup from "./EditTaskPopup";
import { differenceInDays } from "date-fns";

export const TaskList = ({
  tasks,
  users,
  role,
  projectId,
  setTasks,
  editMode,
  setPointsEarned,
  session,
}: {
  tasks: TaskType[];
  users: User[];
  role: "admin" | "member";
  projectId: string;
  setTasks: React.Dispatch<React.SetStateAction<TaskType[]>>;
  editMode: boolean;
  setPointsEarned: React.Dispatch<React.SetStateAction<number>>;
  session: Session;
}) => {
  const isNewTask = (createdAt: string | Date) => {
    const now = new Date();
    const taskDate = new Date(createdAt);
    if (isNaN(taskDate.getTime())) {
      console.error("Invalid createdAt date for task:", createdAt);
      return false;
    }
    const diffDays = differenceInDays(now, taskDate);
    console.log("Date diff:", diffDays, "days for", createdAt);
    return diffDays <= 1; // True if created today or yesterday
  };

  return (
    <div>
      {tasks.map((task, index) => (
        <div key={task.id} className="flex items-start gap-1">
          <span className="text-lg font-bold text-gray-500">{index + 1}.</span>
          <div className="mb-6 p-2 rounded hover:bg-gray-50 border border-gray-200 relative flex-1">
            {role === "admin" && editMode && (
              <AddSubtask
                setTasks={setTasks}
                taskId={task.id}
                projectId={projectId}
                showAi={!task.hasAISuggestions}
              />
            )}
            <div className="flex flex-row items-center gap-1">
              <h3 className="text-xl font-bold mb-2">{task.name}</h3>
              {task.createdAt && (
                <span className="text-xs text-white bg-green-400 px-1 py-0.5 rounded">
                  {isNewTask(task.createdAt) ? "New" : ""}
                </span>
              )}
              {role === "admin" && editMode && (
                <EditTaskPopup task={task} projectId={projectId} setTasks={setTasks} />
              )}
            </div>
            <div className="grid grid-cols-1 gap-2">
              {task.subtasks.map((subtask) => (
                <SubTaskView
                  key={subtask.id}
                  subtask={subtask}
                  taskId={task.id}
                  role={role}
                  users={users}
                  projectId={projectId}
                  setTasks={setTasks}
                  editMode={editMode}
                  setPointsEarned={setPointsEarned}
                  session={session}
                  isNewTask={isNewTask}
                />
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};