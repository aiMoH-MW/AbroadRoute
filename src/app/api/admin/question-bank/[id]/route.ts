import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase/server";
import { questionHash } from "@/lib/studyMaterials/questionExtraction";

interface Params {
  params: Promise<{ id: string }>;
}

const nullableText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .nullable()
    .optional()
    .transform((v) => (v ? v : null));

const updateSchema = z.object({
  question: z.string().trim().min(3, "Question is required").max(4000),
  question_type: z.enum(["mcq", "true_false", "fill_blank", "short_answer", "long_answer"]),
  options: z.array(z.string().trim().min(1).max(1000)).max(10).default([]),
  answer: nullableText(4000),
  explanation: nullableText(4000),
  topic: nullableText(200),
  difficulty: z.enum(["easy", "medium", "hard"]).nullable().optional(),
  section_id: z.string().uuid().nullable().optional(),
  status: z.enum(["draft", "approved", "rejected"]),
});

/** PATCH /api/admin/question-bank/[id]: edit a question after review. */
export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params;
  try {
    const input = updateSchema.parse(await req.json());
    if (input.question_type === "mcq" && input.options.length < 2) {
      return NextResponse.json(
        { success: false, error: "Multiple-choice questions need at least 2 options." },
        { status: 400 },
      );
    }

    // A section must belong to the question's exam.
    if (input.section_id) {
      const [{ data: current }, { data: section }] = await Promise.all([
        supabaseAdmin.from("study_questions").select("exam_id").eq("id", id).single(),
        supabaseAdmin.from("test_prep_sections").select("exam_id").eq("id", input.section_id).single(),
      ]);
      if (!section || section.exam_id !== current?.exam_id) {
        return NextResponse.json(
          { success: false, error: "That section does not belong to this question's exam." },
          { status: 400 },
        );
      }
    }

    const { data, error } = await supabaseAdmin
      .from("study_questions")
      .update({
        ...input,
        options: input.question_type === "mcq" ? input.options : [],
        difficulty: input.difficulty ?? null,
        section_id: input.section_id ?? null,
        question_hash: questionHash(input.question),
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select("*, material:study_materials(title), exam:test_prep_exams(short_name), section:test_prep_sections(name)")
      .single();

    if (error) {
      const duplicate = error.code === "23505";
      return NextResponse.json(
        { success: false, error: duplicate ? "This question already exists for this material." : error.message },
        { status: duplicate ? 409 : 500 },
      );
    }
    return NextResponse.json({ success: true, item: data });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: err.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: "Failed to update question" }, { status: 500 });
  }
}

/** DELETE /api/admin/question-bank/[id] */
export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const { error } = await supabaseAdmin.from("study_questions").delete().eq("id", id);
  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
