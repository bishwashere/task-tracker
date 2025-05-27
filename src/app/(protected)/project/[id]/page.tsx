import React from "react";
import ProjectPage from "./_components";
import { Metadata } from "next";
import { ProjectContextProvider } from "./_context";

export const metadata: Metadata = {
  title: "Azent.io | Streamlined Task Mastery",
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
