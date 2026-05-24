export const MAX_ACTIVE_SPRINT_TASKS = 8;

export const SPRINT_TYPES = [
  {
    value: "GROWTH",
    name: "Growth",
    label: "Growth Sprint",
    purpose: "Improve users, activation, revenue, conversion",
    owner: "Growth Engineer",
  },
  {
    value: "RELIABILITY",
    name: "Reliability",
    label: "Reliability Sprint",
    purpose: "Stability, bugs, integrations, infra",
    owner: "Reliability Engineer",
  },
  {
    value: "LAUNCH",
    name: "Launch",
    label: "Launch Sprint",
    purpose: "Shipping a major feature/product launch",
    owner: "You + Both",
  },
  {
    value: "ONBOARDING",
    name: "Onboarding",
    label: "Onboarding Sprint",
    purpose: "Improve first user success",
    owner: "Growth Engineer",
  },
  {
    value: "SEO",
    name: "SEO",
    label: "SEO Sprint",
    purpose: "Content pages, organic traffic",
    owner: "Growth Engineer",
  },
  {
    value: "ANALYTICS",
    name: "Analytics",
    label: "Analytics Sprint",
    purpose: "Tracking, dashboards, metrics",
    owner: "Both",
  },
  {
    value: "INFRASTRUCTURE",
    name: "Infrastructure",
    label: "Infrastructure Sprint",
    purpose: "Server, deployment, scaling, observability",
    owner: "Reliability Engineer",
  },
  {
    value: "EXPERIMENT",
    name: "Experiment",
    label: "Experiment Sprint",
    purpose: "Testing new ideas quickly",
    owner: "You",
  },
  {
    value: "RETENTION",
    name: "Retention",
    label: "Retention Sprint",
    purpose: "Reduce churn, improve returning users",
    owner: "Growth Engineer",
  },
  {
    value: "AI_QUALITY",
    name: "AI Quality",
    label: "AI Quality Sprint",
    purpose: "Improve generation quality/output consistency",
    owner: "Reliability Engineer",
  },
] as const;

export type SprintTypeValue = (typeof SPRINT_TYPES)[number]["value"];

export const SPRINT_TYPE_VALUES = SPRINT_TYPES.map((entry) => entry.value) as [
  SprintTypeValue,
  ...SprintTypeValue[],
];

export function getSprintTypeMeta(type?: SprintTypeValue | string | null) {
  if (!type) return SPRINT_TYPES[2];
  return SPRINT_TYPES.find((entry) => entry.value === type) ?? SPRINT_TYPES[2];
}

export function getSprintDefaultName(type: SprintTypeValue, weekNumber: number) {
  const name = getSprintTypeMeta(type).name;
  return weekNumber === 1 ? name : `${name} - Week ${weekNumber}`;
}

export function formatSprintName(name: string) {
  return name.replace(/\s Sprint$/i, "").trim();
}

type SprintTaskRef = {
  name: string;
  taskIds: string[];
  createdAt: Date | string;
};

export function getTaskSprintInfo(
  taskId: string,
  subtasks: { status: string }[],
  sprints: SprintTaskRef[],
) {
  const sprint = [...sprints]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .find((entry) => entry.taskIds.includes(taskId));

  if (!sprint) return null;

  const isDone =
    subtasks.length > 0 && subtasks.every((subtask) => subtask.status === "done");

  return {
    name: formatSprintName(sprint.name),
    status: isDone ? ("Done" as const) : ("Pending" as const),
  };
}

export function isTaskInSprint(taskId: string, sprints: SprintTaskRef[]) {
  return sprints.some((sprint) => sprint.taskIds.includes(taskId));
}
