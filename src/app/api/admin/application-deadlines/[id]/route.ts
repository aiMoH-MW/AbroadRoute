import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase/server";
import { getRequestUser, isAdminUser } from "@/lib/supabase/requestAuth";
import { DEADLINE_SELECT, mapSupabaseDeadline } from "@/lib/data/mappers";
import { deadlineInputSchema, toDeadlineRow } from "@/lib/deadlinesSchema";

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
    { success: false, error: "Invalid deadline id" },
    { status: 400 },
  );

/** Replaces the deadline with the submitted fields. */
export async function PATCH(request: Request, { params }: Params) {
  try {
    if (!isAdminUser(await getRequestUser(request))) return forbidden();
    const { id } = await params;
    if (!z.string().uuid().safeParse(id).success) return invalidId();

    const parsed = deadlineInputSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message },
        { status: 400 },
      );
    }

    const { data, error } = await supabaseAdmin
      .from("application_deadlines")
      .update({
        ...toDeadlineRow(parsed.data),
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select(DEADLINE_SELECT)
      .maybeSingle();
    if (error) throw error;
    if (!data) {
      return NextResponse.json(
        { success: false, error: "Deadline not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      deadline: mapSupabaseDeadline(data),
    });
  } catch (error: any) {
    console.error("PATCH /api/admin/application-deadlines error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update deadline" },
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
      .from("application_deadlines")
      .delete()
      .eq("id", id);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("DELETE /api/admin/application-deadlines error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete deadline" },
      { status: 500 },
    );
  }
}
