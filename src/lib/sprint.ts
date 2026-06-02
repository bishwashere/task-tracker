import { format } from "date-fns";

export const MAX_ACTIVE_SPRINT_TASKS = 8;

export const SPRINT_TYPES = [
  {
    value: "GROWTH",
    name: "Growth",
    purpose: "Improve users, activation, revenue, conversion",
    owner: "Growth Engineer",
  },
  {
    value: "RELIABILITY",
    name: "Reliability",
    purpose: "Stability, bugs, integrations, infra",
    owner: "Reliability Engineer",
  },
  {
    value: "LAUNCH",
    name: "Launch",
    purpose: "Shipping a major feature/product launch",
    owner: "You + Both",
  },
  {
    value: "ONBOARDING",
    name: "Onboarding",
    purpose: "Improve first user success",
    owner: "Growth Engineer",
  },
  {
    value: "SEO",
    name: "SEO",
    purpose: "Content pages, organic traffic",
    owner: "Growth Engineer",
  },
  {
    value: "ANALYTICS",
    name: "Analytics",
    purpose: "Tracking, dashboards, metrics",
    owner: "Both",
  },
  {
    value: "INFRASTRUCTURE",
    name: "Infrastructure",
    purpose: "Server, deployment, scaling, observability",
    owner: "Reliability Engineer",
  },
  {
    value: "EXPERIMENT",
    name: "Experiment",
    purpose: "Testing new ideas quickly",
    owner: "You",
  },
  {
    value: "RETENTION",
    name: "Retention",
    purpose: "Reduce churn, improve returning users",
    owner: "Growth Engineer",
  },
  {
    value: "AI_QUALITY",
    name: "AI Quality",
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

export function formatSprintDateRange(startDate: Date, endDate: Date) {
  const start = format(startDate, "MMM d");
  const end =
    startDate.getFullYear() === endDate.getFullYear()
      ? format(endDate, "MMM d")
      : format(endDate, "MMM d, yyyy");

  return `${start} - ${end}`;
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

type SprintSummaryTask = {
  id: string;
  subtasks: Array<{ name: string; status: string; assignedUserId?: string | null }>;
};

export function userIsInActiveSprint(
  tasks: SprintSummaryTask[],
  sprintTaskIds: string[],
  userId: string,
) {
  if (sprintTaskIds.length === 0) return false;

  const sprintTaskIdSet = new Set(sprintTaskIds);

  return tasks.some(
    (task) =>
      sprintTaskIdSet.has(task.id) &&
      task.subtasks.some((subtask) => subtask.assignedUserId === userId),
  );
}

export function buildSprintDonePending(
  tasks: SprintSummaryTask[],
  sprintTaskIds: string[],
  maxItems = 3,
  assignedUserId?: string,
) {
  const done: string[] = [];
  const pending: string[] = [];

  for (const task of tasks) {
    if (!sprintTaskIds.includes(task.id)) continue;

    for (const subtask of task.subtasks) {
      if (assignedUserId && subtask.assignedUserId !== assignedUserId) {
        continue;
      }

      const bucket = subtask.status === "done" ? done : pending;
      if (bucket.length < maxItems) {
        bucket.push(subtask.name);
      }
    }
  }

  return { done, pending };
}

/** Subtasks on sprint tasks (optional assignee filter for members). */
export function countSprintSubtasks(
  tasks: SprintSummaryTask[],
  sprintTaskIds: string[],
  assignedUserId?: string,
) {
  if (sprintTaskIds.length === 0) return 0;

  const sprintTaskIdSet = new Set(sprintTaskIds);
  let count = 0;

  for (const task of tasks) {
    if (!sprintTaskIdSet.has(task.id)) continue;

    for (const subtask of task.subtasks) {
      if (assignedUserId && subtask.assignedUserId !== assignedUserId) {
        continue;
      }
      count++;
    }
  }

  return count;
}
