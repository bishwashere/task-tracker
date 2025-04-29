import React, { useEffect, useState } from "react";
import { SubTaskView, SubTaskContent } from "@/components/project/SubTaskView";
import { TaskType, SubtaskType } from "@/types/organization";
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
import { sortSubtasks } from "@/actions/subtask";
import DeleteTask from "./DeleteTask";
import { cn } from "@/lib/cn";

interface DragOverlayContentProps {
  activeId: string;
  tasks: TaskType[];
}

const DragOverlayContent: React.FC<DragOverlayContentProps> = ({ activeId, tasks }) => {
  // Find if it's a task or subtask
  const task = tasks.find(t => t.id === activeId);
  if (task) {
    return (
      <TaskItem
        task={task}
        index={tasks.findIndex(t => t.id === activeId)}
        isDragging={true}
      />
    );
  }

  // Look for subtask
  for (const task of tasks) {
    const subtask = task.subtasks.find(s => s.id === activeId);
    if (subtask) {
      return (
        <SubTaskContent
          subtask={subtask}
          taskId={task.id}
          isDragging={true}
          projectId={task.projectId}
          role="member"
          users={[]}
          setTasks={() => { }}
          editMode={false}
          setPointsEarned={() => { }}
          //@ts-expect-error:...........
          session={null}
          isNewTask={() => false}
        />
      );
    }
  }

  return null;
};

interface TaskItemProps {
  task: TaskType;
  index: number;
  isDragging: boolean;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, index, isDragging }) => {
  return (
    <div className="flex items-start gap-1">
      <span className="text-lg font-bold text-gray-500">{index + 1}.</span>
      <div className={`mb-6 p-2 rounded hover:bg-gray-50 border border-gray-200 relative flex-1 ${isDragging ? 'border-blue-500 shadow-lg' : ''}`}>
        <div className="flex flex-row items-center gap-1">
          <h3 className="text-xl font-bold mb-2">{task?.name}</h3>
        </div>
      </div>
    </div>
  );
};

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

  const [activeType, setActiveType] = useState<'task' | 'subtask' | null>(null);
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
    const isSubtask = event.active.data.current?.isSubtask;
    setActiveId(event.active.id as string);
    setActiveType(isSubtask ? 'subtask' : 'task');
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const isSubtask = active.data.current?.isSubtask;
    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    if (isSubtask) {
      // Handle subtask reordering
      const task = tasks.find(t =>
        t.subtasks.some(s => s.id === activeId)
      );
      if (!task) return;

      const oldIndex = task.subtasks.findIndex(s => s.id === activeId);
      const newIndex = task.subtasks.findIndex(s => s.id === overId);

      const updatedSubtasks = arrayMove(task.subtasks, oldIndex, newIndex).map(
        (subtask, index) => ({
          ...subtask,
          subtaskSortIndex: [{ sortIndex: task.subtasks.length - 1 - index }] as [
            { sortIndex: number }
          ],
        })
      );

      // Update tasks state with new subtask order
      const updatedTasks = tasks.map(t =>
        t.id === task.id
          ? { ...t, subtasks: updatedSubtasks }
          : t
      );

      // Save previous state for rollback
      const prevTasks = tasks;
      setTasks(updatedTasks);
      setParentTasks(updatedTasks);

      // Prepare sort data for backend
      const sortData = updatedSubtasks.map(subtask => ({
        subtaskId: subtask.id,
        sortIndex: subtask.subtaskSortIndex[0].sortIndex
      }));

      try {
        const res = await sortSubtasks(sortData);
        if (!res.success) {
          toast.error(res.message || "An error occurred");
          setTasks(prevTasks);
          setParentTasks(prevTasks);
        }
      } catch {
        toast.error("An error occurred");
        setTasks(prevTasks);
        setParentTasks(prevTasks);
      }
    } else {
      // Handle task reordering (your existing task reordering logic)
      const oldIndex = initialTasks.findIndex(task => task.id === activeId);
      const newIndex = initialTasks.findIndex(task => task.id === overId);

      const updatedTasks = arrayMove(initialTasks, oldIndex, newIndex).map(
        (task, index) => ({
          ...task,
          taskSortIndex: [{ sortIndex: initialTasks.length - 1 - index }] as [
            { sortIndex: number }
          ],
        })
      );

      setTasks(updatedTasks);
      setParentTasks(updatedTasks);

      const sortData = updatedTasks.map(task => ({
        taskId: task.id,
        sortIndex: task.taskSortIndex[0].sortIndex
      }));

      try {
        const res = await sortTasks(sortData);
        if (!res.success) {
          toast.error(res.message || "An error occurred");
          setTasks(tasks);
          setParentTasks(tasks);
        }
      } catch {
        toast.error("An error occurred");
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
      id: task?.id,
      data: {
        type: 'task',
        isSubtask: false
      },
      disabled: editMode   // Disable when not in edit mode
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
        className={cn(
          "flex items-start gap-1 transition-all duration-200",
          !editMode ? "cursor-grab active:cursor-grabbing" : "cursor-default",
        )}
      >
        <span className="text-lg font-bold text-gray-500">{index + 1}.</span>
        <div className="mb-6 p-2 rounded hover:bg-gray-50 border border-gray-200 relative flex-1">
          {role === "admin" && editMode && (
            <AddSubtask
              setTasks={setParentTasks}
              taskId={task?.id}
              projectId={projectId}
              showAi={!task?.hasAISuggestions}
              users={users}
            />
          )}
          <div className="flex flex-row items-center gap-1">
            <h3 className="text-xl font-bold mb-2">{task?.name}</h3>
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
              {role === "admin" && editMode && (
                <EditTaskPopup
                  task={task}
                  projectId={projectId}
                  setTasks={setParentTasks}
                />
              )}
              {role === "admin" && editMode && (
                <DeleteTask taskId={task?.id}
                  onSuccess={() => {
                    setParentTasks((prevTasks) =>
                      prevTasks.filter((t) => t.id !== task?.id)
                    );
                  }} />
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 gap-2">
            {task?.subtasks.
              // sort by sortIndex
              sort(
                (a, b) =>
                  (b?.subtaskSortIndex?.[0]?.sortIndex || 0) -
                  (a?.subtaskSortIndex?.[0]?.sortIndex || 0)
              ).
              map((subtask) => (
                <SubTaskView
                  key={subtask?.id}
                  subtask={subtask}
                  taskId={task?.id}
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
      id="task-dnd-context"
    >
      <SortableContext
        items={[
          ...tasks.map(t => t.id),
          ...tasks.flatMap(t => t.subtasks.map(s => s.id))
        ]}
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
              <SortableTaskItem key={task?.id} task={task} index={index} />
            ))}
        </div>
      </SortableContext>
      <DragOverlay>
        {activeId && (
          <DragOverlayContent
            activeId={activeId}
            tasks={tasks}
          />
        )}
      </DragOverlay>
    </DndContext>
  );
};


