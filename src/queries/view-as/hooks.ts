import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getViewAsState, setViewAsUser } from "./action";

export function viewAsQueryKey(organizationId: string) {
  return ["view-as", organizationId] as const;
}

export function useViewAsState(organizationId: string) {
  return useQuery({
    queryKey: viewAsQueryKey(organizationId),
    queryFn: async () => {
      const res = await getViewAsState(organizationId);
      if (res.success) {
        return res.state;
      }
      return { isViewingAs: false, viewingAsUser: null, role: "member" as const };
    },
    enabled: !!organizationId,
  });
}

export function useSetViewAsUser(organizationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string | null) => {
      const res = await setViewAsUser(organizationId, userId);
      if (res.success) {
        return res.message;
      }
      throw new Error(res.message);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries();
    },
  });
}
