import { z } from "zod";

// Body of the admin create/update deadline requests (camelCase) and the
// matching `application_deadlines` row.

const dateOnly = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Dates must be YYYY-MM-DD");

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .nullable()
    .default(null)
    .transform((v) => (v ? v : null));

export const deadlineInputSchema = z
  .object({
    countryId: z.string().trim().min(1, "Country is required").max(32),
    universityId: z.string().uuid().nullable().default(null),
    programId: z
      .string()
      .trim()
      .max(32)
      .nullable()
      .default(null)
      .transform((v) => (v ? v : null)),
    intakeTerm: z.string().trim().min(1, "Intake term is required").max(32),
    intakeYear: z.number().int().min(2000).max(2100),
    intakeStartDate: dateOnly.nullable().default(null),
    deadlineType: z
      .enum(["application", "scholarship", "documents", "deposit", "visa"])
      .default("application"),
    roundName: optionalText(64),
    applicationsOpenDate: dateOnly.nullable().default(null),
    deadlineDate: dateOnly,
    isRolling: z.boolean().default(false),
    sourceUrl: z
      .string()
      .trim()
      .url("Source must be a full URL")
      .max(2048)
      .nullable()
      .default(null)
      .or(z.literal("").transform(() => null)),
    notes: optionalText(500),
    isActive: z.boolean().default(true),
  })
  .refine(
    (d) => !d.applicationsOpenDate || d.applicationsOpenDate <= d.deadlineDate,
    { message: "Applications must open on or before the deadline" },
  );

export type DeadlineInput = z.infer<typeof deadlineInputSchema>;

export function toDeadlineRow(d: DeadlineInput) {
  return {
    country_id: d.countryId,
    university_id: d.universityId,
    program_id: d.programId,
    intake_term: d.intakeTerm,
    intake_year: d.intakeYear,
    intake_start_date: d.intakeStartDate,
    deadline_type: d.deadlineType,
    round_name: d.roundName,
    applications_open_date: d.applicationsOpenDate,
    deadline_date: d.deadlineDate,
    is_rolling: d.isRolling,
    source_url: d.sourceUrl,
    notes: d.notes,
    is_active: d.isActive,
  };
}

// Body of the admin create/update milestone requests
export const milestoneInputSchema = z.object({
  countryId: z
    .string()
    .trim()
    .max(32)
    .nullable()
    .default(null)
    .transform((v) => (v ? v : null)),
  deadlineType: z
    .enum(["application", "scholarship", "documents", "deposit", "visa"])
    .nullable()
    .default(null),
  daysBefore: z.number().int().min(0).max(730),
  title: z.string().trim().min(1, "Title is required").max(128),
  description: optionalText(2000),
  actionLabel: optionalText(64),
  isActive: z.boolean().default(true),
});

export type MilestoneInput = z.infer<typeof milestoneInputSchema>;

export function toMilestoneRow(m: MilestoneInput) {
  return {
    country_id: m.countryId,
    deadline_type: m.deadlineType,
    days_before: m.daysBefore,
    title: m.title,
    description: m.description,
    action_label: m.actionLabel,
    is_active: m.isActive,
  };
}
