"use client";

import { useActionState, useEffect, useRef } from "react";
import { createRewardAction } from "@/lib/actions/rewards";
import type { ActionState } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";

const initialState: ActionState = {};

export function CreateRewardForm({
  scope,
  onDone,
}: {
  scope: "PERSONAL" | "SHARED";
  onDone: () => void;
}) {
  const [state, formAction, pending] = useActionState(createRewardAction, initialState);
  const wasPending = useRef(false);

  useEffect(() => {
    if (wasPending.current && !pending && !state.error) {
      onDone();
    }
    wasPending.current = pending;
  }, [pending, state.error, onDone]);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="scope" value={scope} />
      <div>
        <label className="mb-1 block text-sm font-medium text-foreground" htmlFor="title">
          Reward
        </label>
        <input
          id="title"
          name="title"
          required
          placeholder={scope === "PERSONAL" ? "A favorite treat" : "A special date night"}
          className="w-full rounded-lg border border-card-border bg-cream-50 px-3 py-2 text-sm outline-none focus:border-sage-400"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-foreground" htmlFor="description">
          Details (optional)
        </label>
        <input
          id="description"
          name="description"
          className="w-full rounded-lg border border-card-border bg-cream-50 px-3 py-2 text-sm outline-none focus:border-sage-400"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-foreground" htmlFor="costPoints">
          Cost in points
        </label>
        <input
          id="costPoints"
          name="costPoints"
          type="number"
          min={1}
          defaultValue={50}
          className="w-full rounded-lg border border-card-border bg-cream-50 px-3 py-2 text-sm outline-none focus:border-sage-400"
        />
      </div>
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="ghost" onClick={onDone}>
          Cancel
        </Button>
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Add reward"}
        </Button>
      </div>
    </form>
  );
}
