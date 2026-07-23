"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/current-user";
import type { ActionState } from "@/lib/actions/auth";

function generateInviteCode(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no O/0/I/1 ambiguity
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return code;
}

export async function createHouseholdAction(_formData: FormData): Promise<void> {
  const user = await getCurrentUser();
  if (user.householdId) return;

  let household;
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      household = await prisma.household.create({ data: { inviteCode: generateInviteCode() } });
      break;
    } catch {
      // invite code collision, retry
    }
  }
  if (!household) return;

  await prisma.user.update({ where: { id: user.id }, data: { householdId: household.id } });
  revalidatePath("/pair");
}

export async function joinHouseholdAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const user = await getCurrentUser();
  if (user.householdId) {
    return { error: "You're already part of a household." };
  }

  const code = String(formData.get("inviteCode") ?? "")
    .trim()
    .toUpperCase();
  if (!code) {
    return { error: "Enter an invite code." };
  }

  const household = await prisma.household.findUnique({
    where: { inviteCode: code },
    include: { members: true },
  });

  if (!household) {
    return { error: "We couldn't find a household with that invite code." };
  }
  if (household.members.length >= 2) {
    return { error: "That household already has two members." };
  }

  await prisma.user.update({ where: { id: user.id }, data: { householdId: household.id } });
  redirect("/dashboard");
}
