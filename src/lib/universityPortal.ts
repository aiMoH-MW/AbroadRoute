import "server-only";
import type { User } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { getRequestUser, hasConfirmedEmail } from "@/lib/supabase/requestAuth";
import { fetchUniversityProfile } from "@/lib/compareData";
import { fetchSiteSettings } from "@/lib/siteContent";
import type {
  InquiryStatus,
  UniversityPortalData,
} from "@/lib/universityPortalTypes";

/** The university claimed by (and verified for) this account, if any. */
export async function getUniversityForUser(
  user: User,
): Promise<{ id: string; slug: string } | null> {
  const { data } = await supabaseAdmin
    .from("universities")
    .select("id, slug")
    .eq("claimed_by_user_id", user.id)
    .limit(1)
    .maybeSingle();
  return data ?? null;
}

/** Signed-in user and their claimed university, or an error response. */
export async function requireUniversityOwner(
  request: Request,
): Promise<{ user: User; university: { id: string; slug: string } } | { response: NextResponse }> {
  const user = await getRequestUser(request);
  if (!user) {
    return { response: NextResponse.json({ success: false, error: "Please sign in" }, { status: 401 }) };
  }
  const university = await getUniversityForUser(user);
  if (!university) {
    return {
      response: NextResponse.json(
        { success: false, error: "No verified university profile for this account" },
        { status: 403 },
      ),
    };
  }
  return { user, university };
}

const INQUIRY_STATUSES: InquiryStatus[] = ["new", "reviewing", "shortlisted", "contacted"];

export async function loadUniversityPortal(user: User): Promise<UniversityPortalData> {
  const owned = await getUniversityForUser(user);

  const [programsRes, plansRes, settings, claimRes] = await Promise.all([
    supabaseAdmin.from("programs").select("id, name").order("name"),
    supabaseAdmin
      .from("university_listing_plans")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true }),
    fetchSiteSettings(),
    supabaseAdmin
      .from("university_claims")
      .select("university_name, verification_status, created_at")
      .or(
        [
          `user_id.eq.${user.id}`,
          hasConfirmedEmail(user) && `official_email.eq."${user.email}"`,
        ]
          .filter(Boolean)
          .join(","),
      )
      .order("created_at", { ascending: false })
      .limit(1),
  ]);

  const programNames = new Map<string, string>(
    (programsRes.data ?? []).map((p: any) => [String(p.id), p.name]),
  );

  let inquiries: UniversityPortalData["inquiries"] = [];
  if (owned) {
    const { data: leadRows } = await supabaseAdmin
      .from("leads")
      .select(
        "id, full_name, email, phone, program_target, highest_education, ielts_score, budget_range_inr, intake_year, university_status, created_at, countries(name)",
      )
      .eq("university_id", owned.id)
      .order("created_at", { ascending: false })
      .limit(500);
    inquiries = (leadRows ?? []).map((l: any) => ({
      id: l.id,
      fullName: l.full_name,
      email: l.email,
      phone: l.phone,
      countryName: l.countries?.name ?? null,
      programId: l.program_target ?? null,
      programName: l.program_target
        ? (programNames.get(String(l.program_target)) ?? String(l.program_target))
        : null,
      highestEducation: l.highest_education ?? null,
      ieltsScore: l.ielts_score ?? null,
      budgetRange: l.budget_range_inr ?? null,
      intakeYear: l.intake_year ?? null,
      status: INQUIRY_STATUSES.includes(l.university_status) ? l.university_status : "new",
      createdAt: l.created_at,
    }));
  }

  const claim = claimRes.data?.[0];
  return {
    university: owned ? await fetchUniversityProfile(owned.slug) : null,
    claim: claim
      ? {
          universityName: claim.university_name,
          status: claim.verification_status,
          createdAt: claim.created_at ?? null,
        }
      : null,
    programsCatalog: (programsRes.data ?? []).map((p: any) => ({
      id: String(p.id),
      name: p.name,
    })),
    inquiries,
    listingPlans: (plansRes.data ?? []).map((p: any) => ({
      id: p.id,
      name: p.name,
      tagline: p.tagline ?? null,
      priceINR: p.price_inr ?? null,
      priceUSD: p.price_usd ?? null,
      billingPeriod: p.billing_period ?? null,
      features: String(p.features ?? "")
        .split("\n")
        .map((f) => f.trim())
        .filter(Boolean),
    })),
    contactEmail: settings.contact_email ?? null,
  };
}
