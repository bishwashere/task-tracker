import ProgressBar from "@/components/common/ProgressBar";
import { cn } from "@/lib/cn";
import { Project } from ".";
import { useRouter } from "next/navigation";

interface ProjectCardProps {
  project: Project;
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
    </div>
  );
};

export default ProjectCard;
