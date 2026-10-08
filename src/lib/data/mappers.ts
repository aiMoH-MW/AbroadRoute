import {
  Country,
  University,
  ProgramCategory,
  UniversityProgram,
  ApplicationDeadline,
  DeadlineMilestone,
} from "@/types";

// ============================================================
// Row mappers — shared by the fallback-tolerant fetchers in
// lib/supabase/dataFetchers and the strict backend fetchers.
// ============================================================

function safeArray<T extends string = string>(val: any, fallback: T[]): T[] {
  if (Array.isArray(val)) return val as T[];
  if (typeof val === "string") {
    try {
      const parsed = JSON.parse(val);
      if (Array.isArray(parsed)) return parsed as T[];
    } catch {
      const parts = val
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean) as T[];
      if (parts.length > 0) return parts;
    }
  }
  return fallback;
}

export function mapSupabaseCountry(c: any): Country {
  return {
    id: c.id,
    name: c.name,
    slug: c.slug,
    code: c.code,
    tier: c.tier,
    flagEmoji: c.flag_emoji || "🌐",
    currency: c.currency,
    currencySymbol: c.currency_symbol,
    exchangeRateToINR: Number(c.exchange_rate_inr) || 85.0,
    popularPrograms: safeArray<ProgramCategory>(c.popular_programs, [
      "ms",
      "mba",
    ]),
    avgTuitionINR: c.avg_tuition_inr || "₹15 - 30 Lakhs / yr",
    avgLivingCostINR: c.avg_living_cost_inr || "₹8 - 12 Lakhs / yr",
    postStudyWorkVisa: c.post_study_work_visa || "1 to 2 Years",
    topIntakes: safeArray<string>(c.top_intakes, [
      "Fall (Sep)",
      "Spring (Jan)",
    ]),
    heroTagline: c.hero_tagline || `Study in ${c.name}`,
    overview: c.overview || `Overview for ${c.name}`,
    safetyRating: Number(c.safety_rating) || 4.5,
  };
}

export function mapSanityCountry(sc: any): Country | null {
  const slugStr = typeof sc.slug === "string" ? sc.slug : sc.slug?.current;
  if (!slugStr) return null;

  return {
    id: sc._id,
    name: sc.name,
    slug: slugStr,
    code: sc.code || "GLOBAL",
    tier: sc.tier || "Tier 1",
    flagEmoji: sc.flagEmoji || "🌐",
    currency: sc.currency || "USD",
    currencySymbol: sc.currencySymbol || "$",
    exchangeRateToINR: Number(sc.exchangeRateToINR) || 85.0,
    popularPrograms: ["ms", "mba"],
    avgTuitionINR: sc.avgTuitionINR || "₹15 - 30 Lakhs / yr",
    avgLivingCostINR: sc.avgLivingCostINR || "₹8 - 12 Lakhs / yr",
    postStudyWorkVisa: sc.postStudyWorkVisa || "1 to 3 Years",
    topIntakes: ["Fall (Sep)", "Spring (Jan)"],
    heroTagline: sc.heroTagline || `Study in ${sc.name}`,
    overview: sc.overview || `Overview for ${sc.name}`,
    safetyRating: Number(sc.safetyRating) || 4.5,
  };
}

// Active `university_programs` rows embedded in a universities query.
function mapUniversityPrograms(rows: any): UniversityProgram[] {
  if (!Array.isArray(rows)) return [];
  return rows
    .filter((r) => r && r.program_id && r.is_active !== false)
    .map((r) => ({
      programId: String(r.program_id),
      yearlyTuitionINR:
        r.yearly_tuition_inr === null || r.yearly_tuition_inr === undefined
          ? null
          : Number(r.yearly_tuition_inr),
      duration: r.duration || null,
    }));
}

export function mapSupabaseUniversity(u: any): University | null {
  if (!u.slug) return null;
  const programs = mapUniversityPrograms(u.university_programs);

  return {
    id: u.id || u.slug,
    name: u.name,
    slug: u.slug,
    country: u.country_id?.toUpperCase() || "Global",
    countrySlug: u.country_id || "global",
    city: u.city,
    rankingGlobal: u.ranking_global || 100,
    rankingNational: u.ranking_national || 10,
    // Assigned programs win; the legacy array covers universities not yet assigned
    programsOffered:
      programs.length > 0
        ? (programs.map((p) => p.programId) as ProgramCategory[])
        : safeArray<ProgramCategory>(u.programs_offered, ["ms", "mba"]),
    programs,
    tuitionFeeRangeINR: u.tuition_fee_range_inr || "₹15 - 30 Lakhs / yr",
    ieltsMinScore: Number(u.ielts_min_score) || 6.5,
    greGmatRequired: u.gre_gmat_required || false,
    intakes: safeArray<string>(u.intakes, ["Fall (Sep)", "Spring (Jan)"]),
    acceptanceRate: u.acceptance_rate || 30,
    nmcCompliant: u.nmc_compliant || false,
    postStudyWorkMonths: u.post_study_work_months || 24,
    featured: u.featured || true,
    claimed_status: u.claimed_status || "unclaimed",
  };
}

export function mapSanityUniversity(su: any): University | null {
  const slugStr = typeof su.slug === "string" ? su.slug : su.slug?.current;
  if (!slugStr) return null;

  return {
    id: su._id,
    name: su.name,
    slug: slugStr,
    country: su.country ? su.country.toUpperCase() : "Global",
    countrySlug: su.country || "global",
    city: su.city || "Campus City",
    rankingGlobal: su.rankingGlobal || 100,
    rankingNational: su.rankingNational || 1,
    programsOffered: ["ms", "mba"],
    tuitionFeeRangeINR: su.tuitionFeeRangeINR || "₹15 - 30 Lakhs / yr",
    ieltsMinScore: Number(su.ieltsMinScore) || 6.5,
    greGmatRequired: su.greGmatRequired || false,
    intakes: ["Fall (Aug/Sep)", "Spring (Jan)"],
    acceptanceRate: su.acceptanceRate || 30,
    postStudyWorkMonths: su.postStudyWorkMonths || 24,
    featured: su.featured ?? true,
  };
}

// Columns for an `application_deadlines` query, with the linked names
export const DEADLINE_SELECT =
  "*, countries(name), universities(name), programs(name)";

export function mapSupabaseDeadline(d: any): ApplicationDeadline {
  return {
    id: d.id,
    countryId: d.country_id,
    countryName: d.countries?.name ?? null,
    universityId: d.university_id ?? null,
    universityName: d.universities?.name ?? null,
    programId: d.program_id ?? null,
    programName: d.programs?.name ?? null,
    intakeTerm: d.intake_term,
    intakeYear: Number(d.intake_year),
    intakeStartDate: d.intake_start_date ?? null,
    deadlineType: d.deadline_type,
    roundName: d.round_name ?? null,
    applicationsOpenDate: d.applications_open_date ?? null,
    deadlineDate: d.deadline_date,
    isRolling: !!d.is_rolling,
    sourceUrl: d.source_url ?? null,
    notes: d.notes ?? null,
    isActive: d.is_active !== false,
  };
}

export const MILESTONE_SELECT = "*, countries(name)";

export function mapSupabaseMilestone(m: any): DeadlineMilestone {
  return {
    id: m.id,
    countryId: m.country_id ?? null,
    countryName: m.countries?.name ?? null,
    deadlineType: m.deadline_type ?? null,
    daysBefore: Number(m.days_before),
    title: m.title,
    description: m.description ?? null,
    actionLabel: m.action_label ?? null,
    isActive: m.is_active !== false,
  };
}
