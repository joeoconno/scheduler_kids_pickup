import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { addDays, subDays } from "date-fns";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("password123", 10);

  const household = await prisma.household.upsert({
    where: { inviteCode: "DEMO01" },
    update: {},
    create: { inviteCode: "DEMO01" },
  });

  const alex = await prisma.user.upsert({
    where: { email: "alex@example.com" },
    update: {},
    create: { email: "alex@example.com", name: "Alex", passwordHash, householdId: household.id },
  });

  const sam = await prisma.user.upsert({
    where: { email: "sam@example.com" },
    update: {},
    create: { email: "sam@example.com", name: "Sam", passwordHash, householdId: household.id },
  });

  const today = new Date();
  today.setHours(9, 0, 0, 0);

  for (let i = 0; i < 5; i++) {
    const date = subDays(today, i);
    const completed = i > 0;
    await prisma.calendarEntry.upsert({
      where: { id: `seed-personal-${i}` },
      update: {},
      create: {
        id: `seed-personal-${i}`,
        scope: "PERSONAL",
        userId: alex.id,
        title: "Morning meditation",
        category: "Meditation",
        scheduledFor: date,
        pointsValue: 10,
        createdByUserId: alex.id,
        completedAt: completed ? date : null,
        completedByUserId: completed ? alex.id : null,
        checklist: {
          create: [
            { text: "Find a quiet spot", order: 0 },
            { text: "Breathe for 5 minutes", order: 1 },
          ],
        },
      },
    });

    if (completed) {
      await prisma.pointsLedgerEntry.upsert({
        where: { id: `seed-ledger-personal-${i}` },
        update: {},
        create: {
          id: `seed-ledger-personal-${i}`,
          userId: alex.id,
          points: 10,
          reason: 'Completed "Morning meditation"',
          sourceType: "PRACTICE_COMPLETE",
          sourceId: `seed-personal-${i}`,
        },
      });
    }
  }

  await prisma.calendarEntry.upsert({
    where: { id: "seed-shared-0" },
    update: {},
    create: {
      id: "seed-shared-0",
      scope: "SHARED",
      householdId: household.id,
      title: "Date night: cook together",
      category: "Date Night",
      scheduledFor: addDays(today, 1),
      pointsValue: 20,
      createdByUserId: alex.id,
      checklist: { create: [{ text: "Pick a recipe together", order: 0 }] },
    },
  });

  await prisma.reward.upsert({
    where: { id: "seed-reward-0" },
    update: {},
    create: {
      id: "seed-reward-0",
      scope: "PERSONAL",
      userId: alex.id,
      title: "Favorite coffee treat",
      costPoints: 20,
      createdByUserId: alex.id,
    },
  });

  await prisma.reward.upsert({
    where: { id: "seed-reward-1" },
    update: {},
    create: {
      id: "seed-reward-1",
      scope: "SHARED",
      householdId: household.id,
      title: "Weekend hike together",
      costPoints: 60,
      createdByUserId: sam.id,
    },
  });

  console.log("Seeded demo household with alex@example.com / sam@example.com (password123)");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
