"use server";

import { z } from "zod";
import { addDays } from "date-fns";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/current-user";
import { generateSchedule } from "@/lib/claude";
import type { ActionState } from "@/lib/actions/auth";

const schema = z.object({
  scope: z.enum(["PERSONAL", "SHARED"]),
  vibeOrPrompt: z.string().trim().min(1, "Choose a vibe or describe what you want").max(300),
  rangeStart: z.string().min(1),
  rangeDays: z.coerce.number().int().min(1).max(30),
});

export async function autoGenerateScheduleAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const user = await getCurrentUser();

  const parsed = schema.safeParse({
    scope: formData.get("scope"),
    vibeOrPrompt: formData.get("vibeOrPrompt"),
    rangeStart: formData.get("rangeStart"),
    rangeDays: formData.get("rangeDays") || 7,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const data = parsed.data;

  if (data.scope === "SHARED" && !user.householdId) {
    return { error: "Pair with a partner before generating a shared plan." };
  }

  const rangeStart = new Date(data.rangeStart);
  if (Number.isNaN(rangeStart.getTime())) {
    return { error: "Invalid date range." };
  }
  rangeStart.setHours(0, 0, 0, 0);
  const rangeEnd = addDays(rangeStart, data.rangeDays - 1);
  rangeEnd.setHours(23, 59, 59, 999);

  let memberNames: string[] = [user.name];
  if (data.scope === "SHARED" && user.householdId) {
    const household = await prisma.household.findUnique({
      where: { id: user.householdId },
      include: { members: true },
    });
    memberNames = household?.members.map((m) => m.name) ?? memberNames;
  }

  const existing = await prisma.calendarEntry.findMany({
    where:
      data.scope === "PERSONAL"
        ? { scope: "PERSONAL", userId: user.id, scheduledFor: { gte: rangeStart, lte: rangeEnd } }
        : {
            scope: "SHARED",
            householdId: user.householdId,
            scheduledFor: { gte: rangeStart, lte: rangeEnd },
          },
    select: { title: true },
  });

  let proposed;
  try {
    proposed = await generateSchedule({
      scope: data.scope,
      vibeOrPrompt: data.vibeOrPrompt,
      rangeDays: data.rangeDays,
      memberNames,
      existingTitles: existing.map((e) => e.title),
    });
  } catch (err) {
    return {
      error:
        err instanceof Error ? err.message : "Couldn't reach the auto-generate service right now.",
    };
  }

  if (proposed.length === 0) {
    return { error: "No suggestions came back — try a different vibe or a more specific prompt." };
  }

  await prisma.$transaction(
    proposed.map((item) => {
      const [hours, minutes] = item.time.split(":").map(Number);
      const scheduledFor = addDays(rangeStart, item.dayOffset);
      scheduledFor.setHours(hours, minutes, 0, 0);

      return prisma.calendarEntry.create({
        data: {
          scope: data.scope,
          userId: data.scope === "PERSONAL" ? user.id : null,
          householdId: data.scope === "SHARED" ? user.householdId : null,
          title: item.title,
          category: item.category,
          scheduledFor,
          recurrence: "NONE",
          pointsValue: 10,
          createdByUserId: user.id,
          source: "AUTO_GENERATED",
          checklist: { create: item.practiceChecklist.map((text, order) => ({ text, order })) },
        },
      });
    })
  );

  revalidatePath(data.scope === "PERSONAL" ? "/calendar/personal" : "/calendar/shared");
  return {};
}
