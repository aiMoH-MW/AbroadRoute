import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { getRequestUser, hasConfirmedEmail } from "@/lib/supabase/requestAuth";

export const dynamic = "force-dynamic";

/** The signed-in student's own counselling inquiries (leads with their email). */
export async function GET(request: Request) {
  try {
    const user = await getRequestUser(request);
    // Inquiries are matched by email, so the email must be confirmed
    if (!user?.email || !hasConfirmedEmail(user)) {
      return NextResponse.json(
        { success: false, error: "Please sign in" },
        { status: 401 },
      );
    }

    const emails = Array.from(new Set([user.email, user.email.toLowerCase()]));
    const [leadsRes, programsRes] = await Promise.all([
      supabaseAdmin
        .from("leads")
        .select("id, program_target, intake_year, budget_range_inr, created_at, countries(name)")
        .in("email", emails)
        .order("created_at", { ascending: false })
        .limit(50),
      supabaseAdmin.from("programs").select("id, name"),
    ]);
    if (leadsRes.error) throw leadsRes.error;
    const programNames = new Map(
      (programsRes.data ?? []).map((p: any) => [String(p.id), p.name]),
    );

    return NextResponse.json({
      success: true,
      inquiries: (leadsRes.data ?? []).map((l: any) => ({
        id: l.id,
        countryName: l.countries?.name ?? null,
        programName: l.program_target
          ? (programNames.get(String(l.program_target)) ?? String(l.program_target))
          : null,
        intakeYear: l.intake_year ?? null,
        budgetRange: l.budget_range_inr ?? null,
        createdAt: l.created_at,
      })),
    });
  } catch (error: any) {
    console.error("GET /api/student/inquiries error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to load inquiries" },
      { status: 500 },
    );
  }
}
