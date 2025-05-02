import { Task } from "@prisma/client";
import { useTaskListContext } from "./context";

const TaskDragOverlay = () => {
  const { activeDragging, tasks } = useTaskListContext()
  if (activeDragging?.type === "task") {
    return (
      <TaskItem
        task={tasks.find((t) => t.id === activeDragging.id)!}
        index={tasks.findIndex((t) => t.id === activeDragging.id)}
        isDragging={true}
      />
    );
  }

  // // Look for subtask
  // for (const task of tasks) {
  //   const subtask = task.subtasks.find((s) => s.id === activeId);
  //   if (subtask) {
  //     return (
  //       <SubTaskContent
  //         subtask={subtask}
  //         taskId={task.id}
  //         isDragging={true}
  //         projectId={task.projectId}
  //         role="member"
  //         users={[]}
  //         setTasks={() => { }}
  //         editMode={false}
  //         setPointsEarned={() => { }}
  //         //@ts-expect-error:...........
  //         session={null}
  //         isNewTask={() => false}
  //       />
  //     );
  //   }
  // }

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
        className={`mb-6 p-2 rounded hover:bg-gray-50 border border-gray-200 relative flex-1 ${isDragging ? "border-blue-500 shadow-lg" : ""}`}
      >
        <div className="flex flex-row items-center gap-1">
          <h3 className="text-xl font-bold mb-2">{task?.name}</h3>
        </div>
      </div>
    </div>
  );
};

export default TaskDragOverlay