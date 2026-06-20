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

const PRESET_DURATIONS = [7, 14, 30] as const;

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
          value={PRESET_DURATIONS.includes(value.durationDays as 7 | 14 | 30) ? String(value.durationDays) : "custom"}
          onValueChange={(next) => {
            if (next === "custom") {
              onChange({ ...value, durationDays: 1 });
            } else {
              onChange({ ...value, durationDays: Number(next) });
            }
          }}
          className="flex flex-row flex-wrap gap-4"
        >
          {PRESET_DURATIONS.map((days) => (
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
          <label
            htmlFor={`${idPrefix}-duration-custom`}
            className="flex items-center gap-2 cursor-pointer text-sm"
          >
            <RadioGroupItem value="custom" id={`${idPrefix}-duration-custom`} />
            Custom
          </label>
        </RadioGroup>
        {!PRESET_DURATIONS.includes(value.durationDays as 7 | 14 | 30) && (
          <div className="flex items-center gap-2 mt-1.5">
            <input
              type="number"
              min={1}
              max={365}
              value={value.durationDays}
              onChange={(e) => {
                const num = Math.max(1, Math.min(365, Number(e.target.value)));
                onChange({ ...value, durationDays: num });
              }}
              className="border rounded-md px-3 py-1.5 w-24 text-sm"
              placeholder="Days"
            />
            <span className="text-sm text-muted-foreground">days</span>
          </div>
        )}
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
