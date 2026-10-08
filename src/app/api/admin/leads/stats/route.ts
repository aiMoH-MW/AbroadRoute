import { NextResponse } from "next/server";
import { getRequestUser, isAdminUser } from "@/lib/supabase/requestAuth";
import { getLeadStats } from "@/lib/leadStats";

export const dynamic = "force-dynamic";

/** Lead engine totals for the admin Overview tab. */
export async function GET(request: Request) {
  try {
    if (!isAdminUser(await getRequestUser(request))) {
      return NextResponse.json(
        { success: false, error: "Admin access required" },
        { status: 403 },
      );
    }
    return NextResponse.json({ success: true, stats: await getLeadStats() });
  } catch (error: any) {
    console.error("GET /api/admin/leads/stats error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch lead stats" },
      { status: 500 },
    );
  }
}
