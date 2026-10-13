import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAllTestSettings, getTestSettings, saveTestSettings } from "@/lib/testPrep/settings";
import { DIFFICULTIES, QUESTION_TYPES } from "@/lib/studyMaterials/questionTypes";
import { requireAdmin } from "@/lib/supabase/requestAuth";

const MAX_PAPER_QUESTIONS = 200;

const blueprintItemSchema = z.object({
  marks: z.number().min(0.25, "Each sub-question needs at least 0.25 marks").max(100),
  difficulty: z.enum(["any", ...DIFFICULTIES]),
});

const blueprintGroupSchema = z.object({
  id: z.string().min(1).max(64),
  title: z.string().trim().min(1, "Every question needs a title").max(200),
  instructions: z
    .string()
    .trim()
    .max(1000)
    .nullable()
    .optional()
    .transform((v) => (v ? v : null)),
  sectionId: z.string().uuid().nullable(),
  questionType: z.enum(QUESTION_TYPES as [string, ...string[]]),
  items: z.array(blueprintItemSchema).min(1, "Every question needs at least one sub-question").max(100),
});

const settingsSchema = z.object({
  examSlug: z.string().min(1),
  enabled: z.boolean(),
  durationMinutes: z.number().int().min(1, "Duration must be at least 1 minute").max(300),
  questionsPerPaper: z.number().int().min(1, "At least 1 question is required").max(MAX_PAPER_QUESTIONS),
  showAnswerReview: z.boolean(),
  instructions: z
    .string()
    .trim()
    .max(2000)
    .nullable()
    .optional()
    .transform((v) => (v ? v : null)),
  blueprint: z.array(blueprintGroupSchema).max(30).default([]),
});

/** GET /api/admin/test-settings: settings for every exam with a question bank. */
export async function GET(req: Request) {
  const denied = await requireAdmin(req);
  if (denied) return denied;

  const items = await getAllTestSettings();
  return NextResponse.json({ success: true, items });
}

/** PUT /api/admin/test-settings: save one exam's settings and paper format. */
export async function PUT(req: NextRequest) {
  const denied = await requireAdmin(req);
  if (denied) return denied;

  try {
    const input = settingsSchema.parse(await req.json());
    const current = await getTestSettings(input.examSlug);

    if (!current) {
      return NextResponse.json({ success: false, error: "Unknown exam" }, { status: 404 });
    }

    const blueprint = input.blueprint as typeof current.blueprint;
    const blueprintQuestions = blueprint.reduce((sum, g) => sum + g.items.length, 0);

    if (blueprint.length > 0) {
      const sectionIds = new Set(current.sections.map((s) => s.id));
      if (blueprint.some((g) => g.sectionId && !sectionIds.has(g.sectionId))) {
        return NextResponse.json(
          { success: false, error: "A question uses a section that does not belong to this exam." },
          { status: 400 },
        );
      }
      if (blueprintQuestions > MAX_PAPER_QUESTIONS) {
        return NextResponse.json(
          { success: false, error: `A paper can have at most ${MAX_PAPER_QUESTIONS} sub-questions.` },
          { status: 400 },
        );
      }
    } else if (input.questionsPerPaper > current.bankSize) {
      return NextResponse.json(
        {
          success: false,
          error: `Only ${current.bankSize} questions are in this exam's bank.`,
        },
        { status: 400 },
      );
    }

    const { error } = await saveTestSettings({
      ...input,
      instructions: input.instructions ?? null,
      blueprint,
      // With a blueprint, the paper size is the number of sub-questions it defines.
      questionsPerPaper: blueprint.length > 0 ? blueprintQuestions : input.questionsPerPaper,
    });
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
