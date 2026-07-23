"use client";

import { useActionState } from "react";
import { redeemRewardAction } from "@/lib/actions/rewards";
import type { ActionState } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";

const initialState: ActionState = {};

export function RedeemButton({ rewardId, canAfford }: { rewardId: string; canAfford: boolean }) {
  const [state, formAction, pending] = useActionState(redeemRewardAction, initialState);

  return (
    <form action={formAction} className="space-y-1">
      <input type="hidden" name="rewardId" value={rewardId} />
      <Button type="submit" size="sm" variant={canAfford ? "primary" : "outline"} disabled={pending}>
        {pending ? "Redeeming…" : "Redeem"}
      </Button>
      {state.error && <p className="text-xs text-red-600">{state.error}</p>}
    </form>
  );
}
