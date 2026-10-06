import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { gradePaper } from "@/lib/testPrep/paper";
import { getTestSettings } from "@/lib/testPrep/settings";

const gradeSchema = z.object({
  examSlug: z.string().min(1),
  candidate: z.object({
    fullName: z.string().min(2),
    phone: z.string().regex(/^[6-9]\d{9}$/),
    email: z.string().email(),
  }),
  answers: z
    .array(
      z.object({
        questionId: z.string().min(1),
        selectedIndex: z.number().int().min(0).nullable(),
      }),
    )
    .min(1)
    .max(100),
});

export async function POST(req: NextRequest) {
  try {
    const { examSlug, candidate, answers } = gradeSchema.parse(await req.json());
    const slug = examSlug.toLowerCase();
    const result = gradePaper(slug, answers);
    const settings = await getTestSettings(slug);

    if (!result || !settings) {
      return NextResponse.json({ error: "Invalid test submission" }, { status: 400 });
    }

    // TODO: email `result` to `candidate.email` once the email service is configured.
    void candidate;

    // The review reveals the answer keys, so only send it when the admin allows it.
    return NextResponse.json(
      settings.showAnswerReview ? result : { ...result, review: undefined },
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid test submission" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to grade test" }, { status: 500 });
  }
}
