import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  deleteAISuggestedTask,
  deleteTask,
  editTask,
  EditTaskProps,
  getAISuggestedTasksByProjectId,
  saveTask,
  SaveTaskProps,
} from "./actions";
import { Project, Task } from "@prisma/client";

export const useGetAISuggestedTasks = (projectId: string) => {
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: ["ai-suggested-tasks", projectId],
    queryFn: async () => {
      const res = await getAISuggestedTasksByProjectId(projectId);
      if (res.success) {
        await queryClient.invalidateQueries({
          queryKey: ["project", projectId],
        });

        return res.tasks || [];
      } else {
        return [];
      }
    },
  });
};

export const useDeleteAiSuggestedTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (taskId: string) => {
      const res = await deleteAISuggestedTask(taskId);
      if (res.success) {
        await queryClient.invalidateQueries({
          queryKey: ["ai-suggested-tasks"],
        });
        return res.message;
      } else {
        throw new Error(res.message);
      }
    },
  });
};

export const useSaveTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (props: SaveTaskProps) => {
      const res = await saveTask(props);
      if (res.success) {
        await queryClient.setQueryData(
          ["project", props.projectId],
          (
            oldData:
              | (Project & {
                  tasks: Task[];
                })
              | undefined
          ) => {
            if (!oldData) return oldData;
            return {
              ...oldData,
              tasks: [res.task, ...oldData.tasks],
            };
          }
        );
        await queryClient.invalidateQueries({ queryKey: ["sprint", props.projectId] });
        await queryClient.invalidateQueries({ queryKey: ["sprints", props.projectId] });
        return res.message;
      } else {
        throw new Error(res.message);
      }
    },
  });
};

export const useEditTask = () => {
  const queryClient = useQueryClient();
  let old: Project;
  return useMutation({
    mutationFn: async (props: EditTaskProps) => {
      queryClient.setQueryData(
        ["project", props.projectId],
        (
          oldData:
            | (Project & {
                tasks: Task[];
              })
            | undefined
        ) => {
          if (!oldData) return oldData;
          old = oldData;
          return {
            ...oldData,
            tasks: oldData.tasks.map((task) => {
              if (task.id === props.taskId) {
                return {
                  ...task,
                  name: props.taskTitle,
                  description: props.taskDescription,
                };
              }
              return task;
            }),
          };
        }
      );

      const res = await editTask(props);
      if (res.success) {
        return res.message;
      } else {
        throw new Error(res.message);
      }
    },
    onError: () => {
      queryClient.setQueryData(
        ["project", old.id],
        (
          oldData:
            | (Project & {
                tasks: Task[];
              })
            | undefined
        ) => {
          if (!oldData) return oldData;
          return old;
        }
      );
    },
  });
};

export const useDeleteTask = () => {
  const queryClient = useQueryClient();

  let old: Project;

  return useMutation({
    mutationFn: async ({
      taskId,
      projectId,
    }: {
      taskId: string;
      projectId: string;
    }) => {
      queryClient.setQueryData(
        ["project", projectId],
        (
          oldData:
            | (Project & {
                tasks: Task[];
              })
            | undefined
        ) => {
          if (!oldData) return oldData;
          old = oldData;
          return {
            ...oldData,
            tasks: oldData.tasks.filter((task) => task.id !== taskId),
          };
        }
      );

      const res = await deleteTask(taskId);
      if (res.success) {
        return res.message;
      } else {
        throw new Error(res.message);
      }
    },
    onError: () => {
      queryClient.setQueryData(
        ["project", old.id],
        (
          oldData:
            | (Project & {
                tasks: Task[];
              })
            | undefined
        ) => {
          if (!oldData) return oldData;
          return old;
        }
      );
    },
  });
};
