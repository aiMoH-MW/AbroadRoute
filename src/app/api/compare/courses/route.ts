import { NextResponse } from "next/server";
import { fetchCompareCourses } from "@/lib/compareData";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const courses = await fetchCompareCourses();
    return NextResponse.json({
      success: true,
      count: courses.length,
      courses,
    });
  } catch (error: any) {
    console.error("API /api/compare/courses error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch courses" },
      { status: 500 },
    );
  }
}
