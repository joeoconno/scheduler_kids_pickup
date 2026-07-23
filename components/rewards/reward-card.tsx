import type { Reward } from "@prisma/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RedeemButton } from "@/components/rewards/redeem-button";
import { deleteRewardAction } from "@/lib/actions/rewards";

export function RewardCard({
  reward,
  balance,
  isOwner,
}: {
  reward: Reward;
  balance: number;
  isOwner: boolean;
}) {
  const canAfford = balance >= reward.costPoints;

  return (
    <Card>
      <CardContent className="flex items-start justify-between gap-3">
        <div>
          <p className="font-medium text-foreground">{reward.title}</p>
          {reward.description && <p className="mt-1 text-sm text-muted">{reward.description}</p>}
          <Badge tone={reward.scope === "SHARED" ? "lavender" : "sage"} className="mt-2">
            {reward.costPoints} pts
          </Badge>
        </div>
        <div className="flex flex-col items-end gap-2">
          <RedeemButton rewardId={reward.id} canAfford={canAfford} />
          {isOwner && (
            <form action={deleteRewardAction.bind(null, reward.id)}>
              <button type="submit" className="text-xs text-muted hover:text-red-500">
                Remove
              </button>
            </form>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
