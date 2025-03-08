import React, { useState } from 'react';
import { SubTaskView } from '@/components/project/SubTaskView';
import { TaskType } from '@/types/organization';
import { User } from '@/types/user';
import { Session } from 'next-auth';
import AddSubtask from './AddSubtaskPopup';

export const TaskList = ({
  tasks,
  users,
  session,
  role,
  projectId,
  setTasks,
}:{
  tasks: TaskType[];
  users: User[];
  session: Session;
  role: 'admin' | 'member';
  projectId: string;
  setTasks: React.Dispatch<React.SetStateAction<TaskType[]>>
}) => {

  return (
    <div>
      {tasks.map((task) => (
        <div key={task.id} className="mb-6 p-4 rounded hover:bg-gray-50 border border-gray-200 relative">
          {role === 'admin' && (
            <AddSubtask setTasks={setTasks} taskId={task.id} projectId={projectId} />
          )}
          <h3 className="text-xl font-bold mb-4">{task.name}</h3>
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
              />
            ))}
          </div>
        </div>
      ))}
      
    </div>
  );
};
