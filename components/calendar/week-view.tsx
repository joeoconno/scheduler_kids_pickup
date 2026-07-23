import { format, isSameDay } from "date-fns";
import type { CalendarEntry, PracticeChecklistItem } from "@prisma/client";
import { EntryCard } from "@/components/calendar/entry-card";
import { DayAddButton } from "@/components/calendar/day-add-button";
import { dayKey } from "@/lib/week";
import { cn } from "@/lib/cn";

type EntryWithChecklist = CalendarEntry & { checklist: PracticeChecklistItem[] };

export function WeekView({
  scope,
  days,
  entries,
}: {
  scope: "PERSONAL" | "SHARED";
  days: Date[];
  entries: EntryWithChecklist[];
}) {
  const today = new Date();

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-7">
      {days.map((day) => {
        const dayEntries = entries
          .filter((e) => isSameDay(e.scheduledFor, day))
          .sort((a, b) => a.scheduledFor.getTime() - b.scheduledFor.getTime());

        return (
          <div key={dayKey(day)} className="min-w-0">
            <div className="mb-2 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted">
                  {format(day, "EEE")}
                </p>
                <p
                  className={cn(
                    "font-display text-lg",
                    isSameDay(day, today) ? "text-sage-700" : "text-foreground"
                  )}
                >
                  {format(day, "d")}
                </p>
              </div>
              <DayAddButton scope={scope} dateKey={dayKey(day)} />
            </div>
            <div className="space-y-2">
              {dayEntries.map((entry) => (
                <EntryCard key={entry.id} entry={entry} />
              ))}
              {dayEntries.length === 0 && (
                <p className="rounded-xl border border-dashed border-card-border p-3 text-center text-xs text-muted">
                  Nothing scheduled
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
