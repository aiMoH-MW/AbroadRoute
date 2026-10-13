import "server-only";
import { cache } from "react";
import { supabaseAdmin } from "@/lib/supabase/server";
import type {
  CompareCourse,
  CompareDeadline,
  CompareProgramRef,
  CompareScholarship,
  CompareUniversity,
} from "@/lib/compareTypes";

const UNIVERSITY_SELECT =
  "*, countries(name), university_programs(id, program_id, yearly_tuition_inr, duration, is_active)";

const numberOrNull = (v: any): number | null => {
  if (v === null || v === undefined || v === "") return null;
  const num = Number(v);
  return Number.isNaN(num) ? null : num;
};

const stringOrNull = (v: any): string | null =>
  typeof v === "string" && v.trim() !== "" ? v : null;

const stringArray = (v: any): string[] =>
  Array.isArray(v) ? v.filter((s) => typeof s === "string" && s.trim()) : [];

const booleanOrNull = (v: any): boolean | null =>
  typeof v === "boolean" ? v : null;

interface CompareSource {
  universities: any[];
  programs: Map<string, any>;
  deadlines: any[];
  scholarships: any[];
}

// All universities, or just the one with `slug`
async function loadCompareSource(slug?: string): Promise<CompareSource> {
  const queryUniversities = (select: string) => {
    const query = supabaseAdmin.from("universities").select(select);
    return slug ? query.eq("slug", slug) : query;
  };

  let uniRes = await queryUniversities(UNIVERSITY_SELECT);
  // Before the university_programs migration is applied the embed fails
  if (uniRes.error) {
    uniRes = await queryUniversities("*, countries(name)");
  }
  if (uniRes.error) throw new Error(uniRes.error.message);

  const today = new Date().toISOString().slice(0, 10);
  const [programRes, cityRes, deadlineRes, scholarshipRes] = await Promise.all([
    supabaseAdmin.from("programs").select("*"),
    supabaseAdmin.from("cities").select("id, name"),
    supabaseAdmin
      .from("application_deadlines")
      .select(
        "university_id, country_id, program_id, intake_term, intake_year, round_name, deadline_date, is_rolling",
      )
      .eq("is_active", true)
      .eq("deadline_type", "application")
      .gte("deadline_date", today)
      .order("deadline_date", { ascending: true }),
    supabaseAdmin
      .from("scholarships")
      .select("id, name, award_summary, university_id, country_id, sort_order")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true }),
  ]);

  // Deadlines and scholarships are optional; a missing table just means none
  if (deadlineRes.error) {
    console.warn(
      "Compare: application_deadlines fetch error:",
      deadlineRes.error,
    );
  }
  if (scholarshipRes.error) {
    console.warn("Compare: scholarships fetch error:", scholarshipRes.error);
  }

  // universities.city holds the cities.id slug (e.g. 'stanford-ca')
  const cityNames = new Map<string, string>(
    (cityRes.data ?? []).map((c: any) => [String(c.id), c.name]),
  );

  return {
    universities: (uniRes.data ?? []).map((u: any) => ({
      ...u,
      city: cityNames.get(u.city) ?? u.city,
    })),
    programs: new Map(
      (programRes.data ?? []).map((p: any) => [String(p.id), p]),
    ),
    deadlines: deadlineRes.data ?? [],
    scholarships: scholarshipRes.data ?? [],
  };
}

function mapDeadline(d: any): CompareDeadline {
  return {
    intakeTerm: d.intake_term,
    intakeYear: Number(d.intake_year),
    roundName: stringOrNull(d.round_name),
    deadlineDate: d.deadline_date,
    isRolling: !!d.is_rolling,
    programId: d.program_id ?? null,
  };
}

// Deadlines for the university itself, or country-wide ones (university_id NULL)
function deadlinesFor(u: any, deadlines: any[]): any[] {
  return deadlines.filter(
    (d) =>
      d.university_id === u.id ||
      (!d.university_id && u.country_id && d.country_id === u.country_id),
  );
}

function scholarshipsFor(u: any, scholarships: any[]): CompareScholarship[] {
  return scholarships
    .filter(
      (s) =>
        s.university_id === u.id ||
        (!s.university_id && u.country_id && s.country_id === u.country_id),
    )
    .map((s) => ({
      id: s.id,
      name: s.name,
      awardSummary: stringOrNull(s.award_summary),
      universitySpecific: s.university_id === u.id,
    }))
    .sort(
      (a, b) => Number(b.universitySpecific) - Number(a.universitySpecific),
    );
}

function activeProgramRows(u: any): any[] {
  return Array.isArray(u.university_programs)
    ? u.university_programs.filter(
        (r: any) => r && r.program_id && r.is_active !== false,
      )
    : [];
}

function programRefs(u: any, programs: Map<string, any>): CompareProgramRef[] {
  const rows = activeProgramRows(u);
  // Assigned programs win; the legacy array covers universities not yet assigned
  const assigned: any[] =
    rows.length > 0
      ? rows
      : stringArray(u.programs_offered).map((id) => ({ program_id: id }));
  return assigned.map((row) => {
    const id = String(row.program_id);
    const program = programs.get(id);
    return {
      id,
      name: program?.name ?? id,
      level: stringOrNull(program?.level),
      // NULL on the university row = the program's default
      duration: stringOrNull(row.duration) ?? stringOrNull(program?.duration),
      yearlyTuitionINR:
        numberOrNull(row.yearly_tuition_inr) ??
        numberOrNull(program?.yearly_educational_cost),
    };
  });
}

const ieltsOf = (u: any) =>
  numberOrNull(u.ielts_min_band) ?? numberOrNull(u.ielts_min_score);

function mapUniversity(u: any, src: CompareSource): CompareUniversity {
  return {
    id: u.id,
    slug: u.slug,
    name: u.name,
    city: stringOrNull(u.city),
    countryId: u.country_id ?? null,
    countryName: u.countries?.name ?? null,
    rankingGlobal: numberOrNull(u.ranking_global),
    rankingNational: numberOrNull(u.ranking_national),
    tuitionFeeRangeINR: stringOrNull(u.tuition_fee_range_inr),
    ieltsMinScore: ieltsOf(u),
    toeflMinScore: numberOrNull(u.toefl_min_score),
    pteMinScore: numberOrNull(u.pte_min_score),
    duolingoMinScore: numberOrNull(u.duolingo_min_score),
    greGmatRequired: booleanOrNull(u.gre_gmat_required),
    acceptanceRate: numberOrNull(u.acceptance_rate),
    intakes: stringArray(u.intakes),
    postStudyWorkMonths: numberOrNull(u.post_study_work_months),
    programs: programRefs(u, src.programs),
    deadlines: deadlinesFor(u, src.deadlines).map(mapDeadline),
    scholarships: scholarshipsFor(u, src.scholarships),
    nmcCompliant: booleanOrNull(u.nmc_compliant),
    minPercentage: numberOrNull(u.min_percentage),
    apsRequired: booleanOrNull(u.aps_required),
    fourYearDegreeRequired: booleanOrNull(u.four_year_degree_required),
    maxBacklogs: numberOrNull(u.max_backlogs),
    requirementsSourceUrl: stringOrNull(u.requirements_source_url),
    requirementsVerifiedOn: stringOrNull(u.requirements_verified_on),
    logoUrl: stringOrNull(u.logo_url),
    bannerUrl: stringOrNull(u.banner_url),
    claimedStatus: stringOrNull(u.claimed_status),
  };
}

export async function fetchCompareUniversities(): Promise<CompareUniversity[]> {
  const src = await loadCompareSource();

  return src.universities
    .filter((u) => u.slug && u.name)
    .map((u) => mapUniversity(u, src))
    .sort(
      (a, b) =>
        (a.rankingGlobal ?? Infinity) - (b.rankingGlobal ?? Infinity) ||
        a.name.localeCompare(b.name),
    );
}

export async function fetchCompareCourses(): Promise<CompareCourse[]> {
  const src = await loadCompareSource();
  const courses: CompareCourse[] = [];

  src.universities
    .filter((u) => u.slug && u.name)
    .forEach((u) => {
      const uniDeadlines = deadlinesFor(u, src.deadlines);

      activeProgramRows(u).forEach((row: any) => {
        const programId = String(row.program_id);
        const program = src.programs.get(programId);
        const deadline = uniDeadlines.find(
          (d) => !d.program_id || d.program_id === programId,
        );

        courses.push({
          id: String(row.id ?? `${u.id}-${programId}`),
          programId,
          name: program?.name ?? programId,
          level: stringOrNull(program?.level),
          universityId: u.id,
          universitySlug: u.slug,
          universityName: u.name,
          city: stringOrNull(u.city),
          countryId: u.country_id ?? null,
          countryName: u.countries?.name ?? null,
          // NULL on the university row = the program's default
          duration:
            stringOrNull(row.duration) ?? stringOrNull(program?.duration),
          yearlyTuitionINR:
            numberOrNull(row.yearly_tuition_inr) ??
            numberOrNull(program?.yearly_educational_cost),
          ieltsMinScore: ieltsOf(u),
          greGmatRequired: booleanOrNull(u.gre_gmat_required),
          postStudyWorkMonths: numberOrNull(u.post_study_work_months),
          nextDeadline: deadline ? mapDeadline(deadline) : null,
          roiScore: numberOrNull(program?.roi_score),
          keyFields: stringArray(program?.key_fields),
        });
      });
    });

  return courses;
}

// One university for its profile page; cached so metadata and page share it
export const fetchUniversityProfile = cache(
  async (slug: string): Promise<CompareUniversity | null> => {
    const src = await loadCompareSource(slug);
    const u = src.universities.find((row) => row.slug === slug && row.name);
    return u ? mapUniversity(u, src) : null;
  },
);
