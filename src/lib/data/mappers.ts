import {
  Country,
  University,
  ProgramCategory,
  UniversityProgram,
  ApplicationDeadline,
  DeadlineMilestone,
  LoanLender,
  Scholarship,
} from "@/types";

// ============================================================
// Row mappers — shared by lib/supabase/dataFetchers and the
// strict backend fetchers. Values missing in the database stay
// null (or an empty list) so the UI can show "Not provided";
// nothing here invents a default.
// ============================================================

function toArray<T extends string = string>(val: any): T[] {
  if (Array.isArray(val)) return val.filter(Boolean) as T[];
  if (typeof val === "string" && val.trim()) {
    try {
      const parsed = JSON.parse(val);
      if (Array.isArray(parsed)) return parsed.filter(Boolean) as T[];
    } catch {
      return val
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean) as T[];
    }
  }
  return [];
}

const numberOrNull = (v: any): number | null => {
  if (v === null || v === undefined || v === "") return null;
  const num = Number(v);
  return Number.isNaN(num) ? null : num;
};

const textOrNull = (v: any): string | null =>
  typeof v === "string" && v.trim() !== "" ? v : null;

const booleanOrNull = (v: any): boolean | null =>
  typeof v === "boolean" ? v : null;

export function mapSupabaseCountry(c: any): Country {
  return {
    id: c.id,
    name: c.name,
    slug: c.slug,
    code: c.code,
    tier: c.tier,
    flagEmoji: textOrNull(c.flag_emoji),
    currency: c.currency,
    currencySymbol: c.currency_symbol,
    exchangeRateToINR: numberOrNull(c.exchange_rate_inr),
    popularPrograms: toArray<ProgramCategory>(c.popular_programs),
    avgTuitionINR: textOrNull(c.avg_tuition_inr),
    avgLivingCostINR: textOrNull(c.avg_living_cost_inr),
    postStudyWorkVisa: textOrNull(c.post_study_work_visa),
    topIntakes: toArray<string>(c.top_intakes),
    heroTagline: textOrNull(c.hero_tagline),
    overview: textOrNull(c.overview),
    safetyRating: numberOrNull(c.safety_rating),
    isAnchor: c.is_anchor === true,
    heroSubtitle: textOrNull(c.hero_subtitle),
    overviewHeading: textOrNull(c.overview_heading),
    overviewBody: textOrNull(c.overview_body),
    programsOfferedNotes: textOrNull(c.programs_offered_notes),
    visaType: textOrNull(c.visa_type),
    visaProcessingTime: textOrNull(c.visa_processing_time),
    workHoursDuringTerm: textOrNull(c.work_hours_during_term),
    financialProofRequired: textOrNull(c.financial_proof_required),
    prPathwaySummary: textOrNull(c.pr_pathway_summary),
  };
}

// Active `university_programs` rows embedded in a universities query.
function mapUniversityPrograms(rows: any): UniversityProgram[] {
  if (!Array.isArray(rows)) return [];
  return rows
    .filter((r) => r && r.program_id && r.is_active !== false)
    .map((r) => ({
      programId: String(r.program_id),
      yearlyTuitionINR: numberOrNull(r.yearly_tuition_inr),
      duration: r.duration || null,
    }));
}

function optionalNumber(value: any): number | undefined {
  return numberOrNull(value) ?? undefined;
}

// Eligibility Checker columns from migration 0018; absent before it is applied
export function mapEligibilityRequirements(u: any): Partial<University> {
  return {
    minPercentage: optionalNumber(u.min_percentage),
    ieltsMinBand: optionalNumber(u.ielts_min_band),
    toeflMinScore: optionalNumber(u.toefl_min_score),
    pteMinScore: optionalNumber(u.pte_min_score),
    duolingoMinScore: optionalNumber(u.duolingo_min_score),
    apsRequired: u.aps_required === true,
    fourYearDegreeRequired: u.four_year_degree_required === true,
    maxBacklogs: optionalNumber(u.max_backlogs),
    requirementsSourceUrl: u.requirements_source_url || undefined,
    requirementsVerifiedOn: u.requirements_verified_on || undefined,
  };
}

// Columns for a `universities` query: country name and assigned programs
export const UNIVERSITY_SELECT =
  "*, countries(name), university_programs(program_id, yearly_tuition_inr, duration, is_active)";

/**
 * `cityNames` maps cities.id → name; universities.city holds that id
 * (e.g. 'stanford-ca'). Unknown ids are shown as stored.
 */
export function mapSupabaseUniversity(
  u: any,
  cityNames?: Map<string, string>,
): University | null {
  if (!u.slug) return null;
  const programs = mapUniversityPrograms(u.university_programs);
  const cityId = textOrNull(u.city);

  return {
    id: u.id || u.slug,
    name: u.name,
    slug: u.slug,
    country: textOrNull(u.countries?.name) ?? textOrNull(u.country_id),
    countrySlug: textOrNull(u.country_id),
    city: cityId ? (cityNames?.get(cityId) ?? cityId) : null,
    cityId,
    rankingGlobal: numberOrNull(u.ranking_global),
    rankingNational: numberOrNull(u.ranking_national),
    // Assigned programs win; the legacy array covers universities not yet assigned
    programsOffered:
      programs.length > 0
        ? (programs.map((p) => p.programId) as ProgramCategory[])
        : toArray<ProgramCategory>(u.programs_offered),
    programs,
    tuitionFeeRangeINR: textOrNull(u.tuition_fee_range_inr),
    ieltsMinScore: numberOrNull(u.ielts_min_score),
    greGmatRequired: booleanOrNull(u.gre_gmat_required),
    intakes: toArray<string>(u.intakes),
    acceptanceRate: numberOrNull(u.acceptance_rate),
    nmcCompliant: u.nmc_compliant === true,
    postStudyWorkMonths: numberOrNull(u.post_study_work_months),
    ...mapEligibilityRequirements(u),
    logoUrl: u.logo_url || undefined,
    bannerUrl: u.banner_url || undefined,
    featured: u.featured === true,
    claimed_status: u.claimed_status || "unclaimed",
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

export function mapSupabaseLoanLender(l: any): LoanLender {
  return {
    id: l.id,
    name: l.name,
    lenderType: l.lender_type,
    currency: l.currency ?? "INR",
    rateMin: numberOrNull(l.rate_min),
    rateMax: numberOrNull(l.rate_max),
    rateNote: l.rate_note ?? null,
    maxAmountINR: numberOrNull(l.max_amount_inr),
    maxUnsecuredINR: numberOrNull(l.max_unsecured_inr),
    moratoriumNote: l.moratorium_note ?? null,
    processingFeeNote: l.processing_fee_note ?? null,
    websiteUrl: l.website_url ?? null,
    lastVerifiedOn: l.last_verified_on ?? null,
    notes: l.notes ?? null,
    sortOrder: Number(l.sort_order) || 0,
    isActive: l.is_active !== false,
  };
}

export const SCHOLARSHIP_SELECT =
  "*, countries(name, code), universities(name)";

export function mapSupabaseScholarship(s: any): Scholarship {
  return {
    id: s.id,
    name: s.name,
    provider: s.provider ?? null,
    countryId: s.country_id ?? null,
    countryName: s.countries?.name ?? null,
    countryCode: s.countries?.code ?? null,
    destinationLabel: s.destination_label ?? null,
    universityId: s.university_id ?? null,
    universityName: s.universities?.name ?? null,
    fundingType: s.funding_type,
    coverage: s.coverage,
    awardSummary: s.award_summary ?? null,
    awardValue: numberOrNull(s.award_value),
    awardCurrency: s.award_currency ?? null,
    awardPeriod: s.award_period ?? null,
    studyLevels: Array.isArray(s.study_levels) ? s.study_levels : [],
    fields: s.fields ?? null,
    minWorkExperienceMonths: numberOrNull(s.min_work_experience_months),
    womenOnly: !!s.women_only,
    socialCategories: Array.isArray(s.social_categories)
      ? s.social_categories
      : [],
    needBased: !!s.need_based,
    eligibilityNote: s.eligibility_note ?? null,
    overview: s.overview ?? null,
    opensOn: s.opens_on ?? null,
    deadline: s.deadline ?? null,
    deadlineNote: s.deadline_note ?? null,
    websiteUrl: s.website_url ?? null,
    lastVerifiedOn: s.last_verified_on ?? null,
    sortOrder: Number(s.sort_order) || 0,
    isActive: s.is_active !== false,
  };
}
