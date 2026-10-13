import { NextResponse } from "next/server";
import { getRequestUser } from "@/lib/supabase/requestAuth";
import { loadUniversityPortal } from "@/lib/universityPortal";

export const dynamic = "force-dynamic";

/** Everything the university portal shows, for the signed-in account. */
export async function GET(request: Request) {
  try {
    const user = await getRequestUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Please sign in" },
        { status: 401 },
      );
    }
    return NextResponse.json({
      success: true,
      data: await loadUniversityPortal(user),
    });
  } catch (error: any) {
    console.error("GET /api/university-portal error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to load portal" },
      { status: 500 },
    );
  }
}
