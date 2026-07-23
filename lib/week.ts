import { startOfWeek, endOfWeek, addWeeks, addDays, format } from "date-fns";

export interface WeekRange {
  start: Date;
  end: Date;
  days: Date[];
  label: string;
  prevParam: string;
  nextParam: string;
  isoParam: string;
}

export function getWeekRange(weekParam?: string): WeekRange {
  const anchor = weekParam ? new Date(weekParam) : new Date();
  const base = Number.isNaN(anchor.getTime()) ? new Date() : anchor;

  const start = startOfWeek(base, { weekStartsOn: 1 });
  const end = endOfWeek(base, { weekStartsOn: 1 });
  const days = Array.from({ length: 7 }, (_, i) => addDays(start, i));

  return {
    start,
    end,
    days,
    label: `${format(start, "MMM d")} – ${format(end, "MMM d, yyyy")}`,
    prevParam: format(addWeeks(start, -1), "yyyy-MM-dd"),
    nextParam: format(addWeeks(start, 1), "yyyy-MM-dd"),
    isoParam: format(start, "yyyy-MM-dd"),
  };
}

export function dayKey(date: Date): string {
  return format(date, "yyyy-MM-dd");
}
