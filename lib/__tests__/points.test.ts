import { describe, expect, it } from "vitest";
import { computeStreak, buildEncouragement } from "@/lib/points";

describe("computeStreak", () => {
  it("counts consecutive days ending today", () => {
    const today = new Date("2026-07-23T12:00:00Z");
    const dates = [
      new Date("2026-07-23T09:00:00Z"),
      new Date("2026-07-22T09:00:00Z"),
      new Date("2026-07-21T09:00:00Z"),
    ];
    expect(computeStreak(dates, today)).toBe(3);
  });

  it("stops at a gap", () => {
    const today = new Date("2026-07-23T12:00:00Z");
    const dates = [new Date("2026-07-23T09:00:00Z"), new Date("2026-07-21T09:00:00Z")];
    expect(computeStreak(dates, today)).toBe(1);
  });

  it("is 0 when today has no completion", () => {
    const today = new Date("2026-07-23T12:00:00Z");
    const dates = [new Date("2026-07-22T09:00:00Z")];
    expect(computeStreak(dates, today)).toBe(0);
  });

  it("dedupes multiple completions on the same day", () => {
    const today = new Date("2026-07-23T12:00:00Z");
    const dates = [
      new Date("2026-07-23T01:00:00Z"),
      new Date("2026-07-23T20:00:00Z"),
      new Date("2026-07-22T08:00:00Z"),
    ];
    expect(computeStreak(dates, today)).toBe(2);
  });
});

describe("buildEncouragement", () => {
  it("celebrates a strong streak", () => {
    const text = buildEncouragement({
      personalCompleted: 5,
      personalTotal: 5,
      personalCompletionRate: 1,
      sharedCompleted: 0,
      sharedTotal: 0,
      sharedCompletionRate: 0,
      streak: 6,
      pointsEarnedThisWeek: 60,
    });
    expect(text).toContain("6 days strong");
  });

  it("is gentle about a reset", () => {
    const text = buildEncouragement({
      personalCompleted: 0,
      personalTotal: 3,
      personalCompletionRate: 0,
      sharedCompleted: 0,
      sharedTotal: 0,
      sharedCompletionRate: 0,
      streak: 0,
      pointsEarnedThisWeek: 0,
    });
    expect(text).toContain("fresh start");
  });
});
