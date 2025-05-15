import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addUserToOrganization,
  AddUserToOrganizationProps,
  createOrganization,
  CreateOrganizationProps,
  listAllUsersOrganizations,
  updateOrganizationName,
  UpdateOrganizationNameProps,
} from "./action";
import toast from "react-hot-toast";
import { Org } from "@/context/dashboard-context";

export const useCreateOrganization = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (props: CreateOrganizationProps) => {
      const res = await createOrganization(props);
      if (res.success) {
        await queryClient.invalidateQueries({
          queryKey: ["organizations"],
        });
        return {message: res.message, ...res.data};
      } else {
        throw new Error(res.message);
      }
    },
    onSuccess: (data) => {
      toast.success(data.message);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};

export const useListUserOrganizations = () => {
  return useQuery({
    queryKey: ["organizations"],
    queryFn: async () => {
      const res = await listAllUsersOrganizations();
      if (res.success) {
        return res.data;
      } else {
        return [];
      }
    },
  });
};

export const useUpdateOrganizationName = () => {
  const queryClient = useQueryClient();

  // use Optimistic UI Update
  let oldData: UpdateOrganizationNameProps;

  return useMutation({
    mutationFn: async (props: UpdateOrganizationNameProps) => {
      oldData = props;

      queryClient.setQueryData(
        ["organizations"],
        (oldData: Org[] | undefined) => {
          return oldData?.map((org) => {
            if (org.organization.id === props.organizationId) {
              return {
                ...org,
                organization: { ...org.organization, name: props.newName },
              };
            }
            return org;
          });
        },
      );

      const res = await updateOrganizationName(props);

      if (res.success) {
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
      // rollback
      queryClient.setQueryData(
        ["organizations"],
        (prevData: Org[] | undefined) => {
          return prevData?.map((org) => {
            if (org.id === oldData.organizationId) {
              return { ...org, name: oldData.newName };
            }
            return org;
          });
        },
      );
    },
  });
};

export const useAddUserToOrganization = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (props: AddUserToOrganizationProps) => {
      const res = await addUserToOrganization(props);
      if (res.success) {
        await queryClient.invalidateQueries({
          queryKey: ["organizations"],
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
