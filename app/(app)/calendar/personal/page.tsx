import Link from "next/link";
import { getCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/db";
import { getWeekRange } from "@/lib/week";
import { WeekView } from "@/components/calendar/week-view";
import { AutoGenerateButton } from "@/components/calendar/auto-generate-button";

export default async function PersonalCalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string }>;
}) {
  const { week } = await searchParams;
  const user = await getCurrentUser();
  const range = getWeekRange(week);

  const entries = await prisma.calendarEntry.findMany({
    where: {
      scope: "PERSONAL",
      userId: user.id,
      scheduledFor: { gte: range.start, lte: range.end },
    },
    include: { checklist: { orderBy: { order: "asc" } } },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl text-foreground">Personal Mindfulness Calendar</h1>
          <p className="text-sm text-muted">{range.label}</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/calendar/personal?week=${range.prevParam}`}
            className="rounded-full border border-card-border px-3 py-1.5 text-sm text-muted hover:text-foreground"
          >
            ← Prev
          </Link>
          <Link
            href={`/calendar/personal?week=${range.nextParam}`}
            className="rounded-full border border-card-border px-3 py-1.5 text-sm text-muted hover:text-foreground"
          >
            Next →
          </Link>
          <AutoGenerateButton scope="PERSONAL" rangeStart={range.isoParam} />
        </div>
      </div>
      <WeekView scope="PERSONAL" days={range.days} entries={entries} />
    </div>
  );
}
