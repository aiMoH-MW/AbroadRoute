import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { getRequestUser } from "@/lib/supabase/requestAuth";

export const dynamic = "force-dynamic";

/**
 * POST /api/shortlist/sync
 * Body: { slugs: string[] } (signed-in user from the bearer token)
 * Merges cookie shortlist items with any existing shortlists in the Supabase backend.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { slugs } = body;

    const incomingSlugs: string[] = Array.isArray(slugs)
      ? slugs.filter((s: unknown) => typeof s === "string" && s).slice(0, 200)
      : [];

    // The shortlist owner is the signed-in user (bearer token); ids or emails
    // sent by the browser are ignored
    const targetUser = await getRequestUser(request);
    if (!targetUser) {
      return NextResponse.json(
        { success: false, error: "Please sign in" },
        { status: 401 },
      );
    }

    const currentShortlists: string[] = Array.isArray(
      targetUser.user_metadata?.shortlists,
    )
      ? targetUser.user_metadata.shortlists
      : [];

    const mergedShortlists = Array.from(
      new Set([...currentShortlists, ...incomingSlugs]),
    );

    await supabaseAdmin.auth.admin.updateUserById(targetUser.id, {
      user_metadata: {
        ...targetUser.user_metadata,
        shortlists: mergedShortlists,
      },
    });

    // Also upsert rows into public.student_shortlists table
    if (mergedShortlists.length > 0) {
      try {
        const rows = mergedShortlists.map((s) => ({
          user_id: targetUser.id,
          user_email: targetUser.email,
          university_slug: s,
        }));
        await supabaseAdmin
          .from("student_shortlists")
          .upsert(rows, { onConflict: "user_email,university_slug" });
      } catch {
        // ignore if table not ready
      }
    }

    return NextResponse.json({
      success: true,
      shortlists: mergedShortlists,
    });
  } catch (error: any) {
    console.error("POST /api/shortlist/sync error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to sync shortlist" },
      { status: 500 },
    );
  }
}
