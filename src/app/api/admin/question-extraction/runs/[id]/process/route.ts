import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { TEST_PREP_EXAMS } from "@/lib/data/testPrepData";
import { extractQuestions, questionHash } from "@/lib/studyMaterials/questionExtraction";
import { EXTRACTION_PAGES_PER_CHUNK } from "@/lib/studyMaterials/questionTypes";

export const maxDuration = 60;

interface Params {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/admin/question-extraction/runs/[id]/process
 * Sends the next chunk of material pages to the LLM and stores the questions it
 * returns as drafts. The admin UI calls this repeatedly until `done`.
 */
export async function POST(_req: NextRequest, { params }: Params) {
  const { id } = await params;

  const { data: run, error } = await supabaseAdmin
    .from("question_extraction_runs")
    .select("*, material:study_materials(*)")
    .eq("id", id)
    .single();

  if (error || !run || !run.material) {
    return NextResponse.json({ success: false, error: "Extraction run not found" }, { status: 404 });
  }

  const material = run.material;
  const respond = (patch: { next_page: number; questions_found: number; status: string }) =>
    NextResponse.json({
      success: true,
      status: patch.status,
      nextPage: patch.next_page,
      pageFrom: run.page_from,
      pageTo: run.page_to,
      questionsFound: patch.questions_found,
      done: patch.status === "completed",
    });

  if (run.next_page > run.page_to) {
    return respond({ next_page: run.next_page, questions_found: run.questions_found, status: "completed" });
  }

  const chunkFrom = run.next_page;
  const chunkTo = Math.min(chunkFrom + EXTRACTION_PAGES_PER_CHUNK - 1, run.page_to);

  const { data: pages, error: pagesError } = await supabaseAdmin
    .from("study_material_pages")
    .select("page_number, content")
    .eq("material_id", material.id)
    .gte("page_number", chunkFrom)
    .lte("page_number", chunkTo)
    .order("page_number", { ascending: true });

  if (pagesError) {
    return NextResponse.json({ success: false, error: pagesError.message }, { status: 500 });
  }

  let inserted = 0;
  const textPages = (pages ?? []).filter((p) => p.content.trim());

  if (textPages.length > 0) {
    try {
      let specialisationName: string | null = null;
      if (material.specialisation_slug) {
        const { data: spec } = await supabaseAdmin
          .from("specialisations")
          .select("name")
          .eq("slug", material.specialisation_slug)
          .maybeSingle();
        specialisationName = spec?.name ?? material.specialisation_slug;
      }

      const questions = await extractQuestions({
        mode: run.mode,
        prompt: run.prompt,
        material: {
          title: material.title,
          examName: TEST_PREP_EXAMS.find((e) => e.slug === material.exam_slug)?.name ?? material.exam_slug,
          program: material.program_slug,
          specialisation: specialisationName,
          subject: material.subject,
        },
        pages: textPages,
      });

      if (questions.length > 0) {
        // The same question can appear twice in one response; keep the first.
        const unique = new Map(questions.map((q) => [questionHash(q.question), q]));
        const { data: rows, error: insertError } = await supabaseAdmin
          .from("study_questions")
          .upsert(
            Array.from(unique, ([hash, q]) => ({
              ...q,
              material_id: material.id,
              run_id: run.id,
              exam_slug: material.exam_slug,
              program_slug: material.program_slug,
              specialisation_slug: material.specialisation_slug,
              subject: material.subject,
              origin: run.mode,
              question_hash: hash,
              status: "draft",
            })),
            { onConflict: "material_id,question_hash", ignoreDuplicates: true },
          )
          .select("id");

        if (insertError) throw new Error(insertError.message);
        inserted = rows?.length ?? 0;
      }
    } catch (err) {
      const message = `Pages ${chunkFrom}–${chunkTo}: ${err instanceof Error ? err.message : "extraction failed"}`;
      console.error("Question extraction error:", message, err);
      await supabaseAdmin
        .from("question_extraction_runs")
        .update({ status: "failed", error_message: message, updated_at: new Date().toISOString() })
        .eq("id", id);
      return NextResponse.json({ success: false, error: message }, { status: 502 });
    }
  }

  const patch = {
    next_page: chunkTo + 1,
    questions_found: run.questions_found + inserted,
    status: chunkTo >= run.page_to ? "completed" : "running",
  };
  await supabaseAdmin
    .from("question_extraction_runs")
    .update({ ...patch, error_message: null, updated_at: new Date().toISOString() })
    .eq("id", id);

  return respond(patch);
}
