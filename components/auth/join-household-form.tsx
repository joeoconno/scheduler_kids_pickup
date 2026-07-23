"use client";

import { useActionState } from "react";
import { joinHouseholdAction } from "@/lib/actions/household";
import type { ActionState } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";

const initialState: ActionState = {};

export function JoinHouseholdForm() {
  const [state, formAction, pending] = useActionState(joinHouseholdAction, initialState);

  return (
    <form action={formAction} className="space-y-3">
      <div>
        <label className="mb-1 block text-sm font-medium text-foreground" htmlFor="inviteCode">
          Partner&apos;s invite code
        </label>
        <input
          id="inviteCode"
          name="inviteCode"
          required
          placeholder="ABC123"
          className="w-full rounded-lg border border-card-border bg-cream-50 px-3 py-2 text-sm uppercase tracking-widest outline-none focus:border-lavender-400"
        />
      </div>
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      <Button type="submit" variant="secondary" className="w-full" disabled={pending}>
        {pending ? "Joining…" : "Join household"}
      </Button>
    </form>
  );
}
