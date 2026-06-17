import React, { useEffect, useState } from "react";
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
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import toast from "react-hot-toast";
import { Project as P, ProjectSortIndex, ProjectSummary } from "@prisma/client";
import { useSortProjects } from "@/queries/project/hooks";
import SortableProjectCard from "./sortable-project-card";
import ProjectCard from "./project-card";

export type Project = P & {
  progress: number;
  tasksCount: number;
  projectSortIndex: {
    sortIndex: number;
  }[];
  name: string;
  id: string;
  organizationId: string;
  createdAt: Date;
  updatedAt: Date;
  description: string | null;
  hasAiSuggestTasks: boolean;
};

type Props = {
  projects: (Project & {
    projectSummary: Pick<ProjectSummary, "done" | "pending"> | null;
  })[];
  isRecentlyEnded?: boolean;
};

const DashboardDraggableProjectList = ({ projects: p, isRecentlyEnded }: Props) => {
  const [projects, setProjects] = useState(p);
  const [activeId, setActiveId] = useState<string | null>(null);
  const sort = useSortProjects();

  useEffect(() => {
    setProjects(p);
  }, [p]);

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
        await sort.mutateAsync(sortData);
      } catch {
        toast.error("An error occurred");
        setProjects(prevProjectData);
      }
    }
  };

  return (
    <div className="space-y-3">
      {/* Projects List */}
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
          <div className="space-y-3">
            {projects
              .sort(
                (a, b) =>
                  (b?.projectSortIndex?.[0]?.sortIndex || 0) -
                  (a?.projectSortIndex?.[0]?.sortIndex || 0),
              ) // Reverse sort order
              .map((project) => (
                <SortableProjectCard key={project.id} project={project} isRecentlyEnded={isRecentlyEnded} />
              ))}
          </div>
        </SortableContext>
        <DragOverlay>
          {activeId ? (
            <ProjectCard
              project={projects.find((p) => p.id === activeId)!}
              isDragging={true}
              isRecentlyEnded={isRecentlyEnded}
            />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
};

export default DashboardDraggableProjectList;
