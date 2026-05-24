import { PrismaClient } from "@prisma/client";
import { slugifyProjectName } from "../src/lib/project-slug";

const prisma = new PrismaClient();

async function generateUniqueSlug(name: string, usedSlugs: Set<string>) {
  const base = slugifyProjectName(name);
  let slug = base;
  let suffix = 2;

  while (usedSlugs.has(slug)) {
    slug = `${base}-${suffix}`;
    suffix += 1;
  }

  usedSlugs.add(slug);
  return slug;
}

async function main() {
  const projects = await prisma.project.findMany({
    select: { id: true, name: true, slug: true },
    orderBy: { createdAt: "asc" },
  });

  const usedSlugs = new Set(
    projects.map((project) => project.slug).filter(Boolean) as string[],
  );

  let updated = 0;

  for (const project of projects) {
    if (project.slug) continue;

    const slug = await generateUniqueSlug(project.name, usedSlugs);
    await prisma.project.update({
      where: { id: project.id },
      data: { slug },
    });
    updated += 1;
    console.log(`${project.name} -> ${slug}`);
  }

  console.log(`Updated ${updated} project slugs.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
