import { formatCurrency } from "@/lib/utils";

// Site-wide counts shown in headings, menus and hero stats. Always computed
// from the database so copy never states a stale number.
export interface SiteStats {
  countries: number;
  anchorCountries: number;
  programs: number;
  universities: number;
  exams: number;
  // Lowest / highest yearly tuition (INR) set on any university program;
  // null when no university has a fee entered
  tuitionMinINR: number | null;
  tuitionMaxINR: number | null;
}

export const EMPTY_SITE_STATS: SiteStats = {
  countries: 0,
  anchorCountries: 0,
  programs: 0,
  universities: 0,
  exams: 0,
  tuitionMinINR: null,
  tuitionMaxINR: null,
};

/** "19 Destinations", or just "Destinations" when the count is unknown. */
export function withCount(count: number, label: string): string {
  return count > 0 ? `${count} ${label}` : label;
}

/** "₹1.2 Lakh – ₹38 Lakh", or null when no fees are entered. */
export function tuitionRangeLabel(stats: SiteStats): string | null {
  const { tuitionMinINR: min, tuitionMaxINR: max } = stats;
  if (min === null || max === null) return null;
  const fmt = (n: number) => (n === 0 ? "₹0" : formatCurrency(n));
  return min === max ? fmt(min) : `${fmt(min)} – ${fmt(max)}`;
}
