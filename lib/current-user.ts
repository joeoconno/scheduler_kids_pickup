import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

/**
 * Session JWTs cache householdId at sign-in time, so pairing/unpairing wouldn't
 * be reflected until the token refreshes. Read the live row instead whenever
 * household membership matters.
 */
export async function getCurrentUser() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) {
    redirect("/login");
  }

  return user;
}
