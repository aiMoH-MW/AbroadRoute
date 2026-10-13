"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Building2,
  Users,
  FileCheck,
  CheckCircle2,
  LogOut,
  Loader2,
  Plus,
  Pencil,
  Trash2,
  Save,
  X,
  Award,
  TrendingUp,
  MapPin,
  Clock,
  Calendar,
  Download,
  Check,
  ShieldCheck,
  ExternalLink,
  BarChart3,
  Mail,
  GraduationCap,
  AlertCircle,
  RefreshCw,
  Inbox,
} from "lucide-react";
import { useAuth } from "@/lib/auth/AuthContext";
import { getAuthHeaders } from "@/lib/supabase/client";
import { EditUniversityProfileModal } from "@/components/university/EditUniversityProfileModal";
import { CountryFlag } from "@/components/ui/CountryFlag";
import { BrandLogo } from "@/components/ui/BrandSignatures";
import { NotProvided, show } from "@/components/tools/NotProvided";
import { formatCurrency } from "@/lib/utils";
import type {
  InquiryStatus,
  ListingPlan,
  UniversityInquiry,
  UniversityPortalData,
} from "@/lib/universityPortalTypes";
import type { CompareDeadline, CompareProgramRef } from "@/lib/compareTypes";

type TabType = "overview" | "programs" | "analytics" | "inquiries" | "upgrade";
type Timeframe = "30d" | "90d" | "1y" | "all";

const INQUIRY_STATUSES: InquiryStatus[] = [
  "new",
  "reviewing",
  "shortlisted",
  "contacted",
];

const STATUS_META: Record<
  InquiryStatus,
  { label: string; badge: string; bar: string }
> = {
  new: {
    label: "New",
    badge: "bg-indigo-50 text-indigo-700",
    bar: "from-indigo-500 to-indigo-700",
  },
  reviewing: {
    label: "Under Review",
    badge: "bg-amber-50 text-amber-800",
    bar: "from-amber-400 to-amber-600",
  },
  shortlisted: {
    label: "Shortlisted",
    badge: "bg-emerald-50 text-emerald-800",
    bar: "from-emerald-500 to-emerald-700",
  },
  contacted: {
    label: "Contacted",
    badge: "bg-slate-100 text-slate-700",
    bar: "from-slate-400 to-slate-600",
  },
};

// Visual variants for listing plan cards, cycled by position
const PLAN_STYLES = [
  {
    card: "border-slate-200 bg-white",
    title: "text-[#102C57]",
    price: "text-slate-800",
    muted: "text-slate-500",
    list: "text-slate-600 border-slate-100",
    check: "text-emerald-600",
    cta: "text-slate-700 border border-slate-300 bg-slate-100 hover:bg-slate-200",
  },
  {
    card: "border-amber-200 bg-amber-50/40 shadow-md",
    title: "text-[#102C57]",
    price: "text-amber-900",
    muted: "text-slate-600",
    list: "text-slate-700 border-amber-200/60",
    check: "text-amber-600",
    cta: "text-white bg-amber-600 hover:bg-amber-700 shadow-xs",
  },
  {
    card: "border-indigo-800 bg-gradient-to-b from-indigo-950 to-[#102C57] text-white shadow-lg",
    title: "text-white",
    price: "text-white",
    muted: "text-indigo-200",
    list: "text-indigo-100 border-white/10",
    check: "text-purple-300",
    cta: "text-white bg-[#EA5C2B] hover:bg-[#ff7240] shadow-md",
  },
];

function formatTuition(value: number): string {
  return value === 0 ? "₹0 (Tuition Free)" : `${formatCurrency(value)} / yr`;
}

function formatDate(value: string | null | undefined): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatDeadline(d: CompareDeadline): string {
  const term = `${d.intakeTerm} ${d.intakeYear}`;
  const round = d.roundName ? ` · ${d.roundName}` : "";
  const date = d.isRolling
    ? "Rolling admissions"
    : (formatDate(d.deadlineDate) ?? d.deadlineDate);
  return `${term}${round} — ${date}`;
}

function formatPlanPrice(
  plan: ListingPlan,
  currency: "INR" | "USD",
): string | null {
  const amount = currency === "INR" ? plan.priceINR : plan.priceUSD;
  if (amount === null) return null;
  return currency === "INR"
    ? `₹${amount.toLocaleString("en-IN")}`
    : `$${amount.toLocaleString("en-US")}`;
}

function timeframeStart(tf: Timeframe): number | null {
  const day = 24 * 60 * 60 * 1000;
  if (tf === "30d") return Date.now() - 30 * day;
  if (tf === "90d") return Date.now() - 90 * day;
  if (tf === "1y") return Date.now() - 365 * day;
  return null;
}

// Monthly inquiry counts from the earliest month in range to the current one
function monthlyCounts(
  inquiries: UniversityInquiry[],
  tf: Timeframe,
): { label: string; count: number }[] {
  const dates = inquiries
    .map((i) => new Date(i.createdAt))
    .filter((d) => !Number.isNaN(d.getTime()));
  const now = new Date();
  const start = timeframeStart(tf);
  let first: Date;
  if (start !== null) {
    first = new Date(start);
  } else if (dates.length > 0) {
    first = new Date(Math.min(...dates.map((d) => d.getTime())));
  } else {
    return [];
  }
  const months: { key: string; label: string; count: number }[] = [];
  const cursor = new Date(first.getFullYear(), first.getMonth(), 1);
  while (cursor <= now) {
    months.push({
      key: `${cursor.getFullYear()}-${cursor.getMonth()}`,
      label: cursor.toLocaleDateString("en-IN", {
        month: "short",
        year: "numeric",
      }),
      count: 0,
    });
    cursor.setMonth(cursor.getMonth() + 1);
  }
  for (const d of dates) {
    const m = months.find(
      (x) => x.key === `${d.getFullYear()}-${d.getMonth()}`,
    );
    if (m) m.count += 1;
  }
  // Keep the chart readable: show the latest 12 months at most
  return months.slice(-12).map(({ label, count }) => ({ label, count }));
}

function countBy(
  inquiries: UniversityInquiry[],
  keyOf: (i: UniversityInquiry) => string | null,
): { label: string | null; count: number }[] {
  const map = new Map<string | null, number>();
  for (const inq of inquiries) {
    const key = keyOf(inq) || null;
    map.set(key, (map.get(key) ?? 0) + 1);
  }
  return Array.from(map.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);
}

function csvCell(value: string | number | null | undefined): string {
  const text = value === null || value === undefined ? "" : String(value);
  return `"${text.replace(/"/g, '""')}"`;
}

function PortalHeader({
  email,
  badge,
  onSignOut,
}: {
  email: string;
  badge: string;
  onSignOut: () => void;
}) {
  return (
    <header className="border-b border-[#D9CFB8]/60 bg-white/95 backdrop-blur-md sticky top-0 z-30 shadow-xs">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <BrandLogo variant="wordmark" theme="light" size="md" />
          <span className="rounded-full bg-[#1D5A6C]/10 px-3 py-1 text-[11px] font-bold text-[#1D5A6C]">
            {badge}
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <span className="font-semibold text-slate-600 hidden sm:inline-block">
            Signed in as: <strong className="text-slate-900">{email}</strong>
          </span>
          <button
            onClick={onSignOut}
            className="rounded-xl border border-slate-200 px-3 py-1.5 font-bold text-slate-700 hover:bg-slate-50 hover:text-rose-600 transition flex items-center gap-1.5 cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </header>
  );
}

function FactTile({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-3 border border-slate-100">
      <span className="text-[10px] font-bold text-slate-400 uppercase">
        {label}
      </span>
      <div className="mt-1 font-bold text-slate-800">{value}</div>
    </div>
  );
}

function BarRow({
  label,
  count,
  max,
  gradient = "from-[#102C57] to-indigo-600",
}: {
  label: ReactNode;
  count: number;
  max: number;
  gradient?: string;
}) {
  const pct = max > 0 ? Math.round((count / max) * 100) : 0;
  return (
    <div className="space-y-1.5 text-xs">
      <div className="flex justify-between gap-3 font-bold">
        <span className="text-slate-700">{label}</span>
        <span className="text-[#102C57] shrink-0">{count}</span>
      </div>
      <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden">
        <div
          className={`h-full bg-gradient-to-r ${gradient} rounded-full transition-all duration-500`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function EmptyBlock({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 p-6 text-center text-xs text-slate-500">
      {children}
    </div>
  );
}

export default function UniversityPortalPage() {
  const router = useRouter();
  const { user, isLoading, logout } = useAuth();

  const [data, setData] = useState<UniversityPortalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [unauthorized, setUnauthorized] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [timeframe, setTimeframe] = useState<Timeframe>("all");
  const [currency, setCurrency] = useState<"INR" | "USD">("INR");
  const [statusFilter, setStatusFilter] = useState<InquiryStatus | "all">(
    "all",
  );

  // Program modal state
  const [isProgramModalOpen, setIsProgramModalOpen] = useState(false);
  const [editingProgramId, setEditingProgramId] = useState<string | null>(null);
  const [progProgramId, setProgProgramId] = useState("");
  const [progTuition, setProgTuition] = useState("");
  const [progDuration, setProgDuration] = useState("");
  const [progError, setProgError] = useState<string | null>(null);
  const [savingProg, setSavingProg] = useState(false);
  const [deletingProgramId, setDeletingProgramId] = useState<string | null>(
    null,
  );
  const [updatingInquiryId, setUpdatingInquiryId] = useState<string | null>(
    null,
  );

  const loadPortal = useCallback(async () => {
    try {
      setLoadError(null);
      const res = await fetch("/api/university-portal", {
        headers: { ...(await getAuthHeaders()) },
        cache: "no-store",
      });
      if (res.status === 401) {
        setUnauthorized(true);
        setData(null);
        return;
      }
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to load the portal.");
      }
      setUnauthorized(false);
      setData(json.data as UniversityPortalData);
    } catch (err: any) {
      setLoadError(err?.message || "Failed to load the portal.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    loadPortal();
  }, [isLoading, user?.id, loadPortal]);

  const handleSignOut = () => {
    logout();
    router.push("/login");
  };

  const university = data?.university ?? null;
  const programs = university?.programs ?? [];
  const inquiries = data?.inquiries ?? [];

  const analyticsInquiries = useMemo(() => {
    const start = timeframeStart(timeframe);
    if (start === null) return inquiries;
    return inquiries.filter((i) => {
      const t = new Date(i.createdAt).getTime();
      return !Number.isNaN(t) && t >= start;
    });
  }, [inquiries, timeframe]);

  // ---------- Program handlers ----------
  const handleOpenAddProgram = () => {
    setEditingProgramId(null);
    setProgProgramId("");
    setProgTuition("");
    setProgDuration("");
    setProgError(null);
    setIsProgramModalOpen(true);
  };

  const handleOpenEditProgram = (prog: CompareProgramRef) => {
    setEditingProgramId(prog.id);
    setProgProgramId(prog.id);
    setProgTuition(
      prog.yearlyTuitionINR === null ? "" : String(prog.yearlyTuitionINR),
    );
    setProgDuration(prog.duration ?? "");
    setProgError(null);
    setIsProgramModalOpen(true);
  };

  const handleSaveProgram = async (e: React.FormEvent) => {
    e.preventDefault();
    setProgError(null);
    if (!progProgramId) {
      setProgError("Please select a program.");
      return;
    }
    let tuition: number | null = null;
    if (progTuition.trim() !== "") {
      const n = Number(progTuition);
      if (!Number.isInteger(n) || n < 0) {
        setProgError("Yearly tuition must be a whole number of rupees.");
        return;
      }
      tuition = n;
    }

    setSavingProg(true);
    try {
      const res = await fetch("/api/university-portal/programs", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(await getAuthHeaders()),
        },
        body: JSON.stringify({
          programId: progProgramId,
          yearlyTuitionINR: tuition,
          duration: progDuration.trim() || null,
          isActive: true,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to save program.");
      }
      await loadPortal();
      setIsProgramModalOpen(false);
    } catch (err: any) {
      setProgError(err?.message || "Failed to save program.");
    } finally {
      setSavingProg(false);
    }
  };

  const handleDeleteProgram = async (programId: string) => {
    if (
      !confirm(
        "Are you sure you want to remove this academic program from your public catalog?",
      )
    ) {
      return;
    }
    setNotice(null);
    setDeletingProgramId(programId);
    try {
      const res = await fetch(
        `/api/university-portal/programs?programId=${encodeURIComponent(programId)}`,
        { method: "DELETE", headers: { ...(await getAuthHeaders()) } },
      );
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to remove program.");
      }
      await loadPortal();
    } catch (err: any) {
      setNotice(err?.message || "Failed to remove program.");
    } finally {
      setDeletingProgramId(null);
    }
  };

  // ---------- Inquiry handlers ----------
  const handleUpdateInquiryStatus = async (
    id: string,
    newStatus: InquiryStatus,
  ) => {
    setNotice(null);
    setUpdatingInquiryId(id);
    try {
      const res = await fetch(
        `/api/university-portal/inquiries/${encodeURIComponent(id)}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            ...(await getAuthHeaders()),
          },
          body: JSON.stringify({ status: newStatus }),
        },
      );
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to update inquiry status.");
      }
      await loadPortal();
    } catch (err: any) {
      setNotice(err?.message || "Failed to update inquiry status.");
    } finally {
      setUpdatingInquiryId(null);
    }
  };

  // Export the real inquiries in the selected timeframe
  const handleExportInquiries = () => {
    const header = [
      "Received",
      "Name",
      "Email",
      "Phone",
      "Country",
      "Program",
      "Highest education",
      "IELTS",
      "Budget",
      "Intake year",
      "Status",
    ];
    const rows = analyticsInquiries.map((i) =>
      [
        formatDate(i.createdAt) ?? i.createdAt,
        i.fullName,
        i.email,
        i.phone,
        i.countryName,
        i.programName,
        i.highestEducation,
        i.ieltsScore,
        i.budgetRange,
        i.intakeYear,
        STATUS_META[i.status]?.label ?? i.status,
      ]
        .map(csvCell)
        .join(","),
    );
    const csv = [header.map(csvCell).join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${(university?.slug || "university").replace(/[^a-z0-9-]+/gi, "_")}_inquiries.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // ---------- Loading ----------
  if (isLoading || (user && loading)) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <Loader2 className="h-8 w-8 animate-spin text-[#102C57]" />
        <p className="mt-3 text-xs font-semibold text-slate-500">
          Loading your university portal...
        </p>
      </div>
    );
  }

  // ---------- Unauthenticated ----------
  if (!user || unauthorized) {
    return (
      <div className="min-h-screen bg-[#FDFCF7] flex flex-col justify-between selection:bg-[#D89A3E]/20">
        <header className="border-b border-[#D9CFB8]/60 bg-white/95 backdrop-blur-md px-4 py-3.5 sm:px-8 shadow-xs">
          <div className="mx-auto flex max-w-7xl items-center justify-between">
            <BrandLogo variant="wordmark" theme="light" size="md" />
            <Link
              href="/login?redirect=/portal/university"
              className="rounded-xl bg-[#1D5A6C] px-4 py-2 text-xs font-bold text-white hover:bg-[#103B47] transition"
            >
              Sign In to Portal →
            </Link>
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 border border-indigo-100 text-[#102C57] mb-4">
              <Building2 className="h-7 w-7 text-[#EA5C2B]" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">
              University Representative Portal
            </h2>
            <p className="mt-2 text-xs text-slate-600 leading-relaxed">
              Sign in with your verified institutional account to manage degree
              programs and review student inquiries.
            </p>
            <div className="mt-6 space-y-3">
              <Link
                href="/login?redirect=/portal/university"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#102C57] py-3 text-xs font-bold text-white shadow-sm hover:bg-[#0c2242] transition"
              >
                Sign In with Official Account →
              </Link>
              <Link
                href="/university-portal/claim"
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 py-3 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
              >
                <ShieldCheck className="h-4 w-4 text-[#EA5C2B]" />
                Claim Your University Listing
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // ---------- Load error ----------
  if (!data) {
    return (
      <div className="min-h-screen bg-[#FDFCF7] flex flex-col">
        <PortalHeader
          email={user.email}
          badge="University Portal"
          onSignOut={handleSignOut}
        />
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl border border-rose-200 bg-white p-8 text-center shadow-lg">
            <AlertCircle className="mx-auto h-8 w-8 text-rose-500" />
            <h2 className="mt-3 text-base font-bold text-slate-900">
              Could not load the portal
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              {loadError || "Something went wrong."}
            </p>
            <button
              onClick={() => {
                setLoading(true);
                loadPortal();
              }}
              className="mt-5 inline-flex items-center gap-1.5 rounded-xl bg-[#102C57] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#0c2242] transition cursor-pointer"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Try again
            </button>
          </div>
        </main>
      </div>
    );
  }

  // ---------- No verified university: claim state ----------
  if (!university) {
    const claim = data.claim;

    if (!claim) {
      return (
        <div className="min-h-screen bg-[#FDFCF7] flex flex-col justify-between selection:bg-[#D89A3E]/20">
          <PortalHeader
            email={user.email}
            badge="Institutional Verification"
            onSignOut={handleSignOut}
          />

          <main className="flex-1 py-10 px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-4xl">
              <div className="rounded-3xl border border-amber-200 bg-gradient-to-br from-amber-50/70 via-white to-orange-50/40 p-6 sm:p-10 shadow-lg text-center">
                <div className="inline-flex items-center gap-2 rounded-full bg-amber-100/80 border border-amber-200 px-3.5 py-1 text-xs font-bold text-amber-900 mb-4">
                  <ShieldCheck className="h-4 w-4 text-[#EA5C2B]" />
                  Institutional Claim Required
                </div>

                <h1 className="font-serif text-2xl sm:text-4xl font-extrabold text-[#102C57] tracking-tight">
                  Claim Your University to Unlock Portal Data
                </h1>

                <p className="mt-3 max-w-2xl mx-auto text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Welcome, <strong>{user.name || user.email}</strong>. To
                  safeguard academic integrity and protect student inquiries,
                  institutional data is restricted to verified university
                  officials.
                </p>

                <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
                  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-700 font-bold mb-2.5">
                      <FileCheck className="h-4 w-4" />
                    </div>
                    <h3 className="text-xs font-bold text-[#102C57]">
                      Program Management
                    </h3>
                    <p className="mt-1 text-[11px] text-slate-500">
                      Add, edit, and remove the degree programs you offer, with
                      yearly tuition in INR and duration.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 font-bold mb-2.5">
                      <Users className="h-4 w-4" />
                    </div>
                    <h3 className="text-xs font-bold text-[#102C57]">
                      Student Inbound Leads
                    </h3>
                    <p className="mt-1 text-[11px] text-slate-500">
                      Review inquiries from students who contacted you through
                      your university page.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-50 text-[#EA5C2B] font-bold mb-2.5">
                      <BarChart3 className="h-4 w-4" />
                    </div>
                    <h3 className="text-xs font-bold text-[#102C57]">
                      Inquiry Analytics
                    </h3>
                    <p className="mt-1 text-[11px] text-slate-500">
                      Track inquiries by month, program, status and student
                      country.
                    </p>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link
                    href="/university-portal/claim"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#EA5C2B] px-8 py-3.5 text-xs font-bold text-white shadow-md hover:bg-[#ff7240] transition"
                  >
                    <ShieldCheck className="h-4 w-4" />
                    <span>Claim Your University Listing →</span>
                  </Link>
                  <Link
                    href="/universities"
                    className="text-xs font-semibold text-slate-500 hover:text-[#102C57] transition"
                  >
                    Browse University Directory
                  </Link>
                </div>
              </div>
            </div>
          </main>
        </div>
      );
    }

    const claimStatus = (claim.status || "").toLowerCase();
    const isRejected = claimStatus === "rejected";
    const isApproved = claimStatus === "approved" || claimStatus === "verified";
    const statusBadge = isRejected
      ? "bg-rose-100 text-rose-800"
      : isApproved
        ? "bg-emerald-100 text-emerald-800"
        : "bg-amber-100 text-amber-800";
    const statusDot = isRejected
      ? "bg-rose-500"
      : isApproved
        ? "bg-emerald-500"
        : "bg-amber-500 animate-pulse";

    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-between selection:bg-[#EA5C2B]/15">
        <PortalHeader
          email={user.email}
          badge="Institutional Verification"
          onSignOut={handleSignOut}
        />

        <main className="flex-1 py-10 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <div className="rounded-3xl border border-indigo-200 bg-white p-6 sm:p-10 shadow-xl text-center">
              <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 border border-indigo-200 px-3.5 py-1 text-xs font-bold text-indigo-900 mb-4">
                <Clock className="h-4 w-4 text-indigo-600" />
                {isRejected
                  ? "Claim Not Approved"
                  : isApproved
                    ? "Claim Approved"
                    : "Verification In Progress"}
              </div>

              <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#102C57] tracking-tight">
                Claim Submitted for {claim.universityName}
              </h1>

              <p className="mt-2 text-xs sm:text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
                {isRejected
                  ? "Your claim was not approved. You can submit a new claim with updated details."
                  : isApproved
                    ? "Your claim was approved, but the university listing is not linked to your account yet. Please refresh shortly or contact the team."
                    : "Your claim is being reviewed by our partnerships team. Institutional data and student inquiries unlock automatically once approved."}
              </p>

              <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-left text-xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200/80 pb-2.5">
                  <span className="text-slate-500 font-medium">
                    Target University
                  </span>
                  <span className="font-bold text-slate-900">
                    {claim.universityName}
                  </span>
                </div>
                <div className="flex items-center justify-between border-b border-slate-200/80 pb-2.5">
                  <span className="text-slate-500 font-medium">
                    Submitted On
                  </span>
                  <span className="font-medium text-slate-800">
                    {show(formatDate(claim.createdAt))}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">
                    Review Status
                  </span>
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold capitalize ${statusBadge}`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${statusDot}`} />
                    {show(claim.status)}
                  </span>
                </div>
              </div>

              <div className="mt-8 border-t border-slate-100 pt-6">
                <h4 className="text-xs font-bold text-[#102C57] uppercase tracking-wider text-left mb-4">
                  Verification Roadmap
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left text-xs">
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-3">
                    <span className="font-bold text-emerald-800 flex items-center gap-1">
                      <Check className="h-3.5 w-3.5" /> 1. Claim Submitted
                    </span>
                    <p className="mt-1 text-[11px] text-slate-500">
                      Representative details received.
                    </p>
                  </div>
                  <div
                    className={`rounded-xl border p-3 ${
                      isRejected
                        ? "border-rose-200 bg-rose-50/60"
                        : isApproved
                          ? "border-emerald-200 bg-emerald-50/60"
                          : "border-indigo-200 bg-indigo-50/60"
                    }`}
                  >
                    <span
                      className={`font-bold flex items-center gap-1 ${
                        isRejected
                          ? "text-rose-800"
                          : isApproved
                            ? "text-emerald-800"
                            : "text-indigo-800"
                      }`}
                    >
                      {isApproved ? (
                        <Check className="h-3.5 w-3.5" />
                      ) : (
                        <Clock className="h-3.5 w-3.5" />
                      )}{" "}
                      2. Manual Review
                    </span>
                    <p className="mt-1 text-[11px] text-slate-500">
                      Our team validates institutional domain and credentials.
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <span className="font-bold text-slate-600 flex items-center gap-1">
                      3. Full Access
                    </span>
                    <p className="mt-1 text-[11px] text-slate-400">
                      Dashboard, program management & inquiry inbox unlocked.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={() => {
                    setLoading(true);
                    loadPortal();
                  }}
                  className="rounded-xl bg-[#102C57] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#0c2242] transition cursor-pointer"
                >
                  ↻ Refresh Verification Status
                </button>
                <Link
                  href="/university-portal/claim"
                  className="rounded-xl border border-slate-200 px-5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                >
                  Submit Another Claim
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // ---------- Verified university workspace ----------
  const orgName = university.name;
  const newInquiries = inquiries.filter((i) => i.status === "new").length;
  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const inquiriesLast30 = inquiries.filter((i) => {
    const t = new Date(i.createdAt).getTime();
    return !Number.isNaN(t) && t >= thirtyDaysAgo;
  }).length;
  const shortlistedCount = inquiries.filter(
    (i) => i.status === "shortlisted",
  ).length;

  // Share of key profile fields that have a value in the database
  const profileFields: unknown[] = [
    university.city,
    university.countryName,
    university.rankingGlobal,
    university.rankingNational,
    university.tuitionFeeRangeINR,
    university.ieltsMinScore,
    university.acceptanceRate,
    university.postStudyWorkMonths,
    university.intakes.length > 0 ? true : null,
    programs.length > 0 ? true : null,
    university.logoUrl,
    university.bannerUrl,
  ];
  const profileCompleteness = Math.round(
    (profileFields.filter((v) => v !== null && v !== undefined && v !== "")
      .length /
      profileFields.length) *
      100,
  );

  const filteredInquiries =
    statusFilter === "all"
      ? inquiries
      : inquiries.filter((i) => i.status === statusFilter);

  const catalogOptions = (data.programsCatalog ?? []).filter(
    (p) =>
      p.id === editingProgramId || !programs.some((owned) => owned.id === p.id),
  );

  const monthly = monthlyCounts(analyticsInquiries, timeframe);
  const monthlyMax = Math.max(0, ...monthly.map((m) => m.count));
  const byStatus = INQUIRY_STATUSES.map((s) => ({
    status: s,
    count: analyticsInquiries.filter((i) => i.status === s).length,
  }));
  const byStatusMax = Math.max(0, ...byStatus.map((s) => s.count));
  const byProgram = countBy(analyticsInquiries, (i) => i.programName);
  const byProgramMax = Math.max(0, ...byProgram.map((p) => p.count));
  const byCountry = countBy(analyticsInquiries, (i) => i.countryName);

  const upgradeHref = (plan: ListingPlan) =>
    data.contactEmail
      ? `mailto:${data.contactEmail}?subject=${encodeURIComponent(
          `Listing upgrade request: ${plan.name} — ${orgName}`,
        )}&body=${encodeURIComponent(
          `Hello,\n\nWe would like to upgrade the listing for ${orgName} to the "${plan.name}" plan (${currency} billing).\n\nSigned in as: ${user.email}\n`,
        )}`
      : null;

  return (
    <div className="min-h-screen bg-[#FDFCF7] flex flex-col selection:bg-[#D89A3E]/20">
      {/* Top Navbar */}
      <header className="border-b border-[#D9CFB8]/60 bg-white/95 backdrop-blur-md sticky top-0 z-30 shadow-xs">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <BrandLogo variant="wordmark" theme="light" size="md" />
            <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-[#1D5A6C]/10 border border-[#1D5A6C]/20 px-2.5 py-1 text-[11px] font-bold text-[#1D5A6C]">
              <Building2 className="h-3 w-3 text-[#D89A3E]" />
              B2B Institutional Portal
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="font-semibold text-slate-700 hidden md:flex items-center gap-1.5 bg-slate-50 border border-slate-200/80 px-3 py-1.5 rounded-xl">
              <CountryFlag
                code={university.countryId ?? undefined}
                name={university.countryName ?? undefined}
                size="sm"
              />
              <span className="font-bold text-[#102C57] line-clamp-1 max-w-[200px]">
                {orgName}
              </span>
            </span>

            <span className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-1.5 font-bold text-emerald-800 hidden sm:flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              <span>Verified Institution</span>
            </span>

            <button
              onClick={handleSignOut}
              className="rounded-xl border border-slate-200 px-3 py-1.5 font-bold text-slate-700 hover:bg-slate-50 hover:text-rose-600 transition flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Workspace Tab Bar */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 border-t border-slate-100 overflow-x-auto">
          <div className="flex space-x-1 py-2">
            {[
              {
                id: "overview",
                label: "Overview & Dashboard",
                icon: Building2,
              },
              {
                id: "programs",
                label: `Programs (${programs.length})`,
                icon: FileCheck,
              },
              {
                id: "analytics",
                label: "Inquiry Analytics",
                icon: BarChart3,
              },
              {
                id: "inquiries",
                label: `Student Inquiries (${inquiries.length})`,
                icon: Users,
              },
              {
                id: "upgrade",
                label: "Featured Plans",
                icon: Award,
                highlight: true,
              },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl transition cursor-pointer whitespace-nowrap ${
                    isActive
                      ? "bg-[#102C57] text-white shadow-xs"
                      : tab.highlight
                        ? "text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200/60"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <Icon
                    className={`h-3.5 w-3.5 ${isActive ? "text-[#EA5C2B]" : tab.highlight ? "text-amber-600" : "text-slate-400"}`}
                  />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="mx-auto max-w-7xl w-full px-4 py-6 sm:px-6 lg:px-8 flex-1 space-y-6">
        {(notice || loadError) && (
          <div className="flex items-start justify-between gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-800">
            <span className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {notice || loadError}
            </span>
            <button
              onClick={() => {
                setNotice(null);
                setLoadError(null);
              }}
              className="rounded-full p-0.5 hover:bg-rose-100 cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* Top Institutional Identity Banner */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div className="flex items-start sm:items-center gap-4">
              {university.logoUrl ? (
                <img
                  src={university.logoUrl}
                  alt={`${orgName} logo`}
                  className="h-14 w-14 shrink-0 rounded-2xl border border-slate-200 bg-white object-contain p-1 shadow-sm"
                />
              ) : (
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#102C57] to-indigo-900 text-white shadow-sm">
                  <Building2 className="h-7 w-7" />
                </div>
              )}
              <div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-xl sm:text-2xl font-black text-[#102C57] font-serif">
                    {orgName}
                  </h1>
                  <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800 flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                    Verified Institution
                  </span>
                </div>

                <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-500">
                  <span className="flex items-center gap-1.5 text-slate-700">
                    <CountryFlag
                      code={university.countryId ?? undefined}
                      name={university.countryName ?? undefined}
                      size="sm"
                    />
                    <span>
                      {show(university.city)}, {show(university.countryName)}
                    </span>
                  </span>
                  <span>•</span>
                  <span className="text-indigo-700 font-bold">
                    Global Rank:{" "}
                    {show(university.rankingGlobal, (r) => `#${r}`)}
                  </span>
                  <span>•</span>
                  <span>
                    Acceptance Rate:{" "}
                    <strong>
                      {show(university.acceptanceRate, (r) => `${r}%`)}
                    </strong>
                  </span>
                  <span>•</span>
                  <span>
                    Post-Study Work:{" "}
                    <strong>
                      {show(university.postStudyWorkMonths, (m) => `${m} Mos`)}
                    </strong>
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
              <button
                onClick={() => setIsProfileModalOpen(true)}
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer shadow-2xs"
              >
                <Pencil className="h-3.5 w-3.5 text-[#EA5C2B]" />
                <span>Edit Profile</span>
              </button>
              <Link
                href={`/universities/${university.slug}`}
                target="_blank"
                className="flex items-center gap-1.5 rounded-xl bg-[#102C57] px-3.5 py-2 text-xs font-bold text-white hover:bg-[#0c2242] transition shadow-2xs"
              >
                <span>Live Public Page</span>
                <ExternalLink className="h-3 w-3 text-[#EA5C2B]" />
              </Link>
            </div>
          </div>

          <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
            <p className="leading-relaxed">
              Manage your official listing, program fees, and student inquiry
              pipeline.
            </p>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[11px] font-bold text-emerald-700">
                Profile Completeness: {profileCompleteness}%
              </span>
              <div className="w-24 bg-slate-100 rounded-full h-2">
                <div
                  className="bg-emerald-600 h-2 rounded-full"
                  style={{ width: `${profileCompleteness}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* TAB 1: OVERVIEW & DASHBOARD */}
        {activeTab === "overview" && (
          <div className="space-y-6 animate-in fade-in">
            {/* Top Metric Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
                <div className="flex items-center justify-between text-slate-500">
                  <span className="text-[11px] font-bold uppercase tracking-wider">
                    Programs Listed
                  </span>
                  <GraduationCap className="h-4 w-4 text-[#EA5C2B]" />
                </div>
                <p className="mt-3 text-3xl font-black text-[#102C57]">
                  {programs.length}
                </p>
                <div className="mt-1 flex items-center justify-between text-[11px]">
                  <button
                    onClick={() => setActiveTab("programs")}
                    className="font-bold text-[#EA5C2B] hover:underline cursor-pointer"
                  >
                    Manage programs →
                  </button>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
                <div className="flex items-center justify-between text-slate-500">
                  <span className="text-[11px] font-bold uppercase tracking-wider">
                    Total Inquiries
                  </span>
                  <Users className="h-4 w-4 text-emerald-600" />
                </div>
                <p className="mt-3 text-3xl font-black text-[#102C57]">
                  {inquiries.length}
                </p>
                <div className="mt-1 flex items-center justify-between text-[11px]">
                  <span className="text-emerald-600 font-bold">
                    {newInquiries} new
                  </span>
                  <span className="text-slate-400">All time</span>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
                <div className="flex items-center justify-between text-slate-500">
                  <span className="text-[11px] font-bold uppercase tracking-wider">
                    Inquiries (30 Days)
                  </span>
                  <TrendingUp className="h-4 w-4 text-indigo-600" />
                </div>
                <p className="mt-3 text-3xl font-black text-[#102C57]">
                  {inquiriesLast30}
                </p>
                <div className="mt-1 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Past 30 Days</span>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
                <div className="flex items-center justify-between text-slate-500">
                  <span className="text-[11px] font-bold uppercase tracking-wider">
                    Shortlisted Students
                  </span>
                  <Award className="h-4 w-4 text-amber-600" />
                </div>
                <p className="mt-3 text-3xl font-black text-[#102C57]">
                  {shortlistedCount}
                </p>
                <div className="mt-1 flex items-center justify-between text-[11px]">
                  <button
                    onClick={() => setActiveTab("inquiries")}
                    className="font-bold text-[#EA5C2B] hover:underline cursor-pointer"
                  >
                    Open inbox →
                  </button>
                </div>
              </div>
            </div>

            {/* University Facts */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-base font-black text-[#102C57] flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-[#EA5C2B]" />
                    Listing Facts
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    What students see on your public profile.
                  </p>
                </div>
                <button
                  onClick={() => setIsProfileModalOpen(true)}
                  className="text-xs font-bold text-indigo-700 hover:underline cursor-pointer"
                >
                  Edit →
                </button>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 text-xs">
                <FactTile
                  label="Global Rank"
                  value={show(university.rankingGlobal, (r) => `#${r}`)}
                />
                <FactTile
                  label="National Rank"
                  value={show(university.rankingNational, (r) => `#${r}`)}
                />
                <FactTile
                  label="Tuition Range (INR)"
                  value={show(university.tuitionFeeRangeINR)}
                />
                <FactTile
                  label="Acceptance Rate"
                  value={show(university.acceptanceRate, (r) => `${r}%`)}
                />
                <FactTile
                  label="IELTS Minimum"
                  value={show(university.ieltsMinScore)}
                />
                <FactTile
                  label="TOEFL Minimum"
                  value={show(university.toeflMinScore)}
                />
                <FactTile
                  label="PTE Minimum"
                  value={show(university.pteMinScore)}
                />
                <FactTile
                  label="Duolingo Minimum"
                  value={show(university.duolingoMinScore)}
                />
                <FactTile
                  label="GRE / GMAT"
                  value={show(university.greGmatRequired, (v) =>
                    v ? "Required" : "Not required",
                  )}
                />
                <FactTile
                  label="Post-Study Work"
                  value={show(
                    university.postStudyWorkMonths,
                    (m) => `${m} months`,
                  )}
                />
                <FactTile
                  label="Minimum Percentage"
                  value={show(university.minPercentage, (p) => `${p}%`)}
                />
                <FactTile
                  label="Intakes"
                  value={
                    university.intakes.length > 0 ? (
                      university.intakes.join(", ")
                    ) : (
                      <NotProvided />
                    )
                  }
                />
              </div>
            </div>

            {/* Deadlines & Scholarships */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <h3 className="text-base font-black text-[#102C57] flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-[#EA5C2B]" />
                    Upcoming Deadlines
                  </h3>
                  <span className="text-xs font-bold text-slate-400">
                    {university.deadlines.length}
                  </span>
                </div>
                <div className="mt-4 space-y-2.5">
                  {university.deadlines.length === 0 ? (
                    <EmptyBlock>
                      <NotProvided />
                    </EmptyBlock>
                  ) : (
                    university.deadlines.slice(0, 6).map((d, idx) => {
                      const programName = d.programId
                        ? (programs.find((p) => p.id === d.programId)?.name ??
                          null)
                        : null;
                      return (
                        <div
                          key={`${d.intakeTerm}-${d.intakeYear}-${d.deadlineDate}-${idx}`}
                          className="p-3 rounded-2xl border border-slate-100 bg-slate-50/60 text-xs"
                        >
                          <p className="font-bold text-[#102C57]">
                            {formatDeadline(d)}
                          </p>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            {programName ?? "All programs"}
                          </p>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <h3 className="text-base font-black text-[#102C57] flex items-center gap-2">
                    <Award className="h-4 w-4 text-[#EA5C2B]" />
                    Scholarships
                  </h3>
                  <span className="text-xs font-bold text-slate-400">
                    {university.scholarships.length}
                  </span>
                </div>
                <div className="mt-4 space-y-2.5">
                  {university.scholarships.length === 0 ? (
                    <EmptyBlock>
                      <NotProvided />
                    </EmptyBlock>
                  ) : (
                    university.scholarships.slice(0, 6).map((s) => (
                      <div
                        key={s.id}
                        className="p-3 rounded-2xl border border-slate-100 bg-slate-50/60 text-xs"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-bold text-[#102C57]">{s.name}</p>
                          {s.universitySpecific && (
                            <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold text-indigo-700 shrink-0">
                              University-specific
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {show(s.awardSummary)}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Quick Actions & Recent Activity Grid */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="text-base font-black text-[#102C57]">
                      Published Academic Programs
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {programs.length} programs listed
                    </p>
                  </div>
                  <button
                    onClick={handleOpenAddProgram}
                    className="flex items-center gap-1 rounded-xl bg-[#102C57] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#0c2242] transition cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5 text-[#EA5C2B]" />
                    <span>Add Program</span>
                  </button>
                </div>

                <div className="mt-4 space-y-3">
                  {programs.length === 0 && (
                    <EmptyBlock>No programs listed yet.</EmptyBlock>
                  )}
                  {programs.slice(0, 3).map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-100 bg-slate-50/60 hover:bg-slate-50 transition text-xs"
                    >
                      <div>
                        <p className="font-bold text-[#102C57]">{p.name}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {show(p.level)} • {show(p.duration)} •{" "}
                          <strong className="text-emerald-700">
                            {show(p.yearlyTuitionINR, formatTuition)}
                          </strong>
                        </p>
                      </div>
                      <button
                        onClick={() => handleOpenEditProgram(p)}
                        className="text-xs font-bold text-[#EA5C2B] hover:underline cursor-pointer"
                      >
                        Edit →
                      </button>
                    </div>
                  ))}
                  {programs.length > 0 && (
                    <button
                      onClick={() => setActiveTab("programs")}
                      className="w-full py-2 text-center text-xs font-bold text-indigo-700 hover:text-indigo-900 transition cursor-pointer"
                    >
                      View & Manage All {programs.length} Programs →
                    </button>
                  )}
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="text-base font-black text-[#102C57]">
                      Recent Student Inquiries
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Students who contacted you via your university page
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab("inquiries")}
                    className="text-xs font-bold text-indigo-700 hover:underline cursor-pointer"
                  >
                    Open Inbox ({inquiries.length}) →
                  </button>
                </div>

                <div className="mt-4 space-y-3">
                  {inquiries.length === 0 && (
                    <EmptyBlock>No student inquiries yet.</EmptyBlock>
                  )}
                  {inquiries.slice(0, 3).map((inq) => (
                    <div
                      key={inq.id}
                      className="p-3.5 rounded-2xl border border-slate-100 bg-slate-50/60 text-xs flex flex-col justify-between gap-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#102C57]">
                          {inq.fullName}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {show(formatDate(inq.createdAt))}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600">
                        {show(inq.programName)} ·{" "}
                        <strong className="text-slate-800">
                          {show(inq.highestEducation)}
                        </strong>
                      </p>
                      <div className="flex items-center justify-between pt-1 text-[10px]">
                        <span className="rounded-md bg-indigo-50 px-2 py-0.5 font-semibold text-indigo-700">
                          IELTS: {show(inq.ieltsScore)}
                        </span>
                        <span
                          className={`rounded-md px-2 py-0.5 font-bold ${STATUS_META[inq.status]?.badge ?? ""}`}
                        >
                          {STATUS_META[inq.status]?.label ?? inq.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PROGRAM MANAGEMENT */}
        {activeTab === "programs" && (
          <div className="space-y-6 animate-in fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-xs">
              <div>
                <h2 className="text-lg font-black text-[#102C57] flex items-center gap-2">
                  <FileCheck className="h-5 w-5 text-[#EA5C2B]" />
                  Academic Program Management
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Add, update, or remove the programs you offer. Updates reflect
                  on your live profile.
                </p>
              </div>

              <button
                onClick={handleOpenAddProgram}
                className="flex items-center gap-2 rounded-xl bg-[#102C57] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#0c2242] transition cursor-pointer shadow-xs"
              >
                <Plus className="h-4 w-4 text-[#EA5C2B]" />
                <span>Add Program</span>
              </button>
            </div>

            <div className="space-y-4">
              {programs.length === 0 && (
                <EmptyBlock>
                  No programs listed yet. Use “Add Program” to publish your
                  first one.
                </EmptyBlock>
              )}
              {programs.map((prog) => {
                const programDeadline =
                  university.deadlines.find((d) => d.programId === prog.id) ??
                  null;
                const programInquiries = inquiries.filter(
                  (i) => i.programId === prog.id,
                ).length;
                return (
                  <div
                    key={prog.id}
                    className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs hover:border-slate-300 transition space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-slate-100 pb-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-black text-[#102C57]">
                          {prog.name}
                        </h3>
                        {prog.level && (
                          <span className="rounded-md bg-indigo-50 px-2.5 py-0.5 text-[11px] font-bold text-indigo-700">
                            {prog.level}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 self-start sm:self-auto">
                        <button
                          onClick={() => handleOpenEditProgram(prog)}
                          className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                        >
                          <Pencil className="h-3.5 w-3.5 text-[#EA5C2B]" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleDeleteProgram(prog.id)}
                          disabled={deletingProgramId === prog.id}
                          className="flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-100 transition cursor-pointer disabled:opacity-50"
                        >
                          {deletingProgramId === prog.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="h-3.5 w-3.5" />
                          )}
                          <span>Remove</span>
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 text-xs">
                      <FactTile label="Duration" value={show(prog.duration)} />
                      <FactTile
                        label="Yearly Tuition (INR)"
                        value={
                          <span className="text-emerald-700">
                            {show(prog.yearlyTuitionINR, formatTuition)}
                          </span>
                        }
                      />
                      <FactTile
                        label="Next Deadline"
                        value={show(programDeadline, formatDeadline)}
                      />
                      <FactTile
                        label="Student Inquiries"
                        value={programInquiries}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: INQUIRY ANALYTICS */}
        {activeTab === "analytics" && (
          <div className="space-y-6 animate-in fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-xs">
              <div>
                <h2 className="text-lg font-black text-[#102C57] flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-[#EA5C2B]" />
                  Inquiry Analytics
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Computed from the student inquiries received through your
                  university page ({analyticsInquiries.length} in the selected
                  period).
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex rounded-xl bg-slate-100 p-1 text-xs font-bold text-slate-600">
                  {(["30d", "90d", "1y", "all"] as const).map((tf) => (
                    <button
                      key={tf}
                      onClick={() => setTimeframe(tf)}
                      className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                        timeframe === tf
                          ? "bg-white text-[#102C57] shadow-xs"
                          : "hover:text-slate-900"
                      }`}
                    >
                      {tf === "all" ? "ALL" : tf.toUpperCase()}
                    </button>
                  ))}
                </div>

                <button
                  onClick={handleExportInquiries}
                  disabled={analyticsInquiries.length === 0}
                  className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Download className="h-3.5 w-3.5 text-[#EA5C2B]" />
                  <span>Export CSV</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <h3 className="text-base font-black text-[#102C57]">
                    Inquiries per Month
                  </h3>
                  <span className="text-xs font-bold text-slate-400">
                    {analyticsInquiries.length} total
                  </span>
                </div>
                <div className="mt-6 space-y-4">
                  {monthly.length === 0 ? (
                    <EmptyBlock>No inquiries yet.</EmptyBlock>
                  ) : (
                    monthly.map((m) => (
                      <BarRow
                        key={m.label}
                        label={m.label}
                        count={m.count}
                        max={monthlyMax}
                      />
                    ))
                  )}
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <h3 className="text-base font-black text-[#102C57]">
                    Inquiries by Status
                  </h3>
                  <span className="text-xs font-bold text-slate-400">
                    Pipeline
                  </span>
                </div>
                <div className="mt-6 space-y-4">
                  {byStatus.map((s) => (
                    <BarRow
                      key={s.status}
                      label={STATUS_META[s.status].label}
                      count={s.count}
                      max={byStatusMax}
                      gradient={STATUS_META[s.status].bar}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <h3 className="text-base font-black text-[#102C57] flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-[#EA5C2B]" />
                  Inquiries by Program
                </h3>
              </div>
              <div className="mt-6 space-y-4">
                {byProgram.length === 0 ? (
                  <EmptyBlock>No inquiries in this period.</EmptyBlock>
                ) : (
                  byProgram.map((p) => (
                    <BarRow
                      key={p.label ?? "__none"}
                      label={p.label ?? "Program not specified"}
                      count={p.count}
                      max={byProgramMax}
                    />
                  ))
                )}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-base font-black text-[#102C57] flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-[#EA5C2B]" />
                    Inquiries by Student Country
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Country entered by the student on the inquiry form.
                  </p>
                </div>
                <span className="text-xs font-bold text-slate-400">
                  Total {analyticsInquiries.length} Inquiries
                </span>
              </div>

              {byCountry.length === 0 ? (
                <div className="mt-6">
                  <EmptyBlock>No inquiries in this period.</EmptyBlock>
                </div>
              ) : (
                <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6 text-center text-xs">
                  {byCountry.map((item) => (
                    <div
                      key={item.label ?? "__none"}
                      className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4"
                    >
                      <span className="text-lg font-black text-[#102C57]">
                        {Math.round(
                          (item.count / analyticsInquiries.length) * 100,
                        )}
                        %
                      </span>
                      <div className="mt-1 font-bold text-slate-800">
                        {show(item.label)}
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {item.count} {item.count === 1 ? "Student" : "Students"}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: STUDENT INQUIRIES */}
        {activeTab === "inquiries" && (
          <div className="space-y-6 animate-in fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-xs">
              <div>
                <h2 className="text-lg font-black text-[#102C57] flex items-center gap-2">
                  <Users className="h-5 w-5 text-[#EA5C2B]" />
                  Direct Inbound Student Inquiries
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Students who submitted the inquiry form on {orgName}&apos;s
                  page.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="font-bold text-slate-500">Filter Status:</span>
                {(["all", ...INQUIRY_STATUSES] as const).map((s) => {
                  const count =
                    s === "all"
                      ? inquiries.length
                      : inquiries.filter((i) => i.status === s).length;
                  return (
                    <button
                      key={s}
                      onClick={() => setStatusFilter(s)}
                      className={`rounded-xl px-3 py-1 font-bold transition cursor-pointer ${
                        statusFilter === s
                          ? "bg-[#102C57] text-white"
                          : "bg-indigo-50 text-[#102C57] hover:bg-indigo-100"
                      }`}
                    >
                      {s === "all" ? "All" : STATUS_META[s].label} ({count})
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-3">
              {filteredInquiries.length === 0 && (
                <EmptyBlock>
                  <Inbox className="mx-auto mb-2 h-6 w-6 text-slate-300" />
                  No inquiries
                  {statusFilter === "all"
                    ? " yet"
                    : ` with status “${STATUS_META[statusFilter].label}”`}
                  .
                </EmptyBlock>
              )}
              {filteredInquiries.map((inq) => (
                <div
                  key={inq.id}
                  className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs hover:border-slate-300 transition space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-[#102C57] font-bold text-sm">
                        {inq.fullName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-[#102C57] flex items-center gap-2">
                          <span>{inq.fullName}</span>
                          <span className="text-[11px] font-normal text-slate-400">
                            ({show(inq.countryName)})
                          </span>
                        </h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Target:{" "}
                          <strong className="text-slate-800">
                            {show(inq.programName)}
                          </strong>{" "}
                          · Intake: {show(inq.intakeYear)} · Received:{" "}
                          {show(formatDate(inq.createdAt))}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {updatingInquiryId === inq.id && (
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-slate-400" />
                      )}
                      <select
                        value={inq.status}
                        disabled={updatingInquiryId === inq.id}
                        onChange={(e) =>
                          handleUpdateInquiryStatus(
                            inq.id,
                            e.target.value as InquiryStatus,
                          )
                        }
                        className="rounded-xl border border-slate-200 bg-slate-50 py-1.5 px-3 text-xs font-bold text-slate-700 focus:outline-none focus:border-[#102C57] disabled:opacity-50"
                      >
                        {INQUIRY_STATUSES.map((s) => (
                          <option key={s} value={s}>
                            Status: {STATUS_META[s].label}
                          </option>
                        ))}
                      </select>

                      <a
                        href={`mailto:${inq.email}?subject=${encodeURIComponent(`Admissions Inquiry - ${orgName}`)}`}
                        className="flex items-center gap-1 rounded-xl bg-[#102C57] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#0c2242] transition"
                      >
                        <Mail className="h-3 w-3 text-[#EA5C2B]" />
                        <span>Email</span>
                      </a>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs bg-slate-50 p-3 rounded-2xl border border-slate-100">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400">
                        Highest Education
                      </span>
                      <div className="font-semibold text-slate-800">
                        {show(inq.highestEducation)}
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400">
                        IELTS Score
                      </span>
                      <div className="font-semibold text-indigo-700">
                        {show(inq.ieltsScore)}
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400">
                        Budget Range
                      </span>
                      <div className="font-semibold text-slate-800">
                        {show(inq.budgetRange)}
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400">
                        Direct Contacts
                      </span>
                      <div className="font-semibold text-slate-700 break-all">
                        {show(inq.phone)} · {show(inq.email)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: FEATURED LISTING PLANS */}
        {activeTab === "upgrade" && (
          <div className="space-y-6 animate-in fade-in">
            <div className="rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-[#102C57] p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-amber-300 mb-2">
                  <Award className="h-4 w-4" />
                  Featured Institutional Spotlight
                </div>
                <h2 className="text-2xl font-black font-serif sm:text-3xl text-white">
                  Featured Listing Plans
                </h2>
                <p className="mt-1 text-xs text-indigo-200 max-w-2xl leading-relaxed">
                  Boost your university&apos;s visibility. Choose a plan and
                  send an upgrade request to our partnerships team.
                </p>
              </div>

              <div className="flex items-center gap-2 bg-white/10 p-1.5 rounded-2xl border border-white/20 self-start md:self-auto">
                {(["INR", "USD"] as const).map((c) => (
                  <button
                    key={c}
                    onClick={() => setCurrency(c)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                      currency === c
                        ? "bg-[#EA5C2B] text-white shadow-xs"
                        : "text-indigo-200 hover:text-white"
                    }`}
                  >
                    {c} Pricing
                  </button>
                ))}
              </div>
            </div>

            {!data.contactEmail && (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-semibold text-amber-900">
                Contact details not provided — upgrade requests cannot be sent
                right now.
              </div>
            )}

            {data.listingPlans.length === 0 ? (
              <EmptyBlock>No listing plans have been published yet.</EmptyBlock>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {data.listingPlans.map((plan, idx) => {
                  const style = PLAN_STYLES[idx % PLAN_STYLES.length];
                  const price = formatPlanPrice(plan, currency);
                  const href = upgradeHref(plan);
                  return (
                    <div
                      key={plan.id}
                      className={`rounded-3xl border p-6 flex flex-col justify-between shadow-xs ${style.card}`}
                    >
                      <div>
                        <h3 className={`text-lg font-black ${style.title}`}>
                          {plan.name}
                        </h3>
                        <p
                          className={`text-2xl font-black mt-2 ${style.price}`}
                        >
                          {price ?? <NotProvided />}
                          {price && plan.billingPeriod && (
                            <span
                              className={`text-xs font-normal ${style.muted}`}
                            >
                              {" "}
                              / {plan.billingPeriod}
                            </span>
                          )}
                        </p>
                        {plan.tagline && (
                          <p className={`mt-2 text-xs ${style.muted}`}>
                            {plan.tagline}
                          </p>
                        )}

                        {plan.features.length > 0 && (
                          <ul
                            className={`mt-4 space-y-2 text-xs border-t pt-4 ${style.list}`}
                          >
                            {plan.features.map((f, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <Check
                                  className={`h-3.5 w-3.5 mt-0.5 shrink-0 ${style.check}`}
                                />
                                <span>{f}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>

                      <div className="mt-6 pt-4">
                        {href ? (
                          <a
                            href={href}
                            className={`flex w-full items-center justify-center gap-1.5 py-2 text-center text-xs font-bold rounded-xl transition ${style.cta}`}
                          >
                            <Mail className="h-3.5 w-3.5" />
                            Request upgrade
                          </a>
                        ) : (
                          <span className="block w-full py-2 text-center text-xs font-semibold text-slate-400 bg-slate-100 rounded-xl">
                            Contact details not provided
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Program Add / Edit Modal */}
      {isProgramModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-[#102C57]">
                {editingProgramId ? "Edit Program" : "Add Academic Program"}
              </h3>
              <button
                onClick={() => setIsProgramModalOpen(false)}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form
              onSubmit={handleSaveProgram}
              className="mt-4 space-y-3.5 text-xs"
            >
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Program *
                </label>
                <select
                  required
                  value={progProgramId}
                  disabled={!!editingProgramId}
                  onChange={(e) => setProgProgramId(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 py-2.5 px-3 text-slate-800 font-medium focus:border-[#102C57] focus:outline-none bg-white disabled:bg-slate-50 disabled:text-slate-500"
                >
                  <option value="">Select a program</option>
                  {catalogOptions.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
                {!editingProgramId && catalogOptions.length === 0 && (
                  <p className="mt-1 text-[11px] text-slate-400">
                    No more programs available to add.
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Yearly Tuition (INR)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={1}
                    value={progTuition}
                    onChange={(e) => setProgTuition(e.target.value)}
                    placeholder="Leave blank if not known"
                    className="w-full rounded-xl border border-slate-200 py-2 px-3 text-slate-800 focus:border-[#102C57] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Duration
                  </label>
                  <input
                    type="text"
                    maxLength={32}
                    value={progDuration}
                    onChange={(e) => setProgDuration(e.target.value)}
                    placeholder="Leave blank if not known"
                    className="w-full rounded-xl border border-slate-200 py-2 px-3 text-slate-800 focus:border-[#102C57] focus:outline-none"
                  />
                </div>
              </div>

              {progError && (
                <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 font-semibold text-rose-700">
                  {progError}
                </p>
              )}

              <div className="mt-5 flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsProgramModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 font-bold text-slate-600 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingProg || !progProgramId}
                  className="flex items-center gap-1.5 rounded-xl bg-[#102C57] px-5 py-2 font-bold text-white hover:bg-[#0c2242] transition disabled:opacity-50 shadow-xs cursor-pointer"
                >
                  {savingProg ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-[#EA5C2B]" />
                  ) : (
                    <Save className="h-3.5 w-3.5 text-[#EA5C2B]" />
                  )}
                  <span>
                    {editingProgramId ? "Update Program" : "Publish Program"}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Profile Edit Modal (mounted fresh each time so it reads current data) */}
      {isProfileModalOpen && (
        <EditUniversityProfileModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          initialData={{
            // The modal derives the slug from `id`
            id: university.slug,
            name: university.name,
            city: university.city ?? "",
            country: university.countryName ?? "",
            rankingGlobal: university.rankingGlobal ?? "",
            rankingNational: university.rankingNational ?? "",
            tuitionFeeRangeINR: university.tuitionFeeRangeINR ?? "",
            ieltsMinScore: university.ieltsMinScore ?? "",
            acceptanceRate: university.acceptanceRate ?? "",
            postStudyWorkMonths: university.postStudyWorkMonths ?? "",
          }}
          onSave={() => {
            loadPortal();
          }}
        />
      )}
    </div>
  );
}
