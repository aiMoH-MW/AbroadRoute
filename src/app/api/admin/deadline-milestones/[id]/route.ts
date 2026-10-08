import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase/server";
import { getRequestUser, isAdminUser } from "@/lib/supabase/requestAuth";
import { MILESTONE_SELECT, mapSupabaseMilestone } from "@/lib/data/mappers";
import { milestoneInputSchema, toMilestoneRow } from "@/lib/deadlinesSchema";

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
    { success: false, error: "Invalid milestone id" },
    { status: 400 },
  );

/** Replaces the milestone with the submitted fields. */
export async function PATCH(request: Request, { params }: Params) {
  try {
    if (!isAdminUser(await getRequestUser(request))) return forbidden();
    const { id } = await params;
    if (!z.string().uuid().safeParse(id).success) return invalidId();

    const parsed = milestoneInputSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message },
        { status: 400 },
      );
    }

    const { data, error } = await supabaseAdmin
      .from("deadline_milestones")
      .update({
        ...toMilestoneRow(parsed.data),
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select(MILESTONE_SELECT)
      .maybeSingle();
    if (error) throw error;
    if (!data) {
      return NextResponse.json(
        { success: false, error: "Milestone not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      milestone: mapSupabaseMilestone(data),
    });
  } catch (error: any) {
    console.error("PATCH /api/admin/deadline-milestones error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update milestone" },
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
      .from("deadline_milestones")
      .delete()
      .eq("id", id);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("DELETE /api/admin/deadline-milestones error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete milestone" },
      { status: 500 },
    );
  }
}
