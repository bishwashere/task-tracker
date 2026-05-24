"use client";

import SuperHeader from "@/components/common/block/super-header";
import ProfileMenu from "@/components/common/profile-menu";
import Loading from "@/components/ui/loading";
import { useGetPoints } from "@/queries/points/hooks";
import { useRouter } from "next/navigation";
import ProjectPointsTile, { ProjectPointsTileData } from "./project-points-tile";
import { HiCurrencyDollar } from "react-icons/hi2";

type DataItem = {
  organizationId: string;
  organizationName: string;
  projectId: string;
  projectName: string;
  taskId: string;
  taskName: string;
  subtaskId: string;
  subtaskName: string;
  points: number;
};

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

type Project = {
  id: string;
  name: string;
  totalPoints: number;
  tasks: Task[];
};

type Organization = {
  id: string;
  name: string;
  totalPoints: number;
  projects: Project[];
};

const Points = ({ user }: { user: string }) => {
  const { data, isLoading } = useGetPoints(user);
  const router = useRouter();

  if (isLoading) {
    return <Loading />;
  }

  if (!data) return null;

  const projects = structureProjects(data.points || [], data.projectSlugs || {});
  const totalPoints = projects.reduce((sum, project) => sum + project.totalPoints, 0);

  return (
    <>
      <SuperHeader onBackClick={() => router.back()} />
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="flex justify-between items-center mb-2">
          <div>
            <h1 className="text-3xl font-bold">Points Earned</h1>
            <p className="text-muted-foreground mt-1">{data.user?.name}</p>
          </div>
          <ProfileMenu showSettings={false} />
        </div>

        {projects.length > 0 ? (
          <>
            <div className="inline-flex items-center gap-2 rounded-xl border border-border bg-white px-4 py-3 shadow-sm">
              <HiCurrencyDollar className="text-3xl text-[#fbbc05]" />
              <div>
                <p className="text-sm text-muted-foreground">Total points</p>
                <p className="text-2xl font-bold">{totalPoints}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {projects.map((project) => (
                <ProjectPointsTile key={project.id} project={project} />
              ))}
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center mt-6 text-md">
            No points earned.
          </div>
        )}
      </div>
    </>
  );
};

export default Points;

function structureProjects(
  data: DataItem[],
  projectSlugs: Record<string, string>,
): ProjectPointsTileData[] {
  const orgs = structureData(data);

  return orgs
    .flatMap((org) =>
      org.projects.map((project) => ({
        ...project,
        slug: projectSlugs[project.id] ?? project.id,
        organizationName: org.name,
      })),
    )
    .sort((a, b) => b.totalPoints - a.totalPoints);
}

const structureData = (data: DataItem[]): Organization[] => {
  const orgMap = new Map<
    string,
    {
      name: string;
      totalPoints: number;
      projects: Map<
        string,
        {
          name: string;
          totalPoints: number;
          tasks: Map<string, { name: string; subtasks: Subtask[] }>;
        }
      >;
    }
  >();

  data.forEach((item) => {
    if (!orgMap.has(item.organizationId)) {
      orgMap.set(item.organizationId, {
        name: item.organizationName,
        totalPoints: 0,
        projects: new Map(),
      });
    }
    const org = orgMap.get(item.organizationId)!;

    if (!org.projects.has(item.projectId)) {
      org.projects.set(item.projectId, {
        name: item.projectName,
        totalPoints: 0,
        tasks: new Map(),
      });
    }
    const proj = org.projects.get(item.projectId)!;

    if (!proj.tasks.has(item.taskId)) {
      proj.tasks.set(item.taskId, {
        name: item.taskName,
        subtasks: [],
      });
    }
    const task = proj.tasks.get(item.taskId)!;

    task.subtasks.push({
      id: item.subtaskId,
      name: item.subtaskName,
      points: item.points,
    });

    proj.totalPoints += item.points;
    org.totalPoints += item.points;
  });

  return Array.from(orgMap.entries()).map(([orgId, org]) => ({
    id: orgId,
    name: org.name,
    totalPoints: org.totalPoints,
    projects: Array.from(org.projects.entries()).map(([projId, proj]) => ({
      id: projId,
      name: proj.name,
      totalPoints: proj.totalPoints,
      tasks: Array.from(proj.tasks.entries()).map(([taskId, task]) => ({
        id: taskId,
        name: task.name,
        subtasks: task.subtasks,
      })),
    })),
  }));
};
