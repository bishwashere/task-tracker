import React from "react";
import ProjectPage from "./_components";
import { Metadata, ResolvingMetadata } from "next";
import { ProjectContextProvider } from "./_context";

export async function generateMetadata(parent: ResolvingMetadata): Promise<Metadata> {
  return {
    title: "Pending tasks and subtasks | azent.io",
    description: "",
    openGraph: {
      title: "Pending tasks and subtasks | azent.io",
      description: "",
      images: [
        {
          url: "https://www.azent.io/logo.png",
          alt: "azent.io",
        }
      ]
    },
    twitter: {
      card: "summary_large_image",
      title: "Pending tasks and subtasks | azent.io",
      description: "",
      images: [
        {
          url: "https://www.azent.io/logo.png",
          alt: "azent.io",
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
