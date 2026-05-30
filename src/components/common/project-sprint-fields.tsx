"use client";

import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  getSprintDefaultName,
  getSprintTypeMeta,
  SPRINT_TYPES,
  SprintTypeValue,
} from "@/lib/sprint";
import { InitialSprintConfig } from "@/queries/sprint/action";

const DURATION_OPTIONS = [7, 14, 30] as const;

export function createInitialSprintConfig(weekNumber = 1): InitialSprintConfig {
  const sprintType: SprintTypeValue = "LAUNCH";
  return {
    name: getSprintDefaultName(sprintType, weekNumber),
    sprintType,
    durationDays: 7,
    primaryGoal: "",
    targetMetric: "",
    taskIds: [],
  };
}

type Props = {
  value: InitialSprintConfig;
  onChange: (config: InitialSprintConfig) => void;
  idPrefix?: string;
  weekNumber?: number;
  showPostCreateHint?: boolean;
};

export function ProjectSprintFields({
  value,
  onChange,
  idPrefix = "sprint",
  weekNumber = 1,
  showPostCreateHint = false,
}: Props) {
  const selectedTypeMeta = getSprintTypeMeta(value.sprintType);

  const onSprintTypeChange = (sprintType: SprintTypeValue) => {
    onChange({
      ...value,
      sprintType,
      name: getSprintDefaultName(sprintType, weekNumber),
    });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor={`${idPrefix}-type`}>
          Sprint Type <span className="text-red-500">*</span>
        </Label>
        <select
          id={`${idPrefix}-type`}
          value={value.sprintType}
          onChange={(e) => onSprintTypeChange(e.target.value as SprintTypeValue)}
          className="border rounded-md px-3 py-2 w-full text-sm bg-white"
          required
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
        <Label htmlFor={`${idPrefix}-name`}>
          Sprint Name <span className="text-red-500">*</span>
        </Label>
        <input
          id={`${idPrefix}-name`}
          type="text"
          value={value.name}
          onChange={(e) => onChange({ ...value, name: e.target.value })}
          className="border rounded-md px-3 py-2 w-full text-sm"
          placeholder="Launch"
          required
        />
      </div>

      <div className="space-y-2">
        <Label>
          Duration <span className="text-red-500">*</span>
        </Label>
        <RadioGroup
          value={String(value.durationDays)}
          onValueChange={(next) =>
            onChange({
              ...value,
              durationDays: Number(next) as 7 | 14 | 30,
            })
          }
          className="flex flex-row gap-4"
        >
          {DURATION_OPTIONS.map((days) => (
            <label
              key={days}
              htmlFor={`${idPrefix}-duration-${days}`}
              className="flex items-center gap-2 cursor-pointer text-sm"
            >
              <RadioGroupItem
                value={String(days)}
                id={`${idPrefix}-duration-${days}`}
              />
              {days} days
            </label>
          ))}
        </RadioGroup>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor={`${idPrefix}-primary-goal`}>Primary Goal</Label>
        <input
          id={`${idPrefix}-primary-goal`}
          type="text"
          value={value.primaryGoal ?? ""}
          onChange={(e) => onChange({ ...value, primaryGoal: e.target.value })}
          className="border rounded-md px-3 py-2 w-full text-sm"
          placeholder="Increase activation rate"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor={`${idPrefix}-target-metric`}>Target Metric</Label>
        <input
          id={`${idPrefix}-target-metric`}
          type="text"
          value={value.targetMetric ?? ""}
          onChange={(e) => onChange({ ...value, targetMetric: e.target.value })}
          className="border rounded-md px-3 py-2 w-full text-sm"
          placeholder="24% → 40%"
        />
      </div>

      {showPostCreateHint && (
        <p className="text-xs text-muted-foreground">
          New tasks you add will automatically join this sprint.
        </p>
      )}
    </div>
  );
}

export function isSprintConfigValid(config: InitialSprintConfig) {
  return Boolean(config.name.trim() && config.sprintType && config.durationDays);
}
