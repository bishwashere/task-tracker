"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { useStartSprint } from "@/queries/sprint/hooks";
import { getSprintDefaultName, getSprintTypeMeta, SPRINT_TYPES, SprintTypeValue } from "@/lib/sprint";
import { Loader2 } from "lucide-react";

type Props = {
  projectId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  nextWeekNumber: number;
};

const DURATION_OPTIONS = [7, 14, 30] as const;

const StartSprintDialog = ({
  projectId,
  open,
  onOpenChange,
  nextWeekNumber,
}: Props) => {
  const startSprint = useStartSprint(projectId);
  const [name, setName] = useState("");
  const [sprintType, setSprintType] = useState<SprintTypeValue>("LAUNCH");
  const [durationDays, setDurationDays] = useState<7 | 14 | 30>(7);
  const [primaryGoal, setPrimaryGoal] = useState("");
  const [targetMetric, setTargetMetric] = useState("");

  useEffect(() => {
    if (!open) return;
    setSprintType("LAUNCH");
    setName(getSprintDefaultName("LAUNCH", nextWeekNumber));
    setDurationDays(7);
    setPrimaryGoal("");
    setTargetMetric("");
  }, [open, nextWeekNumber]);

  const selectedTypeMeta = getSprintTypeMeta(sprintType);

  const onSprintTypeChange = (value: SprintTypeValue) => {
    setSprintType(value);
    setName(getSprintDefaultName(value, nextWeekNumber));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      await startSprint.mutateAsync({
        name: name.trim(),
        sprintType,
        durationDays,
        primaryGoal: primaryGoal.trim() || undefined,
        targetMetric: targetMetric.trim() || undefined,
        taskIds: [],
      });
      onOpenChange(false);
    } catch {
      // toast handled in hook
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Start Sprint</DialogTitle>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-5 mt-2">
          <div className="space-y-1.5">
            <Label htmlFor="sprint-type">Sprint Type</Label>
            <select
              id="sprint-type"
              value={sprintType}
              onChange={(e) => onSprintTypeChange(e.target.value as SprintTypeValue)}
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
            <Label htmlFor="sprint-name">Sprint Name</Label>
            <input
              id="sprint-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border rounded-md px-3 py-2 w-full text-sm"
              placeholder="Launch"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Duration</Label>
            <RadioGroup
              value={String(durationDays)}
              onValueChange={(value) =>
                setDurationDays(Number(value) as 7 | 14 | 30)
              }
              className="flex flex-row gap-4"
            >
              {DURATION_OPTIONS.map((days) => (
                <label
                  key={days}
                  htmlFor={`duration-${days}`}
                  className="flex items-center gap-2 cursor-pointer text-sm"
                >
                  <RadioGroupItem value={String(days)} id={`duration-${days}`} />
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
              value={primaryGoal}
              onChange={(e) => setPrimaryGoal(e.target.value)}
              className="border rounded-md px-3 py-2 w-full text-sm"
              placeholder="Increase activation rate"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="target-metric">Target Metric</Label>
            <input
              id="target-metric"
              type="text"
              value={targetMetric}
              onChange={(e) => setTargetMetric(e.target.value)}
              className="border rounded-md px-3 py-2 w-full text-sm"
              placeholder="24% → 40%"
            />
          </div>

          <p className="text-xs text-muted-foreground">
            Assign existing pending tasks from the task list using &quot;Add to sprint&quot; after starting.
          </p>

          <div className="flex justify-end pt-1">
            <Button type="submit" disabled={startSprint.isPending || !name.trim()}>
              {startSprint.isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin mr-2" />
                  Starting...
                </>
              ) : (
                "Start Sprint"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default StartSprintDialog;
