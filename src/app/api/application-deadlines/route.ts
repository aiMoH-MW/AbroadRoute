import { NextResponse } from "next/server";
import { fetchLiveDeadlines } from "@/lib/supabase/dataFetchers";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const deadlines = await fetchLiveDeadlines();
    return NextResponse.json({
      success: true,
      count: deadlines.length,
      deadlines,
    });
  } catch (error: any) {
    console.error("API /api/application-deadlines error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch deadlines" },
      { status: 500 },
    );
  }
}
