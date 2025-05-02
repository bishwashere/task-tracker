import SuperHeader from "@/components/common/block/super-header";
import { useGetProjectById } from "@/queries/project/hooks";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { ProjectHeader } from "./project-header";
import { useProjectContext } from "../_context";
import ProgressBar from "@/components/common/ProgressBar";
import { calculateProgressWithStats } from "@/lib/progress";
import ProjectFilters from "./project-filters";
import { ViewToggle } from "./view-toggle";
import AddTaskDialog from "./dialogs/add-task-dialog";
import { useGetAISuggestedTasks } from "@/queries/tasks/hooks";
import AiSuggestions from "./ai-suggestions";
import TaskList from "./task-view/task-list";
import { TaskGrid } from "./task-view/task-grid";

const Project = () => {
  const { id } = useParams() as {
    id: string;
  };
  const { data, isPending } = useGetProjectById(id);
  const { setEditMode, editMode, viewMode, setRole, filteredTasks } = useProjectContext();
  const stats = calculateProgressWithStats(data?.tasks || []);
  const [addTaskModalOpen, setAddTaskModalOpen] = useState(false);
  const ai = useGetAISuggestedTasks(id)
  const [mockLoading, setMockLoading] = useState(true);



  useEffect(() => {
    if (isPending) return
    setRole(data?.role || "member")
  }, [id, data?.role, isPending])

  return (
    <>
      <SuperHeader path="/dashboard" label={data?.project?.name} />
      <div className="max-w-7xl mx-auto p-4 space-y-6">
        <ProjectHeader
          projectName={data?.project?.name || ""}
          projectId={data?.project?.id || ""}
          points={data?.pointsEarned}
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
        <ProjectFilters
          hideUserFilter={data?.role !== "admin"}
          members={data?.members || []}
        />
        <div className="flex flex-row items-center justify-end gap-4 -mt-5">
          <ViewToggle />
        </div>

        <div className="flex justify-end -mt-3">
          {data?.role?.toLowerCase() === "admin" && editMode && (
            <button
              className="text-blue-500 font-semibold cursor-pointer flex flex-row items-center gap-2"
              onClick={() => setAddTaskModalOpen(true)}
            >
              Add task
              <span className="bg-gray-500 text-white w-6 h-6 flex items-center justify-center rounded hover:bg-gray-600 z-10">
                +
              </span>
            </button>
          )}
          <AddTaskDialog
            modalIsOpen={addTaskModalOpen}
            setModalIsOpen={setAddTaskModalOpen}
          />
        </div>
        <AiSuggestions
          showGenerationLoader={!data?.project?.hasAiSuggestTasks}
          loading={ai.isPending || mockLoading} tasks={ai.data || []} completed={() => {
            setMockLoading(false);
          }} />

        {
          !isPending && filteredTasks?.length === 0 ? (
            <div className="mt-10 flex flex-row items-center justify-center gap-1">
              <p>No task found.</p>
            </div>
          ) : viewMode === "grid" ? <TaskGrid tasks={filteredTasks || []} /> : <TaskList tasks={filteredTasks || []} />
        }

      </div>

    </>
  );
};

export default Project;


