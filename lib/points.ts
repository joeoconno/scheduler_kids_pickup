import { prisma } from "@/lib/db";

export async function getUserPointsBalance(userId: string): Promise<number> {
  const result = await prisma.pointsLedgerEntry.aggregate({
    where: { userId },
    _sum: { points: true },
  });
  return result._sum.points ?? 0;
}

export async function getHouseholdPointsBalance(householdId: string): Promise<number> {
  const result = await prisma.pointsLedgerEntry.aggregate({
    where: { householdId },
    _sum: { points: true },
  });
  return result._sum.points ?? 0;
}

function toDayKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/**
 * Consecutive-day streak ending at `asOf`, counting back while each day
 * has at least one completion. A gap (including a missing `asOf` day) stops the count.
 */
export function computeStreak(completionDates: Date[], asOf: Date = new Date()): number {
  const days = new Set(completionDates.map(toDayKey));
  let streak = 0;
  const cursor = new Date(asOf);
  cursor.setHours(0, 0, 0, 0);

  while (days.has(toDayKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

export interface WeeklyReport {
  personalCompletionRate: number;
  personalCompleted: number;
  personalTotal: number;
  sharedCompletionRate: number;
  sharedCompleted: number;
  sharedTotal: number;
  streak: number;
  pointsEarnedThisWeek: number;
  encouragement: string;
}

export function buildEncouragement(report: Omit<WeeklyReport, "encouragement">): string {
  const lines: string[] = [];

  if (report.streak >= 5) {
    lines.push(`${report.streak} days strong — this is becoming who you are.`);
  } else if (report.streak >= 1) {
    lines.push(`${report.streak}-day streak going. Keep the momentum gentle and steady.`);
  } else {
    lines.push("A fresh start today counts just as much as a long streak.");
  }

  if (report.sharedTotal > 0) {
    if (report.sharedCompletionRate >= 0.75) {
      lines.push("You two are really showing up for each other this week.");
    } else if (report.sharedCompletionRate > 0) {
      lines.push("Some shared moments happened this week — more are within reach.");
    } else {
      lines.push("No shared goals landed yet this week — maybe pick one small one together.");
    }
  }

  return lines.join(" ");
}

export async function getWeeklyReport(
  userId: string,
  householdId: string | null,
  weekStart: Date,
  weekEnd: Date
): Promise<WeeklyReport> {
  const [personalEntries, sharedEntries, ledgerThisWeek, completedPersonalDates] =
    await Promise.all([
      prisma.calendarEntry.findMany({
        where: { scope: "PERSONAL", userId, scheduledFor: { gte: weekStart, lte: weekEnd } },
        select: { completedAt: true },
      }),
      householdId
        ? prisma.calendarEntry.findMany({
            where: { scope: "SHARED", householdId, scheduledFor: { gte: weekStart, lte: weekEnd } },
            select: { completedAt: true },
          })
        : Promise.resolve([]),
      prisma.pointsLedgerEntry.aggregate({
        where: { userId, createdAt: { gte: weekStart, lte: weekEnd } },
        _sum: { points: true },
      }),
      prisma.calendarEntry.findMany({
        where: { scope: "PERSONAL", userId, completedAt: { not: null } },
        select: { completedAt: true },
        orderBy: { completedAt: "desc" },
        take: 90,
      }),
    ]);

  const personalCompleted = personalEntries.filter((e) => e.completedAt).length;
  const sharedCompleted = sharedEntries.filter((e) => e.completedAt).length;

  const base = {
    personalCompleted,
    personalTotal: personalEntries.length,
    personalCompletionRate: personalEntries.length ? personalCompleted / personalEntries.length : 0,
    sharedCompleted,
    sharedTotal: sharedEntries.length,
    sharedCompletionRate: sharedEntries.length ? sharedCompleted / sharedEntries.length : 0,
    streak: computeStreak(
      completedPersonalDates.map((e) => e.completedAt as Date)
    ),
    pointsEarnedThisWeek: ledgerThisWeek._sum.points ?? 0,
  };

  return { ...base, encouragement: buildEncouragement(base) };
}
