import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAllTestSettings, getTestSettings, saveTestSettings } from "@/lib/testPrep/settings";

const settingsSchema = z.object({
  examSlug: z.string().min(1),
  enabled: z.boolean(),
  durationMinutes: z.number().int().min(1, "Duration must be at least 1 minute").max(300),
  questionsPerPaper: z.number().int().min(1, "At least 1 question is required").max(200),
  showAnswerReview: z.boolean(),
  instructions: z
    .string()
    .trim()
    .max(2000)
    .nullable()
    .optional()
    .transform((v) => (v ? v : null)),
});

/** GET /api/admin/test-settings: settings for every exam with a question bank. */
export async function GET() {
  const items = await getAllTestSettings();
  return NextResponse.json({ success: true, items });
}

/** PUT /api/admin/test-settings: save one exam's settings. */
export async function PUT(req: NextRequest) {
  try {
    const input = settingsSchema.parse(await req.json());
    const current = await getTestSettings(input.examSlug);

    if (!current) {
      return NextResponse.json({ success: false, error: "Unknown exam" }, { status: 404 });
    }
    if (input.questionsPerPaper > current.bankSize) {
      return NextResponse.json(
        {
          success: false,
          error: `Only ${current.bankSize} questions are in this exam's bank.`,
        },
        { status: 400 },
      );
    }

    const { error } = await saveTestSettings({ ...input, instructions: input.instructions ?? null });
    if (error) {
      return NextResponse.json({ success: false, error }, { status: 500 });
    }

    return NextResponse.json({ success: true, item: await getTestSettings(input.examSlug) });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: err.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: "Failed to save settings" }, { status: 500 });
  }
}
