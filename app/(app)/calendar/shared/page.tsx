import Link from "next/link";
import { getCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/db";
import { getWeekRange } from "@/lib/week";
import { WeekView } from "@/components/calendar/week-view";
import { AutoGenerateButton } from "@/components/calendar/auto-generate-button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/link-button";

export default async function SharedCalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string }>;
}) {
  const { week } = await searchParams;
  const user = await getCurrentUser();

  if (!user.householdId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pair up to unlock shared goals</CardTitle>
          <CardDescription>
            The shared calendar is for goals and activities you build together with a partner.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LinkButton href="/pair" variant="secondary">
            Pair with a partner
          </LinkButton>
        </CardContent>
      </Card>
    );
  }

  const range = getWeekRange(week);

  const entries = await prisma.calendarEntry.findMany({
    where: {
      scope: "SHARED",
      householdId: user.householdId,
      scheduledFor: { gte: range.start, lte: range.end },
    },
    include: { checklist: { orderBy: { order: "asc" } } },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl text-foreground">Shared Goals Calendar</h1>
          <p className="text-sm text-muted">{range.label}</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/calendar/shared?week=${range.prevParam}`}
            className="rounded-full border border-card-border px-3 py-1.5 text-sm text-muted hover:text-foreground"
          >
            ← Prev
          </Link>
          <Link
            href={`/calendar/shared?week=${range.nextParam}`}
            className="rounded-full border border-card-border px-3 py-1.5 text-sm text-muted hover:text-foreground"
          >
            Next →
          </Link>
          <AutoGenerateButton scope="SHARED" rangeStart={range.isoParam} />
        </div>
      </div>
      <WeekView scope="SHARED" days={range.days} entries={entries} />
    </div>
  );
}
