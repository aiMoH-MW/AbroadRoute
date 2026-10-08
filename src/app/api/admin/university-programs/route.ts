import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase/server";
import { getRequestUser, isAdminUser } from "@/lib/supabase/requestAuth";

export const dynamic = "force-dynamic";

const assignmentSchema = z.object({
  universityId: z.string().uuid(),
  programs: z
    .array(
      z.object({
        programId: z.string().trim().min(1).max(32),
        yearlyTuitionINR: z.number().int().min(0).nullable().default(null),
        duration: z
          .string()
          .trim()
          .max(32)
          .nullable()
          .default(null)
          .transform((v) => (v ? v : null)),
      }),
    )
    .max(50),
});

/**
 * PUT /api/admin/university-programs: replace the programs a university
 * offers (with optional per-university fee and duration). Also keeps the
 * legacy universities.programs_offered array in sync.
 */
export async function PUT(request: Request) {
  try {
    const user = await getRequestUser(request);
    if (!isAdminUser(user)) {
      return NextResponse.json(
        { success: false, error: "Admin access required" },
        { status: 403 },
      );
    }

    const parsed = assignmentSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message },
        { status: 400 },
      );
    }
    const { universityId, programs } = parsed.data;
    const programIds = [...new Set(programs.map((p) => p.programId))];

    const { data: university, error: uniError } = await supabaseAdmin
      .from("universities")
      .select("id")
      .eq("id", universityId)
      .maybeSingle();
    if (uniError) throw uniError;
    if (!university) {
      return NextResponse.json(
        { success: false, error: "University not found" },
        { status: 404 },
      );
    }

    if (programIds.length > 0) {
      const { data: known, error } = await supabaseAdmin
        .from("programs")
        .select("id")
        .in("id", programIds);
      if (error) throw error;
      const knownIds = new Set((known || []).map((p: any) => p.id));
      const unknown = programIds.filter((id) => !knownIds.has(id));
      if (unknown.length > 0) {
        return NextResponse.json(
          { success: false, error: `Unknown program: ${unknown.join(", ")}` },
          { status: 400 },
        );
      }
    }

    // Remove programs no longer offered
    let removal = supabaseAdmin
      .from("university_programs")
      .delete()
      .eq("university_id", universityId);
    if (programIds.length > 0) {
      removal = removal.not("program_id", "in", `(${programIds.join(",")})`);
    }
    const { error: deleteError } = await removal;
    if (deleteError) throw deleteError;

    if (programs.length > 0) {
      const now = new Date().toISOString();
      const { error: upsertError } = await supabaseAdmin
        .from("university_programs")
        .upsert(
          programs.map((p) => ({
            university_id: universityId,
            program_id: p.programId,
            yearly_tuition_inr: p.yearlyTuitionINR,
            duration: p.duration,
            is_active: true,
            updated_at: now,
          })),
          { onConflict: "university_id,program_id" },
        );
      if (upsertError) throw upsertError;
    }

    // programs.id equals the program slug, so the ids are valid enum values
    const { error: syncError } = await supabaseAdmin
      .from("universities")
      .update({
        programs_offered: programIds,
        updated_at: new Date().toISOString(),
      })
      .eq("id", universityId);
    if (syncError) throw syncError;

    return NextResponse.json({ success: true, programs });
  } catch (error: any) {
    console.error("PUT /api/admin/university-programs error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to save university programs",
      },
      { status: 500 },
    );
  }
}
