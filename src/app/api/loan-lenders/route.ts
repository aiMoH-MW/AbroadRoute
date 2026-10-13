import { NextResponse } from "next/server";
import { fetchLiveLoanLenders } from "@/lib/supabase/dataFetchers";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const lenders = await fetchLiveLoanLenders();
    return NextResponse.json({
      success: true,
      count: lenders.length,
      lenders,
    });
  } catch (error: any) {
    console.error("API /api/loan-lenders error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch lenders" },
      { status: 500 },
    );
  }
}
