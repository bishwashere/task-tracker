import { User } from "./user";

export type Organization = {
  id: string;
  name: string;
  projects: ProjectType[];
  members: UserOrganization[];
  createdAt: Date;
  updatedAt: Date;
};

export type UserOrganization = {
  id: string;
  user: User;
  userId: string;
  organizationId: string;
  role: "ADMIN" | "MEMBER";
  createdAt: Date;
};

export type ProjectType = {
  id: string;
  name: string;
  description?: string;
  organizationId: string;
  organization: Organization;
  hasAiSuggestTasks: boolean;
  tasks: TaskType[];
  createdAt: Date;
  updatedAt: Date;
};

export type TaskType = {
  id: string;
  name: string;
  description: string;
  projectId: string;
  project: ProjectType;
  subtasks: SubtaskType[];
  hasAISuggestions: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type SubtaskType = {
  id: string;
  name: string;
  taskId: string;
  task: TaskType;
  assignedUserId?: string | null;
  assignedUser?: User | null;
  dueDate?: Date | null;
  points: number;
  status: string;
  priority: number;
  tagName: string;
  tagColor: string;
  comments: CommentType[];
  createdAt: Date;
  updatedAt: Date;
  issueCount?: number;
};
export type CommentType = {
  id: string;
  subtaskId: string;
  subtask: SubtaskType;
  userId: string;
  user: User;
  comment: string;
  createdAt: Date;
  updatedAt: Date;
  commentType: string;
  resolved: boolean;
};
export type PointsEarnedType = {
  id: string;
  userId: string;
  subtaskId: string;
  subtaskName: string;
  organizationId: string;
  organizationName: string;
  projectId: string;
  projectName: string;
  taskId: string;
  taskName: string;
  points: number;
  createdAt: Date;
};
