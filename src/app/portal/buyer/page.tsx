"use client";

import { useState, useEffect, useCallback } from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Wallet,
  CheckCircle2,
  Clock,
  ShieldCheck,
  LogOut,
  Users,
  Loader2,
  Search,
  Phone,
  Mail,
  MessageSquare,
  AlertCircle,
  Target,
  Sparkles,
  TrendingUp,
  Check,
  X,
  ChevronRight,
  RotateCcw,
  Building2,
  Send,
  Plus,
  Lock,
  Unlock,
} from "lucide-react";
import { useAuth } from "@/lib/auth/AuthContext";
import { getAuthHeaders } from "@/lib/supabase/client";
import {
  fetchLiveCountries,
  fetchLivePrograms,
} from "@/lib/supabase/dataFetchers";
import { CountryFlag } from "@/components/ui/CountryFlag";
import { BrandLogo } from "@/components/ui/BrandSignatures";
import { NotProvided, show } from "@/components/tools/NotProvided";
import type { Country, Program } from "@/types";
import type {
  BuyerPortalData,
  DeliveryStatus,
  PurchasedLead,
  WalletTransactionItem,
} from "@/lib/buyerPortalTypes";

type LoadState = "loading" | "ready" | "unauth" | "noprofile" | "error";
type Timeframe = "7d" | "30d" | "quarter" | "all";

const inr = (amount: number) => `₹${amount.toLocaleString("en-IN")}`;

// Relative time for a database timestamp; "Not provided" when missing
function formatTimeAgo(dateStr?: string | null): ReactNode {
  if (!dateStr) return <NotProvided />;
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return <NotProvided />;
  const diffSec = Math.floor((Date.now() - d.getTime()) / 1000);
  if (diffSec < 60) return "Just now";
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)} mins ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)} hours ago`;
  if (diffSec < 172800) return "Yesterday";
  return `${Math.floor(diffSec / 86400)} days ago`;
}

function formatDateTime(dateStr?: string | null): ReactNode {
  if (!dateStr) return <NotProvided />;
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return <NotProvided />;
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const isCredit = (type: WalletTransactionItem["type"]) =>
  type === "wallet_topup" ||
  type === "platform_credit" ||
  type === "lead_refund";

const TX_LABELS: Record<WalletTransactionItem["type"], string> = {
  wallet_topup: "Wallet top-up",
  platform_credit: "Platform credit",
  lead_refund: "Dispute refund",
  lead_purchase: "Lead purchase",
};

const DISPUTE_CATEGORIES = [
  { id: "fake_number", label: "Fake Number / Unreachable" },
  { id: "wrong_profile", label: "Inaccurate Degree Stream / Budget Mismatch" },
  { id: "competitor_applied", label: "Student Already Enrolled Elsewhere" },
  { id: "uninterested", label: "Student Not Interested" },
] as const;

const TIMEFRAME_DAYS: Record<Timeframe, number | null> = {
  "7d": 7,
  "30d": 30,
  quarter: 90,
  all: null,
};

function withinTimeframe(dateStr: string, tf: Timeframe): boolean {
  const days = TIMEFRAME_DAYS[tf];
  if (days === null) return true;
  const t = new Date(dateStr).getTime();
  if (Number.isNaN(t)) return false;
  return Date.now() - t <= days * 86400 * 1000;
}

function disputeStatusLabel(s: PurchasedLead["disputeStatus"]): string {
  if (s === "approved") return "Approved – refunded";
  if (s === "rejected") return "Rejected";
  return "Under review";
}

// Group purchased leads by a label for the analytics breakdown bars
function groupCounts(
  leads: PurchasedLead[],
  pick: (l: PurchasedLead) => string | null,
): { label: string | null; count: number }[] {
  const map = new Map<string | null, number>();
  leads.forEach((l) => {
    const key = pick(l);
    map.set(key, (map.get(key) ?? 0) + 1);
  });
  return Array.from(map.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);
}

export default function BuyerPortalPage() {
  const router = useRouter();
  const { logout } = useAuth();

  // Active Tab: leads | wallet | analytics | disputes | targeting
  const [activeTab, setActiveTab] = useState<
    "leads" | "wallet" | "analytics" | "disputes" | "targeting"
  >("leads");

  // Portal data from /api/buyer/portal
  const [data, setData] = useState<BuyerPortalData | null>(null);
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // Leads State
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | DeliveryStatus>(
    "all",
  );
  const [selectedDeliveryId, setSelectedDeliveryId] = useState<string | null>(
    null,
  );
  const [unlockingLeadId, setUnlockingLeadId] = useState<string | null>(null);
  const [isUpdatingLead, setIsUpdatingLead] = useState(false);

  // Notes state inside detail drawer
  const [newNoteText, setNewNoteText] = useState("");

  // Dispute Modal State
  const [disputeModalOpen, setDisputeModalOpen] = useState(false);
  const [disputeDeliveryId, setDisputeDeliveryId] = useState<string | null>(
    null,
  );
  const [disputeCategory, setDisputeCategory] =
    useState<(typeof DISPUTE_CATEGORIES)[number]["id"]>("fake_number");
  const [disputeNotes, setDisputeNotes] = useState("");
  const [isSubmittingDispute, setIsSubmittingDispute] = useState(false);
  const [disputeError, setDisputeError] = useState<string | null>(null);

  // Top-up request State
  const [topupModalOpen, setTopupModalOpen] = useState(false);
  const [topupAmount, setTopupAmount] = useState("");
  const [topupReference, setTopupReference] = useState("");
  const [isSubmittingTopup, setIsSubmittingTopup] = useState(false);
  const [topupError, setTopupError] = useState<string | null>(null);

  // Analytics timeframe
  const [analyticsTimeframe, setAnalyticsTimeframe] =
    useState<Timeframe>("all");

  // Targeting Rules State (pre-filled from data.buyer)
  const [countryOptions, setCountryOptions] = useState<Country[]>([]);
  const [programOptions, setProgramOptions] = useState<Program[]>([]);
  const [optionsLoaded, setOptionsLoaded] = useState(false);
  const [targetCountries, setTargetCountries] = useState<string[]>([]);
  const [targetPrograms, setTargetPrograms] = useState<string[]>([]);
  const [minLeadScore, setMinLeadScore] = useState<number | null>(null);
  const [dailyLeadCap, setDailyLeadCap] = useState("");
  const [operatingHours, setOperatingHours] = useState("");
  const [isSavingTargeting, setIsSavingTargeting] = useState(false);
  const [targetingSavedNotice, setTargetingSavedNotice] = useState(false);
  const [targetingError, setTargetingError] = useState<string | null>(null);

  // Load portal data (on mount and after every mutation)
  const loadPortal = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch("/api/buyer/portal", {
        cache: "no-store",
        headers: { ...(await getAuthHeaders()) },
      });
      const json = await res.json().catch(() => null);
      if (res.status === 401) {
        setLoadState("unauth");
        return;
      }
      if (res.status === 404) {
        setLoadError(json?.error ?? null);
        setLoadState("noprofile");
        return;
      }
      if (!res.ok || !json?.success) {
        setLoadError(json?.error ?? "Failed to load portal");
        setLoadState("error");
        return;
      }
      setData(json.data as BuyerPortalData);
      setLoadState("ready");
    } catch (err) {
      console.warn("Failed to load buyer portal:", err);
      setLoadError("Failed to load portal");
      setLoadState("error");
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadPortal();
  }, [loadPortal]);

  // Country and program lists for the targeting form come from the database
  useEffect(() => {
    Promise.all([fetchLiveCountries(), fetchLivePrograms()])
      .then(([countries, programs]) => {
        setCountryOptions(countries);
        setProgramOptions(programs);
      })
      .catch((err) => console.warn("Failed to load targeting options:", err))
      .finally(() => setOptionsLoaded(true));
  }, []);

  // Pre-fill the targeting form whenever the buyer profile loads
  const buyer = data?.buyer ?? null;
  useEffect(() => {
    if (!buyer) return;
    setTargetCountries(buyer.targetCountries);
    setTargetPrograms(buyer.targetPrograms);
    setMinLeadScore(buyer.minLeadScore);
    setDailyLeadCap(
      buyer.dailyLeadCap !== null ? String(buyer.dailyLeadCap) : "",
    );
    setOperatingHours(buyer.operatingHours ?? "");
  }, [buyer]);

  const purchasedLeads = data?.purchasedLeads ?? [];
  const availableLeads = data?.availableLeads ?? [];
  const transactions = data?.transactions ?? [];
  const topupRequests = data?.topupRequests ?? [];
  const walletBalance = data?.walletBalanceINR ?? 0;
  const costPerLead = data?.costPerLeadINR ?? null;
  const orgName = buyer?.companyName ?? "";

  const selectedLead =
    purchasedLeads.find((l) => l.deliveryId === selectedDeliveryId) ?? null;

  // Filtered Leads
  const filteredLeads = purchasedLeads.filter((l) => {
    const matchesStatus = statusFilter === "all" || l.status === statusFilter;
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      l.fullName.toLowerCase().includes(query) ||
      l.email.toLowerCase().includes(query) ||
      l.phone.toLowerCase().includes(query) ||
      (l.countryName ?? "").toLowerCase().includes(query) ||
      (l.programName ?? "").toLowerCase().includes(query);
    return matchesStatus && matchesSearch;
  });

  const disputedLeads = purchasedLeads.filter((l) => l.disputeStatus !== null);

  // Shared JSON request helper: returns an error message, or null on success
  const sendJson = async (
    url: string,
    method: "POST" | "PATCH",
    body?: unknown,
  ): Promise<string | null> => {
    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...(await getAuthHeaders()),
        },
        body: body === undefined ? undefined : JSON.stringify(body),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || json?.success === false) {
        return json?.error ?? "Request failed";
      }
      return null;
    } catch {
      return "Request failed";
    }
  };

  // Action: Unlock (purchase) an available lead
  const handleUnlockLead = async (leadId: string) => {
    setActionError(null);
    setUnlockingLeadId(leadId);
    const err = await sendJson(`/api/buyer/leads/${leadId}/purchase`, "POST");
    if (err) setActionError(err);
    await loadPortal();
    setUnlockingLeadId(null);
  };

  // Action: Add Note to Selected Lead
  const handleAddNote = async () => {
    if (!newNoteText.trim() || !selectedLead) return;
    setActionError(null);
    setIsUpdatingLead(true);
    const err = await sendJson(
      `/api/buyer/deliveries/${selectedLead.deliveryId}`,
      "PATCH",
      { note: newNoteText.trim() },
    );
    if (err) setActionError(err);
    else setNewNoteText("");
    await loadPortal();
    setIsUpdatingLead(false);
  };

  // Action: Update Lead Status
  const handleUpdateStatus = async (
    newStatus: "unread" | "contacted" | "converted",
  ) => {
    if (!selectedLead || selectedLead.status === newStatus) return;
    setActionError(null);
    setIsUpdatingLead(true);
    const err = await sendJson(
      `/api/buyer/deliveries/${selectedLead.deliveryId}`,
      "PATCH",
      { status: newStatus },
    );
    if (err) setActionError(err);
    await loadPortal();
    setIsUpdatingLead(false);
  };

  // Action: Open Dispute Modal
  const openDisputeModal = (deliveryId: string) => {
    setDisputeDeliveryId(deliveryId);
    setDisputeNotes("");
    setDisputeError(null);
    setDisputeModalOpen(true);
  };

  // Action: Submit Dispute (reviewed by an admin; no automatic refund)
  const handleDisputeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!disputeDeliveryId) return;
    const category =
      DISPUTE_CATEGORIES.find((c) => c.id === disputeCategory)?.label ?? "";
    setIsSubmittingDispute(true);
    setDisputeError(null);
    const err = await sendJson(
      `/api/buyer/deliveries/${disputeDeliveryId}/dispute`,
      "POST",
      { reason: `${category}: ${disputeNotes.trim()}` },
    );
    setIsSubmittingDispute(false);
    if (err) {
      setDisputeError(err);
      return;
    }
    setDisputeModalOpen(false);
    await loadPortal();
  };

  // Action: Request a wallet top-up (credited by an admin after payment)
  const openTopupModal = () => {
    setTopupAmount("");
    setTopupReference("");
    setTopupError(null);
    setTopupModalOpen(true);
  };

  const handleTopupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(topupAmount);
    if (!Number.isFinite(amount) || amount <= 0) {
      setTopupError("Enter an amount");
      return;
    }
    setIsSubmittingTopup(true);
    setTopupError(null);
    const err = await sendJson("/api/buyer/topups", "POST", {
      amountINR: amount,
      paymentReference: topupReference.trim() || undefined,
    });
    setIsSubmittingTopup(false);
    if (err) {
      setTopupError(err);
      return;
    }
    setTopupModalOpen(false);
    await loadPortal();
  };

  // Action: Save Targeting Rules
  const handleSaveTargeting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!buyer) return;
    const cap = dailyLeadCap.trim() === "" ? null : Number(dailyLeadCap);
    if (cap !== null && (!Number.isInteger(cap) || cap < 1)) {
      setTargetingError("Daily lead cap must be a whole number of 1 or more");
      return;
    }
    setIsSavingTargeting(true);
    setTargetingError(null);
    const err = await sendJson("/api/buyer/profile", "PATCH", {
      targetCountries,
      targetPrograms,
      minLeadScore,
      dailyLeadCap: cap,
      autoUnlock: buyer.autoUnlock,
      operatingHours: operatingHours.trim() || null,
    });
    setIsSavingTargeting(false);
    if (err) {
      setTargetingError(err);
      return;
    }
    setTargetingSavedNotice(true);
    setTimeout(() => setTargetingSavedNotice(false), 3500);
    await loadPortal();
  };

  const toggleTargetCountry = (id: string) => {
    setTargetCountries((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
    );
  };

  const toggleTargetProgram = (id: string) => {
    setTargetPrograms((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
    );
  };

  // KPI calculations (all from purchased leads)
  const totalPurchased = purchasedLeads.length;
  const totalConverted = purchasedLeads.filter(
    (l) => l.status === "converted",
  ).length;
  const totalUnderReview = purchasedLeads.filter(
    (l) => l.disputeStatus === "under_review",
  ).length;
  const totalVerifiedPhones = purchasedLeads.filter(
    (l) => l.isPhoneVerified,
  ).length;
  const conversionRate =
    totalPurchased > 0
      ? `${((totalConverted / totalPurchased) * 100).toFixed(1)}%`
      : null;

  // Analytics (filtered by timeframe)
  const aLeads = purchasedLeads.filter((l) =>
    withinTimeframe(l.deliveredAt, analyticsTimeframe),
  );
  const aTx = transactions.filter((t) =>
    withinTimeframe(t.createdAt, analyticsTimeframe),
  );
  const aCount = (s: DeliveryStatus) =>
    aLeads.filter((l) => l.status === s).length;
  const aConverted = aCount("converted");
  const aSpend = aTx
    .filter((t) => t.type === "lead_purchase")
    .reduce((sum, t) => sum + Math.abs(t.amountINR), 0);
  const aRefunds = aTx
    .filter((t) => t.type === "lead_refund")
    .reduce((sum, t) => sum + Math.abs(t.amountINR), 0);
  const aDisputed = aLeads.filter((l) => l.disputeStatus !== null).length;
  const byCountry = groupCounts(aLeads, (l) => l.countryName);
  const byProgram = groupCounts(aLeads, (l) => l.programName);

  // Not signed in / no buyer profile / failed load states
  if (loadState !== "ready" || !data || !buyer) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-xs text-center space-y-4">
          <BrandLogo variant="wordmark" theme="light" size="md" />
          {loadState === "loading" && (
            <div className="flex items-center justify-center gap-2 text-sm font-semibold text-slate-600">
              <Loader2 className="h-4 w-4 animate-spin text-[#102C57]" />
              <span>Loading partner portal...</span>
            </div>
          )}
          {loadState === "unauth" && (
            <>
              <h2 className="text-lg font-bold text-[#102C57]">
                Sign in to the B2B Partner Portal
              </h2>
              <p className="text-xs text-slate-500">
                Please sign in with your partner account to view your leads and
                wallet.
              </p>
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-xl bg-[#102C57] py-2.5 px-6 text-xs font-bold text-white hover:bg-[#0c2242] transition"
              >
                Sign in
              </Link>
            </>
          )}
          {loadState === "noprofile" && (
            <>
              <h2 className="text-lg font-bold text-[#102C57]">
                Complete partner onboarding
              </h2>
              <p className="text-xs text-slate-500">
                {loadError ??
                  "Your account does not have a partner profile yet."}
              </p>
              <Link
                href="/partner-with-us"
                className="inline-flex items-center justify-center rounded-xl bg-[#EA5C2B] py-2.5 px-6 text-xs font-bold text-white hover:bg-[#d94f20] transition"
              >
                Complete partner onboarding
              </Link>
            </>
          )}
          {loadState === "error" && (
            <>
              <h2 className="text-lg font-bold text-rose-700">
                Could not load the portal
              </h2>
              <p className="text-xs text-slate-500">{loadError}</p>
              <button
                onClick={() => {
                  setLoadState("loading");
                  loadPortal();
                }}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-6 text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Try again</span>
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between selection:bg-[#EA5C2B]/15">
      {/* Top B2B Portal Header */}
      <header className="border-b border-slate-200/90 bg-white sticky top-0 z-30 px-4 sm:px-8 py-3.5 shadow-xs">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <BrandLogo variant="wordmark" theme="light" size="md" />
            <span className="rounded-full bg-[#1D5A6C]/10 px-3 py-1 text-[11px] font-bold text-[#1D5A6C]">
              B2B Partner Portal
            </span>
          </div>

          {/* User Profile & Wallet Quick Badge */}
          <div className="flex items-center gap-3">
            {/* Quick Wallet Top-up Badge */}
            <button
              onClick={() => {
                setActiveTab("wallet");
                openTopupModal();
              }}
              className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-800 hover:bg-emerald-100 transition cursor-pointer"
            >
              <Wallet className="h-3.5 w-3.5 text-emerald-600" />
              <span>Wallet: {inr(walletBalance)}</span>
              <span className="rounded bg-emerald-600 px-1.5 py-0.2 text-[10px] text-white">
                + Add
              </span>
            </button>

            {/* User Dropdown */}
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#102C57] text-[11px] font-bold text-white">
                {orgName.charAt(0)}
              </div>
              <span className="font-bold text-slate-800 hidden sm:inline max-w-xs truncate">
                {show(orgName)}
              </span>
              <button
                onClick={() => {
                  logout();
                  router.push("/login");
                }}
                className="text-slate-400 hover:text-rose-600 ml-1 transition"
                title="Sign Out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Workspace Body */}
      <main className="flex-1 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
          {/* 1. KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {/* Card 1: Purchased Leads */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-xs font-bold uppercase tracking-wider">
                  Purchased Leads
                </span>
                <Users className="h-4 w-4 text-blue-600" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900">
                {totalPurchased}
              </div>
              <div className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                <TrendingUp className="h-3 w-3" />
                <span>{totalVerifiedPhones} with verified phone</span>
              </div>
            </div>

            {/* Card 2: Wallet Balance */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-xs font-bold uppercase tracking-wider">
                  Available Balance
                </span>
                <Wallet className="h-4 w-4 text-emerald-600" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-emerald-700">
                {inr(walletBalance)}
              </div>
              <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
                <span>
                  {costPerLead !== null
                    ? `${inr(costPerLead)} per lead`
                    : "Lead price not set"}
                </span>
                <button
                  onClick={openTopupModal}
                  className="font-bold text-[#EA5C2B] hover:underline"
                >
                  Top Up →
                </button>
              </div>
            </div>

            {/* Card 3: Conversion Rate */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-xs font-bold uppercase tracking-wider">
                  Conversion Rate
                </span>
                <Target className="h-4 w-4 text-[#EA5C2B]" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900">
                {show(conversionRate)}
              </div>
              <div className="mt-1 text-[11px] text-slate-500">
                <span>{totalConverted} Converted Students</span>
              </div>
            </div>

            {/* Card 4: Disputes */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-xs font-bold uppercase tracking-wider">
                  Disputes
                </span>
                <ShieldCheck className="h-4 w-4 text-indigo-600" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900">
                {disputedLeads.length}
              </div>
              <div className="mt-1 text-[11px] text-slate-500">
                <span>{totalUnderReview} under review</span>
              </div>
            </div>
          </div>

          {/* Action error banner */}
          {actionError && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-bold text-rose-800 flex items-center justify-between gap-2">
              <span className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-rose-600" />
                {actionError}
              </span>
              <button
                onClick={() => setActionError(null)}
                className="text-rose-500 hover:text-rose-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* 2. Operational Navigation Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-1 text-xs font-bold">
            {(
              [
                {
                  id: "leads",
                  label: "📥 Leads Inbox & CRM",
                  count: purchasedLeads.length,
                },
                { id: "wallet", label: "💳 Wallet & Billing" },
                { id: "analytics", label: "📊 Performance Analytics" },
                {
                  id: "disputes",
                  label: "⚖️ Disputes & Refunds",
                  count: disputedLeads.length,
                },
                { id: "targeting", label: "🎯 Targeting & Delivery Rules" },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 rounded-t-xl py-2.5 px-4 transition whitespace-nowrap cursor-pointer ${
                  activeTab === tab.id
                    ? "border-b-2 border-[#EA5C2B] text-[#102C57] bg-white shadow-2xs font-extrabold"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                <span>{tab.label}</span>
                {"count" in tab && (
                  <span
                    className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                      activeTab === tab.id
                        ? "bg-[#102C57] text-white"
                        : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* TAB 1: LEADS INBOX & CRM */}
          {activeTab === "leads" && (
            <div className="space-y-4">
              {/* Search & Status Filters */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200">
                {/* Status Filter Tabs */}
                <div className="flex flex-wrap items-center gap-1 text-xs font-bold">
                  {(
                    [
                      { id: "all", label: "All Leads" },
                      { id: "unread", label: "Unread / New" },
                      { id: "contacted", label: "Contacted" },
                      { id: "converted", label: "Converted / Enrolled" },
                      { id: "disputed", label: "Disputed" },
                    ] as const
                  ).map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setStatusFilter(s.id)}
                      className={`rounded-xl px-3 py-1.5 transition cursor-pointer ${
                        statusFilter === s.id
                          ? "bg-[#102C57] text-white"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>

                {/* Search & Refresh Button */}
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <div className="relative flex-1 sm:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search name, phone, email, country..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-4 py-2 text-xs font-semibold text-slate-900 focus:border-[#102C57] focus:bg-white focus:outline-none"
                    />
                  </div>

                  <button
                    onClick={() => loadPortal()}
                    disabled={isRefreshing}
                    className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 transition cursor-pointer shadow-2xs disabled:opacity-60 shrink-0"
                    title="Refresh leads from database"
                  >
                    <RotateCcw
                      className={`h-3.5 w-3.5 text-[#102C57] ${
                        isRefreshing ? "animate-spin" : ""
                      }`}
                    />
                    <span className="hidden sm:inline">
                      {isRefreshing ? "Syncing..." : "Refresh"}
                    </span>
                  </button>
                </div>
              </div>

              {/* My Leads Table */}
              <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
                <div className="px-4 pt-4">
                  <h3 className="text-sm font-bold text-[#102C57]">My leads</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                      <tr>
                        <th className="py-3.5 px-4">Student & Contact</th>
                        <th className="py-3.5 px-4">Target Track</th>
                        <th className="py-3.5 px-4">Quality Score</th>
                        <th className="py-3.5 px-4">Price & Status</th>
                        <th className="py-3.5 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                      {filteredLeads.map((lead) => (
                        <tr
                          key={lead.deliveryId}
                          onClick={() => setSelectedDeliveryId(lead.deliveryId)}
                          className="hover:bg-slate-50/80 transition cursor-pointer group"
                        >
                          {/* Student */}
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-slate-900 group-hover:text-[#EA5C2B] transition">
                              {show(lead.fullName)}
                            </div>
                            <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                              <span>{show(lead.phone)}</span>
                              <span>•</span>
                              <span className="truncate max-w-[140px]">
                                {show(lead.email)}
                              </span>
                            </div>
                          </td>

                          {/* Track */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-1.5 font-bold text-slate-900">
                              {lead.countryName && (
                                <CountryFlag
                                  name={lead.countryName}
                                  size="sm"
                                />
                              )}
                              <span>{show(lead.countryName)}</span>
                            </div>
                            <div className="text-[11px] text-slate-500 mt-0.5">
                              {show(lead.programName)} • {show(lead.intakeYear)}
                            </div>
                          </td>

                          {/* Quality Score */}
                          <td className="py-3.5 px-4">
                            {lead.leadScore !== null ? (
                              <span
                                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-extrabold ${
                                  lead.leadScore >= 90
                                    ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                                    : lead.leadScore >= 75
                                      ? "bg-blue-50 text-blue-800 border border-blue-200"
                                      : "bg-amber-50 text-amber-800 border border-amber-200"
                                }`}
                              >
                                <Sparkles className="h-3 w-3" />
                                Score {lead.leadScore}/100
                              </span>
                            ) : (
                              <NotProvided />
                            )}
                            <span className="block text-[10px] text-slate-400 mt-1">
                              Budget: {show(lead.budgetRange)}
                            </span>
                          </td>

                          {/* Status */}
                          <td className="py-3.5 px-4">
                            <span
                              className={`rounded-lg px-2.5 py-1 text-[10px] font-extrabold capitalize ${
                                lead.status === "unread"
                                  ? "bg-orange-50 text-[#EA5C2B] border border-orange-200 animate-pulse"
                                  : lead.status === "contacted"
                                    ? "bg-blue-50 text-blue-700 border border-blue-200"
                                    : lead.status === "converted"
                                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                      : "bg-rose-50 text-rose-700 border border-rose-200"
                              }`}
                            >
                              {lead.status}
                            </span>
                            <span className="block text-[10px] text-slate-400 mt-1">
                              {inr(lead.pricePaidINR)} paid •{" "}
                              {formatTimeAgo(lead.deliveredAt)}
                            </span>
                          </td>

                          {/* Action Buttons */}
                          <td className="py-3.5 px-4 text-right">
                            <div
                              className="flex items-center justify-end gap-1.5"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {lead.phone && (
                                <>
                                  {/* 1-Click WhatsApp */}
                                  <a
                                    href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(`Hi ${lead.fullName}, I am reaching out from ${orgName} regarding your study abroad plans.`)}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white p-2 transition"
                                    title="WhatsApp Direct"
                                  >
                                    <MessageSquare className="h-3.5 w-3.5" />
                                  </a>

                                  {/* 1-Click Call */}
                                  <a
                                    href={`tel:${lead.phone}`}
                                    className="rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white p-2 transition"
                                    title="Call Student"
                                  >
                                    <Phone className="h-3.5 w-3.5" />
                                  </a>
                                </>
                              )}

                              {/* View Details */}
                              <button
                                onClick={() =>
                                  setSelectedDeliveryId(lead.deliveryId)
                                }
                                className="rounded-lg bg-slate-100 text-slate-700 hover:bg-[#102C57] hover:text-white p-2 transition"
                                title="Open Full Profile"
                              >
                                <ChevronRight className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {filteredLeads.length === 0 && (
                  <div className="text-center py-12 px-4">
                    <Users className="mx-auto h-8 w-8 text-slate-400" />
                    <h4 className="mt-2 text-sm font-bold text-slate-800">
                      {purchasedLeads.length === 0
                        ? "You have not unlocked any leads yet"
                        : "No matching leads found"}
                    </h4>
                    <p className="text-xs text-slate-500 mt-1">
                      {purchasedLeads.length === 0
                        ? "Unlock a lead from the available leads below to see its contact details."
                        : "Try adjusting your search criteria or filter status."}
                    </p>
                  </div>
                )}
              </div>

              {/* Available Leads (contact details hidden until unlocked) */}
              <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
                <div className="px-4 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <h3 className="text-sm font-bold text-[#102C57]">
                    Available leads
                  </h3>
                  <span className="text-[11px] text-slate-500">
                    Matching your targeting rules. Contact details are shown
                    after unlocking.
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                      <tr>
                        <th className="py-3.5 px-4">Target Track</th>
                        <th className="py-3.5 px-4">Budget & Intake</th>
                        <th className="py-3.5 px-4">Quality Score</th>
                        <th className="py-3.5 px-4">Created</th>
                        <th className="py-3.5 px-4 text-right">Unlock</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                      {availableLeads.map((lead) => (
                        <tr key={lead.id} className="hover:bg-slate-50/80">
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-1.5 font-bold text-slate-900">
                              {lead.countryName && (
                                <CountryFlag
                                  name={lead.countryName}
                                  size="sm"
                                />
                              )}
                              <span>{show(lead.countryName)}</span>
                            </div>
                            <div className="text-[11px] text-slate-500 mt-0.5">
                              {show(lead.programName)}
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <div>{show(lead.budgetRange)}</div>
                            <div className="text-[11px] text-slate-500 mt-0.5">
                              Intake: {show(lead.intakeYear)}
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            {lead.leadScore !== null ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 text-blue-800 border border-blue-200 px-2.5 py-0.5 text-[10px] font-extrabold">
                                <Sparkles className="h-3 w-3" />
                                Score {lead.leadScore}/100
                              </span>
                            ) : (
                              <NotProvided />
                            )}
                            <span
                              className={`block text-[10px] mt-1 font-semibold ${
                                lead.isPhoneVerified
                                  ? "text-emerald-600"
                                  : "text-slate-400"
                              }`}
                            >
                              {lead.isPhoneVerified
                                ? "Phone verified"
                                : "Phone not verified"}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-slate-500">
                            {formatTimeAgo(lead.createdAt)}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() => handleUnlockLead(lead.id)}
                              disabled={
                                costPerLead === null || unlockingLeadId !== null
                              }
                              className="inline-flex items-center gap-1.5 rounded-xl bg-[#EA5C2B] px-3 py-2 text-[11px] font-bold text-white hover:bg-[#d94f20] transition shadow-xs cursor-pointer disabled:cursor-not-allowed disabled:bg-slate-300"
                            >
                              {unlockingLeadId === lead.id ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : costPerLead === null ? (
                                <Lock className="h-3.5 w-3.5" />
                              ) : (
                                <Unlock className="h-3.5 w-3.5" />
                              )}
                              <span>
                                {costPerLead === null
                                  ? "Price not set"
                                  : `Unlock for ${inr(costPerLead)}`}
                              </span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {availableLeads.length === 0 && (
                  <div className="text-center py-10 px-4">
                    <Target className="mx-auto h-8 w-8 text-slate-400" />
                    <h4 className="mt-2 text-sm font-bold text-slate-800">
                      No available leads right now
                    </h4>
                    <p className="text-xs text-slate-500 mt-1">
                      New leads matching your targeting rules will appear here.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: WALLET & BILLING */}
          {activeTab === "wallet" && (
            <div className="space-y-6">
              {/* Wallet Summary Card */}
              <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
                  <div>
                    <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800">
                      <Wallet className="h-3.5 w-3.5" />
                      <span>Prepaid Wallet Balance</span>
                    </div>
                    <div className="mt-3 text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
                      {inr(walletBalance)}
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Unlocking a lead debits its price from this balance.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                    <button
                      onClick={openTopupModal}
                      className="flex items-center justify-center gap-2 rounded-xl bg-[#EA5C2B] py-3 px-6 text-xs font-bold text-white hover:bg-[#d94f20] transition shadow-md cursor-pointer"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Request Top-up</span>
                    </button>
                  </div>
                </div>

                {/* GST Info Note */}
                <div className="mt-6 flex items-start gap-2.5 rounded-2xl bg-indigo-50/60 p-4 border border-indigo-100 text-xs text-slate-700">
                  <Building2 className="h-4 w-4 text-[#102C57] shrink-0 mt-0.5" />
                  <div>
                    <strong>Registered Billing GSTIN:</strong>{" "}
                    {show(buyer.gstin)} ({show(buyer.companyName)})
                  </div>
                </div>
              </div>

              {/* Top-up Requests */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-[#102C57]">
                    Top-up Requests
                  </h3>
                  <span className="text-xs text-slate-500">
                    {topupRequests.length} requests
                  </span>
                </div>

                <div className="divide-y divide-slate-100 text-xs">
                  {topupRequests.map((r) => (
                    <div
                      key={r.id}
                      className="py-3.5 flex items-center justify-between gap-4"
                    >
                      <div>
                        <p className="font-bold text-slate-900">
                          {inr(r.amountINR)}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          Requested {formatDateTime(r.createdAt)} • Reference:{" "}
                          {show(r.paymentReference)}
                        </p>
                        {r.adminNote && (
                          <p className="text-[11px] text-slate-600 mt-0.5">
                            <strong>Admin note:</strong> {r.adminNote}
                          </p>
                        )}
                      </div>
                      <span
                        className={`rounded-md px-2 py-0.5 text-[10px] font-bold capitalize border shrink-0 ${
                          r.status === "approved"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : r.status === "rejected"
                              ? "bg-rose-50 text-rose-700 border-rose-200"
                              : "bg-amber-50 text-amber-800 border-amber-200"
                        }`}
                      >
                        {r.status}
                      </span>
                    </div>
                  ))}
                  {topupRequests.length === 0 && (
                    <div className="text-center py-6 text-slate-500">
                      No top-up requests yet.
                    </div>
                  )}
                </div>
              </div>

              {/* Transactions Ledger */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-[#102C57]">
                    Itemized Transaction Ledger
                  </h3>
                  <span className="text-xs text-slate-500">
                    {transactions.length} transactions
                  </span>
                </div>

                <div className="divide-y divide-slate-100 text-xs">
                  {transactions.map((tx) => {
                    const credit = isCredit(tx.type);
                    return (
                      <div
                        key={tx.id}
                        className="py-3.5 flex items-center justify-between gap-4"
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`flex h-8 w-8 items-center justify-center rounded-lg shrink-0 ${
                              tx.type === "lead_refund"
                                ? "bg-indigo-50 text-indigo-700"
                                : credit
                                  ? "bg-emerald-50 text-emerald-700"
                                  : "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {tx.type === "lead_refund" ? (
                              <RotateCcw className="h-4 w-4" />
                            ) : credit ? (
                              <Plus className="h-4 w-4" />
                            ) : (
                              <Users className="h-4 w-4" />
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">
                              {TX_LABELS[tx.type]}
                            </p>
                            <p className="text-[11px] text-slate-600">
                              {show(tx.description)}
                            </p>
                            <p className="text-[10px] text-slate-400 mt-0.5">
                              {formatDateTime(tx.createdAt)} • Ref:{" "}
                              {show(tx.reference)}
                            </p>
                          </div>
                        </div>

                        <div
                          className={`font-black text-sm text-right shrink-0 ${
                            credit ? "text-emerald-700" : "text-slate-900"
                          }`}
                        >
                          {credit ? "+ " : "- "}
                          {inr(Math.abs(tx.amountINR))}
                        </div>
                      </div>
                    );
                  })}
                  {transactions.length === 0 && (
                    <div className="text-center py-6 text-slate-500">
                      No wallet transactions yet.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ANALYTICS DASHBOARD */}
          {activeTab === "analytics" && (
            <div className="space-y-6">
              {/* Analytics Header Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200">
                <div>
                  <h3 className="text-base font-bold text-[#102C57]">
                    Lead Purchase & Conversion Analytics
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Calculated from the leads you have unlocked and your wallet
                    ledger.
                  </p>
                </div>

                {/* Timeframe selector */}
                <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1 text-xs font-bold">
                  {(
                    [
                      { id: "7d", label: "7 Days" },
                      { id: "30d", label: "30 Days" },
                      { id: "quarter", label: "Quarter" },
                      { id: "all", label: "All Time" },
                    ] as const
                  ).map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setAnalyticsTimeframe(t.id)}
                      className={`rounded-lg px-3 py-1.5 transition ${
                        analyticsTimeframe === t.id
                          ? "bg-[#102C57] text-white shadow-xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Headline metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                  <span className="text-xs font-bold text-slate-500 uppercase">
                    Leads Purchased
                  </span>
                  <div className="text-3xl font-black text-slate-900 mt-2">
                    {aLeads.length}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    {aCount("unread")} unread • {aCount("contacted")} contacted
                    • {aConverted} converted • {aCount("disputed")} disputed
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                  <span className="text-xs font-bold text-slate-500 uppercase">
                    Conversion Rate
                  </span>
                  <div className="text-3xl font-black text-slate-900 mt-2">
                    {aLeads.length > 0 ? (
                      `${((aConverted / aLeads.length) * 100).toFixed(1)}%`
                    ) : (
                      <NotProvided />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Converted ÷ purchased
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                  <span className="text-xs font-bold text-slate-500 uppercase">
                    Total Spend
                  </span>
                  <div className="text-3xl font-black text-slate-900 mt-2">
                    {inr(aSpend)}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Cost per conversion:{" "}
                    {aConverted > 0 ? (
                      inr(Math.round(aSpend / aConverted))
                    ) : (
                      <NotProvided />
                    )}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                  <span className="text-xs font-bold text-slate-500 uppercase">
                    Refunds
                  </span>
                  <div className="text-3xl font-black text-emerald-700 mt-2">
                    {inr(aRefunds)}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Dispute rate:{" "}
                    {aLeads.length > 0 ? (
                      `${((aDisputed / aLeads.length) * 100).toFixed(1)}%`
                    ) : (
                      <NotProvided />
                    )}
                  </p>
                </div>
              </div>

              {/* Breakdown by Country & Program */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {(
                  [
                    {
                      title: "Purchased Leads by Country",
                      rows: byCountry,
                      color: "bg-[#102C57]",
                    },
                    {
                      title: "Purchased Leads by Program",
                      rows: byProgram,
                      color: "bg-[#EA5C2B]",
                    },
                  ] as const
                ).map((block) => (
                  <div
                    key={block.title}
                    className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs"
                  >
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">
                      {block.title}
                    </h4>
                    <div className="space-y-3 text-xs">
                      {block.rows.map((item) => {
                        const pct = Math.round(
                          (item.count / aLeads.length) * 100,
                        );
                        return (
                          <div key={item.label ?? "none"} className="space-y-1">
                            <div className="flex justify-between font-semibold">
                              <span className="text-slate-800">
                                {show(item.label)}
                              </span>
                              <span className="text-slate-600">
                                {item.count} Leads ({pct}%)
                              </span>
                            </div>
                            <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                              <div
                                style={{ width: `${pct}%` }}
                                className={`h-full ${block.color} rounded-full`}
                              />
                            </div>
                          </div>
                        );
                      })}
                      {block.rows.length === 0 && (
                        <div className="text-center py-6 text-slate-500">
                          No purchased leads in this period.
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <p className="text-[11px] text-slate-400">
                Page traffic and source analytics: <NotProvided /> — no traffic
                analytics source connected.
              </p>
            </div>
          )}

          {/* TAB 4: DISPUTES & REFUNDS */}
          {activeTab === "disputes" && (
            <div className="space-y-6">
              {/* Disputes Info Banner */}
              <div className="rounded-2xl border border-indigo-100 bg-indigo-50/60 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-slate-700">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="h-5 w-5 text-[#102C57] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-sm text-[#102C57]">
                      Lead Quality Disputes
                    </strong>
                    <p className="mt-1 text-slate-600">
                      Raise a dispute from a lead&apos;s detail view if the
                      phone number is fake, the profile is invalid, or the
                      student is already enrolled elsewhere. Our team reviews
                      each dispute and refunds approved disputes to your wallet.
                    </p>
                  </div>
                </div>
              </div>

              {/* Disputes List */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
                <h3 className="text-sm font-bold text-[#102C57] mb-4">
                  Dispute History
                </h3>

                <div className="space-y-3 text-xs">
                  {disputedLeads.map((d) => (
                    <div
                      key={d.deliveryId}
                      className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-bold text-slate-900">
                            {show(d.fullName)} ({show(d.phone)})
                          </span>
                          <span
                            className={`rounded-md px-2 py-0.5 text-[10px] font-bold border ${
                              d.disputeStatus === "approved"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : d.disputeStatus === "rejected"
                                  ? "bg-rose-50 text-rose-700 border-rose-200"
                                  : "bg-amber-50 text-amber-800 border-amber-200"
                            }`}
                          >
                            {disputeStatusLabel(d.disputeStatus)}
                          </span>
                        </div>
                        <p className="text-slate-600 mt-1">
                          <strong>Reason:</strong> {show(d.disputeReason)}
                        </p>
                        <span className="text-[10px] text-slate-400 mt-0.5 block">
                          Target: {show(d.countryName)} • {show(d.programName)}
                        </span>
                      </div>

                      <div className="text-right shrink-0">
                        <span
                          className={`font-bold text-sm ${
                            d.disputeStatus === "approved"
                              ? "text-emerald-700"
                              : "text-slate-700"
                          }`}
                        >
                          {inr(d.pricePaidINR)}
                        </span>
                        <span className="block text-[10px] text-slate-400">
                          {d.disputeStatus === "approved"
                            ? "Refunded to wallet"
                            : d.disputeStatus === "rejected"
                              ? "Not refunded"
                              : "Refund pending review"}
                        </span>
                      </div>
                    </div>
                  ))}

                  {disputedLeads.length === 0 && (
                    <div className="text-center py-8 text-slate-500">
                      No disputes raised.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: TARGETING RULES */}
          {activeTab === "targeting" && (
            <form
              onSubmit={handleSaveTargeting}
              className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                <div>
                  <h3 className="text-lg font-bold text-[#102C57]">
                    Targeting Rules & Delivery
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Choose which countries, programs, and lead score thresholds
                    appear in your available leads.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isSavingTargeting}
                  className="flex items-center gap-2 rounded-xl bg-[#102C57] py-2.5 px-6 text-xs font-bold text-white hover:bg-[#0c2242] transition shadow-xs cursor-pointer self-start sm:self-center disabled:opacity-60"
                >
                  {isSavingTargeting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4 text-[#EA5C2B]" />
                  )}
                  <span>Save Targeting Rules</span>
                </button>
              </div>

              {targetingSavedNotice && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-bold text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>Targeting parameters saved successfully!</span>
                </div>
              )}

              {targetingError && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-bold text-rose-800 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-rose-600" />
                  <span>{targetingError}</span>
                </div>
              )}

              {/* 1. Countries */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  1. Target Study Destinations
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  {countryOptions.map((c) => {
                    const isSelected = targetCountries.includes(c.id);
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => toggleTargetCountry(c.id)}
                        className={`flex items-center gap-2 rounded-xl p-2.5 text-left font-bold transition border ${
                          isSelected
                            ? "border-[#102C57] bg-[#102C57] text-white shadow-xs"
                            : "border-slate-200 bg-slate-50/60 text-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        <CountryFlag code={c.code} name={c.name} size="sm" />
                        <span className="truncate">{c.name}</span>
                      </button>
                    );
                  })}
                </div>
                {optionsLoaded && countryOptions.length === 0 && (
                  <p className="text-[11px] text-slate-400">
                    No countries available in the database.
                  </p>
                )}
              </div>

              {/* 2. Program Streams */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  2. Accepted Programs
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                  {programOptions.map((p) => {
                    const isSelected = targetPrograms.includes(p.id);
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => toggleTargetProgram(p.id)}
                        className={`flex items-center justify-between rounded-xl p-2.5 font-bold transition border ${
                          isSelected
                            ? "border-[#EA5C2B] bg-[#EA5C2B] text-white shadow-xs"
                            : "border-slate-200 bg-slate-50/60 text-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        <span className="text-left">{p.name}</span>
                        {isSelected && <Check className="h-3.5 w-3.5" />}
                      </button>
                    );
                  })}
                </div>
                {optionsLoaded && programOptions.length === 0 && (
                  <p className="text-[11px] text-slate-400">
                    No programs available in the database.
                  </p>
                )}
              </div>

              {/* 3. Daily Cap & Score Threshold */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                    Daily Lead Cap (leads per day)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={1000}
                    step={1}
                    placeholder="No cap"
                    value={dailyLeadCap}
                    onChange={(e) => setDailyLeadCap(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/60 py-2.5 px-3.5 font-semibold text-slate-900 focus:border-[#102C57] focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                    Minimum Lead Score Threshold
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    step={1}
                    placeholder="No minimum"
                    value={minLeadScore ?? ""}
                    onChange={(e) =>
                      setMinLeadScore(
                        e.target.value === ""
                          ? null
                          : Math.max(
                              0,
                              Math.min(100, Math.round(Number(e.target.value))),
                            ),
                      )
                    }
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/60 py-2.5 px-3.5 font-semibold text-slate-900 focus:border-[#102C57] focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              {/* 4. Operating Hours & Auto-Unlock */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Operating Business Hours
                  </label>
                  <p className="text-[11px] text-slate-500 mb-2">
                    Shared with our team so we know when you handle leads.
                  </p>
                  <input
                    type="text"
                    maxLength={64}
                    placeholder="e.g. 09:00 - 19:00 IST"
                    value={operatingHours}
                    onChange={(e) => setOperatingHours(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white py-2 px-3 text-xs font-semibold text-slate-900"
                  />
                </div>

                <div className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-4 flex items-center justify-between gap-3 opacity-70">
                  <div>
                    <label className="block text-xs font-bold text-[#102C57]">
                      Auto-Unlock (coming soon)
                    </label>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Automatic purchasing is not available yet. Unlock leads
                      manually from the Leads tab.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={buyer.autoUnlock}
                    disabled
                    readOnly
                    className="h-5 w-5 rounded accent-[#102C57] cursor-not-allowed shrink-0"
                  />
                </div>
              </div>
            </form>
          )}
        </div>
      </main>

      {/* Slide-over Individual Lead Detail Drawer */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-xl bg-white h-full shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#102C57] text-white font-bold text-sm">
                  {selectedLead.fullName.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                    <span>{show(selectedLead.fullName)}</span>
                    {selectedLead.isPhoneVerified && (
                      <span className="rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 text-[10px] font-extrabold">
                        Phone Verified
                      </span>
                    )}
                  </h3>
                  <span className="text-xs text-slate-500">
                    Unlocked {formatTimeAgo(selectedLead.deliveredAt)} •{" "}
                    {inr(selectedLead.pricePaidINR)} paid
                  </span>
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedDeliveryId(null);
                  setNewNoteText("");
                }}
                className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="p-6 space-y-6 flex-1 text-xs">
              {actionError && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 font-bold text-rose-800 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-rose-600" />
                  <span>{actionError}</span>
                </div>
              )}

              {/* 1-Click Action Buttons */}
              <div className="grid grid-cols-3 gap-2">
                <a
                  href={`https://wa.me/${selectedLead.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(`Hi ${selectedLead.fullName}, I am reaching out from ${orgName} regarding your study abroad plans.`)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 text-white font-bold py-2.5 px-3 hover:bg-emerald-700 transition shadow-xs"
                >
                  <MessageSquare className="h-4 w-4" />
                  <span>WhatsApp</span>
                </a>

                <a
                  href={`tel:${selectedLead.phone}`}
                  className="flex items-center justify-center gap-2 rounded-xl bg-[#102C57] text-white font-bold py-2.5 px-3 hover:bg-[#0c2242] transition shadow-xs"
                >
                  <Phone className="h-4 w-4" />
                  <span>Call Student</span>
                </a>

                <a
                  href={`mailto:${selectedLead.email}`}
                  className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-slate-700 font-bold py-2.5 px-3 hover:bg-slate-50 transition"
                >
                  <Mail className="h-4 w-4" />
                  <span>Email</span>
                </a>
              </div>

              {/* Contact Details */}
              <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-2">
                <h4 className="font-extrabold uppercase tracking-wider text-[11px] text-[#102C57]">
                  Contact Details
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-slate-400 block text-[10px]">
                      Phone:
                    </span>
                    <span className="font-bold text-slate-800 mt-0.5 block">
                      {show(selectedLead.phone)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">
                      Email:
                    </span>
                    <span className="font-bold text-slate-800 mt-0.5 block break-all">
                      {show(selectedLead.email)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Profile Details Grid */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 space-y-3">
                <h4 className="font-extrabold uppercase tracking-wider text-[11px] text-[#102C57]">
                  Academic & Intake Profile
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-slate-400 block text-[10px]">
                      Target Country:
                    </span>
                    <span className="font-bold text-slate-800 flex items-center gap-1 mt-0.5">
                      {selectedLead.countryName && (
                        <CountryFlag
                          name={selectedLead.countryName}
                          size="sm"
                        />
                      )}
                      {show(selectedLead.countryName)}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px]">
                      Program Stream:
                    </span>
                    <span className="font-bold text-slate-800 mt-0.5 block">
                      {show(selectedLead.programName)}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px]">
                      Target Intake:
                    </span>
                    <span className="font-bold text-slate-800 mt-0.5 block">
                      {show(selectedLead.intakeYear)}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px]">
                      Budget Range (INR):
                    </span>
                    <span className="font-bold text-slate-800 mt-0.5 block">
                      {show(selectedLead.budgetRange)}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px]">
                      Highest Education:
                    </span>
                    <span className="font-bold text-slate-800 mt-0.5 block">
                      {show(selectedLead.highestEducation)}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px]">
                      IELTS Score:
                    </span>
                    <span className="font-bold text-slate-800 mt-0.5 block">
                      {show(selectedLead.ieltsScore)}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px]">
                      Lead Score:
                    </span>
                    <span className="font-bold text-slate-800 mt-0.5 block">
                      {show(selectedLead.leadScore, (s) => `${s}/100`)}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px]">
                      Lead Created:
                    </span>
                    <span className="font-bold text-slate-800 mt-0.5 block">
                      {formatDateTime(selectedLead.createdAt)}
                    </span>
                  </div>
                </div>
              </div>

              {/* CRM Contact Status Updater */}
              <div className="space-y-2">
                <h4 className="font-extrabold uppercase tracking-wider text-[11px] text-slate-700">
                  Update Lead CRM Status
                </h4>
                {selectedLead.status === "disputed" ? (
                  <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-rose-800 font-semibold">
                    This lead is disputed (
                    {disputeStatusLabel(selectedLead.disputeStatus)}).
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-1.5">
                    {(["unread", "contacted", "converted"] as const).map(
                      (st) => (
                        <button
                          key={st}
                          onClick={() => handleUpdateStatus(st)}
                          disabled={isUpdatingLead}
                          className={`rounded-xl py-2 text-center capitalize font-bold transition border disabled:opacity-60 ${
                            selectedLead.status === st
                              ? "bg-[#102C57] text-white border-[#102C57] shadow-xs"
                              : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                          }`}
                        >
                          {st}
                        </button>
                      ),
                    )}
                  </div>
                )}
              </div>

              {/* Consultation Notes Ledger */}
              <div className="space-y-3">
                <h4 className="font-extrabold uppercase tracking-wider text-[11px] text-slate-700">
                  Consultation Notes
                </h4>

                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {selectedLead.notes.map((note, i) => (
                    <div
                      key={i}
                      className="rounded-xl border border-slate-100 bg-slate-50 p-3"
                    >
                      <p className="text-slate-800 leading-relaxed">
                        {note.text}
                      </p>
                      <span className="block text-[10px] text-slate-400 mt-1">
                        {show(note.author)} • {formatTimeAgo(note.at)}
                      </span>
                    </div>
                  ))}
                  {selectedLead.notes.length === 0 && (
                    <p className="text-slate-400">No notes yet.</p>
                  )}
                </div>

                {/* Add Note Input */}
                {selectedLead.status !== "disputed" && (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Add a private note about this student..."
                      value={newNoteText}
                      onChange={(e) => setNewNoteText(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleAddNote()}
                      className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 font-medium focus:border-[#102C57] focus:bg-white focus:outline-none"
                    />
                    <button
                      onClick={handleAddNote}
                      disabled={isUpdatingLead}
                      className="rounded-xl bg-[#102C57] text-white px-3 py-2 font-bold hover:bg-[#0c2242] transition disabled:opacity-60"
                    >
                      {isUpdatingLead ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Send className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Drawer Footer: Dispute Trigger */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
              {selectedLead.disputeStatus === null ? (
                <>
                  <button
                    onClick={() => openDisputeModal(selectedLead.deliveryId)}
                    className="flex items-center gap-1.5 text-xs font-bold text-rose-600 hover:text-rose-800 transition"
                  >
                    <AlertCircle className="h-4 w-4" />
                    <span>Raise dispute</span>
                  </button>
                  <span className="text-[11px] text-slate-400">
                    Reviewed by our team; refunded to wallet if approved
                  </span>
                </>
              ) : (
                <span className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
                  <Clock className="h-4 w-4" />
                  Dispute: {disputeStatusLabel(selectedLead.disputeStatus)}
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal: Raise Lead Dispute */}
      {disputeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-rose-600" />
                <span>Raise Lead Dispute</span>
              </h3>
              <button
                onClick={() => setDisputeModalOpen(false)}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleDisputeSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                  Select Dispute Reason *
                </label>
                <select
                  value={disputeCategory}
                  onChange={(e) =>
                    setDisputeCategory(
                      e.target
                        .value as (typeof DISPUTE_CATEGORIES)[number]["id"],
                    )
                  }
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3 font-semibold text-slate-900 focus:border-[#102C57] focus:bg-white focus:outline-none"
                >
                  {DISPUTE_CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                  Details for Review *
                </label>
                <textarea
                  rows={3}
                  required
                  minLength={3}
                  maxLength={1900}
                  placeholder="Provide call timestamps or details of the problem..."
                  value={disputeNotes}
                  onChange={(e) => setDisputeNotes(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 font-medium text-slate-900 focus:border-[#102C57] focus:bg-white focus:outline-none"
                />
              </div>

              <div className="rounded-xl bg-amber-50 p-3 text-[11px] text-amber-900 border border-amber-200">
                Our team reviews every dispute. If it is approved, the price you
                paid for this lead is refunded to your wallet.
              </div>

              {disputeError && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 font-bold text-rose-800">
                  {disputeError}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDisputeModalOpen(false)}
                  className="rounded-xl border border-slate-200 bg-white py-2 px-4 font-bold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingDispute}
                  className="flex items-center gap-1.5 rounded-xl bg-rose-600 text-white py-2 px-5 font-bold hover:bg-rose-700 transition shadow-md cursor-pointer disabled:opacity-60"
                >
                  {isSubmittingDispute && (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  )}
                  <span>Submit Dispute</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Request Wallet Top-up */}
      {topupModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Wallet className="h-5 w-5 text-emerald-600" />
                <span>Request Wallet Top-up</span>
              </h3>
              <button
                onClick={() => setTopupModalOpen(false)}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleTopupSubmit} className="space-y-4 text-xs">
              <p className="rounded-xl bg-slate-50 p-3 text-[11px] text-slate-600 border border-slate-100">
                Pay by bank transfer or UPI, then submit the amount and payment
                reference here. Your wallet is credited once our team confirms
                the payment.
              </p>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                  Amount Paid (INR) *
                </label>
                <input
                  type="number"
                  min={1}
                  step={1}
                  required
                  value={topupAmount}
                  onChange={(e) => setTopupAmount(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3.5 font-bold text-slate-900 focus:border-[#102C57] focus:bg-white focus:outline-none text-base"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                  Payment Reference (UTR / UPI transaction ID)
                </label>
                <input
                  type="text"
                  maxLength={128}
                  value={topupReference}
                  onChange={(e) => setTopupReference(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3.5 font-semibold text-slate-900 focus:border-[#102C57] focus:bg-white focus:outline-none"
                />
              </div>

              {topupError && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 font-bold text-rose-800">
                  {topupError}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setTopupModalOpen(false)}
                  className="rounded-xl border border-slate-200 bg-white py-2 px-4 font-bold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingTopup}
                  className="flex items-center gap-1.5 rounded-xl bg-[#EA5C2B] text-white py-2.5 px-6 font-bold hover:bg-[#d94f20] transition shadow-md cursor-pointer disabled:opacity-60"
                >
                  {isSubmittingTopup && (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  )}
                  <span>Submit Request</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-200/80 bg-white py-6 text-center text-xs text-slate-500">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            © {new Date().getFullYear()} Abroadroute B2B Partner Portal
          </span>
          <div className="flex items-center gap-4">
            <Link href="/terms-of-service" className="hover:underline">
              Terms
            </Link>
            <Link href="/privacy-policy" className="hover:underline">
              Data Protection
            </Link>
            <Link href="/contact" className="hover:underline">
              Partner Support
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
