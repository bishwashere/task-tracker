import React, { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useAddProject } from "@/queries/project/hooks";
import { AddProjectProps } from "@/queries/project/action";
import { useDashboardContext } from "@/context/dashboard-context";
import {
  getSprintDefaultName,
  getSprintTypeMeta,
  SPRINT_TYPES,
  SprintTypeValue,
} from "@/lib/sprint";
import { InitialSprintConfig } from "@/queries/sprint/action";

type Props = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
};

const DURATION_OPTIONS = [7, 14, 30] as const;

const defaultSprintConfig = (): InitialSprintConfig => ({
  name: getSprintDefaultName("LAUNCH", 1),
  sprintType: "LAUNCH",
  durationDays: 7,
  primaryGoal: "",
  targetMetric: "",
  taskIds: [],
});

const AddProject = ({ isOpen, onOpenChange }: Props) => {
  const { selectedOrg } = useDashboardContext();
  const [formData, setFormData] = useState({
    organizationId: "",
    projectName: "",
    projectDescription: "",
  });
  const [sprintConfig, setSprintConfig] = useState(defaultSprintConfig);

  useEffect(() => {
    if (selectedOrg) {
      setFormData((prevData) => ({
        ...prevData,
        organizationId: selectedOrg.organizationId,
      }));
    }
  }, [selectedOrg]);

  useEffect(() => {
    if (!isOpen) return;
    setSprintConfig(defaultSprintConfig());
  }, [isOpen]);

  const add = useAddProject();
  const selectedTypeMeta = getSprintTypeMeta(sprintConfig.sprintType);

  const onSprintTypeChange = (value: SprintTypeValue) => {
    setSprintConfig((prev) => ({
      ...prev,
      sprintType: value,
      name: getSprintDefaultName(value, 1),
    }));
  };

  const resetForm = () => {
    setFormData((prevData) => ({
      ...prevData,
      projectName: "",
      projectDescription: "",
    }));
    setSprintConfig(defaultSprintConfig());
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.projectName.trim() || !sprintConfig.name.trim()) return;

    const payload: AddProjectProps = {
      organizationId: formData.organizationId,
      projectName: formData.projectName.trim(),
      projectDescription: formData.projectDescription,
      sprint: {
        ...sprintConfig,
        name: sprintConfig.name.trim(),
        primaryGoal: sprintConfig.primaryGoal?.trim() || undefined,
        targetMetric: sprintConfig.targetMetric?.trim() || undefined,
      },
    };

    try {
      await add.mutateAsync(payload);
      onOpenChange(false);
      resetForm();
    } catch {}
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="w-[100%] md:w-[28rem] px-10 py-10 max-h-[90vh] overflow-y-auto">
        <div className="w-full">
          <h3 className="text-2xl font-semibold">Add Project</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Every project starts with an active sprint so it appears in Sprint View.
          </p>
        </div>
        <form className="mt-4 space-y-5" onSubmit={onSubmit}>
          <div className="space-y-2">
            <Label htmlFor="projectTitle">Project Title</Label>
            <input
              type="text"
              placeholder="Project Title"
              name="projectTitle"
              id="projectTitle"
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-blue-300"
              required
              onChange={(e) =>
                setFormData({ ...formData, projectName: e.target.value })
              }
              value={formData.projectName}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="projectDescription">Project Description</Label>
            <textarea
              placeholder="Project Description"
              name="projectDescription"
              id="projectDescription"
              onChange={(e) =>
                setFormData({ ...formData, projectDescription: e.target.value })
              }
              value={formData.projectDescription}
              className="w-full h-24 p-2 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-blue-300"
            />
          </div>

          <div className="border-t pt-4 space-y-4">
            <h4 className="font-semibold text-sm">First Sprint</h4>

            <div className="space-y-1.5">
              <Label htmlFor="sprint-type">Sprint Type</Label>
              <select
                id="sprint-type"
                value={sprintConfig.sprintType}
                onChange={(e) =>
                  onSprintTypeChange(e.target.value as SprintTypeValue)
                }
                className="border rounded-md px-3 py-2 w-full text-sm bg-white"
              >
                {SPRINT_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {selectedTypeMeta.purpose}
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="sprint-name">Sprint Name</Label>
              <input
                id="sprint-name"
                type="text"
                value={sprintConfig.name}
                onChange={(e) =>
                  setSprintConfig((prev) => ({ ...prev, name: e.target.value }))
                }
                className="border rounded-md px-3 py-2 w-full text-sm"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Duration</Label>
              <RadioGroup
                value={String(sprintConfig.durationDays)}
                onValueChange={(value) =>
                  setSprintConfig((prev) => ({
                    ...prev,
                    durationDays: Number(value) as 7 | 14 | 30,
                  }))
                }
                className="flex flex-row gap-4"
              >
                {DURATION_OPTIONS.map((days) => (
                  <label
                    key={days}
                    htmlFor={`add-project-duration-${days}`}
                    className="flex items-center gap-2 cursor-pointer text-sm"
                  >
                    <RadioGroupItem
                      value={String(days)}
                      id={`add-project-duration-${days}`}
                    />
                    {days} days
                  </label>
                ))}
              </RadioGroup>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="primary-goal">Primary Goal</Label>
              <input
                id="primary-goal"
                type="text"
                value={sprintConfig.primaryGoal ?? ""}
                onChange={(e) =>
                  setSprintConfig((prev) => ({
                    ...prev,
                    primaryGoal: e.target.value,
                  }))
                }
                className="border rounded-md px-3 py-2 w-full text-sm"
                placeholder="Increase activation rate"
              />
            </div>
          </div>

          <div className="flex mt-2 space-x-2">
            <Button loading={add.isPending} className="min-w-28">
              Add
            </Button>
            <Button
              type="button"
              variant={"muted"}
              onClick={() => {
                onOpenChange(false);
                resetForm();
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
