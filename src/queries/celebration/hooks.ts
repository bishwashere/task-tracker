import { useQuery } from "@tanstack/react-query";
import { getCelebrationStats } from "./action";

export const useCelebrationStats = (organizationId: string) => {
  return useQuery({
    queryKey: ["celebration-stats", organizationId],
    queryFn: async () => {
      const res = await getCelebrationStats(organizationId);
      if (res.success) {
        return {
          subtasks14d: res.subtasks14d ?? 0,
          subtasks3d: res.subtasks3d ?? 0,
          userId: res.userId ?? "",
        };
      }
      return { subtasks14d: 0, subtasks3d: 0, userId: "" };
    },
    enabled: !!organizationId,
    staleTime: 5 * 60 * 1000,
  });
};
