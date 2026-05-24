export function slugifyProjectName(name: string) {
  const slug = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || "project";
}

export function isMongoObjectId(value: string) {
  return /^[a-f0-9]{24}$/i.test(value);
}

export function getProjectTasksPath(slug: string) {
  return `/project/${slug}/tasks`;
}
