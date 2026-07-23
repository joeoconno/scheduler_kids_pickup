"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/current-user";
import { getUserPointsBalance, getHouseholdPointsBalance } from "@/lib/points";
import type { ActionState } from "@/lib/actions/auth";

const rewardSchema = z.object({
  scope: z.enum(["PERSONAL", "SHARED"]),
  title: z.string().trim().min(1, "Title is required").max(100),
  description: z.string().trim().max(300).optional(),
  costPoints: z.coerce.number().int().min(1, "Cost must be at least 1 point").max(10000),
});

export async function createRewardAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const user = await getCurrentUser();
  const parsed = rewardSchema.safeParse({
    scope: formData.get("scope"),
    title: formData.get("title"),
    description: formData.get("description") ?? undefined,
    costPoints: formData.get("costPoints"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const data = parsed.data;
  if (data.scope === "SHARED" && !user.householdId) {
    return { error: "Pair with a partner before adding a shared reward." };
  }

  await prisma.reward.create({
    data: {
      scope: data.scope,
      userId: data.scope === "PERSONAL" ? user.id : null,
      householdId: data.scope === "SHARED" ? user.householdId : null,
      title: data.title,
      description: data.description || null,
      costPoints: data.costPoints,
      createdByUserId: user.id,
    },
  });

  revalidatePath("/rewards");
  return {};
}

const redeemSchema = z.object({ rewardId: z.string().min(1) });

export async function redeemRewardAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const user = await getCurrentUser();
  const parsed = redeemSchema.safeParse({ rewardId: formData.get("rewardId") });
  if (!parsed.success) return { error: "Invalid reward" };

  const reward = await prisma.reward.findUnique({ where: { id: parsed.data.rewardId } });
  if (!reward) return { error: "That reward no longer exists." };

  const authorized =
    reward.scope === "PERSONAL"
      ? reward.userId === user.id
      : Boolean(user.householdId) && reward.householdId === user.householdId;
  if (!authorized) return { error: "Not authorized." };

  const balance =
    reward.scope === "PERSONAL"
      ? await getUserPointsBalance(user.id)
      : await getHouseholdPointsBalance(reward.householdId as string);

  if (balance < reward.costPoints) {
    return { error: `Not enough points yet — need ${reward.costPoints - balance} more.` };
  }

  await prisma.$transaction([
    prisma.pointsLedgerEntry.create({
      data: {
        userId: user.id,
        householdId: reward.householdId,
        points: -reward.costPoints,
        reason: `Redeemed "${reward.title}"`,
        sourceType: "REWARD_REDEEMED",
        sourceId: reward.id,
      },
    }),
    prisma.rewardRedemption.create({
      data: { rewardId: reward.id, redeemedByUserId: user.id },
    }),
  ]);

  revalidatePath("/rewards");
  return {};
}

export async function deleteRewardAction(rewardId: string) {
  const user = await getCurrentUser();
  const reward = await prisma.reward.findUnique({ where: { id: rewardId } });
  if (!reward || reward.createdByUserId !== user.id) return;
  await prisma.reward.delete({ where: { id: rewardId } });
  revalidatePath("/rewards");
}
