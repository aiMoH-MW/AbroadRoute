import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { getRequestUser } from "@/lib/supabase/requestAuth";

export const dynamic = "force-dynamic";

/**
 * GET /api/shortlist (signed-in user from the bearer token)
 * Returns the list of shortlisted university slugs for a user from Supabase backend.
 */
export async function GET(request: Request) {
  try {
    // The shortlist owner is the signed-in user (bearer token); ids or emails
    // sent by the browser are ignored
    const user = await getRequestUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Please sign in" },
        { status: 401 },
      );
    }

    const targetEmail = (user.email || "").toLowerCase();

    // 1. Try reading from student_shortlists table first
    if (targetEmail) {
      try {
        const { data: tableData, error: tableError } = await supabaseAdmin
          .from("student_shortlists")
          .select("university_slug")
          .eq("user_email", targetEmail);

        if (!tableError && tableData && tableData.length > 0) {
          const slugs = tableData.map((r: any) => r.university_slug);
          return NextResponse.json({
            success: true,
            shortlists: slugs,
          });
        }
      } catch {
        // fallback to user_metadata
      }
    }

    const shortlists: string[] = Array.isArray(user?.user_metadata?.shortlists)
      ? user.user_metadata.shortlists
      : [];

    return NextResponse.json({
      success: true,
      shortlists,
    });
  } catch (error: any) {
    console.error("GET /api/shortlist error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch shortlist" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/shortlist
 * Body: { slug } (signed-in user from the bearer token)
 * Adds a university slug to the user's shortlist in the Supabase backend.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { slug } = body;

    if (typeof slug !== "string" || !slug) {
      return NextResponse.json(
        { success: false, error: "slug is required" },
        { status: 400 },
      );
    }

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

    const updatedShortlists = Array.from(new Set([...currentShortlists, slug]));

    // 1. Update user_metadata in Supabase Auth
    await supabaseAdmin.auth.admin.updateUserById(targetUser.id, {
      user_metadata: {
        ...targetUser.user_metadata,
        shortlists: updatedShortlists,
      },
    });

    // 2. Try inserting row into public.student_shortlists table
    try {
      await supabaseAdmin.from("student_shortlists").upsert(
        {
          user_id: targetUser.id,
          user_email: targetUser.email,
          university_slug: slug,
        },
        { onConflict: "user_email,university_slug" },
      );
    } catch (e) {
      // Table may not be created yet; metadata is already saved
    }

    return NextResponse.json({
      success: true,
      shortlists: updatedShortlists,
    });
  } catch (error: any) {
    console.error("POST /api/shortlist error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to add to shortlist" },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/shortlist
 * Body or query: { slug } (signed-in user from the bearer token)
 * Removes a university slug from the user's shortlist in the Supabase backend.
 */
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    let slug = searchParams.get("slug");

    if (!slug) {
      try {
        const body = await request.json();
        slug = body.slug;
      } catch {
        // ignore
      }
    }

    if (typeof slug !== "string" || !slug) {
      return NextResponse.json(
        { success: false, error: "slug is required" },
        { status: 400 },
      );
    }

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

    const updatedShortlists = currentShortlists.filter((s) => s !== slug);

    // 1. Update user_metadata in Supabase Auth
    await supabaseAdmin.auth.admin.updateUserById(targetUser.id, {
      user_metadata: {
        ...targetUser.user_metadata,
        shortlists: updatedShortlists,
      },
    });

    // 2. Try deleting from public.student_shortlists table
    try {
      await supabaseAdmin
        .from("student_shortlists")
        .delete()
        .match({ user_email: targetUser.email, university_slug: slug });
    } catch {
      // ignore
    }

    return NextResponse.json({
      success: true,
      shortlists: updatedShortlists,
    });
  } catch (error: any) {
    console.error("DELETE /api/shortlist error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to remove from shortlist",
      },
      { status: 500 },
    );
  }
}
