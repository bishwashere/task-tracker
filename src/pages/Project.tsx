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
import { Session } from "next-auth";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { MdEditSquare } from "react-icons/md";
import { getAISuggestedTasksByProjectId, deleteAISuggestedTask } from "@/actions/get-ai-sugested-task";
import { saveTask } from "@/actions/task";

const Project = ({ session, project }: { session: Session, project: ProjectType }) => {
  const [initialLoading, setInitialLoading] = useState(true);
  const [members, setMembers] = useState<User[]>([]);
  const [tasks, setTasks] = useState<TaskType[]>([]);
  const [currentUserRole, setCurrentUserRole] = useState<'admin' | 'member'>('member');
  const [viewMode, setViewMode] = useState('list'); // Default view state
  const [editMode, setEditMode] = useState(false);
  const [subtaskFilter, setSubtaskFilter] = useState<'all' | 'pending' | 'done'>('all');
  const [showSubtasks, setShowSubtasks] = useState(true);
  const [pointsEarned, setPointsEarned] = useState<number>(0);
  const [addTaskModalOpen, setaddTaskModalOpen] = useState(false);
  const [aiSuggestedTasks, setAiSuggestedTasks] = useState<{
    id: string;
    name: string;
    description: string | null;
    projectId: string;
  }[]>([]);

  // Fetch tasks and subtasks
  const fetchtasksWithSubTasks = async () => {
    const res = await fetchProjectData(project.id);
    if (res.success) {
      setTasks(res.tasks as unknown as TaskType[]);
      setCurrentUserRole(res.role as 'admin' | 'member');
      setPointsEarned(res.pointsEarned as number);
      if (res.members) setMembers(res.members as User[]);
    } else {
      toast.error(res.message || "An error occurred!");
    }
    setInitialLoading(false);
  };

  // Fetch AI suggested tasks
  const fetchAISuggestedTasks = async () => {
    const res = await getAISuggestedTasksByProjectId(project.id);
    if (res.success) {
      setAiSuggestedTasks(res.tasks || []);
    } else {
      toast.error(res.message || "An error occurred!");
    }
  };

  useEffect(() => {
    fetchtasksWithSubTasks();
    fetchAISuggestedTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAcceptSuggestedTask = async (task: any) => {
    // Add the suggested task to the regular tasks
    const newTask = {
      name: task.name,
      description: task.description,
      projectId: project.id,
    };
    // Call your add task function here (e.g., addTask(newTask))
    // Remove the suggested task from the AI suggested tasks in the database
    await deleteAISuggestedTask(task.id);
    // Update the state
    //@ts-expect-error: Type 'TaskType[]' is not assignable to type 'SetStateAction<TaskType[]>'.
    setTasks([...tasks, newTask]);
    setAiSuggestedTasks(aiSuggestedTasks.filter((t) => t.id !== task.id));
    await saveTask(project.id, task.name, task.description);
  };

  const handleRejectSuggestedTask = async (taskId: string) => {
    // Remove the suggested task from the AI suggested tasks in the database
    await deleteAISuggestedTask(taskId);
    // Update the state
    setAiSuggestedTasks(aiSuggestedTasks.filter((t) => t.id !== taskId));
  };

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
        return {
          ...task,
          subtasks: filteredSubtasks,
        };
      })
      .filter((task) => subtaskFilter === "all" || task.subtasks.length > 0);
    return filteredTasks;
  };

  if (initialLoading) {
    return <div className="text-center text-xl font-bold">Loading...</div>;
  }

  // if (!tasks.length) return (
  //   <>
  //     <SuperHeader path="/dashboard" />
  //     <div className="max-w-7xl mx-auto p-6 space-y-6">
  //       <ProjectHeader session={session} projectName={project.name} projectId={project.id} points={pointsEarned} showPoints={true} />
  //       <div className="mb-6">
  //         <ProgressBar progress={stats.progress} />
  //         <p className="text-sm text-gray-600 mt-2">
  //           {stats.progress}% Complete • {stats.totalSubtasks} subtasks •{' '}
  //           {stats.completedSubtasks} done • {stats.pendingSubtasks} pending
  //         </p>
  //       </div>
  //       <div className="flex justify-end mt-3">
  //         {currentUserRole === "admin" &&
  //           <div className="text-blue-500 font-semibold cursor-pointer flex flex-row items-center gap-2" onClick={() => setaddTaskModalOpen(true)}>
  //             Add a new task
  //             <button className="bg-gray-500 text-white w-6 h-6 flex items-center justify-center rounded hover:bg-gray-600 z-10">+</button>
  //           </div>
  //         }
  //         <AddTaskPopup setTasks={setTasks} projectId={project.id} modalIsOpen={addTaskModalOpen} setModalIsOpen={setaddTaskModalOpen} />
  //       </div>
  //       <div className="mt-10 flex flex-row items-center justify-center gap-1">
  //         <p>No task found.</p>
  //       </div>
  //     </div>
  //   </>
  // );

  return (
    <>
      <SuperHeader path="/dashboard" />
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <ProjectHeader session={session} projectName={project.name} projectId={project.id} points={pointsEarned} showPoints={true} />
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

        <div className="mb-6 flex flex-row justify-between">
          <p
            className="cursor-pointer text-blue-500 hover:underline w-fit"
            onClick={() => setShowSubtasks(!showSubtasks)}
          >
            {showSubtasks ? "Hide Subtasks" : "Show Subtasks"}
          </p>
        </div>

        <div className="flex flex-row items-center justify-end gap-4 -mt-5">
          {/* Toggle edit Mode */}
          {currentUserRole === "admin" &&
            <button onClick={() => setEditMode(!editMode)}>
              <MdEditSquare className={`${editMode ? 'text-red-600' : 'text-blue-600'} text-2xl`} />
            </button>
          }
          <ViewToggle onChange={(mode: string) => setViewMode(mode)} />
        </div>

        <div className="flex justify-end -mt-3">
          {currentUserRole === "admin" && editMode &&
            <div className="text-blue-500 font-semibold cursor-pointer flex flex-row items-center gap-2" onClick={() => setaddTaskModalOpen(true)}>
              Add task
              <button className="bg-gray-500 text-white w-6 h-6 flex items-center justify-center rounded hover:bg-gray-600 z-10">+</button>
            </div>
          }
          <AddTaskPopup setTasks={setTasks} projectId={project.id} modalIsOpen={addTaskModalOpen} setModalIsOpen={setaddTaskModalOpen} />
        </div>

        {/* Display AI Suggested Tasks */}
        {aiSuggestedTasks.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold">Maybe add these tasks?</h3>
            {aiSuggestedTasks.map((task, i) => (
              <div key={i} className="mb-6 p-4 rounded bg-gray-50 border border-gray-200 relative">
                <div>
                  <h4 className="font-semibold">{task.name}</h4>
                  {/*<p>{task.description}</p>*/}
                </div>
                <div className="flex gap-2">
                  <button
                    className="bg-green-500 text-white px-2 py-1 rounded"
                    onClick={() => handleAcceptSuggestedTask(task)}
                  >
                    ✓
                  </button>
                  <button
                    className="bg-red-500 text-white px-2 py-1 rounded"
                    onClick={() => handleRejectSuggestedTask(task.id)}
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

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
              editMode={editMode}
              setPointsEarned={setPointsEarned}
              session={session}
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
            editMode={editMode}
          />
        )}
      </div>
    </>
  );
}

export default Project;