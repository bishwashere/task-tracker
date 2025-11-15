"use client";
import SuperHeader from "@/components/common/block/super-header";
import { useGetProjectById } from "@/queries/project/hooks";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { ProjectHeader } from "./project-header";
import { ProjectContextProvider, useProjectContext } from "../_context";
import ProgressBar from "@/components/common/ProgressBar";
import { calculateProgressWithStats } from "@/lib/progress";
import ProjectFilters from "./project-filters";
import { ViewToggle } from "./view-toggle";
import AddTaskDialog from "./dialogs/add-task-dialog";
import { useGetAISuggestedTasks } from "@/queries/tasks/hooks";
import AiSuggestions from "./ai-suggestions";
import TaskList from "./task-view/task-list";
import { TaskGrid } from "./task-view/task-grid";
import { ProjectInsights } from "./project-insights";
import Loading from "@/components/ui/loading";
import Link from "next/link";

const Project = ({ id }: { id: string }) => {

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

  const project = useGetProjectById(id);

  if (project.isLoading) {
    return <Loading />;
  }

  if (project.isSuccess && project.data) {
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
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-gray-800">Project Progress</h3>
              <span className="text-2xl font-bold text-green-600">
                {Math.round(stats.progress)}%
              </span>
            </div>
            <ProgressBar progress={stats.progress} className="h-6" showPercentage={false} />
            <p className="text-sm text-gray-600 mt-2">
              {stats.totalSubtasks} subtasks • {stats.completedSubtasks} done • {stats.pendingSubtasks} pending
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
        <ProjectInsights id={id} />
        </>
    );
  } else {
    return (
      <div className="w-screen h-screen flex flex-col items-center justify-center gap-3 p-4 mx-auto max-w-md">
        <p className="text-3xl font-semibold text-left w-full">Error :(</p>
        <p className="text-xl font-semibold mt-2 text-left w-full">
          Possible reasons: <br /> <br /> 1. You are not part of this
          organization. <br /> 2. You do not have access to this project. <br />{" "}
          3. Project not found. <br /> 4. Unauthorized.
        </p>
        <Link
          href="/dashboard"
          className="text-white text-lg bg-blue-600 px-4 py-2 rounded-xl mt-10"
        >
          Go to Dashboard
        </Link>
      </div>
    );
  }

};

export default Project;


