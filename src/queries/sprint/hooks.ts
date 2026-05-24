import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getActiveSprint, startSprint, StartSprintInput, toggleSprintTask } from "./action";
import toast from "react-hot-toast";

export const useGetActiveSprint = (projectId: string) => {
  return useQuery({
    queryKey: ["sprint", projectId],
    queryFn: async () => {
      const res = await getActiveSprint(projectId);
      if (res.success) {
        return {
          sprint: res.sprint,
          nextWeekNumber: res.nextWeekNumber ?? 1,
        };
      }
      throw new Error(res.message || "Failed to load sprint");
    },
    enabled: !!projectId,
  });
};

export const useStartSprint = (projectId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: Omit<StartSprintInput, "projectId">) => {
      const res = await startSprint({ ...input, projectId });
      if (res.success) {
        return res.message;
      }
      throw new Error(res.message);
    },
    onSuccess: (msg) => {
      toast.success(msg);
      queryClient.invalidateQueries({ queryKey: ["sprint", projectId] });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};

export const useToggleSprintTask = (projectId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (taskId: string) => {
      const res = await toggleSprintTask(projectId, taskId);
      if (res.success) {
        return res.sprint;
      }
      throw new Error(res.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sprint", projectId] });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};
