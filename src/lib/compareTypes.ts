// Data for the Compare Universities / Compare Courses tools and the
// university profile page.
// Every field comes straight from the database; null = not provided.

export interface CompareDeadline {
  intakeTerm: string;
  intakeYear: number;
  roundName: string | null;
  deadlineDate: string;
  isRolling: boolean;
  programId: string | null;
}

export interface CompareScholarship {
  id: string;
  name: string;
  awardSummary: string | null;
  universitySpecific: boolean;
}

export interface CompareProgramRef {
  id: string;
  name: string;
  level: string | null;
  duration: string | null;
  yearlyTuitionINR: number | null;
}

export interface CompareUniversity {
  id: string;
  slug: string;
  name: string;
  city: string | null;
  countryId: string | null;
  countryName: string | null;
  rankingGlobal: number | null;
  rankingNational: number | null;
  tuitionFeeRangeINR: string | null;
  ieltsMinScore: number | null;
  toeflMinScore: number | null;
  pteMinScore: number | null;
  duolingoMinScore: number | null;
  greGmatRequired: boolean | null;
  acceptanceRate: number | null;
  intakes: string[];
  postStudyWorkMonths: number | null;
  programs: CompareProgramRef[];
  deadlines: CompareDeadline[]; // upcoming, soonest first
  scholarships: CompareScholarship[]; // university-specific first
  nmcCompliant: boolean | null;
  minPercentage: number | null;
  apsRequired: boolean | null;
  fourYearDegreeRequired: boolean | null;
  maxBacklogs: number | null;
  requirementsSourceUrl: string | null;
  requirementsVerifiedOn: string | null;
  logoUrl: string | null;
  bannerUrl: string | null;
  claimedStatus: string | null;
}

// One program as offered by one university (a `university_programs` row)
export interface CompareCourse {
  id: string;
  programId: string;
  name: string;
  level: string | null;
  universityId: string;
  universitySlug: string;
  universityName: string;
  city: string | null;
  countryId: string | null;
  countryName: string | null;
  duration: string | null;
  yearlyTuitionINR: number | null;
  ieltsMinScore: number | null;
  greGmatRequired: boolean | null;
  postStudyWorkMonths: number | null;
  nextDeadline: CompareDeadline | null;
  roiScore: number | null;
  keyFields: string[];
}
