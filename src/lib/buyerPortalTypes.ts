// Data returned by /api/buyer/portal (migration 0022). Client-safe.
// Every value comes from the database; null = not provided.

export type DeliveryStatus = "unread" | "contacted" | "converted" | "disputed";
export type DisputeStatus = "under_review" | "approved" | "rejected";

export interface BuyerProfile {
  id: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  gstin: string | null;
  pan: string | null;
  city: string | null;
  state: string | null;
  targetCountries: string[]; // countries.id
  targetPrograms: string[]; // programs.id
  minLeadScore: number | null;
  dailyLeadCap: number | null;
  autoUnlock: boolean;
  operatingHours: string | null;
  isVerified: boolean;
}

export interface LeadSummary {
  id: string;
  countryId: string | null;
  countryName: string | null;
  programId: string | null;
  programName: string | null;
  budgetRange: string | null;
  intakeYear: string | null;
  leadScore: number | null;
  isPhoneVerified: boolean;
  createdAt: string;
}

/** A lead this buyer has purchased: contact details are visible. */
export interface PurchasedLead extends LeadSummary {
  deliveryId: string;
  fullName: string;
  email: string;
  phone: string;
  highestEducation: string | null;
  ieltsScore: string | null;
  pricePaidINR: number;
  deliveredAt: string;
  status: DeliveryStatus;
  notes: { text: string; author: string; at: string }[];
  disputeReason: string | null;
  disputeStatus: DisputeStatus | null;
}

export interface WalletTransactionItem {
  id: string;
  type: "wallet_topup" | "lead_purchase" | "lead_refund" | "platform_credit";
  amountINR: number;
  description: string | null;
  reference: string | null;
  createdAt: string;
}

export interface TopupRequest {
  id: string;
  amountINR: number;
  paymentReference: string | null;
  status: "pending" | "approved" | "rejected";
  adminNote: string | null;
  createdAt: string;
  reviewedAt: string | null;
}

export interface BuyerPortalData {
  buyer: BuyerProfile;
  walletBalanceINR: number;
  transactions: WalletTransactionItem[];
  purchasedLeads: PurchasedLead[];
  availableLeads: LeadSummary[]; // matching the targeting, contact hidden
  topupRequests: TopupRequest[];
  costPerLeadINR: number | null; // site_settings.b2b_cost_per_lead_inr
  maxBuyersPerLead: number | null; // site_settings.b2b_max_buyers_per_lead
}
