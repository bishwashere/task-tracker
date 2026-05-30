"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useAddProject } from "@/queries/project/hooks";
import { AddProjectProps } from "@/queries/project/action";
import { useDashboardContext } from "@/context/dashboard-context";
import {
  createInitialSprintConfig,
  isSprintConfigValid,
  ProjectSprintFields,
} from "@/components/common/project-sprint-fields";
import { InitialSprintConfig } from "@/queries/sprint/action";
import toast from "react-hot-toast";
import { cn } from "@/lib/cn";

type Props = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
};

type Step = "project" | "sprint";

const AddProject = ({ isOpen, onOpenChange }: Props) => {
  const { selectedOrg } = useDashboardContext();
  const [step, setStep] = useState<Step>("project");
  const [formData, setFormData] = useState({
    organizationId: "",
    projectName: "",
    projectDescription: "",
  });
  const [sprintConfig, setSprintConfig] = useState<InitialSprintConfig>(
    createInitialSprintConfig,
  );

  useEffect(() => {
    if (selectedOrg) {
      setFormData((prev) => ({
        ...prev,
        organizationId: selectedOrg.organizationId,
      }));
    }
  }, [selectedOrg]);

  useEffect(() => {
    if (!isOpen) return;
    setStep("project");
    setSprintConfig(createInitialSprintConfig());
  }, [isOpen]);

  const add = useAddProject();

  const resetForm = () => {
    setStep("project");
    setFormData((prev) => ({
      ...prev,
      projectName: "",
      projectDescription: "",
    }));
    setSprintConfig(createInitialSprintConfig());
  };

  const goToSprintStep = () => {
    if (!formData.projectName.trim()) {
      toast.error("Project name is required.");
      return;
    }
    setSprintConfig(createInitialSprintConfig());
    setStep("sprint");
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (step === "project") {
      goToSprintStep();
      return;
    }

    if (!isSprintConfigValid(sprintConfig)) {
      toast.error("Complete all required sprint fields.");
      return;
    }

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
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) resetForm();
        onOpenChange(open);
      }}
    >
      <DialogContent className="w-[100%] md:w-[32rem] px-8 py-8 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Add Project</DialogTitle>
          <p className="text-sm text-muted-foreground">
            {step === "project"
              ? "Step 1 of 2 — Project details"
              : "Step 2 of 2 — Start sprint (required)"}
          </p>
        </DialogHeader>

        <div className="flex gap-2 mt-2">
          <div
            className={cn(
              "h-1 flex-1 rounded-full",
              step === "project" ? "bg-blue-500" : "bg-blue-200",
            )}
          />
          <div
            className={cn(
              "h-1 flex-1 rounded-full",
              step === "sprint" ? "bg-blue-500" : "bg-gray-200",
            )}
          />
        </div>

        <form className="mt-6 space-y-5" onSubmit={onSubmit}>
          {step === "project" ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="projectTitle">
                  Project Title <span className="text-red-500">*</span>
                </Label>
                <input
                  type="text"
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
                  id="projectDescription"
                  onChange={(e) =>
                    setFormData({ ...formData, projectDescription: e.target.value })
                  }
                  value={formData.projectDescription}
                  className="w-full h-24 p-2 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-blue-300"
                />
              </div>
            </>
          ) : (
            <>
              <div className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm">
                <p className="font-medium text-green-800">Start Sprint</p>
                <p className="text-green-700 text-xs mt-0.5">
                  Every project needs an active sprint to appear in Sprint View.
                </p>
              </div>
              <ProjectSprintFields
                value={sprintConfig}
                onChange={setSprintConfig}
                idPrefix="add-project"
                showPostCreateHint
              />
            </>
          )}

          <div className="flex gap-2 pt-2">
            {step === "sprint" && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep("project")}
              >
                Back
              </Button>
            )}
            <Button
              type="button"
              variant="muted"
              onClick={() => {
                onOpenChange(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button loading={add.isPending} className="min-w-28 ml-auto">
              {step === "project" ? "Next: Start Sprint" : "Create & Start Sprint"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddProject;
