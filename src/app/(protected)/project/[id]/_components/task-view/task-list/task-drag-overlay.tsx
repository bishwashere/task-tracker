import { Task } from "@prisma/client";
import { useTaskListContext } from "./context";
import { SubTaskContent } from "./subtask-view/subtask-content";

const TaskDragOverlay = () => {
  const { activeDragging, tasks } = useTaskListContext()
  if (!activeDragging?.id) return null;
  if (activeDragging?.type === "task") {
    return (
      <TaskItem
        task={tasks.find((t) => t.id === activeDragging.id)!}
        index={tasks.findIndex((t) => t.id === activeDragging.id)}
        isDragging={true}
      />
    );
  }

  // Look for subtask
  for (const task of tasks) {
    const subtask = task.subtasks.find((s) => s.id === activeDragging.id);
    if (subtask) {
      return (
        <SubTaskContent
          //@ts-expect-error: ....
          subtask={subtask}
          isNew={() => false}
          taskId={task.id}
          isDragging={true}

        />
      );
    }
  }

  return null;
};

type TaskItemProps = {
  task: Task;
  index: number;
  isDragging: boolean;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, index, isDragging }) => {
  return (
    <div className="flex items-start gap-1">
      <span className="text-lg font-bold text-gray-500">{index + 1}.</span>
      <div
        className={`mb-4 p-3 rounded-lg border border-border bg-white shadow-md relative flex-1 ${isDragging ? "ring-2 ring-blue-400/40 border-blue-300" : ""}`}
      >
        <div className="flex flex-row items-center gap-1">
          <h3 className="text-xl font-bold mb-2">{task?.name}</h3>
        </div>
      </div>
    </div>
  );
};

export default TaskDragOverlay