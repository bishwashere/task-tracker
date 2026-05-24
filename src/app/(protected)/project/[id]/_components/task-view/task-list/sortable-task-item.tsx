import { useSortable } from "@dnd-kit/sortable";
import { Subtask, Task } from "@prisma/client";
import { useProjectContext } from "../../../_context";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/cn";
import { differenceInDays } from "date-fns";
import { useCallback } from "react";
import EditTaskDialog from "../../dialogs/edit-task-dialog";
import { useParams } from "next/navigation";
import DeleteTask from "../../dialogs/delete-task-dialog";
import AddSubtaskDialog from "../../dialogs/add-subtask-dialog";
import SubTaskView from "./subtask-view";
import { useTaskListContext } from "./context";
import { ListChecks } from "lucide-react";
import SprintTaskToggle, { taskHasPendingWork } from "../../sprint-task-toggle";
import { useProjectSprints } from "@/queries/sprint/hooks";
import { getTaskSprintInfo, isTaskInSprint } from "@/lib/sprint";
import TaskSprintLabel from "../../task-sprint-label";

const SortableTaskItem = ({
  task,
  index,
}: {
  task: Task & {
    subtasks: Array<Subtask & {
      subtaskSortIndex: { sortIndex: number }[]
      assignedUser: {
        name: string | null
        image: string | null
      } | null
      issueCount: number
    }>
  };
  index: number;
}) => {
  const { id } = useParams() as {
    id: string
  }
  const { activeDragging } = useTaskListContext()
  const { editMode, role, showSubtasks } = useProjectContext()
  const { data: projectSprints = [] } = useProjectSprints(id)
  const sprintInfo = getTaskSprintInfo(task.id, task.subtasks, projectSprints)
  const inSprint = isTaskInSprint(task.id, projectSprints)
  const hasPendingWork = taskHasPendingWork(task.subtasks)
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task?.id,
    data: {
      type: "task",
      isSubtask: false,
    },
    disabled: editMode,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const isNewTask = useCallback((createdAt: string | Date) => {
    const now = new Date();
    const taskDate = new Date(createdAt);
    if (isNaN(taskDate.getTime())) {
      console.error("Invalid createdAt date for task:", createdAt);
      return false;
    }
    const diffDays = differenceInDays(now, taskDate);
    return diffDays <= 0;
  }, []);

  return (
    <div
      {
      ...(activeDragging?.type === "subtask" ? {} : {
        ref: setNodeRef,
        style,
        ...attributes,
        ...listeners,
      })}
      className={cn(
        "flex items-start gap-1 transition-all duration-200",
        !editMode ? "cursor-grab active:cursor-grabbing" : "cursor-default",
      )}
    >
      <span className="text-lg font-bold text-gray-500">{index + 1}.</span>
      <div className={cn(
        "mb-4 p-3 rounded-lg border bg-white shadow-sm hover:shadow-md transition-all duration-150 relative flex-1",
        inSprint ? "border-green-300 hover:border-green-400" : "border-border hover:border-blue-200/50",
      )}>
        {role === "admin" && editMode && (
          <AddSubtaskDialog
            taskId={task?.id}
            projectId={id}
            showAi={!task?.hasAISuggestions}
          />
        )}
        <div className="flex flex-row items-center gap-2 flex-wrap mb-1.5">
          <h3 className="text-xl font-bold">{task?.name}</h3>
          {task.subtasks.length > 0 && (
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground font-normal">
              <ListChecks className="size-3.5 shrink-0" aria-hidden />
              {task.subtasks.length}
            </span>
          )}
          <TaskSprintLabel sprintInfo={sprintInfo} />
          <SprintTaskToggle
            projectId={id}
            taskId={task.id}
            hasPendingWork={hasPendingWork}
          />
          {task?.createdAt && (
            <span className="text-xs text-white bg-transparent px-1 py-0.5 rounded inline-flex items-center">
              {isNewTask(task?.createdAt) ? (
                <span className="w-2.5 h-2.5 bg-green-500 rounded-full mr-1"></span>
              ) : (
                ""
              )}
            </span>
          )}
          <div className="flex items-center justify-center">
            {role.toLowerCase() === "admin" && editMode && (
              <EditTaskDialog
                task={task}
                projectId={id}
              />
            )}
            {role === "admin" && editMode && (
              <DeleteTask
                taskId={task?.id}
              />
            )}
          </div>
        </div>
        <div className="grid grid-cols-1 gap-1.5" style={{ display: showSubtasks ? "grid" : "none" }}>
          {task?.subtasks
            // sort by sortIndex
            .sort(
              (a, b) =>
                (b?.subtaskSortIndex?.[0]?.sortIndex || 0) -
                (a?.subtaskSortIndex?.[0]?.sortIndex || 0),
            )
            .map((subtask) => (
              <SubTaskView
                key={subtask?.id}
                subtask={subtask}
                isNew={isNewTask}
                taskId={task?.id}
              />
            ))}
        </div>
      </div>
    </div>
  );
};

export default SortableTaskItem