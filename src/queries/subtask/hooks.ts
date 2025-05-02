import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  deleteSubtask,
  editSubTask,
  EditSubTaskProps,
  saveSubTask,
  SaveSubtaskProps,
  saveSubTaskTag,
  SaveSubtaskTagProps,
  toggleSubtaskPriority,
  ToggleSubtaskPriorityProps,
  updateSubtaskStatus,
  UpdateSubtaskStatusProps,
} from "./action";
import { Project, Subtask, Task } from "@prisma/client";

export const useSaveSubtask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (props: SaveSubtaskProps) => {
      const res = await saveSubTask(props);
      if (res.success) {
        await queryClient.setQueryData(
          ["project", props.projectId],
          (
            oldData:
              | (Project & {
                  tasks: Array<
                    Task & {
                      subtasks: Subtask[];
                    }
                  >;
                })
              | undefined
          ) => {
            if (!oldData) return oldData;
            return {
              ...oldData,
              tasks: oldData.tasks.map((task) => {
                if (task.id === props.taskId) {
                  return {
                    ...task,
                    subtasks: [res.subTask, ...task.subtasks],
                  };
                }
                return task;
              }),
            };
          }
        );

        return res.message;
      } else {
        throw new Error(res.message);
      }
    },
  });
};

export const useDeleteSubtask = () => {
  const queryClient = useQueryClient();
  let old: any;
  return useMutation({
    mutationFn: async ({
      projectId,
      subtaskId,
      taskId,
    }: {
      subtaskId: string;
      taskId: string;
      projectId: string;
    }) => {
      queryClient.setQueryData(
        ["project", projectId],
        (
          oldData:
            | (Project & {
                tasks: Array<
                  Task & {
                    subtasks: Subtask[];
                  }
                >;
              })
            | undefined
        ) => {
          old = oldData;
          return {
            ...oldData,
            tasks: oldData?.tasks.map((task) => {
              if (task.id === taskId) {
                return {
                  ...task,
                  subtasks: task.subtasks.filter(
                    (subtask) => subtask.id !== subtaskId
                  ),
                };
              }
              return task;
            }),
          };
        }
      );

      const res = await deleteSubtask(subtaskId);

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
                tasks: Array<
                  Task & {
                    subtasks: Subtask[];
                  }
                >;
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

export const useEditSubtask = () => {
  const queryClient = useQueryClient();
  let old: any;
  return useMutation({
    mutationFn: async (props: EditSubTaskProps) => {
      queryClient.setQueryData(
        ["project", props.projectId],
        (
          oldData:
            | (Project & {
                tasks: Array<
                  Task & {
                    subtasks: Subtask[];
                  }
                >;
              })
            | undefined
        ) => {
          old = oldData;
          return {
            ...oldData,
            tasks: oldData?.tasks.map((task) => {
              if (task.id === props.taskId) {
                return {
                  ...task,
                  subtasks: task.subtasks.map((subtask) => {
                    if (subtask.id === props.subTaskId) {
                      return {
                        ...subtask,
                        name: props.subTaskName,
                        dueDate: props.dueDate,
                        points: props.points,
                        assignedUserId: props.assignedUserId,
                      };
                    }
                    return subtask;
                  }),
                };
              }
              return task;
            }),
          };
        }
      );

      const res = await editSubTask(props);
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
                tasks: Array<
                  Task & {
                    subtasks: Subtask[];
                  }
                >;
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

export const useToggleSubtaskPriority = () => {
  const queryClient = useQueryClient();

  let old: any;

  return useMutation({
    mutationFn: async ({
      taskId,
      ...props
    }: ToggleSubtaskPriorityProps & {
      taskId: string;
    }) => {
      queryClient.setQueryData(
        ["project", props.projectId],
        (
          oldData:
            | (Project & {
                tasks: Array<
                  Task & {
                    subtasks: Subtask[];
                  }
                >;
              })
            | undefined
        ) => {
          old = oldData;
          return {
            ...oldData,
            tasks: oldData?.tasks.map((task) => {
              if (task.id === taskId) {
                return {
                  ...task,
                  subtasks: task.subtasks.map((subtask) => {
                    if (subtask.id === props.subtaskId) {
                      return {
                        ...subtask,
                        priority: props.priority,
                      };
                    }
                    return subtask;
                  }),
                };
              }
              return task;
            }),
          };
        }
      );

      const res = await toggleSubtaskPriority(props);
      if (res.success) {
        await queryClient.invalidateQueries({
          queryKey: ["project", props.projectId],
        });
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
                tasks: Array<
                  Task & {
                    subtasks: Subtask[];
                  }
                >;
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

export const useUpdateSubtaskStatus = () => {
  const queryClient = useQueryClient();

  let old: any;

  return useMutation({
    mutationFn: async (
      props: UpdateSubtaskStatusProps & {
        projectId: string;
        taskId: string;
      }
    ) => {
      queryClient.setQueryData(
        ["project", props.projectId],
        (
          oldData:
            | (Project & {
                tasks: Array<
                  Task & {
                    subtasks: Subtask[];
                  }
                >;
              })
            | undefined
        ) => {
          old = oldData;
          return {
            ...oldData,
            tasks: oldData?.tasks.map((task) => {
              if (task.id === props.taskId) {
                return {
                  ...task,
                  subtasks: task.subtasks.map((subtask) => {
                    if (subtask.id === props.subtaskId) {
                      return {
                        ...subtask,
                        status: props.status,
                      };
                    }
                    return subtask;
                  }),
                };
              }
              return task;
            }),
          };
        }
      );

      const res = await updateSubtaskStatus(props);

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
                tasks: Array<
                  Task & {
                    subtasks: Subtask[];
                  }
                >;
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

export const useSaveSubtaskTag = () => {
  const queryClient = useQueryClient();
  let old: any;
  return useMutation({
    mutationFn: async (props: SaveSubtaskTagProps & { taskId: string }) => {
      queryClient.setQueryData(
        ["project", props.projectId],
        (
          oldData:
            | (Project & {
                tasks: Array<
                  Task & {
                    subtasks: Subtask[];
                  }
                >;
              })
            | undefined
        ) => {
          old = oldData;
          return {
            ...oldData,
            tasks: oldData?.tasks.map((task) => {
              if (task.id === props.taskId) {
                return {
                  ...task,
                  subtasks: task.subtasks.map((subtask) => {
                    if (subtask.id === props.subtaskId) {
                      return {
                        ...subtask,
                        tagName: props.tagName,
                        tagColor: props.tagColor,
                      };
                    }
                    return subtask;
                  }),
                };
              }
              return task;
            }),
          };
        }
      );

      const res = await saveSubTaskTag(props);
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
                tasks: Array<
                  Task & {
                    subtasks: Subtask[];
                  }
                >;
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
