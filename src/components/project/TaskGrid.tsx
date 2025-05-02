import { SubtaskType, TaskType } from "@/types/organization";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import AddSubtask from "../../app/(protected)/project/[id]/_components/dialogs/add-subtask-dialog.tsx";
import toast from "react-hot-toast";
import { togglePriority, sortTasks } from "@/actions/task";
import AISubtaskDialog from "../common/AISubtaskGenerator";
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
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/cn";
import { User } from "@/types/user";

export const TaskGrid = ({
  tasks: initialTasks,
  setTasks: setParentTasks,
  projectId,
  role,
  editMode,
  originalTasks,
  users,
}: {
  tasks: TaskType[];
  setTasks: React.Dispatch<React.SetStateAction<TaskType[]>>;
  projectId: string;
  role: "admin" | "member";
  editMode: boolean;
  originalTasks: TaskType[];
  users: User[];
}) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [sortedTasks, setSortedTasks] = useState(initialTasks);

  console.log("originalTasks", originalTasks);

  useEffect(() => {
    const sorted = [...initialTasks].sort(
      (a, b) =>
        (b?.taskSortIndex?.[0]?.sortIndex || 0) -
        (a?.taskSortIndex?.[0]?.sortIndex || 0),
    );
    setSortedTasks(sorted);
  }, [initialTasks]);

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
    }),
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (over && active.id !== over.id) {
      const oldIndex = initialTasks.findIndex((task) => task.id === active.id);
      const newIndex = initialTasks.findIndex((task) => task.id === over.id);

      const updatedTasks = arrayMove(initialTasks, oldIndex, newIndex).map(
        (task, index) => ({
          ...task,
          taskSortIndex: [{ sortIndex: initialTasks.length - 1 - index }] as [
            { sortIndex: number },
          ],
        }),
      );

      setSortedTasks(updatedTasks);
      setParentTasks(updatedTasks);

      const sortData = updatedTasks.map((task) => ({
        taskId: task.id,
        sortIndex: task?.taskSortIndex?.[0]?.sortIndex || 0,
      }));

      try {
        const res = await sortTasks(sortData);
        if (!res.success) {
          toast.error(res.message || "An error occurred");
          setSortedTasks(sortedTasks);
          setParentTasks(sortedTasks);
        }
      } catch {
        toast.error("An error occurred");
        setSortedTasks(sortedTasks);
        setParentTasks(sortedTasks);
      }
    }
  };

  const priorityToggle = async (
    taskId: string,
    subtaskId: string,
    priority: number,
  ) => {
    setLoading(true);
    const res = await togglePriority(
      subtaskId,
      projectId,
      priority === 0 ? 1 : 0,
    );
    if (res.success) {
      const updatedSubtask = res.updatedSubtask as unknown as SubtaskType;
      setParentTasks((prevTasks) =>
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

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={sortedTasks.map((t) => t.id)}
        strategy={rectSortingStrategy}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {sortedTasks.map((task) => (
            <SortableTaskCard
              key={task.id}
              task={task}
              role={role}
              editMode={editMode}
              projectId={projectId}
              loading={loading}
              priorityToggle={priorityToggle}
              setTasks={setParentTasks}
              users={users}
            />
          ))}
        </div>
      </SortableContext>
      <DragOverlay adjustScale={true} dropAnimation={null}>
        {activeId ? (
          <TaskCard
            task={sortedTasks.find((t) => t.id === activeId)!}
            role={role}
            editMode={editMode}
            projectId={projectId}
            loading={loading}
            priorityToggle={priorityToggle}
            setTasks={setParentTasks}
            isDragging={true}
            users={users}
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

const SortableTaskCard = (props: {
  task: TaskType;
  role: "admin" | "member";
  editMode: boolean;
  projectId: string;
  loading: boolean;
  priorityToggle: (
    taskId: string,
    subtaskId: string,
    priority: number,
  ) => Promise<void>;
  setTasks: React.Dispatch<React.SetStateAction<TaskType[]>>;
  users: User[];
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: props.task.id,
    disabled: !props.editMode,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition || undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "cursor-grab active:cursor-grabbing",
        isDragging && "opacity-50",
      )}
    >
      <TaskCard {...props} isDragging={isDragging} users={props.users} />
    </div>
  );
};

const TaskCard = ({
  task,
  role,
  editMode,
  projectId,
  loading,
  priorityToggle,
  setTasks,
  isDragging,
  users,
}: {
  task: TaskType;
  role: "admin" | "member";
  editMode: boolean;
  projectId: string;
  loading: boolean;
  priorityToggle: (
    taskId: string,
    subtaskId: string,
    priority: number,
  ) => Promise<void>;
  setTasks: React.Dispatch<React.SetStateAction<TaskType[]>>;
  isDragging?: boolean;
  users: User[];
}) => {
  const router = useRouter();

  return (
    <div
      className={cn(
        "mb-6 p-4 rounded hover:bg-gray-50 border border-gray-200 relative",
        isDragging && "border-blue-500 shadow-lg",
      )}
    >
      <div className="flex justify-between items-start gap-4">
        <h3 className="text-lg font-bold cursor-pointer flex-1">{task.name}</h3>

        {role === "admin" && editMode && (
          <AddSubtask
            setTasks={setTasks}
            taskId={task.id}
            projectId={projectId}
            showText={false}
            showAi={!task.hasAISuggestions}
            users={users}
          />
        )}
      </div>

      <ul className="list-none space-y-2 mt-4">
        {task.subtasks.map((subtask) => (
          <li
            key={subtask.id}
            className={`p-2 rounded shadow-md flex justify-between items-center ${subtask.status === "done"
              ? "bg-green-200 text-green-700 hover:bg-green-300"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
          >
            <span
              className="cursor-pointer"
              onClick={() => router.push(`/project/subtask/${subtask.id}`)}
            >
              {subtask.name}
            </span>
            <div className="space-x-2">
              {(subtask.issueCount || 0) > 0 && (
                <span className="text-xs text-white bg-red-500 px-1 py-0.5 inline-flex items-center rounded-full aspect-square">
                  {subtask.issueCount}
                </span>
              )}
              {role === "admin" && (
                <button
                  onClick={() =>
                    priorityToggle(task.id, subtask.id, subtask.priority)
                  }
                  className={`text-sm rounded ${subtask.priority
                    ? "text-yellow-500 hover:text-yellow-600"
                    : "text-gray-500 hover:text-gray-600"
                    }`}
                  disabled={loading}
                >
                  {subtask.priority ? "⭐" : "☆"}
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};
