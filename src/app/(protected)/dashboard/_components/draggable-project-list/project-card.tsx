import ProgressBar from "@/components/common/ProgressBar";
import { cn } from "@/lib/cn";
import { Project } from ".";
import { useRouter } from "next/navigation";
import { ProjectSummary } from "@prisma/client";

interface ProjectCardProps {
  project: Project & {
    projectSummary: ProjectSummary | null;
  };
  isDragging: boolean;
}

const ProjectCard = ({ project, isDragging }: ProjectCardProps) => {
  const router = useRouter();
  return (
    <div
      className={cn(
        "bg-white p-6 rounded shadow-md border-l-4 border-blue-500 cursor-pointer select-none",
        isDragging && "border-red-500",
      )}
      onClick={() => router.push(`/project/${project.id}`)}
    >
      <div className="flex justify-between items-center mb-4 gap-6">
        <h3 className="text-lg font-semibold">{project.name}</h3>
        <ProgressBar progress={project.progress} />
      </div>
      <p className="text-sm text-gray-500">{project?.tasksCount} Tasks</p>
      {/* project summary done and pending */}
      <hr className="my-2" />

      <div className="grid sm:grid-cols-2 gap-4 text-muted-foreground">
        {(project?.projectSummary?.done?.length || 0) > 0 ? (
          <div>
            <h4 className="text-sm font-medium">Done</h4>
            <ul className="list-disc list-inside">
              {project?.projectSummary?.done?.map((item) => (
                <li key={item} className="text-sm">
                  {item}
                </li>
              ))}
            </ul>
          </div>) : null}
        {(project?.projectSummary?.pending?.length || 0) > 0 ? (
          <div>
            <h4 className="text-sm font-medium">Pending</h4>
            <ul className="list-disc list-inside">
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
