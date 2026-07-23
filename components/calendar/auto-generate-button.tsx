"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { autoGenerateScheduleAction } from "@/lib/actions/auto-generate";
import type { ActionState } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { VIBES } from "@/lib/claude";

const initialState: ActionState = {};

function AutoGenerateForm({
  scope,
  rangeStart,
  onDone,
}: {
  scope: "PERSONAL" | "SHARED";
  rangeStart: string;
  onDone: () => void;
}) {
  const [state, formAction, pending] = useActionState(autoGenerateScheduleAction, initialState);
  const [vibe, setVibe] = useState<string>(VIBES[0]);
  const [custom, setCustom] = useState("");
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
      <input type="hidden" name="rangeStart" value={rangeStart} />
      <input
        type="hidden"
        name="vibeOrPrompt"
        value={custom.trim() ? custom : vibe}
      />

      <div>
        <p className="mb-2 text-sm font-medium text-foreground">Pick a vibe</p>
        <div className="flex flex-wrap gap-2">
          {VIBES.map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => {
                setVibe(v);
                setCustom("");
              }}
              className={`rounded-full border px-3 py-1 text-sm transition-colors ${
                vibe === v && !custom
                  ? "border-lavender-400 bg-lavender-100 text-lavender-800"
                  : "border-card-border bg-card text-muted hover:text-foreground"
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-foreground" htmlFor="custom">
          Or describe what you want
        </label>
        <textarea
          id="custom"
          rows={2}
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          placeholder="e.g. Light week, we're both traveling for work"
          className="w-full rounded-lg border border-card-border bg-cream-50 px-3 py-2 text-sm outline-none focus:border-lavender-400"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-foreground" htmlFor="rangeDays">
          Length
        </label>
        <select
          id="rangeDays"
          name="rangeDays"
          defaultValue={7}
          className="w-full rounded-lg border border-card-border bg-cream-50 px-3 py-2 text-sm outline-none focus:border-lavender-400"
        >
          <option value={7}>One week</option>
          <option value={30}>One month</option>
        </select>
      </div>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="ghost" onClick={onDone}>
          Cancel
        </Button>
        <Button type="submit" variant="secondary" disabled={pending}>
          {pending ? "Generating…" : "Generate schedule"}
        </Button>
      </div>
    </form>
  );
}

export function AutoGenerateButton({
  scope,
  rangeStart,
}: {
  scope: "PERSONAL" | "SHARED";
  rangeStart: string;
}) {
  return (
    <Modal
      trigger={
        <Button variant="secondary" size="sm">
          ✦ Auto-generate
        </Button>
      }
      title="Auto-generate schedule"
      description="Claude will propose a batch of entries you can then edit or remove."
    >
      {(close) => <AutoGenerateForm scope={scope} rangeStart={rangeStart} onDone={close} />}
    </Modal>
  );
}
