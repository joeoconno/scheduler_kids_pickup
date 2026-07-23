import { getCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/db";
import { getUserPointsBalance, getHouseholdPointsBalance } from "@/lib/points";
import { Tabs } from "@/components/ui/tabs";
import { AddRewardButton } from "@/components/rewards/add-reward-button";
import { RewardCard } from "@/components/rewards/reward-card";
import { AppreciationForm } from "@/components/rewards/appreciation-form";

export default async function RewardsPage() {
  const user = await getCurrentUser();
  const personalBalance = await getUserPointsBalance(user.id);
  const personalRewards = await prisma.reward.findMany({
    where: { scope: "PERSONAL", userId: user.id },
    orderBy: { costPoints: "asc" },
  });

  let sharedRewards: Awaited<ReturnType<typeof prisma.reward.findMany>> = [];
  let sharedBalance = 0;
  let partnerName: string | null = null;

  if (user.householdId) {
    sharedBalance = await getHouseholdPointsBalance(user.householdId);
    sharedRewards = await prisma.reward.findMany({
      where: { scope: "SHARED", householdId: user.householdId },
      orderBy: { costPoints: "asc" },
    });
    const household = await prisma.household.findUnique({
      where: { id: user.householdId },
      include: { members: true },
    });
    partnerName = household?.members.find((m) => m.id !== user.id)?.name ?? null;
  }

  const personalContent = (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted">
          Balance: <span className="font-medium text-foreground">{personalBalance} pts</span>
        </p>
        <AddRewardButton scope="PERSONAL" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {personalRewards.map((r) => (
          <RewardCard
            key={r.id}
            reward={r}
            balance={personalBalance}
            isOwner={r.createdByUserId === user.id}
          />
        ))}
        {personalRewards.length === 0 && (
          <p className="text-sm text-muted">
            No personal rewards yet — add something you&apos;ll enjoy earning.
          </p>
        )}
      </div>
    </div>
  );

  const sharedContent = !user.householdId ? (
    <p className="text-sm text-muted">
      Pair with a partner to unlock shared rewards and appreciation.
    </p>
  ) : (
    <div className="space-y-4">
      {partnerName && <AppreciationForm partnerName={partnerName} />}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted">
          Shared balance: <span className="font-medium text-foreground">{sharedBalance} pts</span>
        </p>
        <AddRewardButton scope="SHARED" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {sharedRewards.map((r) => (
          <RewardCard
            key={r.id}
            reward={r}
            balance={sharedBalance}
            isOwner={r.createdByUserId === user.id}
          />
        ))}
        {sharedRewards.length === 0 && (
          <p className="text-sm text-muted">No shared rewards yet.</p>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl text-foreground">Rewards &amp; Appreciation</h1>
      <Tabs
        tabs={[
          { value: "personal", label: "Personal", content: personalContent },
          { value: "shared", label: "Shared", content: sharedContent },
        ]}
      />
    </div>
  );
}
