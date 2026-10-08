import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { getRequestUser, isAdminUser } from "@/lib/supabase/requestAuth";
import { DEADLINE_SELECT, mapSupabaseDeadline } from "@/lib/data/mappers";
import { deadlineInputSchema, toDeadlineRow } from "@/lib/deadlinesSchema";

export const dynamic = "force-dynamic";

const forbidden = () =>
  NextResponse.json(
    { success: false, error: "Admin access required" },
    { status: 403 },
  );

/** All deadlines, inactive ones included, soonest first. */
export async function GET(request: Request) {
  try {
    if (!isAdminUser(await getRequestUser(request))) return forbidden();

    const { data, error } = await supabaseAdmin
      .from("application_deadlines")
      .select(DEADLINE_SELECT)
      .order("deadline_date", { ascending: true });
    if (error) throw error;

    return NextResponse.json({
      success: true,
      deadlines: (data ?? []).map(mapSupabaseDeadline),
    });
  } catch (error: any) {
    console.error("GET /api/admin/application-deadlines error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch deadlines" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    if (!isAdminUser(await getRequestUser(request))) return forbidden();

    const parsed = deadlineInputSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message },
        { status: 400 },
      );
    }

    const { data, error } = await supabaseAdmin
      .from("application_deadlines")
      .insert(toDeadlineRow(parsed.data))
      .select(DEADLINE_SELECT)
      .single();
    if (error) throw error;

    return NextResponse.json({
      success: true,
      deadline: mapSupabaseDeadline(data),
    });
  } catch (error: any) {
    console.error("POST /api/admin/application-deadlines error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to add deadline" },
      { status: 500 },
    );
  }
}
