import { useRouter } from "next/navigation";
import { SubTaskViewProps } from ".";
import { cn } from "@/lib/cn";
import { useProjectContext } from "../../../../_context";
import { Avatar } from "@/components/ui/avatar";
import { useDeleteSubtask, useToggleSubtaskPriority, useUpdateSubtaskStatus } from "@/queries/subtask/hooks";
import { confirm } from "@/components/ui/alert-dialog";
import { MdDelete } from "react-icons/md";
import EditSubtaskDialog from "./edit-subtask-dialog";
import AddTagPopup from "./add-tag-dialog";
import { Calendar, Check, Circle, CircleCheck, Coins, Lock, MessageSquare, Star, UserRound } from "lucide-react";

interface SubTaskContentProps extends SubTaskViewProps {
  isDragging?: boolean;
}

export const SubTaskContent = ({
  subtask,
  isNew,
  isDragging,
  taskId,
}: SubTaskContentProps) => {
  const router = useRouter();
  const { role, editMode, projectId } = useProjectContext()
  const isAdmin = role.toLowerCase() === "admin";
  const showSubtaskActions = editMode || (role.length > 0 && !isAdmin);
  const del = useDeleteSubtask()
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
        month: "long",
        day: "numeric",
        year: "numeric",
      };
      return dueDateObj.toLocaleDateString("en-US", options);
    }
  };
  const update = useUpdateSubtaskStatus()

  const togglePriority = useToggleSubtaskPriority()
  const blockingSubtask =
    subtask.dependsOnSubtask && subtask.dependsOnSubtask.status !== "done"
      ? subtask.dependsOnSubtask
      : null;

  const onOpenSubtask = async () => {
    if (blockingSubtask) {
      await confirm({
        title: "Subtask is blocked",
        description: `This subtask depends on "${blockingSubtask.name}". Complete that subtask before starting this one.`,
        confirm: "Got it",
        showCancel: false,
      });
      return;
    }

    router.push(`/project/subtask/${subtask.id}`);
  };

  const onDelete = async () => {
    const should = await confirm({
      title: undefined,
      description: "Are you sure you want to delete this subtask?",
    })
    if (!should) return
    try {
      await del.mutateAsync({
        subtaskId: subtask.id,
        projectId,
        taskId
      })
    } catch { }
  }

  return (
    <div
      key={subtask.id}
      className={cn(
        "px-2.5 py-1.5 rounded-md border shadow-sm flex justify-between items-center transition-colors duration-150",
        subtask.status === "done"
          ? "bg-green-50 border-green-200/80 text-green-800 hover:bg-green-100"
          : "bg-white border-border hover:bg-muted/40",
        isDragging && "ring-2 ring-blue-400/40 border-blue-300 shadow-md",
      )}
    >
      <div>
        <div className="flex flex-row gap-2 items-center">
          <span
            className="cursor-pointer hover:underline text-lg font-semibold"
            onClick={onOpenSubtask}
          >
            {subtask.name}
          </span>
          {subtask.createdAt && (
            <span className="text-xs text-white bg-transparent px-1 py-0.5 rounded inline-flex items-center">
              {isNew(subtask.createdAt) ? (
                <span className="w-2.5 h-2.5 bg-green-500 rounded-full mr-1"></span>
              ) : (
                ""
              )}
            </span>
          )}
          {/* //todo */}
          {(subtask.issueCount || 0) > 0 && (
            <span className="text-xs text-white bg-red-500 px-1.5 py-0.5 inline-flex items-center gap-0.5 rounded-full">
              <MessageSquare className="size-3" aria-hidden />
              {subtask.issueCount}
            </span>
          )}
          {blockingSubtask && (
            <span className="text-xs text-amber-700 bg-amber-100 px-1.5 py-0.5 inline-flex items-center gap-0.5 rounded-full">
              <Lock className="size-3" aria-hidden />
              Blocked by {blockingSubtask.name}
            </span>
          )}
          {isAdmin && editMode && (
            <EditSubtaskDialog
              canEdit={isAdmin && editMode}
              projectId={projectId}
              taskId={taskId}
              subtaskId={subtask.id}
              defaultValue={{
                subtaskName: subtask.name,
                dueDate: subtask.dueDate?.toISOString().split("T")[0] || "",
                points: subtask.points,
                assignedUserId: subtask.assignedUserId || "",
                dependsOnSubtaskId: subtask.dependsOnSubtaskId || "",
              }}
            />
          )}
          {isAdmin && editMode && (
            <button className="px-1 w-4" onClick={onDelete}>
              <MdDelete className="text-red-600 " />
            </button>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground mt-0.5">
          <span className="inline-flex items-center gap-1 capitalize">
            {subtask.status === "done" ? (
              <CircleCheck className="size-3.5 text-green-600 shrink-0" aria-hidden />
            ) : (
              <Circle className="size-3.5 shrink-0" aria-hidden />
            )}
            {subtask.status}
          </span>
          {subtask.assignedUserId && subtask.assignedUser ? (
            <span className="inline-flex items-center gap-1.5 px-1.5 py-0.5 border border-gray-300 rounded-full text-gray-700 bg-background">
              <Avatar
                className="border-foreground"
                src={subtask.assignedUser?.image || ""}
                alt={subtask.assignedUser?.name || ""}
                size="xs"
              />
              {subtask.assignedUser?.name}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1">
              <UserRound className="size-3.5 shrink-0" aria-hidden />
              Unassigned
            </span>
          )}
          <span className="inline-flex items-center gap-1">
            <Coins className="size-3.5 shrink-0" aria-hidden />
            {subtask.points} pts
          </span>
          {subtask.dueDate && (
            <span className="inline-flex items-center gap-1">
              <Calendar className="size-3.5 shrink-0" aria-hidden />
              {dueRemaining(subtask.dueDate)}
            </span>
          )}
        </div>
      </div>
      {showSubtaskActions && (
        <div className="flex items-center gap-2">
          {subtask.tagName ? (
            <span
              className="px-2 py-1 rounded text-sm"
              style={{
                backgroundColor: subtask.tagColor || "transparent",
                color: "#FFF",
              }}
            >
              {subtask.tagName}
            </span>
          ) : (
            <AddTagPopup
              taskId={taskId}
              subtaskId={subtask.id}
              projectId={projectId}
            />
          )}
          <button
            onClick={() => togglePriority.mutate({
              projectId,
              subtaskId: subtask.id,
              priority: subtask.priority === 0 ? 1 : 0,
              taskId: taskId
            })}
            className={cn(
              "rounded p-0.5",
              subtask.priority
                ? "text-yellow-500 hover:text-yellow-600"
                : "text-gray-400 hover:text-gray-600",
            )}
            aria-label={subtask.priority ? "Remove priority" : "Mark as priority"}
          >
            <Star className={cn("size-4", subtask.priority && "fill-current")} />
          </button>
          {isAdmin && subtask.status !== "done" && (
            <button
              onClick={async () => {
                if (blockingSubtask) {
                  await confirm({
                    title: "Subtask is blocked",
                    description: `This subtask depends on "${blockingSubtask.name}". Complete that subtask before closing this one.`,
                    confirm: "Got it",
                    showCancel: false,
                  });
                  return;
                }

                update.mutate({ subtaskId: subtask.id, status: "done", projectId, taskId });
              }}
              className="p-1.5 rounded-md bg-green-100 text-green-700 hover:bg-green-200 disabled:opacity-75"
              aria-label="Mark as done"
            >
              <Check className="size-4" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};