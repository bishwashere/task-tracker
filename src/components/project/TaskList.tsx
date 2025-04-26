import React, { useEffect, useState } from "react";
import { SubTaskView } from "@/components/project/SubTaskView";
import { TaskType } from "@/types/organization";
import { User } from "@/types/user";
import AddSubtask from "./AddSubtaskPopup";
import { Session } from "next-auth";
import EditTaskPopup from "./EditTaskPopup";
import { differenceInDays } from "date-fns";
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
import { sortTasks } from "@/actions/task";
import toast from "react-hot-toast";

export const TaskList = ({
  tasks: initialTasks,
  users,
  role,
  projectId,
  setTasks: setParentTasks,
  editMode,
  setPointsEarned,
  session,
  originalTasks,
}: {
  tasks: TaskType[];
  users: User[];
  role: "admin" | "member";
  projectId: string;
  setTasks: React.Dispatch<React.SetStateAction<TaskType[]>>;
  editMode: boolean;
  setPointsEarned: React.Dispatch<React.SetStateAction<number>>;
  session: Session;
  originalTasks: TaskType[];
}) => {


  const [tasks, setTasks] = useState(initialTasks);
  const [activeId, setActiveId] = useState<string | null>(null);

  const isNewTask = (createdAt: string | Date) => {
    const now = new Date();
    const taskDate = new Date(createdAt);
    if (isNaN(taskDate.getTime())) {
      console.error("Invalid createdAt date for task:", createdAt);
      return false;
    }
    const diffDays = differenceInDays(now, taskDate);
    return diffDays <= 0;
  };

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
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (over && active.id !== over.id) {
      const oldIndex = originalTasks.findIndex((task) => task.id === active.id);
      const newIndex = originalTasks.findIndex((task) => task.id === over.id);

      // Immediately update the local state first
      const updatedTasks = arrayMove(originalTasks, oldIndex, newIndex).map(
        (task, index) => ({
          ...task,
          taskSortIndex: [{ sortIndex: originalTasks.length - 1 - index }] as [
            { sortIndex: number }
          ],
        })
      );

      // Update both local and parent state immediately
      setTasks(updatedTasks);
      setParentTasks(updatedTasks);

      // Then handle the backend update
      const sortData = updatedTasks.map((task) => ({
        taskId: task.id,
        sortIndex: task?.taskSortIndex?.[0]?.sortIndex || 0,
      }));

      try {
        const res = await sortTasks(sortData);
        if (!res.success) {
          toast.error(res.message || "An error occurred");
          // If error, revert both states
          setTasks(tasks);
          setParentTasks(tasks);
        }
      } catch {
        toast.error("An error occurred");
        // If error, revert both states
        setTasks(tasks);
        setParentTasks(tasks);
      }
    }
  };

  const SortableTaskItem = ({ task, index }: { task: TaskType; index: number }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({
      id: task.id,
      transition: {
        duration: 200,
        easing: "ease"
      }
    });

    const style = {
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
        className="flex items-start gap-1 cursor-grab active:cursor-grabbing transition-all duration-200"
      >
        <span className="text-lg font-bold text-gray-500">{index + 1}.</span>
        <div className="mb-6 p-2 rounded hover:bg-gray-50 border border-gray-200 relative flex-1">
          {role === "admin" && editMode && (
            <AddSubtask
              setTasks={setParentTasks}
              taskId={task.id}
              projectId={projectId}
              showAi={!task.hasAISuggestions}
            />
          )}
          <div className="flex flex-row items-center gap-1">
            <h3 className="text-xl font-bold mb-2">{task.name}</h3>
            {task.createdAt && (
              <span className="text-xs text-white bg-transparent px-1 py-0.5 rounded inline-flex items-center">
                {isNewTask(task.createdAt) ? (
                  <span className="w-2.5 h-2.5 bg-green-500 rounded-full mr-1"></span>
                ) : (
                  ""
                )}
              </span>
            )}
            {role === "admin" && editMode && (
              <EditTaskPopup
                task={task}
                projectId={projectId}
                setTasks={setParentTasks}
              />
            )}
          </div>
          <div className="grid grid-cols-1 gap-2">
            {task.subtasks.map((subtask) => (
              <SubTaskView
                key={subtask.id}
                subtask={subtask}
                taskId={task.id}
                role={role}
                users={users}
                projectId={projectId}
                setTasks={setParentTasks}
                editMode={editMode}
                setPointsEarned={setPointsEarned}
                session={session}
                isNewTask={isNewTask}
              />
            ))}
          </div>
        </div>
      </div>
    );
  };

  useEffect(() => {
    setTasks(initialTasks);
  }, [initialTasks]);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={tasks.map((t) => t.id)}
        strategy={verticalListSortingStrategy}
      >
        <div>
          {tasks
            .sort(
              (a, b) =>
                (b?.taskSortIndex?.[0]?.sortIndex || 0) -
                (a?.taskSortIndex?.[0]?.sortIndex || 0)
            )
            .map((task, index) => (
              <SortableTaskItem key={task.id} task={task} index={index} />
            ))}
        </div>
      </SortableContext>
      <DragOverlay>
        {activeId ? (
          <TaskItem
            task={tasks.find((t) => t.id === activeId)!}
            index={tasks.findIndex((t) => t.id === activeId)}
            isDragging={true}
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

// Separate non-draggable component for the overlay
const TaskItem = ({ task, index, isDragging }: { task: TaskType; index: number; isDragging: boolean }) => {
  return (
    <div className="flex items-start gap-1">
      <span className="text-lg font-bold text-gray-500">{index + 1}.</span>
      <div className={`mb-6 p-2 rounded hover:bg-gray-50 border border-gray-200 relative flex-1 ${isDragging ? 'border-blue-500 shadow-lg' : ''}`}>
        <div className="flex flex-row items-center gap-1">
          <h3 className="text-xl font-bold mb-2">{task.name}</h3>
        </div>
      </div>
    </div>
  );
};



