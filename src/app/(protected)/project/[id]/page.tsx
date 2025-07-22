import React from "react";
import ProjectPage from "./_components";
import { Metadata, ResolvingMetadata } from "next";
import { ProjectContextProvider } from "./_context";

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
        }
      ]
    },
    twitter: {
      card: "summary_large_image",
      title: "Pending tasks and subtasks | taskmentor.io",
      description: "",
      images: [
        {
          url: "https://taskmentor.io/logo.png",
          alt: "taskmentor.io",
        }
      ]
    },
  }
};

const Project = async ({ params, }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;

  return (
    <ProjectContextProvider>
      <ProjectPage id={id} />
    </ProjectContextProvider>
  )
};

export default Project;
