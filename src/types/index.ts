// ============================================================
// Abroadroute - Core Domain Types
// ============================================================

export type TierCategory = "Tier 1" | "Tier 2" | "Tier 3";

export type ProgramCategory =
  | "ms"
  | "mba"
  | "emba"
  | "mbbs"
  | "bachelors"
  | "nursing"
  | "phd"
  | "ausbildung";

export interface Country {
  id: string;
  name: string;
  slug: string;
  code: string;
  tier: TierCategory;
  flagEmoji: string;
  currency: string;
  currencySymbol: string;
  exchangeRateToINR: number;
  popularPrograms: ProgramCategory[];
  avgTuitionINR: string;
  avgLivingCostINR: string;
  postStudyWorkVisa: string;
  topIntakes: string[];
  heroTagline: string;
  overview: string;
  safetyRating: number; // out of 5
  // Set when exchangeRateToINR is a live rate (ISO time); absent = stored rate
  exchangeRateUpdatedAt?: string;
}

export interface Program {
  id: string;
  name: string;
  slug: ProgramCategory;
  level:
    "Postgraduate" | "Undergraduate" | "Vocational" | "Doctoral" | "Executive";
  duration: string;
  keyFields: string[];
  topDestinations: string[];
  summary: string;
  roiScore: number; // out of 100
  yearlyEducationalCost?: number | null; // INR per year; null when not set
}

export interface Specialisation {
  id: string;
  programSlug: ProgramCategory | string;
  anchorCategory: string;
  name: string;
  slug: string;
  description: string;
  focusAreas: string[];
  targetDestinations: string[];
  durationFormats: string[];
  licensingPathways: string[];
  contentInvestmentShare: string;
  isYearOneAnchor: boolean;
}

export interface City {
  id: string; // slug-style id, e.g. "melbourne"
  countryId: string;
  name: string;
  stateRegion: string | null;
  // Typical monthly student costs in INR; null when not set for this city.
  accommodationMonthly: number | null;
  foodMonthly: number | null;
  transportMonthly: number | null;
  miscMonthly: number | null;
  // Extra % on top of living costs for emergencies; null when not set.
  costBufferPercentage: number | null;
}

export interface University {
  id: string;
  name: string;
  slug: string;
  country: string;
  countrySlug: string;
  city: string;
  rankingGlobal: number;
  rankingNational?: number;
  programsOffered: ProgramCategory[];
  tuitionFeeRangeINR: string;
  ieltsMinScore: number;
  toeflMinScore?: number;
  greGmatRequired: boolean;
  intakes: string[];
  acceptanceRate: number; // percentage
  nmcCompliant?: boolean; // For MBBS
  postStudyWorkMonths: number;
  featured: boolean;
  logoUrl?: string;
  bannerUrl?: string;
  claimed_status?: "claimed" | "unclaimed" | "verified";
  claimed_by_user_id?: string;
  official_email_domain?: string;
  official_email_address?: string;
  tierBadge?: "Platinum Partner" | "Gold Partner" | "Silver Partner";
  // Programs assigned in `university_programs`; empty when none assigned yet
  programs?: UniversityProgram[];
}

/** A program offered by a university (row of `university_programs`). */
export interface UniversityProgram {
  programId: string; // programs.id, same as the program slug
  yearlyTuitionINR: number | null; // null = use the program's default
  duration: string | null; // null = use the program's default
}

export type DeadlineType =
  | "application"
  | "scholarship"
  | "documents"
  | "deposit"
  | "visa";

/** A row of `application_deadlines`, with the linked names joined in. */
export interface ApplicationDeadline {
  id: string;
  countryId: string;
  countryName: string | null;
  universityId: string | null; // null = every university in the country
  universityName: string | null;
  programId: string | null; // null = every program
  programName: string | null;
  intakeTerm: string; // e.g. "Fall"
  intakeYear: number;
  intakeStartDate: string | null; // YYYY-MM-DD
  deadlineType: DeadlineType;
  roundName: string | null;
  applicationsOpenDate: string | null; // YYYY-MM-DD
  deadlineDate: string; // YYYY-MM-DD
  isRolling: boolean;
  sourceUrl: string | null;
  notes: string | null;
  isActive: boolean;
}

/** A row of `deadline_milestones`: a countdown step before a deadline. */
export interface DeadlineMilestone {
  id: string;
  countryId: string | null; // null = every country
  countryName: string | null;
  deadlineType: DeadlineType | null; // null = every deadline type
  daysBefore: number;
  title: string;
  description: string | null;
  actionLabel: string | null;
  isActive: boolean;
}

export interface LeadSubmission {
  fullName: string;
  email: string;
  phone: string;
  countryTarget: string;
  programTarget: ProgramCategory;
  highestEducation: string;
  budgetRangeINR: string;
  intakeYear: string;
  ieltsScore?: string;
  utmSource?: string;
  utmCampaign?: string;
}

export interface AIChatMessage {
  id: string;
  role: "user" | "model" | "system";
  text: string;
  timestamp: string;
  suggestedActions?: {
    label: string;
    action: string;
    payload?: Record<string, unknown>;
  }[];
}

export interface ComparisonItem {
  id: string;
  name: string;
  country: string;
  fees: string;
  ranking: string;
  workVisa: string;
  ielts: string;
}

export interface CourseItem {
  id: string;
  slug: string;
  name: string;
  universityName: string;
  universitySlug: string;
  city: string;
  country: string;
  flagEmoji: string;
  level: string;
  duration: string;
  tuitionFeeINR: string;
  tuitionFeeLocal: string;
  ieltsMinScore: number | string;
  greGmatRequired: boolean;
  postStudyWorkMonths: number;
  intakeDeadline: string;
  roiScore: number;
  coreModules: string[];
}

export type TestPrepCategory =
  | "English Proficiency"
  | "Graduate Admissions"
  | "Medical & Healthcare Licensing";

export interface TestPrepSection {
  id: string;
  name: string;
  duration: string;
  questionsCount: string;
  skillsTested: string;
  tips: string;
}

/** A test prep exam from the Supabase `test_prep_exams` table (with its sections). */
export interface TestPrepExam {
  id: string;
  slug: string;
  name: string;
  shortName: string;
  fullName: string;
  category: TestPrepCategory;
  heroTagline: string;
  targetPrograms: string[];
  targetCountries: string[];
  overview: string;
  feeINR: string;
  feeOriginal: string;
  duration: string;
  formatMode: string;
  validityYears: number;
  scoringScale: string;
  targetCutoffIndianStudents: string;
  conductingBody: string;
  frequency: string;
  sections: TestPrepSection[];
  scoreRequirementsByCountry: {
    country: string;
    flag: string;
    minRequired: string;
    competitiveScore: string;
  }[];
  prepRoadmap: {
    week: string;
    title: string;
    milestone: string;
  }[];
  faqs: {
    question: string;
    answer: string;
  }[];
}
