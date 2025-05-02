"use client";
import Loading from "@/components/ui/loading";
import { useGetProjectById } from "@/queries/project/hooks";
import { useParams } from "next/navigation";
import React from "react";
import ProjectPage from "./_components";
import Link from "next/link";
import { ProjectContextProvider } from "./_context";

const Project = () => {
  const { id } = useParams() as {
    id: string;
  };
  const project = useGetProjectById(id);

  if (project.isLoading) {
    return <Loading />;
  }

  if (project.isSuccess && project.data) {
    return (
      <ProjectContextProvider>
        <ProjectPage />
      </ProjectContextProvider>
    );
  } else {
    return (
      <div className="w-screen h-screen flex flex-col items-center justify-center gap-3 p-4 mx-auto max-w-md">
        <p className="text-3xl font-semibold text-left w-full">Error :(</p>
        <p className="text-xl font-semibold mt-2 text-left w-full">
          Possible reasons: <br /> <br /> 1. You are not part of this
          organization. <br /> 2. You do not have access to this project. <br />{" "}
          3. Project not found. <br /> 4. Unauthorized.
        </p>
        <Link
          href="/dashboard"
          className="text-white text-lg bg-blue-600 px-4 py-2 rounded-xl mt-10"
        >
          Go to Dashboard
        </Link>
      </div>
    );
  }
};

export default Project;
