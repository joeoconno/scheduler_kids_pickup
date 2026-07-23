"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/current-user";
import type { ActionState } from "@/lib/actions/auth";

const schema = z.object({
  gratitude: z.string().trim().min(1, "Share at least a word of gratitude").max(1000),
  showedUp: z.string().trim().min(1, "Tell us how you showed up today").max(1000),
  win: z.string().trim().min(1, "Name one small win").max(1000),
  growthArea: z.string().trim().min(1, "Name one area for growth").max(1000),
  photoUrl: z.string().trim().max(500).optional(),
});

export async function submitJournalEntryAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const user = await getCurrentUser();
  const parsed = schema.safeParse({
    gratitude: formData.get("gratitude"),
    showedUp: formData.get("showedUp"),
    win: formData.get("win"),
    growthArea: formData.get("growthArea"),
    photoUrl: formData.get("photoUrl") ?? undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const { photoUrl, ...rest } = parsed.data;

  await prisma.journalEntry.upsert({
    where: { userId_date: { userId: user.id, date: today } },
    update: { ...rest, photoUrl: photoUrl || null },
    create: { userId: user.id, date: today, ...rest, photoUrl: photoUrl || null },
  });

  revalidatePath("/journal");
  return {};
}
