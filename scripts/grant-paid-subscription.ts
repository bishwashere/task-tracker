import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const email = process.argv[2];

if (!email) {
  console.error("Usage: pnpm grant-paid <email>");
  process.exit(1);
}

async function main() {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    console.error(`User not found: ${email}`);
    process.exit(1);
  }

  const now = new Date();
  const periodEnd = new Date(now);
  periodEnd.setFullYear(periodEnd.getFullYear() + 1);

  const subscription = await prisma.subscription.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      status: "active",
      planId: "plan:1",
      currentPeriodStart: now,
      currentPeriodEnd: periodEnd,
      subscriptionId: "manual-admin-grant",
    },
    update: {
      status: "active",
      planId: "plan:1",
      currentPeriodStart: now,
      currentPeriodEnd: periodEnd,
      subscriptionId: "manual-admin-grant",
    },
  });

  console.log(`Granted paid subscription to ${email}`);
  console.log(JSON.stringify(subscription, null, 2));
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
