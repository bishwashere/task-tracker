import { useQuery } from "@tanstack/react-query";
import { getPoints } from "./action";

export const useGetPoints = (
  userId?: string,
  options?: { enabled?: boolean },
) => {
  return useQuery({
    queryKey: ["points", userId],
    enabled: options?.enabled ?? true,
    queryFn: async () => {
      const res = await getPoints(userId);
      if (res.success) {
        const points = res.points;
        const user = res.user;
        return {
          points,
          user,
          projectSlugs: res.projectSlugs ?? {},
        };
      } else {
        return {};
      }
    },
  });
};
