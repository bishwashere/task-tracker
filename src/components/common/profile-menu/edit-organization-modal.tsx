import React, { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  AddUserToOrganizationProps,
  UpdateOrganizationNameProps,
} from "@/queries/organizations/action";
import { useDashboardContext } from "@/context/dashboard-context";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  useAddUserToOrganization,
  useUpdateOrganizationName,
} from "@/queries/organizations/hooks";
import { useSetGuidedMode } from "@/queries/toggle-guided/hooks";

type Props = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
};

const EditOrganizationModal = ({ isOpen, onOpenChange }: Props) => {
  const { selectedOrg, guidedMode, setGuidedMode } = useDashboardContext();
  const oldName = useRef(selectedOrg?.organization?.name);
  const setGuidedModePromise = useSetGuidedMode();

  const [addUserToOrg, setAddUserToOrg] = useState<AddUserToOrganizationProps>({
    organizationId: selectedOrg?.organizationId as string,
    userEmail: "",
    role: "MEMBER",
  });
  const [editOrgFormData, setEditOrgFormData] =
    useState<UpdateOrganizationNameProps>({
      organizationId: selectedOrg?.organizationId as string,
      newName: selectedOrg?.organization?.name as string,
    });

  useEffect(() => {
    if (selectedOrg) {
      setEditOrgFormData({
        organizationId: selectedOrg?.organizationId as string,
        newName: selectedOrg?.organization?.name as string,
      });
    }
  }, [selectedOrg]);

  const changeName = useUpdateOrganizationName();
  const addMember = useAddUserToOrganization();
  const onNameChange = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (
      editOrgFormData.newName === oldName.current ||
      !editOrgFormData.newName.trim()
    )
      return;

    try {
      await changeName.mutateAsync({
        ...editOrgFormData,
        organizationId: selectedOrg?.organizationId as string,
      });
      oldName.current = editOrgFormData.newName;
    } catch {}
  };

  const onMemberAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!addUserToOrg.userEmail.trim()) return;
    try {
      await addMember.mutateAsync({
        ...addUserToOrg,
        organizationId: selectedOrg?.organizationId as string,
      });
      setAddUserToOrg({ ...addUserToOrg, userEmail: "" });
    } catch {}
  };

  const onChangeGuidedMode = async (checked: boolean) => {
    try {
      await setGuidedModePromise.mutateAsync(checked);
      setGuidedMode(checked);
    } catch {}
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="w-[100%] md:w-[80%] xl:w-[50%] px-10 py-10">
        <div className="w-full ">
          <h3 className="text-2xl font-semibold">Settings</h3>
        </div>

        <div className="mt-6 flex items-center justify-between gap-4 rounded-md border px-4 py-3">
          <div>
            <p className="font-semibold">Guided Mode</p>
            <p className="text-sm text-muted-foreground">
              Show step-by-step prompts when creating organizations and projects.
            </p>
          </div>
          <Switch
            checked={guidedMode}
            onCheckedChange={onChangeGuidedMode}
            disabled={setGuidedModePromise.isPending}
          />
        </div>

        <hr className="border border-gray-300 my-6" />

        <form className="mt-4" onSubmit={onNameChange}>
          <p className="font-semibold">Change Organization Name</p>
          <input
            type="text"
            placeholder="Organization Name"
            name="newOrganizationName"
            id="newOrganizationName"
            className="w-[95%] md:w-[80%] h-10 px-2 py-1 mx-2 my-2 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-blue-300"
            required
            value={editOrgFormData.newName}
            onChange={(e) =>
              setEditOrgFormData({
                ...editOrgFormData,
                newName: e.target.value,
              })
            }
          />
          <Button loading={changeName.isPending} className="ml-auto">
            Change
          </Button>
        </form>
        {/* <hr className='border border-gray-300 my-6' /> */}
        <h3 className="text-2xl font-semibold mt-6">Add Members</h3>
        <form onSubmit={onMemberAdd}>
          <input
            type="text"
            placeholder="Enter member email"
            name="memberEmail"
            id="memberEmail"
            className="w-[95%] md:w-[80%] px-2 py-1 mx-2 my-2 h-10 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-blue-300"
            required
            value={addUserToOrg.userEmail}
            onChange={(e) =>
              setAddUserToOrg({ ...addUserToOrg, userEmail: e.target.value })
            }
          />
          <Button loading={addMember.isPending} className="ml-auto">
            Add
          </Button>
        </form>
        {/* <hr className='border border-gray-300 my-6' /> */}
        <h3 className="text-2xl font-semibold mt-6">Current Members</h3>
        <ul className="list-disc ml-4">
          {selectedOrg?.organization?.members.map((member) => (
            <li key={member.id}>
              {member.user.name} ({member.user.email}) :{" "}
              {String(member.role).toLowerCase()}
            </li>
          ))}
        </ul>
      </DialogContent>
    </Dialog>
  );
};

export default EditOrganizationModal;
