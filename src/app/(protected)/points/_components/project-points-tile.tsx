"use client";

import { cn } from "@/lib/cn";
import { HiCurrencyDollar } from "react-icons/hi2";
import { ChevronDown, FolderKanban } from "lucide-react";
import Link from "next/link";
import { getProjectTasksPath } from "@/lib/project-slug";

type Subtask = {
  id: string;
  name: string;
  points: number;
};

type Task = {
  id: string;
  name: string;
  subtasks: Subtask[];
};

export type ProjectPointsTileData = {
  id: string;
  slug: string;
  name: string;
  totalPoints: number;
  organizationName: string;
  tasks: Task[];
};

type Props = {
  project: ProjectPointsTileData;
};

const ProjectPointsTile = ({ project }: Props) => {
  const subtaskCount = project.tasks.reduce(
    (total, task) => total + task.subtasks.length,
    0,
  );

  return (
    <div
      className={cn(
        "bg-white rounded-xl border border-border p-5 shadow-sm",
        "transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5",
      )}
    >
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="min-w-0">
          <div className="inline-flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
            <FolderKanban className="size-3.5 shrink-0" aria-hidden />
            <span className="truncate">{project.organizationName}</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 truncate">
            {project.name}
          </h3>
        </div>
        <Link
          href={getProjectTasksPath(project.slug)}
          className="text-xs text-blue-600 hover:underline shrink-0"
        >
          Open
        </Link>
      </div>

      <div className="flex items-center gap-2 mb-1">
        <HiCurrencyDollar className="text-2xl text-[#fbbc05] shrink-0" />
        <span className="text-3xl font-bold text-gray-900">{project.totalPoints}</span>
      </div>
      <p className="text-sm text-muted-foreground mb-4">
        {subtaskCount} completed subtask{subtaskCount === 1 ? "" : "s"}
      </p>

      {project.tasks.length > 0 && (
        <details className="group border-t border-border/60 pt-3">
          <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-medium text-blue-600 hover:text-blue-700">
            View breakdown
            <ChevronDown className="size-4 transition-transform group-open:rotate-180" />
          </summary>
          <div className="mt-3 space-y-3 max-h-48 overflow-y-auto pr-1">
            {project.tasks.map((task) => (
              <div key={task.id}>
                <p className="text-sm font-medium text-gray-800">{task.name}</p>
                <ul className="mt-1 space-y-0.5 pl-3 border-l-2 border-border/60">
                  {task.subtasks.map((subtask) => (
                    <li
                      key={subtask.id}
                      className="text-xs text-muted-foreground flex justify-between gap-2"
                    >
                      <span className="truncate">{subtask.name}</span>
                      <span className="shrink-0">{subtask.points} pts</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  );
};

export default ProjectPointsTile;
