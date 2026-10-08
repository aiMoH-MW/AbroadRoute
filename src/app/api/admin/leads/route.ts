import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { getRequestUser, isAdminUser } from "@/lib/supabase/requestAuth";
import { getLeadStats } from "@/lib/leadStats";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 25;

const LEAD_STATUSES = [
  "raw",
  "verified",
  "enriched",
  "matched",
  "delivered",
  "converted",
  "disputed",
] as const;

/**
 * Leads for the admin Lead Engine tab, newest first, with their deliveries
 * and engine-wide stats. Query: q (name/email/phone), status, page (1-based).
 */
export async function GET(request: Request) {
  try {
    if (!isAdminUser(await getRequestUser(request))) {
      return NextResponse.json(
        { success: false, error: "Admin access required" },
        { status: 403 },
      );
    }

    const { searchParams } = new URL(request.url);
    // Characters that would break the PostgREST or() filter are dropped
    const q = (searchParams.get("q") ?? "").replace(/[,()*%\\]/g, " ").trim();
    const status = searchParams.get("status") ?? "";
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const from = (page - 1) * PAGE_SIZE;

    let leadsQuery = supabaseAdmin
      .from("leads")
      .select(
        "*, countries(name), lead_deliveries(id, price_charged_inr, delivery_type, delivered_at, buyers(company_name))",
        { count: "exact" },
      )
      .order("created_at", { ascending: false })
      .range(from, from + PAGE_SIZE - 1);
    if (q) {
      leadsQuery = leadsQuery.or(
        `full_name.ilike.%${q}%,email.ilike.%${q}%,phone.ilike.%${q}%`,
      );
    }
    if ((LEAD_STATUSES as readonly string[]).includes(status)) {
      leadsQuery = leadsQuery.eq("status", status);
    }

    const [leadsRes, stats] = await Promise.all([leadsQuery, getLeadStats()]);
    if (leadsRes.error) throw leadsRes.error;

    const leads = (leadsRes.data ?? []).map((l: any) => ({
      id: l.id,
      fullName: l.full_name,
      email: l.email,
      phone: l.phone,
      isPhoneVerified: !!l.is_phone_verified,
      countryId: l.country_target ?? null,
      countryName: l.countries?.name ?? null,
      programTarget: l.program_target ?? null,
      highestEducation: l.highest_education ?? null,
      budgetRangeINR: l.budget_range_inr ?? null,
      intakeYear: l.intake_year ?? null,
      ieltsScore: l.ielts_score ?? null,
      leadScore: l.lead_score ?? null,
      status: l.status,
      utmSource: l.utm_source ?? null,
      createdAt: l.created_at,
      deliveries: (l.lead_deliveries ?? []).map((d: any) => ({
        id: d.id,
        buyerName: d.buyers?.company_name ?? null,
        priceINR:
          d.price_charged_inr === null ? null : Number(d.price_charged_inr),
        deliveryType: d.delivery_type,
        deliveredAt: d.delivered_at,
      })),
    }));

    return NextResponse.json({
      success: true,
      leads,
      page,
      pageSize: PAGE_SIZE,
      matchingCount: leadsRes.count ?? leads.length,
      stats,
    });
  } catch (error: any) {
    console.error("GET /api/admin/leads error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch leads" },
      { status: 500 },
    );
  }
}
