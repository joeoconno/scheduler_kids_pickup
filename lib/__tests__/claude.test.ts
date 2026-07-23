import { describe, expect, it } from "vitest";
import { proposedScheduleSchema } from "@/lib/claude";

describe("proposedScheduleSchema", () => {
  it("accepts a well-formed schedule", () => {
    const result = proposedScheduleSchema.parse([
      {
        title: "Morning meditation",
        category: "Meditation",
        dayOffset: 0,
        time: "07:30",
        durationMinutes: 15,
        practiceChecklist: ["Sit comfortably", "Breathe for 10 cycles"],
      },
    ]);
    expect(result).toHaveLength(1);
    expect(result[0].practiceChecklist).toHaveLength(2);
  });

  it("defaults a missing checklist to an empty array", () => {
    const result = proposedScheduleSchema.parse([
      { title: "Walk", category: "Exercise", dayOffset: 1, time: "18:00", durationMinutes: 30 },
    ]);
    expect(result[0].practiceChecklist).toEqual([]);
  });

  it("rejects an invalid time format", () => {
    expect(() =>
      proposedScheduleSchema.parse([
        { title: "Walk", category: "Exercise", dayOffset: 1, time: "6pm", durationMinutes: 30 },
      ])
    ).toThrow();
  });

  it("rejects a negative day offset", () => {
    expect(() =>
      proposedScheduleSchema.parse([
        { title: "Walk", category: "Exercise", dayOffset: -1, time: "18:00", durationMinutes: 30 },
      ])
    ).toThrow();
  });
});
