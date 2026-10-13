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
  // Fields below are null (or empty lists) when not set in the database
  flagEmoji: string | null;
  currency: string;
  currencySymbol: string;
  exchangeRateToINR: number | null;
  popularPrograms: ProgramCategory[];
  avgTuitionINR: string | null;
  avgLivingCostINR: string | null;
  postStudyWorkVisa: string | null;
  topIntakes: string[];
  heroTagline: string | null;
  overview: string | null;
  safetyRating: number | null; // out of 5
  isAnchor: boolean; // one of the featured "anchor" destinations
  // Country guide (editorial) and visa facts
  heroSubtitle: string | null;
  overviewHeading: string | null;
  overviewBody: string | null; // paragraphs separated by a blank line
  programsOfferedNotes: string | null;
  visaType: string | null;
  visaProcessingTime: string | null;
  workHoursDuringTerm: string | null;
  financialProofRequired: string | null;
  prPathwaySummary: string | null;
  // Set when exchangeRateToINR is a live rate (ISO time); absent = stored rate
  exchangeRateUpdatedAt?: string;
}

export interface Program {
  id: string;
  name: string;
  slug: ProgramCategory;
  // Fields below are null (or empty lists) when not set in the database
  level:
    | "Postgraduate"
    | "Undergraduate"
    | "Vocational"
    | "Doctoral"
    | "Executive"
    | null;
  duration: string | null;
  keyFields: string[];
  topDestinations: string[];
  summary: string | null;
  roiScore: number | null; // out of 100
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
  // Fields below are null (or empty lists) when not set in the database
  country: string | null; // country name
  countrySlug: string | null;
  city: string | null; // city name
  cityId: string | null; // universities.city as stored (cities.id)
  rankingGlobal: number | null;
  rankingNational: number | null;
  programsOffered: ProgramCategory[];
  tuitionFeeRangeINR: string | null;
  ieltsMinScore: number | null;
  toeflMinScore?: number;
  greGmatRequired: boolean | null;
  // Eligibility Checker requirements; undefined = not stated
  minPercentage?: number; // previous qualification, %
  ieltsMinBand?: number; // lowest IELTS section band
  pteMinScore?: number;
  duolingoMinScore?: number;
  apsRequired?: boolean;
  fourYearDegreeRequired?: boolean;
  maxBacklogs?: number;
  requirementsSourceUrl?: string;
  requirementsVerifiedOn?: string; // YYYY-MM-DD
  intakes: string[];
  acceptanceRate: number | null; // percentage
  nmcCompliant?: boolean; // For MBBS
  postStudyWorkMonths: number | null;
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
  // Set on scholarship deadlines shown in the Deadline Tracker (built from
  // the scholarships table): the scholarship's name
  scholarshipName?: string;
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

export type LenderType = "public_bank" | "private_bank" | "nbfc" | "international";

/** A row of `loan_lenders`, shown on the Loan Calculator. */
export interface LoanLender {
  id: string;
  name: string;
  lenderType: LenderType;
  currency: string; // currency the loan is given in, e.g. "INR", "USD"
  rateMin: number | null; // % p.a.
  rateMax: number | null;
  rateNote: string | null;
  maxAmountINR: number | null;
  maxUnsecuredINR: number | null; // 0 = collateral always needed
  moratoriumNote: string | null;
  processingFeeNote: string | null;
  websiteUrl: string | null;
  lastVerifiedOn: string | null; // YYYY-MM-DD
  notes: string | null;
  sortOrder: number;
  isActive: boolean;
}

export type ScholarshipFundingType =
  | "scholarship"
  | "fellowship"
  | "grant"
  | "tuition_waiver"
  | "loan_scholarship";
export type ScholarshipCoverage = "full" | "partial" | "tuition" | "stipend";
export type StudyLevel = "bachelors" | "masters" | "phd" | "diploma";
export type SocialCategory = "sc" | "st" | "obc" | "ews" | "minority";

/** A row of `scholarships`, with the linked names joined in. */
export interface Scholarship {
  id: string;
  name: string;
  provider: string | null;
  countryId: string | null; // null = several countries (destinationLabel)
  countryName: string | null;
  countryCode: string | null; // ISO 2-letter, for the flag
  destinationLabel: string | null;
  universityId: string | null;
  universityName: string | null;
  fundingType: ScholarshipFundingType;
  coverage: ScholarshipCoverage;
  awardSummary: string | null;
  awardValue: number | null;
  awardCurrency: string | null;
  awardPeriod: "month" | "year" | "total" | null;
  studyLevels: StudyLevel[]; // empty = any level
  fields: string | null;
  minWorkExperienceMonths: number | null;
  womenOnly: boolean;
  socialCategories: SocialCategory[]; // empty = everyone
  needBased: boolean;
  eligibilityNote: string | null;
  overview: string | null;
  opensOn: string | null; // YYYY-MM-DD
  deadline: string | null; // YYYY-MM-DD
  deadlineNote: string | null;
  websiteUrl: string | null;
  lastVerifiedOn: string | null; // YYYY-MM-DD
  sortOrder: number;
  isActive: boolean;
  // Computed when read: award value in INR at the live rate, and when that
  // rate was published (absent when there is no amount or no live rate)
  awardValueINR?: number;
  rateUpdatedAt?: string;
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

export type TestPrepCategory =
  | "English Proficiency"
  | "Graduate Admissions"
  | "Medical & Healthcare Licensing";

export interface TestPrepSection {
  id: string;
  name: string;
  duration: string | null;
  questionsCount: string | null;
  skillsTested: string | null;
  tips: string | null;
}

/** A test prep exam from the Supabase `test_prep_exams` table (with its sections). */
// Text fields are null when not set in the database (shown as "Not provided")
export interface TestPrepExam {
  id: string;
  slug: string;
  name: string;
  shortName: string;
  fullName: string;
  category: TestPrepCategory;
  heroTagline: string | null;
  targetPrograms: string[];
  targetCountries: string[];
  overview: string | null;
  feeINR: string | null;
  feeOriginal: string | null;
  duration: string | null;
  formatMode: string | null;
  validityYears: number | null;
  scoringScale: string | null;
  targetCutoffIndianStudents: string | null;
  conductingBody: string | null;
  frequency: string | null;
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
