"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/current-user";
import type { ActionState } from "@/lib/actions/auth";

const schema = z.object({
  points: z.coerce.number().int().min(1, "Give at least 1 point").max(500),
  note: z.string().trim().max(200).optional(),
});

export async function giveAppreciationAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user.householdId) {
    return { error: "Pair with a partner before sending appreciation." };
  }

  const parsed = schema.safeParse({
    points: formData.get("points"),
    note: formData.get("note") ?? undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const household = await prisma.household.findUnique({
    where: { id: user.householdId },
    include: { members: true },
  });
  const partner = household?.members.find((m) => m.id !== user.id);
  if (!partner) {
    return { error: "Your partner hasn't joined yet." };
  }

  await prisma.$transaction([
    prisma.appreciationLog.create({
      data: {
        householdId: user.householdId,
        fromUserId: user.id,
        toUserId: partner.id,
        points: parsed.data.points,
        note: parsed.data.note || null,
      },
    }),
    prisma.pointsLedgerEntry.create({
      data: {
        userId: partner.id,
        householdId: user.householdId,
        points: parsed.data.points,
        reason: parsed.data.note
          ? `Appreciation from ${user.name}: ${parsed.data.note}`
          : `Appreciation from ${user.name}`,
        sourceType: "APPRECIATION_RECEIVED",
      },
    }),
  ]);

  revalidatePath("/rewards");
  return {};
}
