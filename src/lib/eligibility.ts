import { ProgramCategory, University } from "@/types";

// Eligibility Checker rules. Guidance only: compares a profile with each
// university's published minimums and its selectivity. It never predicts
// an admission decision.

export type EligibilityDegree = Extract<
  ProgramCategory,
  "ms" | "mba" | "emba" | "phd" | "bachelors" | "mbbs"
>;
export type AcademicScale = "percentage" | "cgpa10" | "gpa4";
export type EnglishTest = "ielts" | "toefl" | "pte" | "duolingo" | "none";
export type MatchTier = "strong" | "possible" | "ambitious";

export const DEGREE_OPTIONS: { value: EligibilityDegree; label: string }[] = [
  { value: "ms", label: "Master's (MS / MSc / MA)" },
  { value: "mba", label: "MBA" },
  { value: "emba", label: "Executive MBA" },
  { value: "phd", label: "PhD / Doctorate" },
  { value: "bachelors", label: "Bachelor's (after Class 12)" },
  { value: "mbbs", label: "MBBS / Medicine (after Class 12)" },
];

export const ENGLISH_TESTS: {
  value: EnglishTest;
  label: string;
  min: number;
  max: number;
  step: number;
}[] = [
  { value: "ielts", label: "IELTS Academic", min: 4, max: 9, step: 0.5 },
  { value: "toefl", label: "TOEFL iBT (0-120)", min: 30, max: 120, step: 1 },
  { value: "pte", label: "PTE Academic", min: 30, max: 90, step: 1 },
  { value: "duolingo", label: "Duolingo English Test", min: 60, max: 160, step: 5 },
  { value: "none", label: "Not taken yet", min: 0, max: 0, step: 1 },
];

export interface EligibilityProfile {
  degree: EligibilityDegree;
  academicScale: AcademicScale;
  academicScore: number;
  englishTest: EnglishTest;
  englishScore: number;
  ieltsLowestBand: number; // only used for IELTS
  greTaken: boolean;
  greScore: number;
  workExperienceYears: number;
  backlogs: number;
  bachelorYears: 3 | 4;
  neetQualified: boolean;
  hasAps: boolean;
}

export interface EligibilityResult {
  university: University;
  eligible: boolean;
  tier: MatchTier;
  blockers: string[]; // reasons the student cannot apply yet
  actions: string[]; // steps needed before applying
  notes: string[]; // why it landed in this tier
  minPercentage: number | null; // null = not provided by the university
}

/** Previous-qualification score as a percentage. */
export function toPercentage(scale: AcademicScale, score: number): number {
  if (scale === "cgpa10") return Math.min(100, score * 9.5); // CBSE/UGC convention
  if (scale === "gpa4") return Math.min(100, score * 25);
  return score;
}

// Lowest score in each test treated as equal to an IELTS band. Sources:
// ETS TOEFL-IELTS comparison, Pearson PTE concordance (2023) and the
// Duolingo English Test concordance. Approximate, so shown as such.
const CONCORDANCE: Record<Exclude<EnglishTest, "ielts" | "none">, [number, number][]> = {
  toefl: [[118, 9], [115, 8.5], [110, 8], [102, 7.5], [94, 7], [79, 6.5], [60, 6], [46, 5.5], [35, 5]],
  pte: [[86, 9], [83, 8.5], [79, 8], [73, 7.5], [65, 7], [58, 6.5], [51, 6], [43, 5.5], [36, 5]],
  duolingo: [[155, 8.5], [145, 8], [135, 7.5], [125, 7], [115, 6.5], [105, 6], [95, 5.5], [85, 5]],
};

/** Approximate IELTS band for a score in another test. */
export function ieltsEquivalent(test: EnglishTest, score: number): number | null {
  if (test === "none") return null;
  if (test === "ielts") return score;
  const row = CONCORDANCE[test].find(([min]) => score >= min);
  return row ? row[1] : 4.5;
}

const TEST_NAMES: Record<EnglishTest, string> = {
  ielts: "IELTS",
  toefl: "TOEFL",
  pte: "PTE",
  duolingo: "Duolingo",
  none: "",
};

function directMinimum(uni: University, test: EnglishTest): number | undefined {
  if (test === "toefl") return uni.toeflMinScore;
  if (test === "pte") return uni.pteMinScore;
  if (test === "duolingo") return uni.duolingoMinScore;
  return undefined;
}


function offersDegree(uni: University, degree: EligibilityDegree): boolean {
  return (uni.programsOffered || []).includes(degree);
}

function isPostgraduate(degree: EligibilityDegree): boolean {
  return degree === "ms" || degree === "mba" || degree === "emba" || degree === "phd";
}

export function evaluateUniversity(
  uni: University,
  p: EligibilityProfile,
): EligibilityResult {
  const blockers: string[] = [];
  const actions: string[] = [];
  const notes: string[] = [];
  let score = 0;

  // --- Academics (only checked against a minimum the university states)
  const studentPct = toPercentage(p.academicScale, p.academicScore);
  const minPct = uni.minPercentage ?? null;
  const margin = minPct === null ? null : studentPct - minPct;
  const minLabel = `${minPct}%`;
  if (margin === null) {
    notes.push("Minimum academic score not provided by the university.");
  } else if (margin < 0) {
    blockers.push(`Your ${studentPct.toFixed(0)}% is below the ${minLabel} minimum.`);
  } else if (margin >= 10) {
    score += 3;
    notes.push(`Academics well above the ${minLabel} minimum.`);
  } else if (margin >= 5) {
    score += 2;
    notes.push(`Academics comfortably above the ${minLabel} minimum.`);
  } else {
    score += 1;
    notes.push(`Academics just above the ${minLabel} minimum.`);
  }

  // --- English (only checked against a minimum the university states)
  const ieltsMin = uni.ieltsMinScore;
  if (p.englishTest === "none") {
    actions.push(
      ieltsMin !== null
        ? `Take an English test (IELTS ${ieltsMin}+ or equivalent).`
        : "Take an English test; the required score is not provided.",
    );
  } else {
    const direct = directMinimum(uni, p.englishTest);
    const name = TEST_NAMES[p.englishTest];
    if (direct !== undefined) {
      if (p.englishScore < direct) {
        blockers.push(`${name} ${p.englishScore} is below the required ${direct}.`);
      }
    } else if (ieltsMin === null) {
      notes.push("English test requirement not provided by the university.");
    } else {
      const equivalent = ieltsEquivalent(p.englishTest, p.englishScore) ?? 0;
      const approx = p.englishTest === "ielts" ? "" : " (approx. IELTS equivalent)";
      if (equivalent < ieltsMin) {
        blockers.push(
          `${name} ${p.englishScore} is below IELTS ${ieltsMin}${approx}.`,
        );
      } else if (equivalent >= ieltsMin + 0.5) {
        score += 1;
      }
    }
    if (
      p.englishTest === "ielts" &&
      uni.ieltsMinBand !== undefined &&
      p.ieltsLowestBand < uni.ieltsMinBand
    ) {
      blockers.push(
        `Every IELTS section needs ${uni.ieltsMinBand}+; your lowest is ${p.ieltsLowestBand}.`,
      );
    }
  }

  // --- Degree-specific rules
  if (p.degree === "mbbs") {
    if (!p.neetQualified) {
      blockers.push("NMC requires a qualifying NEET score to practise in India.");
    }
    if (!uni.nmcCompliant) {
      blockers.push("Not marked NMC compliant: the degree may not be valid in India.");
    } else {
      notes.push("Check NMC rules: 54 months of study plus a 12-month internship at the same university.");
    }
  }

  if (isPostgraduate(p.degree)) {
    if (uni.fourYearDegreeRequired && p.bachelorYears === 3) {
      blockers.push("Requires a four-year bachelor's degree.");
    }
    if (uni.maxBacklogs !== undefined && p.backlogs > uni.maxBacklogs) {
      blockers.push(`Accepts at most ${uni.maxBacklogs} backlogs.`);
    } else if (p.backlogs > 5) {
      score -= 1;
      notes.push("Several backlogs weaken the application.");
    }

    if (uni.greGmatRequired) {
      const test = p.degree === "ms" || p.degree === "phd" ? "GRE" : "GRE/GMAT";
      if (!p.greTaken) {
        actions.push(`Take the ${test}; this university requires it.`);
      } else if (p.greScore >= 320) {
        score += 1;
        notes.push("Strong GRE score.");
      } else if (p.greScore < 300) {
        score -= 1;
        notes.push("GRE score is below most applicants here.");
      }
    } else if (p.greTaken && p.greScore >= 320) {
      score += 1;
      notes.push("Strong GRE score helps even though it is optional.");
    }

    if (p.degree === "mba") {
      if (p.workExperienceYears >= 3) score += 1;
      else if (p.workExperienceYears < 2) {
        score -= 1;
        notes.push("Most MBAs expect 2-3+ years of work experience.");
      }
    } else if (p.degree === "emba") {
      if (p.workExperienceYears < 5) {
        score -= 2;
        notes.push("Executive MBAs usually expect 5-10 years of experience.");
      }
    } else if (p.workExperienceYears >= 2) {
      score += 1;
      notes.push("Relevant work experience adds strength.");
    }
  }

  if (uni.apsRequired && !p.hasAps) {
    actions.push("Get the APS certificate (mandatory for Indian applicants to Germany).");
  }

  // --- Selectivity (from the ranking / acceptance rate when provided)
  const rank = uni.rankingGlobal;
  const acceptance = uni.acceptanceRate;
  const ultraSelective =
    (rank !== null && rank <= 10) || (acceptance !== null && acceptance <= 10);
  if (ultraSelective) score -= 3;
  else if ((rank !== null && rank <= 50) || (acceptance !== null && acceptance <= 25))
    score -= 2;
  else if (rank !== null && rank <= 100) score -= 1;

  let tier: MatchTier;
  if (ultraSelective) {
    tier = "ambitious";
    notes.push("Highly selective: even strong profiles are often turned down.");
  } else if (score >= 3) tier = "strong";
  else if (score >= 1) tier = "possible";
  else tier = "ambitious";

  return {
    university: uni,
    eligible: blockers.length === 0,
    tier,
    blockers,
    actions,
    notes,
    minPercentage: minPct,
  };
}

/** Results for every university offering the degree, by global rank. */
export function evaluateProfile(
  universities: University[],
  profile: EligibilityProfile,
  countrySlug = "",
): EligibilityResult[] {
  return universities
    .filter((u) => offersDegree(u, profile.degree))
    .filter((u) => !countrySlug || u.countrySlug === countrySlug)
    .map((u) => evaluateUniversity(u, profile))
    // Unranked universities go last
    .sort(
      (a, b) =>
        (a.university.rankingGlobal ?? Infinity) -
        (b.university.rankingGlobal ?? Infinity),
    );
}
