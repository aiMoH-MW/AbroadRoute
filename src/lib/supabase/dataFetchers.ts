import { supabase, getAuthHeaders } from "./client";
import { supabaseAdmin } from "./server";
import {
  City,
  Country,
  University,
  Program,
  Specialisation,
  TestPrepExam,
  ApplicationDeadline,
  DeadlineMilestone,
  LoanLender,
  Scholarship,
} from "@/types";
import {
  mapSupabaseCountry,
  mapSupabaseUniversity,
  UNIVERSITY_SELECT,
  mapSupabaseDeadline,
  DEADLINE_SELECT,
  mapSupabaseMilestone,
  MILESTONE_SELECT,
  mapSupabaseLoanLender,
  mapSupabaseScholarship,
  SCHOLARSHIP_SELECT,
} from "@/lib/data/mappers";
import {
  getLiveExchangeRates,
  withLiveExchangeRates,
} from "@/lib/exchangeRates";

async function queryWithTimeout<T>(
  promiseFactory: () => PromiseLike<T>,
  timeoutMs = 2500,
): Promise<T | null> {
  let timeoutHandle: any;
  const timeoutPromise = new Promise<null>((resolve) => {
    timeoutHandle = setTimeout(() => resolve(null), timeoutMs);
  });

  try {
    const result = await Promise.race([promiseFactory(), timeoutPromise]);
    return result as T;
  } catch {
    return null;
  } finally {
    clearTimeout(timeoutHandle);
  }
}

export async function fetchLiveCountries(): Promise<Country[]> {
  // Client-side browser request: fetch via internal API route to bypass browser RLS constraints
  if (typeof window !== "undefined") {
    try {
      const res = await fetch("/api/countries");
      if (res.ok) {
        const json = await res.json();
        if (
          json.countries &&
          Array.isArray(json.countries) &&
          json.countries.length > 0
        ) {
          return json.countries;
        }
      }
    } catch (err) {
      console.warn("Client fetch /api/countries error:", err);
    }
  }

  let list: Country[] = [];

  // Server-side: Direct Supabase query using supabaseAdmin
  try {
    const client = typeof window === "undefined" ? supabaseAdmin : supabase;
    const response = await queryWithTimeout(
      () => client.from("countries").select("*").eq("is_active", true),
      2500,
    );
    if (
      response &&
      !(response as any).error &&
      (response as any).data &&
      (response as any).data.length > 0
    ) {
      list = (response as any).data.map(mapSupabaseCountry);
    }
  } catch (err) {
    console.warn("Supabase countries fetch error:", err);
  }

  // Live exchange rates; the stored rate stays as the fallback
  return withLiveExchangeRates(list);
}

export async function fetchLiveUniversities(): Promise<University[]> {
  // Client-side browser request: fetch via internal API route to bypass browser RLS constraints
  if (typeof window !== "undefined") {
    try {
      const res = await fetch("/api/universities");
      if (res.ok) {
        const json = await res.json();
        if (
          json.universities &&
          Array.isArray(json.universities) &&
          json.universities.length > 0
        ) {
          return json.universities;
        }
      }
    } catch (err) {
      console.warn("Client fetch /api/universities error:", err);
    }
  }

  // Server-side: Direct Supabase query using supabaseAdmin
  try {
    const client = typeof window === "undefined" ? supabaseAdmin : supabase;
    const [uniRes, cityRes] = await Promise.all([
      queryWithTimeout(
        () => client.from("universities").select(UNIVERSITY_SELECT),
        2500,
      ),
      queryWithTimeout(() => client.from("cities").select("id, name"), 2500),
    ]);
    let response: any = uniRes;
    // Before the university_programs migration is applied the embed fails
    if (response && response.error) {
      response = await queryWithTimeout(
        () => client.from("universities").select("*, countries(name)"),
        2500,
      );
    }
    if (!response || response.error || !response.data) return [];

    const cityNames = new Map<string, string>(
      ((cityRes as any)?.data ?? []).map((c: any) => [String(c.id), c.name]),
    );
    return (response.data as any[])
      .map((u) => mapSupabaseUniversity(u, cityNames))
      .filter((u): u is University => u !== null);
  } catch (err) {
    console.warn("Supabase universities fetch error:", err);
    return [];
  }
}

export async function fetchLivePrograms(): Promise<Program[]> {
  // Client-side browser request: fetch via internal API route to bypass browser RLS constraints
  if (typeof window !== "undefined") {
    try {
      const res = await fetch("/api/programs");
      if (res.ok) {
        const json = await res.json();
        if (
          json.programs &&
          Array.isArray(json.programs) &&
          json.programs.length > 0
        ) {
          return json.programs;
        }
      }
    } catch (err) {
      console.warn("Client fetch /api/programs error:", err);
    }
  }

  // Server-side: Direct Supabase query using supabaseAdmin
  try {
    const client = typeof window === "undefined" ? supabaseAdmin : supabase;
    const response = await queryWithTimeout(
      () => client.from("programs").select("*"),
      2500,
    );
    if (
      response &&
      !(response as any).error &&
      (response as any).data &&
      (response as any).data.length > 0
    ) {
      return (response as any).data.map((p: any) => ({
        id: p.id || p.slug,
        name: p.name,
        slug: p.slug,
        level: p.level || null,
        duration: p.duration || null,
        keyFields: Array.isArray(p.key_fields) ? p.key_fields : [],
        topDestinations: Array.isArray(p.top_destinations)
          ? p.top_destinations
          : [],
        summary: p.summary || null,
        roiScore: toNumberOrNull(p.roi_score),
        yearlyEducationalCost: toNumberOrNull(p.yearly_educational_cost),
      }));
    }
  } catch (err) {
    console.warn("Supabase programs fetch error:", err);
  }
  return [];
}

export const COUNTRY_ALIASES: Record<string, string> = {
  "united-states": "usa",
  "united-kingdom": "uk",
  america: "usa",
  britain: "uk",
  england: "uk",
  holland: "netherlands",
  dubai: "uae",
  "united-arab-emirates": "uae",
  nz: "new-zealand",
};

export const PROGRAM_ALIASES: Record<string, string> = {
  "emba-executive": "emba",
  "executive-mba": "emba",
  "emba-abroad": "emba",
  "masters-stem": "ms",
  "stem-masters": "ms",
  masters: "ms",
  "masters-abroad": "ms",
  "mba-management": "mba",
  "mba-abroad": "mba",
  "mbbs-medicine": "mbbs",
  medicine: "mbbs",
  "mbbs-abroad": "mbbs",
  "nursing-healthcare": "nursing",
  "nursing-abroad": "nursing",
  "germany-ausbildung": "ausbildung",
  "ausbildung-germany": "ausbildung",
  "bachelors-ug": "bachelors",
  undergraduate: "bachelors",
  "bachelors-abroad": "bachelors",
  "phd-doctoral": "phd",
  "phd-research": "phd",
  "phd-abroad": "phd",
  doctoral: "phd",
};

export async function getLiveCountryBySlug(
  slug: string,
): Promise<Country | undefined> {
  if (!slug) return undefined;
  let normalized = slug.toLowerCase().trim();
  if (normalized.startsWith("study-in-")) {
    normalized = normalized.replace("study-in-", "");
  }
  const canonical = COUNTRY_ALIASES[normalized] || normalized;
  const countries = await fetchLiveCountries();
  return countries.find((c) => c.slug === canonical || c.id === canonical);
}

export async function getLiveProgramBySlug(
  slug: string,
): Promise<Program | undefined> {
  if (!slug) return undefined;
  const normalized = slug.toLowerCase().trim();
  const canonical = PROGRAM_ALIASES[normalized] || normalized;
  const programs = await fetchLivePrograms();
  return programs.find((p) => p.slug === canonical || p.id === canonical);
}

export async function getLiveUniversityBySlug(
  slug: string,
): Promise<University | undefined> {
  if (!slug) return undefined;
  const normalized = slug.toLowerCase().trim();
  const universities = await fetchLiveUniversities();
  return universities.find(
    (u) =>
      u.slug.toLowerCase() === normalized || u.id?.toLowerCase() === normalized,
  );
}

export interface ClaimItem {
  id: string;
  universityId: string;
  universityName: string;
  countryId?: string | null;
  countryCode?: string | null;
  countryName?: string | null;
  applicantName: string;
  officialEmail: string;
  designation: string | null;
  proofDocumentUrl?: string;
  status: string;
  createdAt: string | null;
  userId?: string;
}

export async function fetchLiveClaims(): Promise<ClaimItem[]> {
  try {
    if (typeof window !== "undefined") {
      const res = await fetch("/api/claims", {
        cache: "no-store",
        headers: await getAuthHeaders(),
      });
      const json = await res.json();
      if (json.success && json.claims && json.claims.length > 0) {
        return json.claims;
      }
    } else {
      const response = await queryWithTimeout(
        () =>
          supabaseAdmin
            .from("university_claims")
            .select("*")
            .order("created_at", { ascending: false }),
        2000,
      );

      if (
        response &&
        !(response as any).error &&
        (response as any).data &&
        (response as any).data.length > 0
      ) {
        return (response as any).data.map((c: any) => ({
          id: c.id,
          universityId: c.university_id,
          universityName: c.university_name,
          applicantName: c.applicant_name,
          officialEmail: c.official_email,
          designation: c.designation || null,
          proofDocumentUrl: c.proof_document_url,
          status: c.verification_status || "pending",
          createdAt: c.created_at
            ? new Date(c.created_at).toLocaleDateString()
            : null,
        }));
      }
    }
  } catch (err) {
    console.warn("Supabase claims fetch error:", err);
  }

  return [];
}

/**
 * Specialisations live only in the Supabase `specialisations` table (no static
 * fallback), ordered by `display_order` so tracks render in a fixed sequence.
 */
export async function fetchLiveSpecialisations(): Promise<Specialisation[]> {
  try {
    const client = typeof window === "undefined" ? supabaseAdmin : supabase;
    const response = await queryWithTimeout(
      () => client.from("specialisations").select("*"),
      5000,
    );
    if (!response) {
      console.warn("Supabase specialisations fetch timed out.");
      return [];
    }
    if ((response as any).error) {
      console.warn(
        "Supabase specialisations fetch error:",
        (response as any).error,
      );
      return [];
    }

    return ((response as any).data ?? [])
      .slice()
      .sort(
        (a: any, b: any) =>
          (a.display_order ?? Number.MAX_SAFE_INTEGER) -
            (b.display_order ?? Number.MAX_SAFE_INTEGER) ||
          String(a.program_slug).localeCompare(String(b.program_slug)),
      )
      .map((s: any) => ({
        id: s.id,
        programSlug: s.program_slug,
        anchorCategory: s.anchor_category,
        name: s.name,
        slug: s.slug,
        description: s.description || "",
        focusAreas: Array.isArray(s.focus_areas) ? s.focus_areas : [],
        targetDestinations: Array.isArray(s.target_destinations)
          ? s.target_destinations
          : [],
        durationFormats: Array.isArray(s.duration_formats)
          ? s.duration_formats
          : [],
        licensingPathways: Array.isArray(s.licensing_pathways)
          ? s.licensing_pathways
          : [],
        contentInvestmentShare: s.content_investment_share || "",
        isYearOneAnchor: s.is_year_one_anchor ?? true,
      }));
  } catch (err) {
    console.warn("Supabase specialisations fetch error:", err);
    return [];
  }
}

export async function getSpecialisationsByProgramSlug(
  programSlug: string,
): Promise<Specialisation[]> {
  const all = await fetchLiveSpecialisations();
  const normalized = programSlug.toLowerCase().trim();
  const canonical = PROGRAM_ALIASES[normalized] || normalized;
  return all.filter(
    (s) =>
      s.programSlug.toLowerCase() === canonical ||
      s.slug.toLowerCase().includes(canonical),
  );
}

const byDisplayOrder = (a: any, b: any) =>
  (a.display_order ?? Number.MAX_SAFE_INTEGER) -
  (b.display_order ?? Number.MAX_SAFE_INTEGER);

function mapTestPrepExam(e: any): TestPrepExam {
  return {
    id: e.id,
    slug: e.slug,
    name: e.name,
    shortName: e.short_name,
    fullName: e.full_name,
    category: e.category,
    heroTagline: e.hero_tagline || null,
    targetPrograms: Array.isArray(e.target_programs) ? e.target_programs : [],
    targetCountries: Array.isArray(e.target_countries)
      ? e.target_countries
      : [],
    overview: e.overview || null,
    feeINR: e.fee_inr || null,
    feeOriginal: e.fee_original || null,
    duration: e.duration || null,
    formatMode: e.format_mode || null,
    validityYears: e.validity_years ?? null,
    scoringScale: e.scoring_scale || null,
    targetCutoffIndianStudents: e.target_cutoff_indian_students || null,
    conductingBody: e.conducting_body || null,
    frequency: e.frequency || null,
    sections: (Array.isArray(e.test_prep_sections) ? e.test_prep_sections : [])
      .slice()
      .sort(byDisplayOrder)
      .map((s: any) => ({
        id: s.id,
        name: s.name,
        duration: s.duration || null,
        questionsCount: s.questions_count || null,
        skillsTested: s.skills_tested || null,
        tips: s.tips || null,
      })),
    scoreRequirementsByCountry: Array.isArray(e.score_requirements)
      ? e.score_requirements
      : [],
    prepRoadmap: Array.isArray(e.prep_roadmap) ? e.prep_roadmap : [],
    faqs: Array.isArray(e.faqs) ? e.faqs : [],
  };
}

/**
 * Active test prep exams (with sections) from the Supabase `test_prep_exams`
 * table, in `display_order`. Returns [] if the database is unavailable.
 */
export async function fetchTestPrepExams(): Promise<TestPrepExam[]> {
  try {
    const client = typeof window === "undefined" ? supabaseAdmin : supabase;
    const response = await queryWithTimeout(
      () =>
        client
          .from("test_prep_exams")
          .select("*, test_prep_sections(*)")
          .eq("is_active", true),
      5000,
    );
    if (!response) {
      console.warn("Supabase test_prep_exams fetch timed out.");
      return [];
    }
    if ((response as any).error) {
      console.warn(
        "Supabase test_prep_exams fetch error:",
        (response as any).error,
      );
      return [];
    }
    return ((response as any).data ?? [])
      .slice()
      .sort(byDisplayOrder)
      .map(mapTestPrepExam);
  } catch (err) {
    console.warn("Supabase test_prep_exams fetch error:", err);
    return [];
  }
}

export async function getTestPrepExamBySlug(
  slug: string,
): Promise<TestPrepExam | null> {
  const normalized = slug.toLowerCase().trim();
  const exams = await fetchTestPrepExams();
  return exams.find((e) => e.slug.toLowerCase() === normalized) ?? null;
}

function toNumberOrNull(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

/**
 * Active cities from the Supabase `cities` table, sorted by name.
 * Returns [] if the database is unavailable.
 */
export async function fetchLiveCities(): Promise<City[]> {
  try {
    const client = typeof window === "undefined" ? supabaseAdmin : supabase;
    const response = await queryWithTimeout(
      () => client.from("cities").select("*").eq("is_active", true),
      5000,
    );
    if (!response || (response as any).error) {
      console.warn("Supabase cities fetch error:", (response as any)?.error);
      return [];
    }
    return ((response as any).data ?? [])
      .map((c: any): City => ({
        id: c.id,
        countryId: c.country_id,
        name: c.name,
        stateRegion: c.state_region ?? null,
        accommodationMonthly: toNumberOrNull(c.monthly_accommodation_cost),
        foodMonthly: toNumberOrNull(c.monthly_food_groceries_cost),
        transportMonthly: toNumberOrNull(c.monthly_public_transport_cost),
        miscMonthly: toNumberOrNull(c.miscellaneous),
        costBufferPercentage: toNumberOrNull(c.cost_buffer_percentage),
      }))
      .sort((a: City, b: City) => a.name.localeCompare(b.name));
  } catch (err) {
    console.warn("Supabase cities fetch error:", err);
    return [];
  }
}

// Active application deadlines, soonest first. Empty when none are added.
export async function fetchLiveDeadlines(): Promise<ApplicationDeadline[]> {
  // Client-side: via the API route, which can read the joined names
  if (typeof window !== "undefined") {
    try {
      const res = await fetch("/api/application-deadlines");
      const json = await res.json();
      return res.ok && Array.isArray(json.deadlines) ? json.deadlines : [];
    } catch (err) {
      console.warn("Client fetch /api/application-deadlines error:", err);
      return [];
    }
  }

  try {
    const response = await queryWithTimeout(
      () =>
        supabaseAdmin
          .from("application_deadlines")
          .select(DEADLINE_SELECT)
          .eq("is_active", true)
          .order("deadline_date", { ascending: true }),
      5000,
    );
    if (!response || (response as any).error) {
      console.warn(
        "Supabase application_deadlines fetch error:",
        (response as any)?.error,
      );
      return [];
    }
    return ((response as any).data ?? []).map(mapSupabaseDeadline);
  } catch (err) {
    console.warn("Supabase application_deadlines fetch error:", err);
    return [];
  }
}

// Active countdown milestones, furthest first. Empty when none are added.
export async function fetchLiveMilestones(): Promise<DeadlineMilestone[]> {
  // Client-side: via the API route, which can read the joined names
  if (typeof window !== "undefined") {
    try {
      const res = await fetch("/api/deadline-milestones");
      const json = await res.json();
      return res.ok && Array.isArray(json.milestones) ? json.milestones : [];
    } catch (err) {
      console.warn("Client fetch /api/deadline-milestones error:", err);
      return [];
    }
  }

  try {
    const response = await queryWithTimeout(
      () =>
        supabaseAdmin
          .from("deadline_milestones")
          .select(MILESTONE_SELECT)
          .eq("is_active", true)
          .order("days_before", { ascending: false }),
      5000,
    );
    if (!response || (response as any).error) {
      console.warn(
        "Supabase deadline_milestones fetch error:",
        (response as any)?.error,
      );
      return [];
    }
    return ((response as any).data ?? []).map(mapSupabaseMilestone);
  } catch (err) {
    console.warn("Supabase deadline_milestones fetch error:", err);
    return [];
  }
}

// Active loan lenders in display order. Empty when none are added.
export async function fetchLiveLoanLenders(): Promise<LoanLender[]> {
  if (typeof window !== "undefined") {
    try {
      const res = await fetch("/api/loan-lenders");
      const json = await res.json();
      return res.ok && Array.isArray(json.lenders) ? json.lenders : [];
    } catch (err) {
      console.warn("Client fetch /api/loan-lenders error:", err);
      return [];
    }
  }

  try {
    const response = await queryWithTimeout(
      () =>
        supabaseAdmin
          .from("loan_lenders")
          .select("*")
          .eq("is_active", true)
          .order("sort_order", { ascending: true })
          .order("name", { ascending: true }),
      5000,
    );
    if (!response || (response as any).error) {
      console.warn(
        "Supabase loan_lenders fetch error:",
        (response as any)?.error,
      );
      return [];
    }
    return ((response as any).data ?? []).map(mapSupabaseLoanLender);
  } catch (err) {
    console.warn("Supabase loan_lenders fetch error:", err);
    return [];
  }
}

// Active scholarships in display order. Empty when none are added.
export async function fetchLiveScholarships(): Promise<Scholarship[]> {
  if (typeof window !== "undefined") {
    try {
      const res = await fetch("/api/scholarships");
      const json = await res.json();
      return res.ok && Array.isArray(json.scholarships)
        ? json.scholarships
        : [];
    } catch (err) {
      console.warn("Client fetch /api/scholarships error:", err);
      return [];
    }
  }

  try {
    const response = await queryWithTimeout(
      () =>
        supabaseAdmin
          .from("scholarships")
          .select(SCHOLARSHIP_SELECT)
          .eq("is_active", true)
          .order("sort_order", { ascending: true })
          .order("name", { ascending: true }),
      5000,
    );
    if (!response || (response as any).error) {
      console.warn(
        "Supabase scholarships fetch error:",
        (response as any)?.error,
      );
      return [];
    }
    const scholarships: Scholarship[] = ((response as any).data ?? []).map(
      mapSupabaseScholarship,
    );

    // Award value in INR at the live rate (INR amounts need no rate)
    const needsRate = scholarships.some(
      (s) =>
        s.awardValue !== null && s.awardCurrency && s.awardCurrency !== "INR",
    );
    const live = needsRate ? await getLiveExchangeRates() : null;
    return scholarships.map((s) => {
      if (s.awardValue === null || !s.awardCurrency) return s;
      if (s.awardCurrency === "INR")
        return { ...s, awardValueINR: s.awardValue };
      const rate = live?.inrPerUnit[s.awardCurrency];
      return rate
        ? {
            ...s,
            awardValueINR: Math.round(s.awardValue * rate),
            rateUpdatedAt: live!.updatedAt,
          }
        : s;
    });
  } catch (err) {
    console.warn("Supabase scholarships fetch error:", err);
    return [];
  }
}
