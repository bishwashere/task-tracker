"use client";

import ProgressBar from "@/components/common/ProgressBar";
import { ViewToggle } from "@/components/common/ViewToggle";
import { ProjectHeader } from "@/components/headers/ProjectHeader";
import SuperHeader from "@/components/headers/SuperHeader";
import AddTaskPopup from "@/components/project/AddTaskPopup";
import { TaskGrid } from "@/components/project/TaskGrid";
import { TaskList } from "@/components/project/TaskList";
import { fetchProjectData } from "@/data/task";
import { ProjectType, TaskType } from "@/types/organization";
import { User } from "@/types/user";
import { calculateProgressWithStats } from "@/utils/progressUtils";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const Project = ({ project }: { project: ProjectType }) => {

  const [initialLoading, setInitialLoading] = useState(true)
  const [members, setMembers] = useState<User[]>([]);
  const [tasks, setTasks] = useState<TaskType[]>([]);
  const [currentUserRole, setCurrentUserRole] = useState<'admin' | 'member'>('member')
  const [viewMode, setViewMode] = useState('list'); // Default view state

  const [subtaskFilter, setSubtaskFilter] = useState<'all' | 'pending' | 'done'>('all');
  const [showSubtasks, setShowSubtasks] = useState(true)

  const [addTaskModalOpen, setaddTaskModalOpen] = useState(false)

  //fetch tasks and subtasks
  const fetchtasksWithSubTasks = async () => {
    const res = await fetchProjectData(project.id);
    if (res.success) {
      setTasks(res.tasks as unknown as TaskType[]);
      setCurrentUserRole(res.role as 'admin' | 'member')
      if (res.members)
        setMembers(res.members as User[])
    } else {
      toast.error(res.message || "An error occurred!")
    }
    setInitialLoading(false)
  }
  useEffect(() => {
    fetchtasksWithSubTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const stats = calculateProgressWithStats(tasks);

  const getFilteredTasks = () => {
    if (!tasks) return [];
    const filteredTasks = tasks
      .map((task) => {
        // Ensure task.subtasks is always an array before filtering
        const filteredSubtasks = (task.subtasks || []).filter((subtask) => {
          if (subtaskFilter === 'all') return true;
          if (subtaskFilter === 'pending') return subtask.status === 'pending';
          if (subtaskFilter === 'done') return subtask.status === 'done';
          return false;
        });
        // console.log(`Task ${task.name} (${task.id}):`, filteredSubtasks);
        return {
          ...task,
          subtasks: filteredSubtasks,
        };
      })
    // .filter((task) => Array.isArray(task.subtasks) && task.subtasks.length > 0);
    // console.log('Filtered Tasks:', filteredTasks);
    return filteredTasks;
  };

  if (initialLoading) {
    return <div className="text-center text-xl font-bold">Loading...</div>;
  }

  if (!tasks.length) return (
    <>
      <SuperHeader path="/dashboard" />
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <ProjectHeader projectName={project.name} />
        <div className="mb-6">
          <ProgressBar progress={stats.progress} />
          <p className="text-sm text-gray-600 mt-2">
            {stats.progress}% Complete • {stats.totalSubtasks} subtasks •{' '}
            {stats.completedSubtasks} done • {stats.pendingSubtasks} pending
          </p>
        </div>
        <div className="mt-10 flex flex-row items-center justify-center gap-1">
          <p>No task found.</p>
          <button className="text-blue-500 font-semibold cursor-pointer" onClick={() => setaddTaskModalOpen(true)}>Add a new task</button></div>
        <AddTaskPopup setTasks={setTasks} projectId={project.id} modalIsOpen={addTaskModalOpen} setModalIsOpen={setaddTaskModalOpen} />
      </div>
    </>
  )

  return (
    <>
      <SuperHeader path="/dashboard" />
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <ProjectHeader projectName={project.name} />
        <div className="mb-6">
          <ProgressBar progress={stats.progress} />
          <p className="text-sm text-gray-600 mt-2">
            {stats.progress}% Complete • {stats.totalSubtasks} subtasks •{' '}
            {stats.completedSubtasks} done • {stats.pendingSubtasks} pending
          </p>
        </div>
        <div className="flex justify-start items-center space-x-4 mb-6">
          <button
            className={`px-4 py-2 rounded ${subtaskFilter === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
              }`}
            onClick={() => setSubtaskFilter('all')}
          >
            All
          </button>
          <button
            className={`px-4 py-2 rounded ${subtaskFilter === 'pending' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
              }`}
            onClick={() => setSubtaskFilter('pending')}
          >
            Pending
          </button>
          <button
            className={`px-4 py-2 rounded ${subtaskFilter === 'done' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
              }`}
            onClick={() => setSubtaskFilter('done')}
          >
            Done
          </button>
        </div>

        <div className="flex flex-col gap-2 mb-6">
          <p className="cursor-pointer text-blue-500 hover:underline w-fit" onClick={() => setaddTaskModalOpen(true)}>Add a new task</p>
          <AddTaskPopup setTasks={setTasks} projectId={project.id} modalIsOpen={addTaskModalOpen} setModalIsOpen={setaddTaskModalOpen} />
          <p
            className="cursor-pointer text-blue-500 hover:underline w-fit"
            onClick={() => setShowSubtasks(!showSubtasks)}
          >
            {showSubtasks ? "Hide Subtasks" : "Show Subtasks"}
          </p>
        </div>

        <ViewToggle onChange={(mode: string) => setViewMode(mode)} />

        {!tasks.length && <p>No tasks Found</p>}
        {viewMode === 'list' ? (
          <>
            <TaskList
              tasks={getFilteredTasks().map((task) => ({
                ...task,
                subtasks: showSubtasks ? task.subtasks : [], // Show or hide subtasks based on `showSubtasks`
              }))}
              setTasks={setTasks}
              users={members}
              projectId={project.id}
              role={currentUserRole}
            />
          </>
        ) : (
          <TaskGrid
            tasks={getFilteredTasks().map((task) => ({
              ...task,
              subtasks: showSubtasks ? task.subtasks : [], // Show or hide subtasks based on `showSubtasks`
            }))}
            setTasks={setTasks}
            projectId={project.id}
            role={currentUserRole}
          />
        )}
      </div>
    </>
  );
}

export default Project;