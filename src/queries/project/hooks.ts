import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import {
  addProject,
  AddProjectProps,
  getProjectById,
  listAllUserProjectByOrganizationId,
  sortProjects,
} from "./action";
import { projectQueryKey, staticPageQueryOptions } from "@/lib/query-cache";
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
  return useMutation({
    mutationFn: async (data: { projectId: string; sortIndex: number }[]) => {
      const res = await sortProjects(data);
      if (res.success) {
        return res.message;
      } else {
        throw new Error(res.message);
      }
    },
  });
};

export const useGetProjectById = (slugOrId: string) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: projectQueryKey(slugOrId),
    queryFn: async () => {
      const res = await getProjectById(slugOrId, { skipCleanup: true });
      if (res.success) {
        return res;
      } else {
        return null;
      }
    },
    enabled: !!slugOrId,
    ...staticPageQueryOptions,
  });

  useEffect(() => {
    const projectId = query.data?.project?.id;
    if (projectId && projectId !== slugOrId) {
      queryClient.setQueryData(projectQueryKey(projectId), query.data);
    }
  }, [query.data, slugOrId, queryClient]);

  return query;
};
