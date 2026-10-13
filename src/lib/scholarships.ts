import {
  Scholarship,
  ScholarshipCoverage,
  ScholarshipFundingType,
  SocialCategory,
  StudyLevel,
} from "@/types";
import { daysUntil, formatDateOnly } from "@/lib/deadlines";

export const FUNDING_TYPES: { value: ScholarshipFundingType; label: string }[] =
  [
    { value: "scholarship", label: "Scholarship" },
    { value: "fellowship", label: "Fellowship" },
    { value: "grant", label: "Grant" },
    { value: "tuition_waiver", label: "Tuition Waiver" },
    { value: "loan_scholarship", label: "Loan Scholarship" },
  ];

export const COVERAGES: { value: ScholarshipCoverage; label: string }[] = [
  { value: "full", label: "Fully Funded" },
  { value: "partial", label: "Partial" },
  { value: "tuition", label: "Tuition Only" },
  { value: "stipend", label: "Stipend / Living Costs" },
];

export const STUDY_LEVELS: { value: StudyLevel; label: string }[] = [
  { value: "bachelors", label: "Bachelor's" },
  { value: "masters", label: "Master's" },
  { value: "phd", label: "PhD" },
  { value: "diploma", label: "Diploma" },
];

export const SOCIAL_CATEGORIES: { value: SocialCategory; label: string }[] = [
  { value: "sc", label: "SC" },
  { value: "st", label: "ST" },
  { value: "obc", label: "OBC" },
  { value: "ews", label: "EWS" },
  { value: "minority", label: "Minority" },
];

const labelOf = <T extends string>(
  list: { value: T; label: string }[],
  value: T,
) => list.find((x) => x.value === value)?.label ?? value;

export const fundingTypeLabel = (v: ScholarshipFundingType) =>
  labelOf(FUNDING_TYPES, v);
export const coverageLabel = (v: ScholarshipCoverage) => labelOf(COVERAGES, v);
export const studyLevelLabel = (v: StudyLevel) => labelOf(STUDY_LEVELS, v);
export const socialCategoryLabel = (v: SocialCategory) =>
  labelOf(SOCIAL_CATEGORIES, v);

// Where it can be used: country, destination label, or both
export const scholarshipDestination = (s: Scholarship) =>
  s.countryName ?? s.destinationLabel ?? s.countryId ?? "—";

export type ScholarshipStatus = "open" | "opens_soon" | "closed" | "unknown";

// Status from the dates: closed after the deadline, "opens soon" before
// opens_on, open in between; unknown without a deadline
export function scholarshipStatus(s: Scholarship): {
  status: ScholarshipStatus;
  label: string;
} {
  if (s.deadline && daysUntil(s.deadline) < 0) {
    return {
      status: "closed",
      label: `Closed (${formatDateOnly(s.deadline)})`,
    };
  }
  if (s.opensOn && daysUntil(s.opensOn) > 0) {
    return {
      status: "opens_soon",
      label: `Opens ${formatDateOnly(s.opensOn)}`,
    };
  }
  if (s.deadline) {
    const days = daysUntil(s.deadline);
    return {
      status: "open",
      label: `Open · closes ${formatDateOnly(s.deadline)}${days <= 30 ? ` (${days === 0 ? "today" : `${days} days left`})` : ""}`,
    };
  }
  return { status: "unknown", label: s.deadlineNote ?? "Check official page" };
}

export interface StudentProfile {
  level: StudyLevel | ""; // "" = not given
  workExperienceYears: number | null;
  gender: "woman" | "man" | "";
  category: SocialCategory | "general" | "";
}

export const emptyProfile: StudentProfile = {
  level: "",
  workExperienceYears: null,
  gender: "",
  category: "",
};

export const isProfileEmpty = (p: StudentProfile) =>
  !p.level && p.workExperienceYears === null && !p.gender && !p.category;

// Checks a profile against a scholarship's listed criteria. Only fields the
// student filled in are checked. `notes` are things the finder can't check.
export function matchProfile(
  s: Scholarship,
  p: StudentProfile,
): { eligible: boolean; reasons: string[]; notes: string[] } {
  const reasons: string[] = [];
  if (p.level && s.studyLevels.length > 0 && !s.studyLevels.includes(p.level)) {
    reasons.push(`Only for ${s.studyLevels.map(studyLevelLabel).join(" / ")}`);
  }
  if (
    p.workExperienceYears !== null &&
    s.minWorkExperienceMonths &&
    p.workExperienceYears * 12 < s.minWorkExperienceMonths
  ) {
    const months = s.minWorkExperienceMonths;
    reasons.push(
      `Needs ${months % 12 === 0 ? `${months / 12} year${months === 12 ? "" : "s"}` : `${months} months`} of work experience`,
    );
  }
  if (p.gender === "man" && s.womenOnly) reasons.push("Only for women");
  if (
    p.category &&
    s.socialCategories.length > 0 &&
    (p.category === "general" || !s.socialCategories.includes(p.category))
  ) {
    reasons.push(
      `Only for ${s.socialCategories.map(socialCategoryLabel).join(" / ")} students`,
    );
  }

  const notes: string[] = [];
  if (s.needBased) notes.push("Check the family income limit");
  if (s.womenOnly && !p.gender) notes.push("Only for women");
  return { eligible: reasons.length === 0, reasons, notes };
}
