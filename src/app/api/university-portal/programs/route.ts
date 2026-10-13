import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase/server";
import { requireUniversityOwner } from "@/lib/universityPortal";

export const dynamic = "force-dynamic";

const fail = (error: string, status: number) =>
  NextResponse.json({ success: false, error }, { status });

const programSchema = z.object({
  programId: z.string().trim().min(1).max(32),
  // null = use the program's default
  yearlyTuitionINR: z.number().int().min(0).max(100000000).nullable().default(null),
  duration: z
    .string()
    .trim()
    .max(32)
    .nullable()
    .default(null)
    .transform((v) => (v ? v : null)),
  isActive: z.boolean().default(true),
});

/** Adds or updates one of the university's programs (university_programs). */
export async function PUT(request: Request) {
  try {
    const auth = await requireUniversityOwner(request);
    if ("response" in auth) return auth.response;
    const parsed = programSchema.safeParse(await request.json());
    if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Invalid program", 400);
    const p = parsed.data;

    const { error } = await supabaseAdmin.from("university_programs").upsert(
      {
        university_id: auth.university.id,
        program_id: p.programId,
        yearly_tuition_inr: p.yearlyTuitionINR,
        duration: p.duration,
        is_active: p.isActive,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "university_id,program_id" },
    );
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("PUT /api/university-portal/programs error:", error);
    return fail(error.message || "Failed to save program", 500);
  }
}

/** Removes a program from the university (?programId=...). */
export async function DELETE(request: Request) {
  try {
    const auth = await requireUniversityOwner(request);
    if ("response" in auth) return auth.response;
    const programId = new URL(request.url).searchParams.get("programId");
    if (!programId) return fail("programId is required", 400);

    const { error } = await supabaseAdmin
      .from("university_programs")
      .delete()
      .eq("university_id", auth.university.id)
      .eq("program_id", programId);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("DELETE /api/university-portal/programs error:", error);
    return fail(error.message || "Failed to remove program", 500);
  }
}
