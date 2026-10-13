import { LenderType, LoanLender } from "@/types";

export const LENDER_TYPES: { value: LenderType; label: string }[] = [
  { value: "public_bank", label: "Public Sector Bank" },
  { value: "private_bank", label: "Private Bank" },
  { value: "nbfc", label: "NBFC" },
  { value: "international", label: "International Lender" },
];

export const lenderTypeLabel = (type: LenderType) =>
  LENDER_TYPES.find((t) => t.value === type)?.label ?? type;

// "8.4% – 8.9%", "from 10.25%", "up to 13%", or null when no rate is set
export function formatRateRange(lender: LoanLender): string | null {
  const { rateMin: min, rateMax: max } = lender;
  if (min !== null && max !== null) {
    return min === max ? `${min}%` : `${min}% – ${max}%`;
  }
  if (min !== null) return `from ${min}%`;
  if (max !== null) return `up to ${max}%`;
  return null;
}
