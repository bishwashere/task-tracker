import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import {
  useCreateOrganization,
  useListUserOrganizations,
} from "@/queries/organizations/hooks";
import { CreateOrganizationProps } from "@/queries/organizations/action";
import { useDashboardContext } from "@/context/dashboard-context";

const defaultFormData: CreateOrganizationProps = {
  name: "",
};

type Props = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
};

const AddOrganizationModal = ({ isOpen, onOpenChange }: Props) => {
  const org = useCreateOrganization();
  const [formData, setFormData] = useState<CreateOrganizationProps>(defaultFormData);
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Organization name is required");
      return;
    }
    try {
      await org.mutateAsync({ name: formData.name.trim() });
      onOpenChange(false);
      setFormData(defaultFormData);
    } catch {}
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="w-[100%] md:w-[80%] xl:w-[50%] px-10 py-10">
        <DialogHeader>
          <DialogTitle className="text-2xl">Add Organization</DialogTitle>
        </DialogHeader>
        {/* <hr className='border border-gray-300 my-6' /> */}
        <form onSubmit={onSubmit}>
          <input
            type="text"
            placeholder="Organization Name"
            name="organizationName"
            id="organizationName"
            className="w-[95%] md:w-[80%] p-2 mx-2 my-2 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-blue-300"
            required
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            value={formData.name}
          />
          {/* <hr className='border border-gray-300 my-6' /> */}
          <div className="flex mt-6 gap-2.5">
            <Button loading={org.isPending} type="submit" className="min-w-28">
              Save
            </Button>
            <Button
              type="reset"
              variant={"muted"}
              onClick={() => {
                onOpenChange(false);
                setFormData(defaultFormData);
              }}
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddOrganizationModal;
