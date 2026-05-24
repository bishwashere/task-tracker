import React from "react";
import { redirect } from "next/navigation";
import ProjectPage from "./_components";
import { Metadata } from "next";
import { ProjectContextProvider } from "./_context";
import { getProjectTasksPath, isMongoObjectId } from "@/lib/project-slug";
import { getProjectById } from "@/queries/project/action";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Pending tasks and subtasks | taskmentor.io",
    description: "",
    openGraph: {
      title: "Pending tasks and subtasks | taskmentor.io",
      description: "",
      images: [
        {
          url: "https://taskmentor.io/logo.png",
          alt: "taskmentor.io",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "Pending tasks and subtasks | taskmentor.io",
      description: "",
      images: [
        {
          url: "https://taskmentor.io/logo.png",
          alt: "taskmentor.io",
        },
      ],
    },
  };
}

const ProjectTasksPage = async ({
  params,
}: {
  params: Promise<{ slug: string }>;
}) => {
  const { slug } = await params;
  const res = await getProjectById(slug, { skipCleanup: true });

  if (res.success && res.project?.slug && isMongoObjectId(slug) && slug !== res.project.slug) {
    redirect(getProjectTasksPath(res.project.slug));
  }

  return (
    <ProjectContextProvider>
      <ProjectPage />
    </ProjectContextProvider>
  );
};

export default ProjectTasksPage;
