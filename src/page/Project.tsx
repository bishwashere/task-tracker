

"use client";

import ProgressBar from "@/components/common/ProgressBar";
import { ViewToggle } from "@/components/common/ViewToggle";
import { ProjectHeader } from "@/components/headers/ProjectHeader";
import SuperHeader from "@/components/common/block/super-header";
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
import {
  getAISuggestedTasksByProjectId,
  deleteAISuggestedTask,
} from "@/actions/ai-sugested-task";
import { saveTask } from "@/actions/task";
import TaskGenerationLoader from "@/components/common/task-generation-loader";
import { Separator } from "@/components/ui/separator";

const Project = ({
  session,
  project,
}: {
  session: Session;
  project: ProjectType;
}) => {
  const [initialLoading, setInitialLoading] = useState(true);
  const [members, setMembers] = useState<User[]>([]);
  const [tasks, setTasks] = useState<TaskType[]>([]);
  const [originalTasks, setOriginalTasks] = useState<TaskType[]>([]);
  const [currentUserRole, setCurrentUserRole] = useState<"admin" | "member">(
    "member",
  );
  const [viewMode, setViewMode] = useState("list"); // Default view state
  const [filterByDate, setFilterByDate] = useState<
    "all" | "today" | "week" | "month" | "year"
  >("all");
  const [editMode, setEditMode] = useState(false);
  const [subtaskFilter, setSubtaskFilter] = useState<
    "all" | "pending" | "done"
  >("pending");
  const [showSubtasks, setShowSubtasks] = useState(true);
  const [pointsEarned, setPointsEarned] = useState<number>(0);
  const [addTaskModalOpen, setaddTaskModalOpen] = useState(false);
  const [showTaskGeneration, setShowTaskGeneration] = useState(
    !project.hasAiSuggestTasks,
  );
  const [aiSuggestedTasks, setAiSuggestedTasks] = useState<
    {
      id: string;
      name: string;
      description: string | null;
      projectId: string;
    }[]
  >([]);
  const [userFilter, setUserFilter] = useState<string>("all"); // "all" | "unassigned" | userId

  // Fetch tasks and subtasks
  const fetchtasksWithSubTasks = async () => {
    const res = await fetchProjectData(project.id);
    if (res.success) {
      setOriginalTasks(res.tasks as unknown as TaskType[]); // Store original tasks
      setCurrentUserRole(res.role as "admin" | "member");
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

  const handleAcceptSuggestedTask = async (task: {
    id: string;
    name: string;
    description: string | null;
  }) => {
    // Call your add task function here (e.g., addTask(newTask))
    // Remove the suggested task from the AI suggested tasks in the database
    // Update the state

    const res = await saveTask(project.id, task.name, task.description || "");
    if (res.success && res.task) {
      setOriginalTasks((prevTasks) => [...prevTasks, res.task as unknown as TaskType]);
      setAiSuggestedTasks(aiSuggestedTasks.filter((t) => t.id !== task.id));
      await deleteAISuggestedTask(task.id);
    }
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
          if (subtaskFilter === "all") return true;
          if (subtaskFilter === "pending") return subtask.status === "pending"
          if (subtaskFilter === "done") return subtask.status === "done";
          return false;
        });
        return {
          ...task,
          subtasks: filteredSubtasks,
        };
      })
      // now if all return all, if done, return task with subtasks > 0,
      // if pending, return task with subtasks > 0 or task with subtask can also pass if it already does not have any task before 
      // filtering
      .filter((t) => {
        if (subtaskFilter === "all") return true;
        if (subtaskFilter === "done" && t.subtasks.length > 0) return true;
        if (subtaskFilter === "pending") {
          if (t.subtasks.length > 0) return true; // if subtasks > 0, return true
          if (t.subtasks.length === 0 && originalTasks.find((ot) => ot.id === t.id)?.subtasks.length === 0) return true; // if subtasks === 0 and originalTasks.subtasks === 0, return true
        }
      });

    return filteredTasks;
  };



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


  useEffect(() => {
    const filter = filterByDate;

    // Reset to original tasks for "all" filter
    if (filter === 'all' && userFilter === 'all') {
      setTasks(originalTasks);
      return;
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const isToday = (date: Date) => {
      return date.getFullYear() === today.getFullYear() &&
        date.getMonth() === today.getMonth() &&
        date.getDate() === today.getDate();
    };

    const isSameWeek = (date: Date) => {
      const taskWeek = Math.ceil((date.getDate() + new Date(date.getFullYear(), date.getMonth(), 1).getDay()) / 7);
      const currentWeek = Math.ceil((today.getDate() + new Date(today.getFullYear(), today.getMonth(), 1).getDay()) / 7);
      return date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear() &&
        taskWeek === currentWeek;
    };

    const isSameMonth = (date: Date) => {
      return date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear();
    };

    const isSameYear = (date: Date) => {
      return date.getFullYear() === today.getFullYear();
    };

    const filteredTasks = originalTasks.map(task => ({
      ...task,
      subtasks: task.subtasks.filter(subtask => {
        // First apply user filter
        const passesUserFilter =
          userFilter === 'all' ? true :
            userFilter === 'unassigned' ? !subtask.assignedUserId :
              subtask.assignedUserId === userFilter;

        if (!passesUserFilter) return false;

        // Then apply date filter if not "all"
        if (filter === 'all') return true;

        if (!subtask.dueDate) return false;

        const subtaskDate = new Date(subtask.dueDate);
        if (isNaN(subtaskDate.getTime())) return false;

        subtaskDate.setHours(0, 0, 0, 0);

        switch (filter) {
          case 'today':
            return isToday(subtaskDate);
          case 'week':
            return isSameWeek(subtaskDate);
          case 'month':
            return isSameMonth(subtaskDate);
          case 'year':
            return isSameYear(subtaskDate);
          default:
            return false;
        }
      })
    }))
      .filter(task => task.subtasks.length > 0);

    setTasks(filteredTasks);
    console.log("filteredTasks", filteredTasks);
  }, [filterByDate, userFilter, originalTasks]);

  return (
    <>
      <SuperHeader path="/dashboard" label={project.name} />
      <div className="max-w-7xl mx-auto p-4 space-y-6">
        <ProjectHeader
          session={session}
          projectName={project.name}
          projectId={project.id}
          points={pointsEarned}
          showPoints={true}
          onEditButtonClick={() => setEditMode((prev) => !prev)}
        />
        <div className="mb-4">
          <ProgressBar progress={stats.progress} />
          <p className="text-sm text-gray-600 mt-2">
            {stats.progress}% Complete • {stats.totalSubtasks} subtasks •{" "}
            {stats.completedSubtasks} done • {stats.pendingSubtasks} pending
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="flex justify-start items-center max-sm:space-x-2 space-x-4 ">
            {
              ([
                "pending",
                "all",
                "done",
              ] as const).map((filter) => (
                <button
                  key={filter}
                  className={`sm:px-4 capitalize px-2 text-sm sm:py-2 py-0.5 rounded ${subtaskFilter === filter
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-700"
                    }`}
                  onClick={() => setSubtaskFilter(filter)}
                >
                  {filter}
                </button>
              ))
            }
          </div>

          {/* filter by assigned users */}
          {
            // only if admin
            currentUserRole === "admin" &&
            <> <Separator orientation="vertical" className="h-5" />
              <select
                className="border rounded px-2 py-1 text-sm"
                value={userFilter}
                onChange={(e) => setUserFilter(e.target.value)}
              >
                <option value="all">All Users</option>
                <option value="unassigned">Unassigned</option>
                {members.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </select></>}
        </div>

        <div className="mb-4 flex flex-row gap-4">
          <p
            className="cursor-pointer text-blue-500 hover:underline w-fit text-sm sm:text-base"
            onClick={() => setShowSubtasks(!showSubtasks)}
          >
            {showSubtasks ? "Hide Subtasks" : "Show Subtasks"}
          </p>



          <Separator orientation="vertical" className="h-5" />
          <select
            className="border rounded px-2 py-1 text-sm"
            value={filterByDate}
            onChange={(e) => {
              setFilterByDate(e.target.value as "all" | "today" | "week" | "month" | "year");
            }}
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>
        </div>

        <div className="flex flex-row items-center justify-end gap-4 -mt-5">
          {/* Toggle edit Mode */}
          {/* {currentUserRole === "admin" && (
            <button onClick={() => setEditMode(!editMode)}>
              <MdEditSquare
                className={`${editMode ? "text-red-600" : "text-blue-600"} text-2xl`}
              />
            </button>
          )} */}
          <ViewToggle onChange={(mode: string) => setViewMode(mode)} />
        </div>

        <div className="flex justify-end -mt-3">
          {currentUserRole === "admin" && editMode && (
            <div
              className="text-blue-500 font-semibold cursor-pointer flex flex-row items-center gap-2"
              onClick={() => setaddTaskModalOpen(true)}
            >
              Add task
              <button className="bg-gray-500 text-white w-6 h-6 flex items-center justify-center rounded hover:bg-gray-600 z-10">
                +
              </button>
            </div>
          )}
          <AddTaskPopup
            setTasks={(data) => {
              setOriginalTasks(data);
            }}
            projectId={project.id}
            modalIsOpen={addTaskModalOpen}
            setModalIsOpen={setaddTaskModalOpen}
          />
        </div>

        {showTaskGeneration ? (
          <TaskGenerationLoader
            onComplete={() => {
              console.log("Task generation complete");
              setShowTaskGeneration(false);
            }}
          />
        ) : initialLoading ? (
          <div className="text-center text-xl font-bold">Loading...</div>
        ) : (
          <>
            {/* Display AI Suggested Tasks */}
            {aiSuggestedTasks.length > 0 && (
              <div className="mb-4">
                <h3 className="text-lg font-semibold">
                  Maybe add these tasks?
                </h3>
                {aiSuggestedTasks.map((task, i) => (
                  <div
                    key={i}
                    className="mb-4 p-4 rounded bg-gray-50 border border-gray-200 relative flex justify-between"
                  >
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
            {viewMode === "list" ? (
              <>
                <TaskList
                  tasks={getFilteredTasks().map((task) => ({
                    ...task,
                    subtasks: showSubtasks ? task.subtasks : [], // Show or hide subtasks based on `showSubtasks`
                  }))}
                  setTasks={(data) => {
                    setOriginalTasks(data);
                  }}
                  users={members}
                  projectId={project.id}
                  role={currentUserRole}
                  editMode={editMode}
                  setPointsEarned={setPointsEarned}
                  session={session}
                  originalTasks={originalTasks}
                />
              </>
            ) : (
              <TaskGrid
                tasks={getFilteredTasks().map((task) => ({
                  ...task,
                  subtasks: showSubtasks ? task.subtasks : [], // Show or hide subtasks based on `showSubtasks`
                }))}
                setTasks={(data) => {
                  setOriginalTasks(data);
                }}
                projectId={project.id}
                role={currentUserRole}
                editMode={editMode}
                originalTasks={originalTasks}
                users={members}
              />
            )}
          </>
        )}
      </div>
    </>
  );
};

export default Project;








