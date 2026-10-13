import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase/server";
import { getRequestUser, isAdminUser } from "@/lib/supabase/requestAuth";
import { SCHOLARSHIP_SELECT, mapSupabaseScholarship } from "@/lib/data/mappers";
import {
  scholarshipInputSchema,
  toScholarshipRow,
} from "@/lib/scholarshipsSchema";

export const dynamic = "force-dynamic";

interface Params {
  params: Promise<{ id: string }>;
}

const forbidden = () =>
  NextResponse.json(
    { success: false, error: "Admin access required" },
    { status: 403 },
  );

const invalidId = () =>
  NextResponse.json(
    { success: false, error: "Invalid scholarship id" },
    { status: 400 },
  );

/** Replaces the scholarship with the submitted fields. */
export async function PATCH(request: Request, { params }: Params) {
  try {
    if (!isAdminUser(await getRequestUser(request))) return forbidden();
    const { id } = await params;
    if (!z.string().uuid().safeParse(id).success) return invalidId();

    const parsed = scholarshipInputSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message },
        { status: 400 },
      );
    }

    const { data, error } = await supabaseAdmin
      .from("scholarships")
      .update({
        ...toScholarshipRow(parsed.data),
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select(SCHOLARSHIP_SELECT)
      .maybeSingle();
    if (error) throw error;
    if (!data) {
      return NextResponse.json(
        { success: false, error: "Scholarship not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      scholarship: mapSupabaseScholarship(data),
    });
  } catch (error: any) {
    console.error("PATCH /api/admin/scholarships error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to update scholarship",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request, { params }: Params) {
  try {
    if (!isAdminUser(await getRequestUser(request))) return forbidden();
    const { id } = await params;
    if (!z.string().uuid().safeParse(id).success) return invalidId();

    const { error } = await supabaseAdmin
      .from("scholarships")
      .delete()
      .eq("id", id);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("DELETE /api/admin/scholarships error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to delete scholarship",
      },
      { status: 500 },
    );
  }
}
