import { z } from "zod";

// Request bodies for the buyer API (camelCase) and their `buyers` columns.

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .nullable()
    .optional()
    .transform((v) => (v ? v : null));

export const buyerTargetingSchema = z.object({
  targetCountries: z.array(z.string().trim().min(1).max(32)).max(50).default([]),
  targetPrograms: z.array(z.string().trim().min(1).max(32)).max(20).default([]),
  minLeadScore: z.number().int().min(0).max(100).nullable().default(null),
  dailyLeadCap: z.number().int().min(1).max(1000).nullable().default(null),
  autoUnlock: z.boolean().default(false),
  operatingHours: optionalText(64),
});

export const buyerCompanySchema = z.object({
  companyName: z.string().trim().min(2, "Company name is required").max(255),
  contactPerson: z.string().trim().min(2, "Contact name is required").max(128),
  phone: z
    .string()
    .trim()
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"),
  gstin: optionalText(15),
  pan: optionalText(10),
  city: optionalText(128),
  state: optionalText(128),
  yearsInBusiness: optionalText(32),
  annualStudentVolume: optionalText(32),
});

export const buyerRegisterSchema = buyerCompanySchema
  .merge(buyerTargetingSchema)
  .extend({
    initialDepositINR: z.number().min(0).max(10000000).default(0),
    paymentReference: optionalText(128),
  });

export function toBuyerTargetingRow(t: z.infer<typeof buyerTargetingSchema>) {
  return {
    target_countries: t.targetCountries,
    target_programs: t.targetPrograms,
    min_lead_score: t.minLeadScore,
    daily_lead_cap: t.dailyLeadCap,
    auto_unlock: t.autoUnlock,
    operating_hours: t.operatingHours,
  };
}

export function toBuyerCompanyRow(c: z.infer<typeof buyerCompanySchema>) {
  return {
    company_name: c.companyName,
    contact_person: c.contactPerson,
    phone: c.phone,
    gstin: c.gstin,
    pan: c.pan,
    city: c.city,
    state: c.state,
    years_in_business: c.yearsInBusiness,
    annual_student_volume: c.annualStudentVolume,
  };
}
