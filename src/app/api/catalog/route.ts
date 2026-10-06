import { NextResponse } from "next/server";
import {
  fetchLiveCountries,
  fetchLivePrograms,
  fetchLiveUniversities,
  fetchTestPrepExams,
} from "@/lib/supabase/dataFetchers";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [countries, programs, universities, exams] = await Promise.all([
      fetchLiveCountries(),
      fetchLivePrograms(),
      fetchLiveUniversities(),
      fetchTestPrepExams(),
    ]);

    return NextResponse.json({
      success: true,
      countries,
      programs,
      universities,
      // Menu needs only these fields; full exam details stay on the exam pages.
      testPrepExams: exams.map(({ id, slug, name, shortName, category }) => ({
        id,
        slug,
        name,
        shortName,
        category,
      })),
    });
  } catch (error: any) {
    console.error("API /api/catalog error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch catalog data",
      },
      { status: 500 },
    );
  }
}
