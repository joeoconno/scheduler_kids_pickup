import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";

export const VIBES = [
  "Gentle",
  "Balanced",
  "Focus Week",
  "Restorative",
  "Growth Push",
  "Mindful Reset",
] as const;

export type Vibe = (typeof VIBES)[number];

export const proposedEntrySchema = z.object({
  title: z.string().min(1).max(80),
  category: z.string().min(1).max(40),
  dayOffset: z.number().int().min(0).max(30),
  time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "must be HH:MM 24h time"),
  durationMinutes: z.number().int().min(5).max(240),
  practiceChecklist: z.array(z.string().min(1).max(120)).max(6).default([]),
});

export const proposedScheduleSchema = z.array(proposedEntrySchema).max(40);

export type ProposedEntry = z.infer<typeof proposedEntrySchema>;

const SCHEDULE_TOOL = {
  name: "propose_schedule",
  description: "Propose a set of calendar entries for the requested date range.",
  input_schema: {
    type: "object" as const,
    properties: {
      entries: {
        type: "array",
        items: {
          type: "object",
          properties: {
            title: { type: "string" },
            category: { type: "string" },
            dayOffset: {
              type: "integer",
              description: "0-indexed day offset from the range start date",
            },
            time: { type: "string", description: "24h HH:MM local time" },
            durationMinutes: { type: "integer" },
            practiceChecklist: {
              type: "array",
              items: { type: "string" },
              description: "0-6 short guided checklist items for this practice",
            },
          },
          required: ["title", "category", "dayOffset", "time", "durationMinutes"],
        },
      },
    },
    required: ["entries"],
  },
};

export interface AutoGenerateParams {
  scope: "PERSONAL" | "SHARED";
  vibeOrPrompt: string;
  rangeDays: number;
  memberNames: string[];
  existingTitles: string[];
}

export async function generateSchedule(params: AutoGenerateParams): Promise<ProposedEntry[]> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY is not configured");
  }

  const client = new Anthropic({ apiKey });

  const audience =
    params.scope === "SHARED"
      ? `a couple (${params.memberNames.join(" and ") || "two partners"}) sharing goals and activities together`
      : `one person building personal mindfulness/growth habits`;

  const existing = params.existingTitles.length
    ? `Already scheduled in this range, avoid exact duplicates or time clashes: ${params.existingTitles.join(", ")}.`
    : "Nothing else is scheduled in this range yet.";

  const prompt = `You are a calm, encouraging mindfulness and personal-growth coach helping ${audience}.

Generate a realistic ${params.rangeDays}-day schedule of ${params.scope === "SHARED" ? "shared activities/goals" : "personal practices"} matching this vibe or request: "${params.vibeOrPrompt}".

${existing}

Guidelines:
- Keep it realistic: a few short entries per day, not an overwhelming list. Mix rest with activity.
- Each entry needs a short practice checklist (1-3 gentle, concrete prompts) where it helps intention.
- Respect the requested vibe (e.g. "Restorative" should be lighter and slower; "Growth Push" more ambitious; "Gentle" very light touch).
- Use the propose_schedule tool to return your answer. Do not include any other commentary.`;

  const response = await client.messages.create({
    model: "claude-sonnet-5",
    max_tokens: 4096,
    tools: [SCHEDULE_TOOL],
    tool_choice: { type: "tool", name: "propose_schedule" },
    messages: [{ role: "user", content: prompt }],
  });

  const toolUse = response.content.find(
    (block): block is Anthropic.Messages.ToolUseBlock => block.type === "tool_use"
  );

  if (!toolUse) {
    throw new Error("Claude did not return a structured schedule");
  }

  const raw = (toolUse.input as { entries?: unknown }).entries ?? [];
  return proposedScheduleSchema.parse(raw);
}
