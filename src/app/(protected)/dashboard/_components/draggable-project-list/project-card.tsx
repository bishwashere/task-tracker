import { cn } from "@/lib/cn";
import { getProjectTasksPath } from "@/lib/project-slug";
import { Project } from ".";
import { useRouter } from "next/navigation";
import { ProjectSummary } from "@prisma/client";
import { CircleCheck, Clock, ListTodo, TimerOff } from "lucide-react";

interface ProjectCardProps {
  project: Project & {
    projectSummary: Pick<ProjectSummary, "done" | "pending"> | null;
  };
  isDragging: boolean;
  isRecentlyEnded?: boolean;
}

const ProjectCard = ({ project, isDragging, isRecentlyEnded }: ProjectCardProps) => {
  const router = useRouter();
  return (
    <div
      className={cn(
        "bg-white p-4 rounded-lg border border-border shadow-sm border-l-[3px] cursor-pointer select-none transition-shadow duration-150 hover:shadow-md",
        isRecentlyEnded
          ? "border-l-amber-400 hover:border-l-amber-500"
          : "border-l-blue-500 hover:border-l-blue-600",
        isDragging && "border-l-red-500 ring-2 ring-red-200/60 shadow-md",
      )}
      onClick={() => router.push(getProjectTasksPath(project.slug))}
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <h3 className="text-lg font-semibold">{project.name}</h3>
        {isRecentlyEnded && (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-200">
            <TimerOff className="size-3" aria-hidden />
            Sprint ended
          </span>
        )}
      </div>
      <p className="text-sm text-muted-foreground inline-flex items-center gap-1.5">
        <ListTodo className="size-3.5 shrink-0" aria-hidden />
        {project?.tasksCount} Tasks
      </p>
      {/* project summary done and pending */}
      <div className="border-t border-border/60 my-2" />

      <div className="grid sm:grid-cols-2 gap-3 text-muted-foreground">
        {(project?.projectSummary?.done?.length || 0) > 0 ? (
          <div>
            <h4 className="text-sm font-medium inline-flex items-center gap-1.5 mb-1">
              <CircleCheck className="size-3.5 text-green-600 shrink-0" aria-hidden />
              Done
            </h4>
            <ul className="list-none space-y-0.5 pl-5">
              {project?.projectSummary?.done?.map((item) => (
                <li key={item} className="text-sm">
                  {item}
                </li>
              ))}
            </ul>
          </div>) : null}
        {(project?.projectSummary?.pending?.length || 0) > 0 ? (
          <div>
            <h4 className="text-sm font-medium inline-flex items-center gap-1.5 mb-1">
              <Clock className="size-3.5 text-amber-600 shrink-0" aria-hidden />
              Pending
            </h4>
            <ul className="list-none space-y-0.5 pl-5">
              {project?.projectSummary?.pending?.map((item) => (
                <li key={item} className="text-sm">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

      </div>
    </div>
  );
};

export default ProjectCard;
