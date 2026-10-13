import { NextResponse } from "next/server";
import { fetchCompareCourses } from "@/lib/compareData";

export const dynamic = "force-dynamic";

// Programs as offered by each university (university_programs rows)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query =
      searchParams.get("query")?.toLowerCase() ||
      searchParams.get("q")?.toLowerCase() ||
      "";
    const country = searchParams.get("country")?.toLowerCase() || "";

    let courses = await fetchCompareCourses();
    if (query) {
      courses = courses.filter((c) =>
        [c.name, c.universityName, c.countryName, c.level].some((v) =>
          v?.toLowerCase().includes(query),
        ),
      );
    }
    if (country) {
      courses = courses.filter(
        (c) =>
          c.countryId?.toLowerCase() === country ||
          c.countryName?.toLowerCase().includes(country),
      );
    }

    return NextResponse.json({
      success: true,
      count: courses.length,
      courses,
    });
  } catch (error: any) {
    console.error("API /api/courses error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch courses" },
      { status: 500 },
    );
  }
}
