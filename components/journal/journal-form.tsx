"use client";

import { useActionState } from "react";
import { submitJournalEntryAction } from "@/lib/actions/journal";
import type { ActionState } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import type { JournalEntry } from "@prisma/client";

const initialState: ActionState = {};

export function JournalForm({ existing }: { existing: JournalEntry | null }) {
  const [state, formAction, pending] = useActionState(submitJournalEntryAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-foreground" htmlFor="gratitude">
          What am I grateful for today?
        </label>
        <textarea
          id="gratitude"
          name="gratitude"
          rows={2}
          required
          defaultValue={existing?.gratitude}
          className="w-full rounded-lg border border-card-border bg-cream-50 px-3 py-2 text-sm outline-none focus:border-sage-400"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-foreground" htmlFor="showedUp">
          How did I show up for my goals or my partner today?
        </label>
        <textarea
          id="showedUp"
          name="showedUp"
          rows={2}
          required
          defaultValue={existing?.showedUp}
          className="w-full rounded-lg border border-card-border bg-cream-50 px-3 py-2 text-sm outline-none focus:border-sage-400"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-foreground" htmlFor="win">
            One small win
          </label>
          <textarea
            id="win"
            name="win"
            rows={2}
            required
            defaultValue={existing?.win}
            className="w-full rounded-lg border border-card-border bg-cream-50 px-3 py-2 text-sm outline-none focus:border-sage-400"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-foreground" htmlFor="growthArea">
            One area for growth
          </label>
          <textarea
            id="growthArea"
            name="growthArea"
            rows={2}
            required
            defaultValue={existing?.growthArea}
            className="w-full rounded-lg border border-card-border bg-cream-50 px-3 py-2 text-sm outline-none focus:border-sage-400"
          />
        </div>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-foreground" htmlFor="photoUrl">
          Photo link (optional)
        </label>
        <input
          id="photoUrl"
          name="photoUrl"
          type="url"
          placeholder="https://…"
          defaultValue={existing?.photoUrl ?? undefined}
          className="w-full rounded-lg border border-card-border bg-cream-50 px-3 py-2 text-sm outline-none focus:border-sage-400"
        />
      </div>
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : existing ? "Update today's reflection" : "Save today's reflection"}
      </Button>
    </form>
  );
}
