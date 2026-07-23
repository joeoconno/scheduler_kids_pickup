import Link from "next/link";
import { getCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/db";
import { createHouseholdAction } from "@/lib/actions/household";
import { Button } from "@/components/ui/button";
import { LinkButton } from "@/components/ui/link-button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { JoinHouseholdForm } from "@/components/auth/join-household-form";

export default async function PairPage() {
  const user = await getCurrentUser();

  if (user.householdId) {
    const household = await prisma.household.findUnique({
      where: { id: user.householdId },
      include: { members: true },
    });
    const partner = household?.members.find((m) => m.id !== user.id);

    return (
      <Card>
        <CardHeader>
          <CardTitle>You&apos;re all set</CardTitle>
          <CardDescription>
            {partner
              ? `You're paired with ${partner.name}.`
              : "Share this invite code with your partner so they can join you."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!partner && household && (
            <p className="rounded-lg bg-lavender-50 px-4 py-3 text-center font-display text-2xl tracking-[0.3em] text-lavender-700">
              {household.inviteCode}
            </p>
          )}
          <LinkButton href="/dashboard" className="w-full">
            Continue to dashboard
          </LinkButton>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Create a household</CardTitle>
          <CardDescription>Start a shared space and invite your partner later.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={createHouseholdAction}>
            <Button type="submit" className="w-full">
              Create household
            </Button>
          </form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Join a household</CardTitle>
          <CardDescription>Already have a code from your partner? Enter it here.</CardDescription>
        </CardHeader>
        <CardContent>
          <JoinHouseholdForm />
        </CardContent>
      </Card>
      <p className="text-center text-sm text-muted">
        Prefer to go solo for now?{" "}
        <Link href="/dashboard" className="font-medium text-sage-700 hover:underline">
          Skip pairing
        </Link>
      </p>
    </div>
  );
}
