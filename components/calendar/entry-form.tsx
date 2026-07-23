"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { createCalendarEntryAction } from "@/lib/actions/calendar";
import type { ActionState } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";

const PERSONAL_CATEGORIES = ["Exercise", "Meditation", "Journaling", "Reading", "Other"];
const SHARED_CATEGORIES = ["Date Night", "Fitness Goal", "Learning Together", "Home Project", "Wellness Routine", "Other"];

const initialState: ActionState = {};

export function EntryForm({
  scope,
  defaultDate,
  onDone,
}: {
  scope: "PERSONAL" | "SHARED";
  defaultDate: string;
  onDone: () => void;
}) {
  const [state, formAction, pending] = useActionState(createCalendarEntryAction, initialState);
  const [checklist, setChecklist] = useState<string[]>([""]);
  const wasPending = useRef(false);
  const categories = scope === "PERSONAL" ? PERSONAL_CATEGORIES : SHARED_CATEGORIES;

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
          Title
        </label>
        <input
          id="title"
          name="title"
          required
          className="w-full rounded-lg border border-card-border bg-cream-50 px-3 py-2 text-sm outline-none focus:border-sage-400"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-foreground" htmlFor="category">
            Category
          </label>
          <select
            id="category"
            name="category"
            className="w-full rounded-lg border border-card-border bg-cream-50 px-3 py-2 text-sm outline-none focus:border-sage-400"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-foreground" htmlFor="pointsValue">
            Points
          </label>
          <input
            id="pointsValue"
            name="pointsValue"
            type="number"
            min={1}
            max={100}
            defaultValue={10}
            className="w-full rounded-lg border border-card-border bg-cream-50 px-3 py-2 text-sm outline-none focus:border-sage-400"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-foreground" htmlFor="scheduledFor">
            Date &amp; time
          </label>
          <input
            id="scheduledFor"
            name="scheduledFor"
            type="datetime-local"
            required
            defaultValue={`${defaultDate}T09:00`}
            className="w-full rounded-lg border border-card-border bg-cream-50 px-3 py-2 text-sm outline-none focus:border-sage-400"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-foreground" htmlFor="recurrence">
            Repeats
          </label>
          <select
            id="recurrence"
            name="recurrence"
            className="w-full rounded-lg border border-card-border bg-cream-50 px-3 py-2 text-sm outline-none focus:border-sage-400"
          >
            <option value="NONE">Just once</option>
            <option value="DAILY">Daily</option>
            <option value="WEEKLY">Weekly</option>
          </select>
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-foreground" htmlFor="description">
          Notes (optional)
        </label>
        <textarea
          id="description"
          name="description"
          rows={2}
          className="w-full rounded-lg border border-card-border bg-cream-50 px-3 py-2 text-sm outline-none focus:border-sage-400"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-foreground">
          Practice checklist (optional)
        </label>
        <div className="space-y-2">
          {checklist.map((item, i) => (
            <input
              key={i}
              name="checklistItem"
              defaultValue={item}
              placeholder={`Step ${i + 1}`}
              className="w-full rounded-lg border border-card-border bg-cream-50 px-3 py-2 text-sm outline-none focus:border-sage-400"
            />
          ))}
        </div>
        <button
          type="button"
          onClick={() => setChecklist((c) => [...c, ""])}
          className="mt-2 text-sm font-medium text-sage-700 hover:underline"
        >
          + Add checklist item
        </button>
      </div>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="ghost" onClick={onDone}>
          Cancel
        </Button>
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Add to calendar"}
        </Button>
      </div>
    </form>
  );
}
