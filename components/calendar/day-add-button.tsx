"use client";

import { Modal } from "@/components/ui/modal";
import { EntryForm } from "@/components/calendar/entry-form";

export function DayAddButton({
  scope,
  dateKey,
}: {
  scope: "PERSONAL" | "SHARED";
  dateKey: string;
}) {
  return (
    <Modal
      trigger={
        <button
          type="button"
          className="rounded-full border border-card-border px-2 py-0.5 text-sm text-muted hover:bg-sage-50 hover:text-sage-700"
        >
          +
        </button>
      }
      title={scope === "PERSONAL" ? "New personal practice" : "New shared goal"}
    >
      {(close) => <EntryForm scope={scope} defaultDate={dateKey} onDone={close} />}
    </Modal>
  );
}
