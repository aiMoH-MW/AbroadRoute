import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { getRequestUser, isAdminUser } from "@/lib/supabase/requestAuth";
import { MILESTONE_SELECT, mapSupabaseMilestone } from "@/lib/data/mappers";
import { milestoneInputSchema, toMilestoneRow } from "@/lib/deadlinesSchema";

export const dynamic = "force-dynamic";

const forbidden = () =>
  NextResponse.json(
    { success: false, error: "Admin access required" },
    { status: 403 },
  );

/** All milestones, inactive ones included, soonest first. */
export async function GET(request: Request) {
  try {
    if (!isAdminUser(await getRequestUser(request))) return forbidden();

    const { data, error } = await supabaseAdmin
      .from("deadline_milestones")
      .select(MILESTONE_SELECT)
      .order("days_before", { ascending: false });
    if (error) throw error;

    return NextResponse.json({
      success: true,
      milestones: (data ?? []).map(mapSupabaseMilestone),
    });
  } catch (error: any) {
    console.error("GET /api/admin/deadline-milestones error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch milestones" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    if (!isAdminUser(await getRequestUser(request))) return forbidden();

    const parsed = milestoneInputSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message },
        { status: 400 },
      );
    }

    const { data, error } = await supabaseAdmin
      .from("deadline_milestones")
      .insert(toMilestoneRow(parsed.data))
      .select(MILESTONE_SELECT)
      .single();
    if (error) throw error;

    return NextResponse.json({
      success: true,
      milestone: mapSupabaseMilestone(data),
    });
  } catch (error: any) {
    console.error("POST /api/admin/deadline-milestones error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to add milestone" },
      { status: 500 },
    );
  }
}
