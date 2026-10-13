import { z } from "zod";

// Body of the admin create/update loan lender requests (camelCase) and the
// matching `loan_lenders` row.

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .nullable()
    .default(null)
    .transform((v) => (v ? v : null));

const optionalAmount = z.number().int().min(0).nullable().default(null);
const optionalRate = z.number().min(0).max(100).nullable().default(null);

export const loanLenderInputSchema = z
  .object({
    name: z.string().trim().min(1, "Name is required").max(128),
    lenderType: z.enum([
      "public_bank",
      "private_bank",
      "nbfc",
      "international",
    ]),
    currency: z
      .string()
      .trim()
      .toUpperCase()
      .regex(/^[A-Z]{3}$/, "Currency must be a 3-letter code like INR")
      .default("INR"),
    rateMin: optionalRate,
    rateMax: optionalRate,
    rateNote: optionalText(128),
    maxAmountINR: optionalAmount,
    maxUnsecuredINR: optionalAmount,
    moratoriumNote: optionalText(128),
    processingFeeNote: optionalText(128),
    websiteUrl: z
      .string()
      .trim()
      .url("Website must be a full URL")
      .max(2048)
      .nullable()
      .default(null)
      .or(z.literal("").transform(() => null)),
    lastVerifiedOn: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Dates must be YYYY-MM-DD")
      .nullable()
      .default(null),
    notes: optionalText(1000),
    sortOrder: z.number().int().default(0),
    isActive: z.boolean().default(true),
  })
  .refine(
    (l) => l.rateMin === null || l.rateMax === null || l.rateMin <= l.rateMax,
    { message: "Minimum rate can't be above the maximum rate" },
  );

export type LoanLenderInput = z.infer<typeof loanLenderInputSchema>;

export function toLoanLenderRow(l: LoanLenderInput) {
  return {
    name: l.name,
    lender_type: l.lenderType,
    currency: l.currency,
    rate_min: l.rateMin,
    rate_max: l.rateMax,
    rate_note: l.rateNote,
    max_amount_inr: l.maxAmountINR,
    max_unsecured_inr: l.maxUnsecuredINR,
    moratorium_note: l.moratoriumNote,
    processing_fee_note: l.processingFeeNote,
    website_url: l.websiteUrl,
    last_verified_on: l.lastVerifiedOn,
    notes: l.notes,
    sort_order: l.sortOrder,
    is_active: l.isActive,
  };
}
