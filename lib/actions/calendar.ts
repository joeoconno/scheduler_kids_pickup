"use server";

import { z } from "zod";
import { addDays } from "date-fns";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/current-user";
import type { ActionState } from "@/lib/actions/auth";

const RECURRENCE_OCCURRENCES = 8;

const createEntrySchema = z.object({
  scope: z.enum(["PERSONAL", "SHARED"]),
  title: z.string().trim().min(1, "Title is required").max(120),
  description: z.string().trim().max(500).optional(),
  category: z.string().trim().min(1, "Pick a category").max(40),
  scheduledFor: z.string().min(1, "Pick a date & time"),
  recurrence: z.enum(["NONE", "DAILY", "WEEKLY"]),
  pointsValue: z.coerce.number().int().min(1).max(100),
});

function pathForScope(scope: "PERSONAL" | "SHARED") {
  return scope === "PERSONAL" ? "/calendar/personal" : "/calendar/shared";
}

export async function createCalendarEntryAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const user = await getCurrentUser();
  const checklist = formData
    .getAll("checklistItem")
    .map((v) => String(v).trim())
    .filter(Boolean);

  const parsed = createEntrySchema.safeParse({
    scope: formData.get("scope"),
    title: formData.get("title"),
    description: formData.get("description") ?? undefined,
    category: formData.get("category"),
    scheduledFor: formData.get("scheduledFor"),
    recurrence: formData.get("recurrence"),
    pointsValue: formData.get("pointsValue") || 10,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const data = parsed.data;

  if (data.scope === "SHARED" && !user.householdId) {
    return { error: "Pair with a partner before adding shared goals." };
  }

  const baseDate = new Date(data.scheduledFor);
  if (Number.isNaN(baseDate.getTime())) {
    return { error: "Enter a valid date & time." };
  }

  const occurrences = data.recurrence === "NONE" ? 1 : RECURRENCE_OCCURRENCES;
  const stepDays = data.recurrence === "WEEKLY" ? 7 : 1;
  const dates = Array.from({ length: occurrences }, (_, i) => addDays(baseDate, i * stepDays));

  await prisma.$transaction(
    dates.map((date) =>
      prisma.calendarEntry.create({
        data: {
          scope: data.scope,
          userId: data.scope === "PERSONAL" ? user.id : null,
          householdId: data.scope === "SHARED" ? user.householdId : null,
          title: data.title,
          description: data.description || null,
          category: data.category,
          scheduledFor: date,
          recurrence: data.recurrence,
          pointsValue: data.pointsValue,
          createdByUserId: user.id,
          checklist: {
            create: checklist.map((text, order) => ({ text, order })),
          },
        },
      })
    )
  );

  revalidatePath(pathForScope(data.scope));
  return {};
}

export async function completeCalendarEntryAction(entryId: string) {
  const user = await getCurrentUser();
  const entry = await prisma.calendarEntry.findUnique({ where: { id: entryId } });
  if (!entry) return;

  const authorized =
    entry.scope === "PERSONAL"
      ? entry.userId === user.id
      : Boolean(user.householdId) && entry.householdId === user.householdId;
  if (!authorized || entry.completedAt) return;

  await prisma.$transaction([
    prisma.calendarEntry.update({
      where: { id: entryId },
      data: { completedAt: new Date(), completedByUserId: user.id },
    }),
    prisma.pointsLedgerEntry.create({
      data: {
        userId: user.id,
        householdId: entry.householdId,
        points: entry.pointsValue,
        reason: `Completed "${entry.title}"`,
        sourceType: entry.scope === "SHARED" ? "SHARED_GOAL_COMPLETE" : "PRACTICE_COMPLETE",
        sourceId: entry.id,
      },
    }),
  ]);

  revalidatePath(pathForScope(entry.scope));
  revalidatePath("/dashboard");
}

export async function deleteCalendarEntryAction(entryId: string) {
  const user = await getCurrentUser();
  const entry = await prisma.calendarEntry.findUnique({ where: { id: entryId } });
  if (!entry) return;

  const authorized =
    entry.scope === "PERSONAL"
      ? entry.userId === user.id
      : Boolean(user.householdId) && entry.householdId === user.householdId;
  if (!authorized) return;

  await prisma.calendarEntry.delete({ where: { id: entryId } });
  revalidatePath(pathForScope(entry.scope));
}

export async function toggleChecklistItemAction(itemId: string) {
  const user = await getCurrentUser();
  const item = await prisma.practiceChecklistItem.findUnique({
    where: { id: itemId },
    include: { calendarEntry: true },
  });
  if (!item) return;

  const entry = item.calendarEntry;
  const authorized =
    entry.scope === "PERSONAL"
      ? entry.userId === user.id
      : Boolean(user.householdId) && entry.householdId === user.householdId;
  if (!authorized) return;

  await prisma.practiceChecklistItem.update({
    where: { id: itemId },
    data: { completed: !item.completed },
  });

  revalidatePath(pathForScope(entry.scope));
}
