import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addProject,
  AddProjectProps,
  listAllUserProjectByOrganizationId,
  sortProjects,
} from "./action";
import toast from "react-hot-toast";

export const useAddProject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (props: AddProjectProps) => {
      const res = await addProject(props);
      if (res.success) {
        await queryClient.invalidateQueries({
          queryKey: ["projects", props.organizationId],
        });
        return res.message;
      } else {
        throw new Error(res.message);
      }
    },
    onSuccess: (msg) => {
      toast.success(msg);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};

export const useListUserProjectByOrganizationId = (organizationId: string) => {
  return useQuery({
    queryKey: ["projects", organizationId],
    queryFn: async () => {
      const res = await listAllUserProjectByOrganizationId(organizationId);
      if (res.success) {
        return res.projects;
      } else {
        return [];
      }
    },
  });
};

export const useSortProjects = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { projectId: string; sortIndex: number }[]) => {
      const res = await sortProjects(data);
      if (res.success) {
        await queryClient.invalidateQueries({
          queryKey: ["projects"],
        });
        return res.message;
      } else {
        throw new Error(res.message);
      }
    },
  });
};
