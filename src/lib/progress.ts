import { TaskType } from "@/types/organization";
import { Subtask, Task } from "@prisma/client";

export function calculateProgressWithStats(
  tasks: Array<
    Task & {
      subtasks: Subtask[];
    }
  >,
) {
  const totalSubtasks = tasks?.reduce(
    (sum, task) => sum + task.subtasks?.length,
    0,
  );
  const completedSubtasks = tasks?.reduce(
    (sum, task) =>
      sum +
      task.subtasks?.filter((subtask) => subtask.status === "done").length,
    0,
  );
  const pendingSubtasks = totalSubtasks - completedSubtasks;

  // const totalPoints = tasks?.reduce(
  //   (sum, task) =>
  //     sum + task.subtasks?.reduce((subSum, subtask) => subSum + subtask.points, 0),
  //   0
  // );
  // const completedPoints = tasks?.reduce(
  //   (sum, task) =>
  //     sum +
  //     task.subtasks
  //       .filter((subtask) => subtask.status === 'done')
  //       .reduce((subSum, subtask) => subSum + subtask.points, 0),
  //   0
  // );
  // const pendingPoints = totalPoints - completedPoints;

  const assignedSubtasks = tasks?.reduce(
    (sum, task) =>
      sum + task.subtasks?.filter((subtask) => subtask.assignedUserId).length,
    0,
  );
  const unassignedSubtasks = totalSubtasks - assignedSubtasks;

  return {
    progress:
      totalSubtasks === 0
        ? 0
        : Math.round((completedSubtasks / totalSubtasks) * 100),
    totalSubtasks,
    completedSubtasks,
    pendingSubtasks,
    // totalPoints,
    // completedPoints,
    // pendingPoints,
    assignedSubtasks,
    unassignedSubtasks,
  };
}
