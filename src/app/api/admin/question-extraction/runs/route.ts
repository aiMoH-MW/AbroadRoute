import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/supabase/requestAuth";

const createRunsSchema = z
  .object({
    materialIds: z.array(z.string().uuid()).min(1, "Select at least one material").max(50),
    mode: z.enum(["extract", "generate"]),
    prompt: z.string().trim().min(20, "Prompt is too short").max(8000),
    pageFrom: z.number().int().min(1).optional(),
    pageTo: z.number().int().min(1).optional(),
  })
  .refine((v) => !v.pageFrom || !v.pageTo || v.pageTo >= v.pageFrom, "Page range end must be after its start");

/** GET /api/admin/question-extraction/runs: the 50 most recent runs. */
export async function GET(req: Request) {
  const denied = await requireAdmin(req);
  if (denied) return denied;

  const { data, error } = await supabaseAdmin
    .from("question_extraction_runs")
    .select("*, material:study_materials(title)")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true, items: data ?? [] });
}

/**
 * POST /api/admin/question-extraction/runs
 * Creates one run per selected material. Each run is then processed chunk by
 * chunk via /runs/[id]/process. A page range applies only when one material is selected.
 */
export async function POST(req: NextRequest) {
  const denied = await requireAdmin(req);
  if (denied) return denied;

  try {
    const input = createRunsSchema.parse(await req.json());

    const { data: materials, error } = await supabaseAdmin
      .from("study_materials")
      .select("id, title, pages_processed")
      .in("id", input.materialIds);

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    const usable = (materials ?? []).filter((b) => b.pages_processed > 0);
    if (usable.length === 0) {
      return NextResponse.json(
        { success: false, error: "None of the selected materials have extracted text yet." },
        { status: 400 },
      );
    }

    const singleMaterial = usable.length === 1;
    const rows = usable.map((material) => {
      const lastPage = material.pages_processed;
      const pageFrom = singleMaterial && input.pageFrom ? Math.min(input.pageFrom, lastPage) : 1;
      const pageTo = singleMaterial && input.pageTo ? Math.min(input.pageTo, lastPage) : lastPage;
      return {
        material_id: material.id,
        mode: input.mode,
        prompt: input.prompt,
        page_from: pageFrom,
        page_to: Math.max(pageTo, pageFrom),
        next_page: pageFrom,
        status: "running",
      };
    });

    const { data: runs, error: insertError } = await supabaseAdmin
      .from("question_extraction_runs")
      .insert(rows)
      .select("*, material:study_materials(title)");

    if (insertError) {
      return NextResponse.json({ success: false, error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      runs,
      skipped: input.materialIds.length - usable.length,
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: err.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: "Failed to start extraction" }, { status: 500 });
  }
}
