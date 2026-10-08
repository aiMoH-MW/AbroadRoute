import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// INR in Crore / Lakh with up to 2 decimals (₹4.85 Lakh, ₹15 Lakh, ₹1.2 Cr),
// else the full amount. Rounds on whole rupees first so 4,85,000 doesn't
// become 4.8 through floating-point error.
const toUnits = (amount: number, unit: number) =>
  (Math.round((amount * 100) / unit) / 100).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  });

export function formatCurrency(amount: number, currency: string = "INR"): string {
  if (currency === "INR") {
    if (amount >= 10000000) {
      return `₹${toUnits(amount, 10000000)} Cr`;
    }
    if (amount >= 100000) {
      return `₹${toUnits(amount, 100000)} Lakh`;
    }
    return `₹${amount.toLocaleString("en-IN")}`;
  }
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);
}

// Exact INR amount with Indian digit grouping, e.g. ₹4,85,000
export function formatINRExact(amount: number): string {
  return `₹${amount.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
}
