import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const LAUNCH_SPRINT_NAME = "Launch";
const DEFAULT_DURATION_DAYS = 7;

async function main() {
  const projects = await prisma.project.findMany({
    select: {
      id: true,
      name: true,
      tasks: {
        select: { id: true },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  let created = 0;
  let skipped = 0;

  for (const project of projects) {
    const activeSprint = await prisma.sprint.findFirst({
      where: { projectId: project.id, status: "ACTIVE" },
    });

    if (activeSprint) {
      console.log(`Skip (active sprint exists): ${project.name}`);
      skipped += 1;
      continue;
    }

    const existingLaunchSprint = await prisma.sprint.findFirst({
      where: { projectId: project.id, name: LAUNCH_SPRINT_NAME },
    });

    if (existingLaunchSprint) {
      console.log(`Skip (Launch Sprint already exists): ${project.name}`);
      skipped += 1;
      continue;
    }

    const sprintCount = await prisma.sprint.count({
      where: { projectId: project.id },
    });
    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + DEFAULT_DURATION_DAYS);

    const sprint = await prisma.sprint.create({
      data: {
        projectId: project.id,
        name: LAUNCH_SPRINT_NAME,
        sprintType: "LAUNCH",
        weekNumber: sprintCount + 1,
        durationDays: DEFAULT_DURATION_DAYS,
        taskIds: project.tasks.map((task) => task.id),
        startDate,
        endDate,
        status: "ACTIVE",
      },
    });

    created += 1;
    console.log(
      `Created Launch Sprint for "${project.name}" with ${project.tasks.length} task(s)`,
    );
    console.log(`  sprintId: ${sprint.id}`);
  }

  console.log(`\nDone. Created: ${created}, Skipped: ${skipped}, Total projects: ${projects.length}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
