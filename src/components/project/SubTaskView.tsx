import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SubtaskType, TaskType } from '@/types/organization';
import { User } from '@/types/user';
import AddTagPopup from './AddTagPopup';
import { assignUserToSubtask, togglePriority, updateSubtaskStatus } from '@/actions/task';
import toast from 'react-hot-toast';
import { useConfirmModal } from '../Modal/useConfirmModal';

export const SubTaskView = ({
  subtask,
  taskId,
  role,
  users,
  projectId,
  setTasks,
  editMode
}: {
  subtask: SubtaskType;
  taskId: string;
  role: 'admin' | 'member';
  users: User[];
  projectId: string;
  setTasks: React.Dispatch<React.SetStateAction<TaskType[]>>;
  editMode: boolean;
}) => {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const { confirmAction, ConfirmationModal } = useConfirmModal();

  const priorityToggle = async () => {
    setLoading(true);
    const res = await togglePriority(subtask.id, projectId, subtask.priority === 0 ? 1 : 0);
    if (res.success) {
      const updatedSubtask = res.updatedSubtask as SubtaskType;
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === taskId
            ? {
              ...task,
              subtasks: task.subtasks.map((subtask) =>
                subtask.id === updatedSubtask.id ? updatedSubtask : subtask
              ),
            }
            : task
        )
      );
    } else {
      toast.error(res.message || 'An error Occurred');
    }
    setLoading(false)
  }

  const markAsDone = async (subtaskId: string) => {
    const confirmed = await confirmAction('Are you sure you want to mark this subtask as done?');
    if (!confirmed) return;
    setLoading(true);
    const res = await updateSubtaskStatus(subtaskId, 'done');
    if (res.success) {
      const updatedSubtask = res.updatedSubtask as SubtaskType;
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === taskId
            ? {
              ...task,
              subtasks: task.subtasks.map((subtask) =>
                subtask.id === updatedSubtask.id ? updatedSubtask : subtask
              ),
            }
            : task
        )
      );
    } else {
      toast.error(res.message || 'An error occurred')
    }
    setLoading(false);
  };

  const assignUser = async (subtaskId: string, userId: string) => {
    const confirmed = await confirmAction('Are you sure you want to assign this user to the subtask?');
    if (!confirmed) return;
    const res = await assignUserToSubtask(subtaskId, projectId, userId);
    if (res.success) {
      toast.success("Assigned User to subtask!")
      const updatedSubtask = res.updatedSubtask as SubtaskType;
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === taskId
            ? {
              ...task,
              subtasks: task.subtasks.map((subtask) =>
                subtask.id === updatedSubtask.id ? updatedSubtask : subtask
              ),
            }
            : task
        )
      );
    } else {
      toast.error(res.message)
    }
  };

  const dueRemaining = (dueDate: Date) => {
    const currentDate = new Date();
    const dueDateObj = new Date(dueDate);
    currentDate.setHours(0, 0, 0, 0);
    dueDateObj.setHours(0, 0, 0, 0);
    const timeDiff = dueDateObj.getTime() - currentDate.getTime();
    const dayDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    if (dayDiff === 0) {
      return "Today";
    } else if (dayDiff === 1) {
      return "1 day";
    } else if (dayDiff === 2) {
      return "2 days";
    } else if (dayDiff === 3) {
      return "3 days";
    } else if (dayDiff < 0) {
      return "Past due";
    } else {
      const options: Intl.DateTimeFormatOptions = {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      };
      return dueDateObj.toLocaleDateString('en-US', options);
    }
  };


  return (
    <div
      key={subtask.id}
      className={`p-4 rounded shadow-md flex justify-between items-center ${subtask.status === 'done'
        ? 'bg-green-200 text-green-700 hover:bg-green-300'
        : 'bg-white hover:bg-gray-100'
        }`}
    >
      <div>
        <h4 className="text-lg font-semibold cursor-pointer hover:underline">
          <span
            className="cursor-pointer"
            onClick={() =>
              router.push(`/project/subtask/${subtask.id}`)
            }
          >
            {subtask.name}
          </span>
        </h4>
        <p className="text-sm">{subtask.status} • {!editMode ? subtask.assignedUserId ? `${subtask.assignedUser?.name} • ` : "Unassigned • " : ""}{subtask.points} points {subtask.dueDate && `• Due: ${dueRemaining(subtask.dueDate)}`}</p>
        {role === 'admin' && editMode && (
          <select
            value={subtask.assignedUserId || ''}
            onChange={(e) => assignUser(subtask.id, e.target.value)}
            className="mt-2 border p-1 rounded"
          >
            <option value="">Unassigned</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </select>
        )}
      </div>
      <div className="flex items-center gap-2">
        {subtask.tagName ? (
          <span
            className="px-2 py-1 rounded text-sm"
            style={{ backgroundColor: subtask.tagColor || 'transparent', color: '#FFF' }}
          >
            {subtask.tagName}
          </span>
        ) : (
          <AddTagPopup setTasks={setTasks} taskId={taskId} subtaskId={subtask.id} projectId={projectId} />
        )}
        {role === 'admin' && (
          <button
            onClick={() => priorityToggle()}
            className={`text-sm rounded ${subtask.priority
              ? 'text-yellow-500 hover:text-yellow-600'
              : 'text-gray-500 hover:text-gray-600'
              }`}
            disabled={loading}
          >
            {subtask.priority ? '⭐' : '☆'}
          </button>
        )}
        {subtask.status !== 'done' && (
          <button
            onClick={() => markAsDone(subtask.id)}
            disabled={loading}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-75"
          >
            &#10003;
          </button>
        )}
      </div>
      <ConfirmationModal />
    </div>
  );
};