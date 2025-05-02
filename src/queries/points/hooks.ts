import { useQuery } from "@tanstack/react-query";
import { getPoints } from "./action";

export const useGetPoints = (userId?: string) => {
  return useQuery({
    queryKey: ["points", userId],
    queryFn: async () => {
      const res = await getPoints(userId);
      if (res.success) {
        const points = res.points;
        const user = res.user;
        return {
          points,
          user,
        };
      } else {
        return {};
      }
    },
  });
};
