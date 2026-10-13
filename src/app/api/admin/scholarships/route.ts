import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { getRequestUser, isAdminUser } from "@/lib/supabase/requestAuth";
import { SCHOLARSHIP_SELECT, mapSupabaseScholarship } from "@/lib/data/mappers";
import {
  scholarshipInputSchema,
  toScholarshipRow,
} from "@/lib/scholarshipsSchema";

export const dynamic = "force-dynamic";

const forbidden = () =>
  NextResponse.json(
    { success: false, error: "Admin access required" },
    { status: 403 },
  );

/** All scholarships, inactive ones included, soonest first. */
export async function GET(request: Request) {
  try {
    if (!isAdminUser(await getRequestUser(request))) return forbidden();

    const { data, error } = await supabaseAdmin
      .from("scholarships")
      .select(SCHOLARSHIP_SELECT)
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true });
    if (error) throw error;

    return NextResponse.json({
      success: true,
      scholarships: (data ?? []).map(mapSupabaseScholarship),
    });
  } catch (error: any) {
    console.error("GET /api/admin/scholarships error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch scholarships",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    if (!isAdminUser(await getRequestUser(request))) return forbidden();

    const parsed = scholarshipInputSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message },
        { status: 400 },
      );
    }

    const { data, error } = await supabaseAdmin
      .from("scholarships")
      .insert(toScholarshipRow(parsed.data))
      .select(SCHOLARSHIP_SELECT)
      .single();
    if (error) throw error;

    return NextResponse.json({
      success: true,
      scholarship: mapSupabaseScholarship(data),
    });
  } catch (error: any) {
    console.error("POST /api/admin/scholarships error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to add scholarship" },
      { status: 500 },
    );
  }
}
