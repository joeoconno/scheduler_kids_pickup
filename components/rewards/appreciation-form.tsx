"use client";

import { useActionState, useEffect, useRef } from "react";
import { giveAppreciationAction } from "@/lib/actions/appreciation";
import type { ActionState } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const initialState: ActionState = {};

export function AppreciationForm({ partnerName }: { partnerName: string }) {
  const [state, formAction, pending] = useActionState(giveAppreciationAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const wasPending = useRef(false);

  useEffect(() => {
    if (wasPending.current && !pending && !state.error) {
      formRef.current?.reset();
    }
    wasPending.current = pending;
  }, [pending, state.error]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Give appreciation</CardTitle>
        <CardDescription>Send {partnerName} bonus points for showing up for you.</CardDescription>
      </CardHeader>
      <CardContent>
        <form ref={formRef} action={formAction} className="flex flex-wrap items-end gap-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground" htmlFor="points">
              Points
            </label>
            <input
              id="points"
              name="points"
              type="number"
              min={1}
              defaultValue={10}
              className="w-24 rounded-lg border border-card-border bg-cream-50 px-3 py-2 text-sm outline-none focus:border-lavender-400"
            />
          </div>
          <div className="flex-1 min-w-[10rem]">
            <label className="mb-1 block text-sm font-medium text-foreground" htmlFor="note">
              Note (optional)
            </label>
            <input
              id="note"
              name="note"
              placeholder="Thanks for making dinner ❤"
              className="w-full rounded-lg border border-card-border bg-cream-50 px-3 py-2 text-sm outline-none focus:border-lavender-400"
            />
          </div>
          <Button type="submit" variant="secondary" disabled={pending}>
            {pending ? "Sending…" : "Send"}
          </Button>
        </form>
        {state.error && <p className="mt-2 text-sm text-red-600">{state.error}</p>}
      </CardContent>
    </Card>
  );
}
