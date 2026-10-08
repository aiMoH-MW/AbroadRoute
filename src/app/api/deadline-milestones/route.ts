import { NextResponse } from "next/server";
import { fetchLiveMilestones } from "@/lib/supabase/dataFetchers";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const milestones = await fetchLiveMilestones();
    return NextResponse.json({
      success: true,
      count: milestones.length,
      milestones,
    });
  } catch (error: any) {
    console.error("API /api/deadline-milestones error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch milestones" },
      { status: 500 },
    );
  }
}
