import { format } from "date-fns";
import type { CalendarEntry, PracticeChecklistItem } from "@prisma/client";
import {
  completeCalendarEntryAction,
  deleteCalendarEntryAction,
  toggleChecklistItemAction,
} from "@/lib/actions/calendar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/cn";

type EntryWithChecklist = CalendarEntry & { checklist: PracticeChecklistItem[] };

export function EntryCard({ entry }: { entry: EntryWithChecklist }) {
  const isDone = Boolean(entry.completedAt);

  return (
    <div
      className={cn(
        "rounded-xl border p-3 text-sm",
        isDone ? "border-sage-200 bg-sage-50" : "border-card-border bg-card"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className={cn("font-medium text-foreground", isDone && "text-muted line-through")}>
            {entry.title}
          </p>
          <p className="text-xs text-muted">
            {format(entry.scheduledFor, "h:mm a")} · {entry.category}
          </p>
        </div>
        <Badge tone={entry.scope === "SHARED" ? "lavender" : "sage"}>{entry.pointsValue} pts</Badge>
      </div>

      {entry.description && <p className="mt-2 text-xs text-muted">{entry.description}</p>}

      {entry.checklist.length > 0 && (
        <ul className="mt-2 space-y-1">
          {entry.checklist.map((item) => (
            <li key={item.id}>
              <form action={toggleChecklistItemAction.bind(null, item.id)}>
                <button
                  type="submit"
                  className={cn(
                    "flex items-center gap-2 text-left text-xs",
                    item.completed ? "text-muted line-through" : "text-foreground"
                  )}
                >
                  <span>{item.completed ? "☑" : "☐"}</span>
                  {item.text}
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-3 flex gap-3">
        {!isDone && (
          <form action={completeCalendarEntryAction.bind(null, entry.id)}>
            <button type="submit" className="text-xs font-medium text-sage-700 hover:underline">
              Mark complete
            </button>
          </form>
        )}
        <form action={deleteCalendarEntryAction.bind(null, entry.id)}>
          <button type="submit" className="text-xs font-medium text-red-500 hover:underline">
            Delete
          </button>
        </form>
      </div>
    </div>
  );
}
