import { NextResponse } from "next/server";
import { fetchCompareUniversities } from "@/lib/compareData";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const universities = await fetchCompareUniversities();
    return NextResponse.json({
      success: true,
      count: universities.length,
      universities,
    });
  } catch (error: any) {
    console.error("API /api/compare/universities error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch universities",
      },
      { status: 500 },
    );
  }
}
