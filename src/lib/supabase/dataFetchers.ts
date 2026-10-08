import { supabase, getAuthHeaders } from "./client";
import { supabaseAdmin } from "./server";
import {
  City,
  Country,
  University,
  CourseItem,
  Program,
  Specialisation,
  TestPrepExam,
} from "@/types";
import {
  mapSupabaseCountry,
  mapSanityCountry,
  mapSupabaseUniversity,
  mapSanityUniversity,
} from "@/lib/data/mappers";
import {
  getSanityUniversities,
  getSanityCountries,
} from "@/lib/sanity/fetchers";
import { withLiveExchangeRates } from "@/lib/exchangeRates";

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

  // 2. Merge Sanity CMS Countries (Prepend / update by slug)
  try {
    const sanityCountries = await queryWithTimeout(
      () => getSanityCountries(),
      2000,
    );
    if (sanityCountries && sanityCountries.length > 0) {
      const map = new Map<string, Country>();

      sanityCountries.forEach((sc: any) => {
        const mapped = mapSanityCountry(sc);
        if (mapped) {
          map.set(mapped.slug, mapped);
        }
      });

      list.forEach((c) => {
        if (!map.has(c.slug)) {
          map.set(c.slug, c);
        }
      });

      list = Array.from(map.values());
    }
  } catch (err) {
    console.warn("Sanity countries fetch error:", err);
  }

  // 3. Live exchange rates; the stored rate stays as the fallback
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

  const uniMap = new Map<string, University>();

  // Server-side: Direct Supabase query using supabaseAdmin
  try {
    const client = typeof window === "undefined" ? supabaseAdmin : supabase;
    let response = await queryWithTimeout(
      () =>
        client
          .from("universities")
          .select(
            "*, university_programs(program_id, yearly_tuition_inr, duration, is_active)",
          ),
      2500,
    );
    // Before the university_programs migration is applied the embed fails
    if (response && (response as any).error) {
      response = await queryWithTimeout(
        () => client.from("universities").select("*"),
        2500,
      );
    }
    if (
      response &&
      !(response as any).error &&
      (response as any).data &&
      (response as any).data.length > 0
    ) {
      (response as any).data.forEach((u: any) => {
        const mapped = mapSupabaseUniversity(u);
        if (mapped) {
          uniMap.set(mapped.slug, mapped);
        }
      });
    }
  } catch (err) {
    console.warn("Supabase universities fetch error:", err);
  }

  // 2. Merge Sanity CMS Universities
  try {
    const sanityUnis = await queryWithTimeout(
      () => getSanityUniversities(),
      2000,
    );
    if (sanityUnis && sanityUnis.length > 0) {
      sanityUnis.forEach((su: any) => {
        const mapped = mapSanityUniversity(su);
        if (mapped) {
          // Program assignments live in Supabase; keep them over Sanity's defaults
          const existing = uniMap.get(mapped.slug);
          if (existing?.programs?.length) {
            mapped.programs = existing.programs;
            mapped.programsOffered = existing.programsOffered;
          }
          uniMap.set(mapped.slug, mapped);
        }
      });
    }
  } catch (err) {
    console.warn("Sanity universities fetch fallback:", err);
  }

  return Array.from(uniMap.values());
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
        level: p.level || "Postgraduate",
        duration: p.duration || "2 Years",
        keyFields: Array.isArray(p.key_fields) ? p.key_fields : [],
        topDestinations: Array.isArray(p.top_destinations)
          ? p.top_destinations
          : [],
        summary: p.summary || "",
        roiScore: Number(p.roi_score) || 90,
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
  countryName?: string;
  applicantName: string;
  officialEmail: string;
  designation: string;
  proofDocumentUrl?: string;
  status: string;
  createdAt: string;
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
          designation: c.designation || "Admissions Representative",
          proofDocumentUrl: c.proof_document_url,
          status: c.verification_status || "pending",
          createdAt: new Date(c.created_at || Date.now()).toLocaleDateString(),
        }));
      }
    }
  } catch (err) {
    console.warn("Supabase claims fetch error:", err);
  }

  return [];
}

export async function fetchLiveCourses(): Promise<CourseItem[]> {
  const courseMap = new Map<string, CourseItem>();

  // 1. Fetch live universities from Supabase
  const universities = await fetchLiveUniversities();

  const flagMap: Record<string, string> = {
    germany: "🇩🇪",
    usa: "🇺🇸",
    uk: "🇬🇧",
    canada: "🇨🇦",
    ireland: "🇮🇪",
    australia: "🇦🇺",
    france: "🇫🇷",
    uzbekistan: "🇺🇿",
    global: "🌐",
  };

  // 2. Build course catalog dynamically from fetched Supabase universities
  universities.forEach((u) => {
    const countryFlag = flagMap[u.countrySlug?.toLowerCase() || ""] || "🌐";

    (u.programsOffered || []).forEach((prog) => {
      let programTitle = "";
      let level = "Postgraduate (Master's)";
      let duration = "2 Years";
      let coreModules = [
        "Core Academic Curriculum",
        "Applied Project",
        "Research Thesis",
        "Specialization Elective",
      ];

      if (prog === "ms") {
        programTitle = `M.Sc. in ${u.name.includes("Technical") ? "Engineering & Data Science" : "Computer Science & Analytics"}`;
        level = "Postgraduate (Master's)";
        duration = u.countrySlug === "uk" ? "1 Year (Full-time)" : "2 Years";
        coreModules = [
          "Machine Learning & AI",
          "Distributed Systems",
          "Cloud Computing",
          "Advanced Algorithms",
        ];
      } else if (prog === "mba") {
        programTitle = `Master of Business Administration (MBA)`;
        level = "Postgraduate (MBA)";
        duration = u.countrySlug === "uk" ? "1 Year" : "16 - 24 Months";
        coreModules = [
          "Strategic Leadership",
          "Corporate Finance",
          "Global Marketing",
          "Venture Capital & Innovation",
        ];
      } else if (prog === "mbbs") {
        programTitle = `Doctor of Medicine (MD / MBBS - NMC Compliant)`;
        level = "Undergraduate (Medicine)";
        duration = "6 Years (5 Yrs + 1 Yr Clinical)";
        coreModules = [
          "Human Anatomy",
          "Pathology & Histology",
          "Clinical Surgery",
          "Internal Medicine",
        ];
      } else if (prog === "bachelors") {
        programTitle = `Bachelor of Science (B.Sc.) in Computer Engineering`;
        level = "Undergraduate (Bachelor's)";
        duration = u.countrySlug === "usa" ? "4 Years" : "3 Years";
        coreModules = [
          "Computer Systems",
          "Linear Algebra",
          "Data Structures",
          "Software Engineering",
        ];
      } else if (prog === "nursing") {
        programTitle = `B.Sc. / M.Sc. in Nursing & Healthcare Leadership`;
        level = "Postgraduate / Undergraduate";
        duration = "2 - 3 Years";
        coreModules = [
          "Clinical Care",
          "Patient Safety",
          "Healthcare Management",
          "Pharmacology",
        ];
      } else if (prog === "ausbildung") {
        programTitle = `Pflegefachfrau/mann Dual Vocational Nursing Ausbildung`;
        level = "Vocational Diploma";
        duration = "3 Years (Paid Apprenticeship)";
        coreModules = [
          "General Nursing",
          "Anatomy & Physiology",
          "Clinical Practice",
          "Geriatric Care",
        ];
      } else {
        programTitle = `${String(prog).toUpperCase()} Program`;
      }

      const courseId = `${u.slug}-${prog}`;
      if (!courseMap.has(courseId)) {
        courseMap.set(courseId, {
          id: courseId,
          slug: `${prog}-${u.slug}`,
          name: programTitle,
          universityName: u.name,
          universitySlug: u.slug,
          city: u.city,
          country: u.country,
          flagEmoji: countryFlag,
          level,
          duration,
          tuitionFeeINR: u.tuitionFeeRangeINR,
          tuitionFeeLocal:
            u.countrySlug === "germany"
              ? "€0 / yr (Semester Fee ~€150)"
              : `${u.tuitionFeeRangeINR}`,
          ieltsMinScore: u.ieltsMinScore,
          greGmatRequired: u.greGmatRequired,
          postStudyWorkMonths: u.postStudyWorkMonths,
          intakeDeadline: u.intakes?.[0]
            ? `${u.intakes[0]} Intake`
            : "Fall Intake",
          roiScore: Math.min(
            99,
            85 +
              (u.rankingGlobal
                ? Math.max(0, 15 - Math.floor(u.rankingGlobal / 20))
                : 5),
          ),
          coreModules,
        });
      }
    });
  });

  // 3. Direct fetch from Supabase `courses` table
  try {
    const client = typeof window === "undefined" ? supabaseAdmin : supabase;
    const response = await queryWithTimeout(
      () => client.from("courses").select("*"),
      2000,
    );
    if (
      response &&
      !(response as any).error &&
      (response as any).data &&
      (response as any).data.length > 0
    ) {
      (response as any).data.forEach((c: any) => {
        if (c.slug) {
          courseMap.set(c.slug, {
            id: c.id || c.slug,
            slug: c.slug,
            name: c.name,
            universityName: c.university_name,
            universitySlug: c.university_slug || "global",
            city: c.city || "Campus City",
            country: c.country || "Global",
            flagEmoji: c.flag_emoji || "🌐",
            level: c.level || "Postgraduate",
            duration: c.duration || "2 Years",
            tuitionFeeINR: c.tuition_fee_inr || "₹15 - 30 Lakhs / yr",
            tuitionFeeLocal: c.tuition_fee_local || "Local Tuition",
            ieltsMinScore: Number(c.ielts_min_score) || 6.5,
            greGmatRequired: c.gre_gmat_required || false,
            postStudyWorkMonths: c.post_study_work_months || 24,
            intakeDeadline: c.intake_deadline || "Fall Intake",
            roiScore: c.roi_score || 90,
            coreModules: c.core_modules || ["Core Module 1", "Core Module 2"],
          });
        }
      });
    }
  } catch (err) {
    console.warn("Supabase courses table fetch notice:", err);
  }

  return Array.from(courseMap.values());
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
    heroTagline: e.hero_tagline || "",
    targetPrograms: Array.isArray(e.target_programs) ? e.target_programs : [],
    targetCountries: Array.isArray(e.target_countries)
      ? e.target_countries
      : [],
    overview: e.overview || "",
    feeINR: e.fee_inr || "",
    feeOriginal: e.fee_original || "",
    duration: e.duration || "",
    formatMode: e.format_mode || "",
    validityYears: e.validity_years ?? 0,
    scoringScale: e.scoring_scale || "",
    targetCutoffIndianStudents: e.target_cutoff_indian_students || "",
    conductingBody: e.conducting_body || "",
    frequency: e.frequency || "",
    sections: (Array.isArray(e.test_prep_sections) ? e.test_prep_sections : [])
      .slice()
      .sort(byDisplayOrder)
      .map((s: any) => ({
        id: s.id,
        name: s.name,
        duration: s.duration || "",
        questionsCount: s.questions_count || "",
        skillsTested: s.skills_tested || "",
        tips: s.tips || "",
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
