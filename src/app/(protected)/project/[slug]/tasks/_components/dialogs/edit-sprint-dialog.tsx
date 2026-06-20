"use client";

import { useEffect, useState } from "react";
import { BiEditAlt } from "react-icons/bi";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { useUpdateSprint } from "@/queries/sprint/hooks";
import { getSprintTypeMeta, SPRINT_TYPES, SprintTypeValue } from "@/lib/sprint";
import { Sprint } from "@prisma/client";
import { Loader2 } from "lucide-react";

type Props = {
  projectId: string;
  sprint: Sprint;
};

const PRESET_DURATIONS = [7, 14, 30] as const;

const EditSprintDialog = ({ projectId, sprint }: Props) => {
  const [open, setOpen] = useState(false);
  const updateSprint = useUpdateSprint(projectId);
  const [name, setName] = useState(sprint.name);
  const [sprintType, setSprintType] = useState<SprintTypeValue>(
    sprint.sprintType as SprintTypeValue,
  );
  const [durationDays, setDurationDays] = useState<number>(sprint.durationDays);
  const [primaryGoal, setPrimaryGoal] = useState(sprint.primaryGoal || "");
  const [targetMetric, setTargetMetric] = useState(sprint.targetMetric || "");

  useEffect(() => {
    if (!open) return;
    setName(sprint.name);
    setSprintType(sprint.sprintType as SprintTypeValue);
    setDurationDays(sprint.durationDays);
    setPrimaryGoal(sprint.primaryGoal || "");
    setTargetMetric(sprint.targetMetric || "");
  }, [open, sprint]);

  const selectedTypeMeta = getSprintTypeMeta(sprintType);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      await updateSprint.mutateAsync({
        sprintId: sprint.id,
        name: name.trim(),
        sprintType,
        durationDays,
        primaryGoal: primaryGoal.trim() || undefined,
        targetMetric: targetMetric.trim() || undefined,
      });
      setOpen(false);
    } catch {
      // toast handled in hook
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button type="button" className="p-1 shrink-0" aria-label="Edit sprint">
          <BiEditAlt className="text-red-600" />
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Sprint</DialogTitle>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-5 mt-2">
          <div className="space-y-1.5">
            <Label htmlFor="edit-sprint-type">Sprint Type</Label>
            <select
              id="edit-sprint-type"
              value={sprintType}
              onChange={(e) => setSprintType(e.target.value as SprintTypeValue)}
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
              <span className="block mt-0.5">Usually owned by: {selectedTypeMeta.owner}</span>
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-sprint-name">Sprint Name</Label>
            <input
              id="edit-sprint-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border rounded-md px-3 py-2 w-full text-sm"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Duration</Label>
            <RadioGroup
              value={PRESET_DURATIONS.includes(durationDays as 7 | 14 | 30) ? String(durationDays) : "custom"}
              onValueChange={(value) => {
                if (value === "custom") {
                  setDurationDays(1);
                } else {
                  setDurationDays(Number(value));
                }
              }}
              className="flex flex-row flex-wrap gap-4"
            >
              {PRESET_DURATIONS.map((days) => (
                <label
                  key={days}
                  htmlFor={`edit-duration-${days}`}
                  className="flex items-center gap-2 cursor-pointer text-sm"
                >
                  <RadioGroupItem value={String(days)} id={`edit-duration-${days}`} />
                  {days} days
                </label>
              ))}
              <label
                htmlFor="edit-duration-custom"
                className="flex items-center gap-2 cursor-pointer text-sm"
              >
                <RadioGroupItem value="custom" id="edit-duration-custom" />
                Custom
              </label>
            </RadioGroup>
            {!PRESET_DURATIONS.includes(durationDays as 7 | 14 | 30) && (
              <div className="flex items-center gap-2 mt-1.5">
                <input
                  type="number"
                  min={1}
                  max={365}
                  value={durationDays}
                  onChange={(e) => {
                    const num = Math.max(1, Math.min(365, Number(e.target.value)));
                    setDurationDays(num);
                  }}
                  className="border rounded-md px-3 py-1.5 w-24 text-sm"
                  placeholder="Days"
                />
                <span className="text-sm text-muted-foreground">days</span>
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-primary-goal">Primary Goal</Label>
            <input
              id="edit-primary-goal"
              type="text"
              value={primaryGoal}
              onChange={(e) => setPrimaryGoal(e.target.value)}
              className="border rounded-md px-3 py-2 w-full text-sm"
              placeholder="Increase activation rate"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-target-metric">Target Metric</Label>
            <input
              id="edit-target-metric"
              type="text"
              value={targetMetric}
              onChange={(e) => setTargetMetric(e.target.value)}
              className="border rounded-md px-3 py-2 w-full text-sm"
              placeholder="24% → 40%"
            />
          </div>

          <div className="flex justify-end pt-1">
            <Button type="submit" disabled={updateSprint.isPending || !name.trim()}>
              {updateSprint.isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                "Save Sprint"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditSprintDialog;
