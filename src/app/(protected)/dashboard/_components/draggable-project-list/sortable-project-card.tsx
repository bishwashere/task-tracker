import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Project } from "./index";
import ProjectCard from "./project-card";
import { ProjectSummary } from "@prisma/client";

const SortableProjectCard = ({ project, isDragDisabled = false }: {
  project: Project & {
    projectSummary: Pick<ProjectSummary, "done" | "pending"> | null;
  };
  isDragDisabled?: boolean;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: project.id,
    data: project,
    disabled: isDragDisabled,
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...(isDragDisabled ? {} : listeners)}
      className={isDragDisabled ? "cursor-default" : "cursor-grab active:cursor-grabbing"}
    >
      <ProjectCard project={project} isDragging={isDragging} />
    </div>
  );
};

export default SortableProjectCard;
