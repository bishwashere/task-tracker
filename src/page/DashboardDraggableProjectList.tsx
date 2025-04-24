import ProgressBar from "@/components/common/ProgressBar";
import { ProjectType, SubtaskType, TaskType } from "@/types/organization";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  DragStartEvent,
  DragEndEvent,
  TouchSensor,
  MouseSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/cn";
import { sortProjects } from "@/actions/project";
import toast from "react-hot-toast";

type Props = {
  projects: ProjectType[];
};

const DashboardDraggableProjectList = ({ projects: p }: Props) => {
  const [projects, setProjects] = useState(p);
  const [activeId, setActiveId] = useState<string | null>(null);

  // Configure sensors for both mouse and touch interactions
  const sensors = useSensors(
    useSensor(MouseSensor, {
      // Require the mouse to move by 10 pixels before activating
      activationConstraint: {
        distance: 10,
      },
    }),
    useSensor(TouchSensor, {
      // Press delay of 250ms, with tolerance of 5px of movement
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (over && active.id !== over.id) {
      const oldIndex = projects.findIndex(
        (project) => project.id === active.id,
      );
      const newIndex = projects.findIndex((project) => project.id === over.id);

      // Update sortIndex in reverse order (highest at top)
      const updatedProjects = arrayMove(projects, oldIndex, newIndex).map(
        (project, index) => ({
          ...project,
          projectSortIndex: [{ sortIndex: projects.length - 1 - index }] as [
            { sortIndex: number },
          ],
        }),
      );

      // save this to use later if error occurred
      const prevProjectData = projects;

      setProjects(updatedProjects);

      // Send updated sort indices to the backend
      const sortData = updatedProjects.map((project) => ({
        projectId: project.id,
        sortIndex: project?.projectSortIndex?.[0]?.sortIndex || 0,
      }));

      try {
        const res = await sortProjects(sortData);
        if (!res.success) {
          toast.error(res.message || "An error occurred");
          setProjects(prevProjectData);
        }
      } catch {
        toast.error("An error occurred");
        setProjects(prevProjectData);
      }
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={projects.map((p) => p.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-4">
          {projects
            .sort(
              (a, b) =>
                (b?.projectSortIndex?.[0]?.sortIndex || 0) -
                (a?.projectSortIndex?.[0]?.sortIndex || 0),
            ) // Reverse sort order
            .map((project) => (
              <SortableProjectCard key={project.id} project={project} />
            ))}
        </div>
      </SortableContext>
      <DragOverlay>
        {activeId ? (
          <ProjectCard
            project={projects.find((p) => p.id === activeId)!}
            isDragging={true}
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

interface SortableProjectCardProps {
  project: ProjectType;
}

const SortableProjectCard = ({ project }: SortableProjectCardProps) => {
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
      {...listeners}
      className="cursor-grab active:cursor-grabbing"
    >
      <ProjectCard project={project} isDragging={isDragging} />
    </div>
  );
};

interface ProjectCardProps {
  project: ProjectType;
  isDragging: boolean;
}

const ProjectCard = ({ project, isDragging }: ProjectCardProps) => {
  const router = useRouter();
  const progress = calculateProgress(project.tasks);

  return (
    <div
      className={cn(
        "bg-white p-6 rounded shadow-md border-l-4 border-blue-500 cursor-pointer select-none",
        isDragging && "border-red-500",
      )}
      onClick={() => router.push(`/project/${project.id}`)}
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">{project.name}</h3>
        <ProgressBar progress={progress} />
      </div>
      <p className="text-sm text-gray-500">{project.tasks.length} Tasks</p>
    </div>
  );
};

function calculateProgress(tasks: TaskType[]): number {
  const totalSubtasks = tasks.reduce(
    (sum, task) => sum + (task.subtasks?.length || 0),
    0,
  );

  const completedSubtasks = tasks.reduce(
    (sum, task) =>
      sum +
      (task.subtasks?.filter(
        (subtask: SubtaskType) => subtask.status === "done",
      ).length || 0),
    0,
  );

  return totalSubtasks === 0
    ? 0
    : Math.round((completedSubtasks / totalSubtasks) * 100);
}

export default DashboardDraggableProjectList;

