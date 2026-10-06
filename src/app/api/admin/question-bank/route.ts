import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase/server";

const PAGE_SIZE = 25;

const bulkSchema = z.object({
  ids: z.array(z.string().uuid()).min(1).max(500),
  action: z.enum(["approved", "rejected", "draft", "delete"]),
});

/**
 * GET /api/admin/question-bank?exam=&program=&specialisation=&subject=&material=&status=&type=&q=&page=1
 * Paginated list of extracted questions.
 */
export async function GET(req: NextRequest) {
  const sp = new URL(req.url).searchParams;
  const page = Math.max(1, Number(sp.get("page")) || 1);

  let query = supabaseAdmin
    .from("study_questions")
    .select("*, material:study_materials(title)", { count: "exact" })
    .order("created_at", { ascending: false })
    .order("source_page", { ascending: true })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

  const filters: [string, string][] = [
    ["exam", "exam_slug"],
    ["program", "program_slug"],
    ["specialisation", "specialisation_slug"],
    ["subject", "subject"],
    ["material", "material_id"],
    ["status", "status"],
    ["type", "question_type"],
  ];
  for (const [param, column] of filters) {
    const value = sp.get(param);
    if (value) query = query.eq(column, value);
  }

  const q = sp.get("q")?.trim().replace(/[%,()]/g, "");
  if (q) query = query.or(`question.ilike.%${q}%,answer.ilike.%${q}%,topic.ilike.%${q}%`);

  const { data, error, count } = await query;
  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    items: data ?? [],
    total: count ?? 0,
    page,
    pageSize: PAGE_SIZE,
  });
}

/** PATCH /api/admin/question-bank: bulk approve / reject / reset to draft / delete. */
export async function PATCH(req: NextRequest) {
  try {
    const { ids, action } = bulkSchema.parse(await req.json());
    const table = supabaseAdmin.from("study_questions");
    const { error } =
      action === "delete"
        ? await table.delete().in("id", ids)
        : await table.update({ status: action, updated_at: new Date().toISOString() }).in("id", ids);

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
    return NextResponse.json({ success: true, count: ids.length });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: "Invalid bulk action" }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: "Bulk update failed" }, { status: 500 });
  }
}
