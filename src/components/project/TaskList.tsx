import React from 'react';
import { SubTaskView } from '@/components/project/SubTaskView';
import { TaskType } from '@/types/organization';
import { User } from '@/types/user';
import AddSubtask from './AddSubtaskPopup';
import { Session } from 'next-auth';
import EditTaskPopup from './EditTaskPopup';

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
  role: 'admin' | 'member';
  projectId: string;
  setTasks: React.Dispatch<React.SetStateAction<TaskType[]>>;
  editMode: boolean;
  setPointsEarned: React.Dispatch<React.SetStateAction<number>>;
  session: Session;
}) => {
  return (
    <div>
      {tasks.map((task, index) => (
        <div key={task.id} className="flex items-start gap-2">
          <span className="text-lg font-bold text-gray-500">{index + 1}.</span>
          <div className="mb-6 p-4 rounded hover:bg-gray-50 border border-gray-200 relative flex-1">
            {role === 'admin' && editMode && (
              <AddSubtask
                setTasks={setTasks}
                taskId={task.id}
                projectId={projectId}
                showAi={!task.hasAISuggestions}
              />
            )}
            <div className="flex flex-row items-center gap-2">
              <h3 className="text-xl font-bold mb-4">{task.name}</h3>
              {role === 'admin' && editMode && (
                <EditTaskPopup task={task} projectId={projectId} setTasks={setTasks} />
              )}
            </div>
            <div className="grid grid-cols-1 gap-4">
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
                />
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};