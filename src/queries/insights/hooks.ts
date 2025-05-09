import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createInsights, CreateInsightsProps, getInsights, getInsightsFromSubredditsKeywords, GetInsightsFromSubredditsKeywordsProps, updateDesiredOutCome, UpdateDesiredOutComeProps } from "./action";
import { InsightsType } from "@/app/(protected)/project/[id]/_components/project-insights";
import toast from "react-hot-toast";

export const useGetInsights = (projectId: string) => {
  return useQuery({
    queryKey: ["Insights", projectId],
    queryFn: async () => {
      const res = await getInsights(projectId);
      if (res.success) {
        return res;
      } else {
        return null;
      }
    },
  });
};

export const useCreateInsights = (projectId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (props: CreateInsightsProps) => {
      const res = await createInsights(props);
      if (res.success) {
        await queryClient.invalidateQueries({
          queryKey: ["Insights", projectId],
        });
        return res.message;
      } else {
        throw new Error(res.message);
      }
    },
  });
};

export const useUpdateInsights = (projectId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (props: UpdateDesiredOutComeProps) => {
      const res = await updateDesiredOutCome(props);

      if (res.success) {
        await queryClient.invalidateQueries({
          queryKey: ["Insights", projectId],
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

export const useGetInsightsFromSubredditsKeywords = (projectId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (props: GetInsightsFromSubredditsKeywordsProps) => {
      const res = await getInsightsFromSubredditsKeywords(props);
      if (res.success) {
        await queryClient.invalidateQueries({
          queryKey: ["GetInsightsFromSubredditsKeywords", projectId],
        });
        return res.message;
      } else {
        throw new Error(res.message);
      }
    },
  });
};