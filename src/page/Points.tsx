"use client";

import ProfileMenu from "@/components/common/ProfileMenu";
import SuperHeader from "@/components/headers/SuperHeader";
import { getPoints } from "@/data/points";
import { Session } from "next-auth";
import { useEffect, useState } from "react";

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

const Points = ({
  projectId,
  session,
}: {
  projectId: string | null;
  session: Session;
}) => {
  const [data, setData] = useState<Organization[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);

  const fetchPoints = async () => {
    const res = await getPoints();
    if (res.success) {
      // console.log(res.points)
      setData(structureData(res.points as DataItem[]));
      setInitialLoading(false);
    }
  };
  useEffect(() => {
    fetchPoints();
  }, []);

  if (initialLoading) {
    return <div className="text-center text-xl font-bold">Loading...</div>;
  }

  return (
    <>
      <SuperHeader
        path={`${projectId ? `/project/${projectId}` : "/dashboard"}`}
      />
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Points Earned</h1>
          <ProfileMenu session={session} showSettings={false} />
        </div>

        {data.length ? (
          data.map((org) => (
            <div key={org.id} className="mb-6">
              {/* Organization */}
              <h2 className="text-lg font-bold">
                {org.name}{" "}
                <span className="text-gray-500">
                  ({org.totalPoints} Points)
                </span>
              </h2>
              <div className="ml-6">
                {org.projects.map((proj) => (
                  <div key={proj.id} className="mb-4">
                    {/* Project */}
                    <h3 className="text-md font-semibold">
                      {proj.name}{" "}
                      <span className="text-gray-500">
                        ({proj.totalPoints} Points)
                      </span>
                    </h3>
                    <div className="ml-6">
                      {proj.tasks.map((task) => (
                        <div key={task.id} className="mb-2">
                          {/* Task */}
                          <h4 className="text-sm font-medium">{task.name}</h4>
                          <div className="ml-6 text-sm">
                            {task.subtasks.map((subtask) => (
                              <p key={subtask.id}>
                                {subtask.name}{" "}
                                <span className="text-gray-500">
                                  ({subtask.points} Points)
                                </span>
                              </p>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
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
    // Organization Level
    if (!orgMap.has(item.organizationId)) {
      orgMap.set(item.organizationId, {
        name: item.organizationName,
        totalPoints: 0,
        projects: new Map(),
      });
    }
    const org = orgMap.get(item.organizationId)!;

    // Project Level
    if (!org.projects.has(item.projectId)) {
      org.projects.set(item.projectId, {
        name: item.projectName,
        totalPoints: 0,
        tasks: new Map(),
      });
    }
    const proj = org.projects.get(item.projectId)!;

    // Task Level
    if (!proj.tasks.has(item.taskId)) {
      proj.tasks.set(item.taskId, {
        name: item.taskName,
        subtasks: [],
      });
    }
    const task = proj.tasks.get(item.taskId)!;

    // Subtask Level
    task.subtasks.push({
      id: item.subtaskId,
      name: item.subtaskName,
      points: item.points,
    });

    // Update total points
    proj.totalPoints += item.points;
    org.totalPoints += item.points;
  });

  // Convert Maps to Arrays before returning
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
