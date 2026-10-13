import { z } from "zod";

// Body of the admin create/update scholarship requests (camelCase) and the
// matching `scholarships` row.

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .nullable()
    .default(null)
    .transform((v) => (v ? v : null));

const dateOnly = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Dates must be YYYY-MM-DD")
  .nullable()
  .default(null);

export const scholarshipInputSchema = z
  .object({
    name: z.string().trim().min(1, "Name is required").max(255),
    provider: optionalText(255),
    countryId: optionalText(32),
    destinationLabel: optionalText(64),
    universityId: z.string().uuid().nullable().default(null),
    fundingType: z
      .enum([
        "scholarship",
        "fellowship",
        "grant",
        "tuition_waiver",
        "loan_scholarship",
      ])
      .default("scholarship"),
    coverage: z
      .enum(["full", "partial", "tuition", "stipend"])
      .default("partial"),
    awardSummary: optionalText(255),
    awardValue: z.number().min(0).nullable().default(null),
    awardCurrency: z
      .string()
      .trim()
      .toUpperCase()
      .regex(/^[A-Z]{3}$/, "Currency must be a 3-letter code like EUR")
      .nullable()
      .default(null)
      .or(z.literal("").transform(() => null)),
    awardPeriod: z.enum(["month", "year", "total"]).nullable().default(null),
    studyLevels: z
      .array(z.enum(["bachelors", "masters", "phd", "diploma"]))
      .default([]),
    fields: optionalText(255),
    minWorkExperienceMonths: z
      .number()
      .int()
      .min(0)
      .max(600)
      .nullable()
      .default(null),
    womenOnly: z.boolean().default(false),
    socialCategories: z
      .array(z.enum(["sc", "st", "obc", "ews", "minority"]))
      .default([]),
    needBased: z.boolean().default(false),
    eligibilityNote: optionalText(2000),
    overview: optionalText(2000),
    opensOn: dateOnly,
    deadline: dateOnly,
    deadlineNote: optionalText(128),
    websiteUrl: z
      .string()
      .trim()
      .url("Official page must be a full URL")
      .max(2048)
      .nullable()
      .default(null)
      .or(z.literal("").transform(() => null)),
    lastVerifiedOn: dateOnly,
    sortOrder: z.number().int().default(0),
    isActive: z.boolean().default(true),
  })
  .refine((s) => s.countryId || s.destinationLabel, {
    message: "Choose a country or enter a destination label",
  })
  .refine((s) => !s.opensOn || !s.deadline || s.opensOn <= s.deadline, {
    message: "Applications must open on or before the deadline",
  })
  .refine((s) => s.awardValue === null || (s.awardCurrency && s.awardPeriod), {
    message: "An award amount needs a currency and a period",
  });

export type ScholarshipInput = z.infer<typeof scholarshipInputSchema>;

export function toScholarshipRow(s: ScholarshipInput) {
  return {
    name: s.name,
    provider: s.provider,
    country_id: s.countryId,
    destination_label: s.destinationLabel,
    university_id: s.universityId,
    funding_type: s.fundingType,
    coverage: s.coverage,
    award_summary: s.awardSummary,
    award_value: s.awardValue,
    award_currency: s.awardCurrency,
    award_period: s.awardPeriod,
    study_levels: s.studyLevels,
    fields: s.fields,
    min_work_experience_months: s.minWorkExperienceMonths,
    women_only: s.womenOnly,
    social_categories: s.socialCategories,
    need_based: s.needBased,
    eligibility_note: s.eligibilityNote,
    overview: s.overview,
    opens_on: s.opensOn,
    deadline: s.deadline,
    deadline_note: s.deadlineNote,
    website_url: s.websiteUrl,
    last_verified_on: s.lastVerifiedOn,
    sort_order: s.sortOrder,
    is_active: s.isActive,
  };
}
