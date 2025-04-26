import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { SubtaskType, TaskType } from "@/types/organization";
import { User } from "@/types/user";
import AddTagPopup from "./AddTagPopup";
import { togglePriority, updateSubtaskStatus } from "@/actions/task";
import toast from "react-hot-toast";
import { useConfirmModal } from "../Modal/useConfirmModal";
import { Session } from "next-auth";
import EditSubtaskPopup from "./EditSubtaskPopup";
import { Avatar } from "../ui/avatar";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  DragStartEvent,
  DragEndEvent,
  TouchSensor,
  MouseSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/cn";
import { sortSubtasks } from "@/actions/subtask";

interface SubTaskListProps {
  subtasks: SubtaskType[];
  taskId: string;
  role: "admin" | "member";
  users: User[];
  projectId: string;
  setTasks: React.Dispatch<React.SetStateAction<TaskType[]>>;
  editMode: boolean;
  setPointsEarned: React.Dispatch<React.SetStateAction<number>>;
  session: Session;
  isNewTask: (createdAt: string | Date) => boolean;
}

export const SubTaskList = (props: SubTaskListProps) => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [subtasks, setSubtasks] = useState(props.subtasks);

  // Configure sensors for both mouse and touch interactions
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 10,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    console.log("drag start")
    // Stop event propagation to parent DnD context
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {

    console.log("drag end")

    // Stop event propagation to parent DnD context
    const { active, over } = event;
    setActiveId(null);

    if (over && active.id !== over.id) {
      const oldIndex = subtasks.findIndex(
        (subtask) => subtask.id === active.id
      );
      const newIndex = subtasks.findIndex(
        (subtask) => subtask.id === over.id
      );

      const updatedSubtasks = arrayMove(subtasks, oldIndex, newIndex).map(
        (subtask, index) => ({
          ...subtask,
          subtaskSortIndex: [{ sortIndex: subtasks.length - 1 - index }] as [
            { sortIndex: number }
          ],
        })
      );

      // Save the previous state in case of error
      const prevSubtasks = subtasks;
      setSubtasks(updatedSubtasks);

      // Prepare sort data for the backend
      const sortData = updatedSubtasks.map((subtask) => ({
        subtaskId: subtask.id,
        sortIndex: subtask?.subtaskSortIndex?.[0]?.sortIndex || 0,
      }));

      try {
        const res = await sortSubtasks(sortData);
        if (!res.success) {
          toast.error(res.message || "An error occurred");
          setSubtasks(prevSubtasks);
        }
      } catch {
        toast.error("An error occurred");
        setSubtasks(prevSubtasks);
      }
    }
  };

  return (
    // Add onClick handler to prevent event bubbling
    <div onClick={(e) => e.stopPropagation()}>
      <DndContext
        id="subtask-dnd-context"
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={subtasks.map((s) => s.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {subtasks
              .sort(
                (a, b) =>
                  (b?.subtaskSortIndex?.[0]?.sortIndex || 0) -
                  (a?.subtaskSortIndex?.[0]?.sortIndex || 0)
              )
              .map((subtask) => (
                <SubTaskView
                  key={subtask.id}
                  subtask={subtask}
                  {...props}
                />
              ))}
          </div>
        </SortableContext>
        <DragOverlay>
          {activeId ? (
            <SubTaskViewDragOverlay
              subtask={subtasks.find((s) => s.id === activeId)!}
              {...props}
            />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
};

interface SubTaskViewProps {
  subtask: SubtaskType;
  taskId: string;
  role: "admin" | "member";
  users: User[];
  projectId: string;
  setTasks: React.Dispatch<React.SetStateAction<TaskType[]>>;
  editMode: boolean;
  setPointsEarned: React.Dispatch<React.SetStateAction<number>>;
  session: Session;
  isNewTask: (createdAt: string | Date) => boolean;
}

export const SubTaskView = (props: SubTaskViewProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: props.subtask.id,
    data: {
      ...props.subtask,
      isSubtask: true // Important: This flags it as a subtask
    }
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="cursor-grab active:cursor-grabbing"
    >
      <SubTaskContent {...props} isDragging={isDragging} />
    </div>
  );
};

interface SubTaskContentProps extends SubTaskViewProps {
  isDragging?: boolean;
}

export const SubTaskContent = ({
  subtask,
  taskId,
  role,
  users,
  projectId,
  setTasks,
  editMode,
  setPointsEarned,
  session,
  isNewTask,
  isDragging,
}: SubTaskContentProps) => {
  const router = useRouter();
  const issueCount = subtask.issueCount || 0;
  const [loading, setLoading] = useState(false);
  const { confirmAction, ConfirmationModal } = useConfirmModal();

  const priorityToggle = async () => {
    setLoading(true);
    const res = await togglePriority(
      subtask.id,
      projectId,
      subtask.priority === 0 ? 1 : 0,
    );
    if (res.success) {
      const updatedSubtask = res.updatedSubtask as SubtaskType;
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === taskId
            ? {
              ...task,
              subtasks: task.subtasks.map((subtask) =>
                subtask.id === updatedSubtask.id ? updatedSubtask : subtask,
              ),
            }
            : task,
        ),
      );
    } else {
      toast.error(res.message || "An error Occurred");
    }
    setLoading(false);
  };

  const markAsDone = async (subtaskId: string) => {
    const confirmed = await confirmAction(
      "Are you sure you want to mark this subtask as done?",
    );
    if (!confirmed) return;
    setLoading(true);
    const res = await updateSubtaskStatus(subtaskId, "done");
    if (res.success) {
      const updatedSubtask = res.updatedSubtask as SubtaskType;
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === taskId
            ? {
              ...task,
              subtasks: task.subtasks.map((subtask) =>
                subtask.id === updatedSubtask.id ? updatedSubtask : subtask,
              ),
            }
            : task,
        ),
      );
      if (subtask.assignedUserId === session?.user?.id)
        setPointsEarned((prev) => prev + subtask.points);
    } else {
      toast.error(res.message || "An error occurred");
    }
    setLoading(false);
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
        month: "long",
        day: "numeric",
        year: "numeric",
      };
      return dueDateObj.toLocaleDateString("en-US", options);
    }
  };

  return (
    <div
      key={subtask.id}
      className={cn(
        `p-2 rounded shadow-md flex justify-between items-center`,
        subtask.status === "done"
          ? "bg-green-200 text-green-700 hover:bg-green-300"
          : "bg-white hover:bg-gray-100",
        isDragging && "border-blue-500 shadow-lg"
      )}
    >
      <div>
        <div className="flex flex-row gap-2 items-center">
          <span
            className="cursor-pointer hover:underline text-lg font-semibold"
            onClick={() => router.push(`/project/subtask/${subtask.id}`)}
          >
            {subtask.name}
          </span>
          {subtask.createdAt && (
            <span className="text-xs text-white bg-transparent px-1 py-0.5 rounded inline-flex items-center">
              {isNewTask(subtask.createdAt) ? (
                <span className="w-2.5 h-2.5 bg-green-500 rounded-full mr-1"></span>
              ) : (
                ""
              )}
            </span>
          )}

          {(subtask.issueCount || 0) > 0 && (
            <span className="text-xs text-white bg-red-500 px-1 py-0.5 inline-flex items-center rounded-full aspect-square">
              {subtask.issueCount}
            </span>
          )}
          {role === "admin" && editMode && (
            <EditSubtaskPopup
              users={users}
              projectId={projectId}
              setTasks={setTasks}
              subtask={subtask}
              taskId={taskId}
            />
          )}
        </div>
        <div className="text-sm">
          {subtask.status} •{" "}
          {subtask.assignedUserId && subtask.assignedUser ? (
            <div className="inline-flex items-center gap-1.5 px-1.5 py-0.5 border border-gray-300 rounded-full text-gray-700 bg-background">
              <Avatar className="border-foreground" src={subtask.assignedUser?.image || ""} alt={subtask.assignedUser?.name || ""} size="xs" />  {subtask.assignedUser?.name}
            </div>
          ) : (
            "Unassigned"
          )}{" "}
          • {subtask.points} points{" "}
          {subtask.dueDate && `• Due: ${dueRemaining(subtask.dueDate)}`}
        </div>
      </div>
      {editMode && (
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
              setTasks={setTasks}
              taskId={taskId}
              subtaskId={subtask.id}
              projectId={projectId}
            />
          )}
          <button
            onClick={() => priorityToggle()}
            className={`text-sm rounded ${subtask.priority
              ? "text-yellow-500 hover:text-yellow-600"
              : "text-gray-500 hover:text-gray-600"
              }`}
            disabled={loading}
          >
            {subtask.priority ? "⭐" : "☆"}
          </button>
          {subtask.status !== "done" && (
            <button
              onClick={() => markAsDone(subtask.id)}
              disabled={loading}
              className="bg-green-100 text-white px-4 py-2 rounded hover:bg-green-200 disabled:opacity-75"
            >
              &#10003;
            </button>
          )}
        </div>
      )}

      <ConfirmationModal />
    </div>
  );
};

export const SubTaskViewDragOverlay = (props: SubTaskViewProps) => {
  // Add onClick handler to prevent event bubbling
  return (
    <div onClick={(e) => e.stopPropagation()}>
      <SubTaskContent {...props} isDragging={true} />
    </div>
  );
};




