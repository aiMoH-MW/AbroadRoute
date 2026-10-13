import { NextResponse } from "next/server";
import { fetchSiteStats } from "@/lib/siteStats";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const stats = await fetchSiteStats();
    return NextResponse.json({ success: true, stats });
  } catch (error: any) {
    console.error("API /api/site-stats error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch site stats" },
      { status: 500 },
    );
  }
}
