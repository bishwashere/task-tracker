import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getGuidedInfo, setGuidedMode } from "./action";

export const useSetGuidedMode = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (props: boolean) => {
      const res = await setGuidedMode(props);
      if (res.success) {
        await queryClient.invalidateQueries({
          queryKey: ["guidedMode"],
        });
        return res.message;
      } else {
        throw new Error(res.message);
      }
    },
  });
};

export const useGetGuidedInfo = () => {
    return useQuery({
      queryKey: ["guidedMode"],
      queryFn: async () => {
        const res = await getGuidedInfo();
        if (res.success) {
          return res.guidedMode;
        } else {
          return true;
        }
      },
    });
  };