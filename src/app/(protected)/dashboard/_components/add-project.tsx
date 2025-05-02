import React, { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAddProject } from "@/queries/project/hooks";
import { AddProjectProps } from "@/queries/project/action";
import { useDashboardContext } from "@/context/dashboard-context";

type Props = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
};

const AddProject = ({ isOpen, onOpenChange }: Props) => {
  const { selectedOrg } = useDashboardContext();
  const [fromData, setFormData] = useState<AddProjectProps>({
    organizationId: "",
    projectName: "",
    projectDescription: "",
  });

  useEffect(() => {
    if (selectedOrg) {
      setFormData((prevData) => ({
        ...prevData,
        organizationId: selectedOrg.organizationId,
      }));
    }
  }, [selectedOrg]);

  const add = useAddProject();

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!fromData.projectName.trim()) return;
    try {
      await add.mutateAsync(fromData);
      onOpenChange(false);
      setFormData((prevData) => ({
        ...prevData,
        projectName: "",
        projectDescription: "",
      }));
    } catch {}
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="w-[100%] md:w-96 px-10 py-10">
        <div className="w-full">
          <h3 className="text-2xl font-semibold">Add Project</h3>
        </div>
        {/* <hr className='border border-gray-300 my-6' /> */}
        <form className="mt-4" onSubmit={onSubmit}>
          <input
            type="text"
            placeholder="Project Title"
            name="projectTitle"
            id="projectTitle"
            className="w-full p-2 my-2 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-blue-300"
            required
            onChange={(e) =>
              setFormData({ ...fromData, projectName: e.target.value })
            }
            value={fromData.projectName}
          />
          <textarea
            placeholder="Project Description"
            name="projectDescription"
            id="projectDescription"
            onChange={(e) =>
              setFormData({ ...fromData, projectDescription: e.target.value })
            }
            value={fromData.projectDescription}
            className="w-full h-24 p-2 my-2 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-blue-300"
          />
          {/* <hr className='border border-gray-300 my-6' /> */}
          <div className="flex mt-5 space-x-2">
            <Button loading={add.isPending} className="min-w-28">
              Add
            </Button>
            <Button
              variant={"muted"}
              onClick={() => {
                onOpenChange(false);
                setFormData((prevData) => ({
                  ...prevData,
                  projectName: "",
                  projectDescription: "",
                }));
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

export default AddProject;
