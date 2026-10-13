import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { getRequestUser, isAdminUser } from "@/lib/supabase/requestAuth";
import { mapSupabaseCountry } from "@/lib/data/mappers";

export const dynamic = "force-dynamic";

interface Params {
  params: Promise<{ id: string }>;
}

// Country fields editable from admin: empty text clears the value (NULL)
const TEXT_FIELDS = [
  "avg_tuition_inr",
  "avg_living_cost_inr",
  "post_study_work_visa",
  "hero_tagline",
  "overview",
  "hero_subtitle",
  "overview_heading",
  "overview_body",
  "programs_offered_notes",
  "visa_type",
  "visa_processing_time",
  "work_hours_during_term",
  "financial_proof_required",
  "pr_pathway_summary",
] as const;

/** Updates the editorial / visa fields of a country. */
export async function PATCH(request: Request, { params }: Params) {
  try {
    if (!isAdminUser(await getRequestUser(request))) {
      return NextResponse.json(
        { success: false, error: "Admin access required" },
        { status: 403 },
      );
    }
    const { id } = await params;
    const body = await request.json();
    const updates: Record<string, unknown> = {};

    for (const field of TEXT_FIELDS) {
      if (!(field in body)) continue;
      const text = body[field] === null ? "" : String(body[field]).trim();
      updates[field] = text === "" ? null : text;
    }
    if ("top_intakes" in body) {
      const list = Array.isArray(body.top_intakes)
        ? body.top_intakes
        : String(body.top_intakes ?? "").split(",");
      updates.top_intakes = list.map((s: unknown) => String(s).trim()).filter(Boolean);
    }
    if ("safety_rating" in body) {
      const raw = body.safety_rating;
      if (raw === null || raw === "") {
        updates.safety_rating = null;
      } else {
        const num = Number(raw);
        if (Number.isNaN(num) || num < 0 || num > 5) {
          return NextResponse.json(
            { success: false, error: "Safety rating must be between 0 and 5" },
            { status: 400 },
          );
        }
        updates.safety_rating = num;
      }
    }
    if ("is_anchor" in body) updates.is_anchor = body.is_anchor === true;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { success: false, error: "Nothing to update" },
        { status: 400 },
      );
    }

    const { data, error } = await supabaseAdmin
      .from("countries")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select("*")
      .maybeSingle();
    if (error) throw error;
    if (!data) {
      return NextResponse.json(
        { success: false, error: "Country not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, country: mapSupabaseCountry(data) });
  } catch (error: any) {
    console.error("PATCH /api/admin/countries error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update country" },
      { status: 500 },
    );
  }
}
