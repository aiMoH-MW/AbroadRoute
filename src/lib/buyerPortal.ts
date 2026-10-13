import "server-only";
import type { User } from "@supabase/supabase-js";
import { supabaseAdmin } from "@/lib/supabase/server";
import { fetchSiteSettings } from "@/lib/siteContent";
import type {
  BuyerPortalData,
  BuyerProfile,
  LeadSummary,
  PurchasedLead,
} from "@/lib/buyerPortalTypes";
import { hasConfirmedEmail } from "@/lib/supabase/requestAuth";

const LEAD_COLUMNS =
  "id, full_name, email, phone, is_phone_verified, country_target, program_target, highest_education, budget_range_inr, intake_year, ielts_score, lead_score, created_at, countries(name)";

const numberOrNull = (v: unknown): number | null => {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isNaN(n) ? null : n;
};

export function mapBuyer(b: any): BuyerProfile {
  return {
    id: b.id,
    companyName: b.company_name,
    contactPerson: b.contact_person,
    email: b.email,
    phone: b.phone,
    gstin: b.gstin ?? null,
    pan: b.pan ?? null,
    city: b.city ?? null,
    state: b.state ?? null,
    targetCountries: b.target_countries ?? [],
    targetPrograms: b.target_programs ?? [],
    minLeadScore: numberOrNull(b.min_lead_score),
    dailyLeadCap: numberOrNull(b.daily_lead_cap),
    autoUnlock: b.auto_unlock === true,
    operatingHours: b.operating_hours ?? null,
    isVerified: b.is_verified === true,
  };
}

/** The buyer record of the signed-in user (by user id, else by email). */
export async function getBuyerForUser(user: User): Promise<any | null> {
  const { data: byUser } = await supabaseAdmin
    .from("buyers")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();
  if (byUser) return byUser;

  // Linking by email only for addresses the user has confirmed
  const email = user.email;
  if (!email || !hasConfirmedEmail(user)) return null;
  // Exact match only (ilike would treat "_" and "%" as wildcards)
  const { data: byEmail } = await supabaseAdmin
    .from("buyers")
    .select("*")
    .in("email", Array.from(new Set([email, email.toLowerCase()])))
    .limit(1)
    .maybeSingle();
  // Link an existing buyer row to this account on first sign-in
  if (byEmail && !byEmail.user_id) {
    await supabaseAdmin.from("buyers").update({ user_id: user.id }).eq("id", byEmail.id);
    byEmail.user_id = user.id;
  }
  return byEmail ?? null;
}

/** B2B settings from site_settings; null when not set in admin. */
export async function getB2BSettings() {
  const settings = await fetchSiteSettings();
  return {
    costPerLeadINR: numberOrNull(settings.b2b_cost_per_lead_inr),
    maxBuyersPerLead: numberOrNull(settings.b2b_max_buyers_per_lead),
  };
}

async function programNames(): Promise<Map<string, string>> {
  const { data } = await supabaseAdmin.from("programs").select("id, name");
  return new Map((data ?? []).map((p: any) => [String(p.id), p.name]));
}

function toLeadSummary(l: any, programs: Map<string, string>): LeadSummary {
  return {
    id: l.id,
    countryId: l.country_target ?? null,
    countryName: l.countries?.name ?? null,
    programId: l.program_target ?? null,
    programName: l.program_target
      ? (programs.get(String(l.program_target)) ?? String(l.program_target))
      : null,
    budgetRange: l.budget_range_inr ?? null,
    intakeYear: l.intake_year ?? null,
    leadScore: numberOrNull(l.lead_score),
    isPhoneVerified: l.is_phone_verified === true,
    createdAt: l.created_at,
  };
}

export async function loadBuyerPortal(buyerRow: any): Promise<BuyerPortalData> {
  const buyer = mapBuyer(buyerRow);
  const [programs, b2b, walletRes, deliveriesRes, topupsRes] = await Promise.all([
    programNames(),
    getB2BSettings(),
    supabaseAdmin
      .from("wallet_accounts")
      .select("id, balance_inr")
      .eq("buyer_id", buyer.id)
      .maybeSingle(),
    supabaseAdmin
      .from("lead_deliveries")
      .select(`*, leads(${LEAD_COLUMNS})`)
      .eq("buyer_id", buyer.id)
      .order("delivered_at", { ascending: false }),
    supabaseAdmin
      .from("wallet_topup_requests")
      .select("*")
      .eq("buyer_id", buyer.id)
      .order("created_at", { ascending: false }),
  ]);

  const wallet = walletRes.data;
  const { data: txRows } = wallet
    ? await supabaseAdmin
        .from("wallet_transactions")
        .select("*")
        .eq("wallet_id", wallet.id)
        .order("created_at", { ascending: false })
    : { data: [] as any[] };

  const purchasedLeads: PurchasedLead[] = (deliveriesRes.data ?? [])
    .filter((d: any) => d.leads)
    .map((d: any) => ({
      ...toLeadSummary(d.leads, programs),
      deliveryId: d.id,
      fullName: d.leads.full_name,
      email: d.leads.email,
      phone: d.leads.phone,
      highestEducation: d.leads.highest_education ?? null,
      ieltsScore: d.leads.ielts_score ?? null,
      pricePaidINR: Number(d.price_charged_inr),
      deliveredAt: d.delivered_at,
      status: d.status ?? "unread",
      notes: Array.isArray(d.notes) ? d.notes : [],
      disputeReason: d.dispute_reason ?? null,
      disputeStatus: d.dispute_status ?? null,
    }));

  // Leads matching the buyer's targeting that are still available
  const purchasedIds = new Set(purchasedLeads.map((l) => l.id));
  let leadQuery = supabaseAdmin
    .from("leads")
    .select(`${LEAD_COLUMNS}, lead_deliveries(id)`)
    .neq("status", "disputed")
    .order("created_at", { ascending: false })
    .limit(100);
  if (buyer.targetCountries.length > 0) {
    leadQuery = leadQuery.in("country_target", buyer.targetCountries);
  }
  if (buyer.targetPrograms.length > 0) {
    leadQuery = leadQuery.in("program_target", buyer.targetPrograms);
  }
  if (buyer.minLeadScore !== null) {
    leadQuery = leadQuery.gte("lead_score", buyer.minLeadScore);
  }
  const { data: leadRows } = await leadQuery;
  const availableLeads = (leadRows ?? [])
    .filter((l: any) => !purchasedIds.has(l.id))
    .filter(
      (l: any) =>
        b2b.maxBuyersPerLead === null ||
        (l.lead_deliveries?.length ?? 0) < b2b.maxBuyersPerLead,
    )
    .map((l: any) => toLeadSummary(l, programs));

  return {
    buyer,
    walletBalanceINR: Number(wallet?.balance_inr ?? 0),
    transactions: (txRows ?? []).map((t: any) => ({
      id: t.id,
      type: t.type,
      amountINR: Number(t.amount_inr),
      description: t.description ?? null,
      reference: t.razorpay_payment_id ?? null,
      createdAt: t.created_at,
    })),
    purchasedLeads,
    availableLeads,
    topupRequests: (topupsRes.data ?? []).map((r: any) => ({
      id: r.id,
      amountINR: Number(r.amount_inr),
      paymentReference: r.payment_reference ?? null,
      status: r.status,
      adminNote: r.admin_note ?? null,
      createdAt: r.created_at,
      reviewedAt: r.reviewed_at ?? null,
    })),
    costPerLeadINR: b2b.costPerLeadINR,
    maxBuyersPerLead: b2b.maxBuyersPerLead,
  };
}
