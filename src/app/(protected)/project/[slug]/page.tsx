import { redirect } from "next/navigation";
import { getProjectTasksPath, isMongoObjectId } from "@/lib/project-slug";
import { getProjectById } from "@/queries/project/action";

export default async function ProjectRedirectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const res = await getProjectById(slug, { skipCleanup: true });

  if (!res.success || !res.project?.slug) {
    redirect("/dashboard");
  }

  if (isMongoObjectId(slug) && slug !== res.project.slug) {
    redirect(getProjectTasksPath(res.project.slug));
  }

  redirect(getProjectTasksPath(res.project.slug));
}
