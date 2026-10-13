// Data returned by /api/university-portal. Client-safe; null = not provided.
import type { CompareUniversity } from "@/lib/compareTypes";

export type InquiryStatus = "new" | "reviewing" | "shortlisted" | "contacted";

/** A student inquiry made from this university's page (a `leads` row). */
export interface UniversityInquiry {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  countryName: string | null;
  programId: string | null;
  programName: string | null;
  highestEducation: string | null;
  ieltsScore: string | null;
  budgetRange: string | null;
  intakeYear: string | null;
  status: InquiryStatus;
  createdAt: string;
}

export interface ListingPlan {
  id: string;
  name: string;
  tagline: string | null;
  priceINR: number | null;
  priceUSD: number | null;
  billingPeriod: string | null;
  features: string[];
}

export interface UniversityPortalData {
  // The university this account has claimed; null until a claim is approved
  university: CompareUniversity | null;
  // Latest claim by this account, for showing its review status
  claim: {
    universityName: string;
    status: string;
    createdAt: string | null;
  } | null;
  programsCatalog: { id: string; name: string }[];
  inquiries: UniversityInquiry[];
  listingPlans: ListingPlan[];
  contactEmail: string | null; // site_settings.contact_email, for upgrades
}
