import { NextResponse } from "next/server";
import { fetchLiveScholarships } from "@/lib/supabase/dataFetchers";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const scholarships = await fetchLiveScholarships();
    return NextResponse.json({
      success: true,
      count: scholarships.length,
      scholarships,
    });
  } catch (error: any) {
    console.error("API /api/scholarships error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch scholarships",
      },
      { status: 500 },
    );
  }
}
