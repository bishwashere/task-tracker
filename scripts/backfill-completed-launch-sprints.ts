import { PrismaClient, SprintStatus, SprintType } from "@prisma/client";

const prisma = new PrismaClient();

const LAUNCH_SPRINT_NAME = "Launch";
const DEFAULT_DURATION_DAYS = 7;

function isDoneTask(task: { subtasks: { status: string }[] }) {
  if (task.subtasks.length === 0) return false;
  return task.subtasks.every((subtask) => subtask.status === "done");
}

function todayRange() {
  const endDate = new Date();
  endDate.setHours(23, 59, 59, 999);

  const startDate = new Date(endDate);
  startDate.setDate(startDate.getDate() - DEFAULT_DURATION_DAYS);
  startDate.setHours(0, 0, 0, 0);

  return { startDate, endDate };
}

async function main() {
  const { startDate, endDate } = todayRange();

  const projects = await prisma.project.findMany({
    select: {
      id: true,
      name: true,
      tasks: {
        select: {
          id: true,
          subtasks: { select: { status: true } },
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  let created = 0;
  let updated = 0;

  for (const project of projects) {
    const doneTaskIds = project.tasks.filter(isDoneTask).map((task) => task.id);

    const existingLaunch = await prisma.sprint.findFirst({
      where: {
        projectId: project.id,
        OR: [
          { name: LAUNCH_SPRINT_NAME },
          { name: "Launch Sprint" },
          { sprintType: SprintType.LAUNCH },
        ],
      },
      orderBy: { createdAt: "asc" },
    });

    if (existingLaunch) {
      await prisma.sprint.update({
        where: { id: existingLaunch.id },
        data: {
          name: LAUNCH_SPRINT_NAME,
          sprintType: SprintType.LAUNCH,
          status: SprintStatus.COMPLETED,
          taskIds: doneTaskIds,
          startDate,
          endDate,
          durationDays: DEFAULT_DURATION_DAYS,
        },
      });
      updated += 1;
      console.log(
        `Updated Launch for "${project.name}" — ${doneTaskIds.length} done task(s), ended today`,
      );
      continue;
    }

    const sprintCount = await prisma.sprint.count({ where: { projectId: project.id } });

    await prisma.sprint.create({
      data: {
        projectId: project.id,
        name: LAUNCH_SPRINT_NAME,
        sprintType: SprintType.LAUNCH,
        weekNumber: sprintCount + 1,
        durationDays: DEFAULT_DURATION_DAYS,
        taskIds: doneTaskIds,
        startDate,
        endDate,
        status: SprintStatus.COMPLETED,
      },
    });

    created += 1;
    console.log(
      `Created completed Launch for "${project.name}" — ${doneTaskIds.length} done task(s), ended today`,
    );
  }

  const remainingActive = await prisma.sprint.updateMany({
    where: { status: SprintStatus.ACTIVE },
    data: {
      status: SprintStatus.COMPLETED,
      endDate,
    },
  });

  console.log(
    `\nDone. Created: ${created}, Updated: ${updated}, Closed remaining active sprints: ${remainingActive.count}, Total projects: ${projects.length}`,
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
