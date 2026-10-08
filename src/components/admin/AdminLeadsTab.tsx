"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Users,
  IndianRupee,
  CheckCircle2,
  Search,
  ShieldCheck,
  Send,
  Loader2,
  AlertCircle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Program } from "@/types";
import { getAuthHeaders } from "@/lib/supabase/client";
import { formatINRExact } from "@/lib/utils";
import type { LeadStats } from "@/lib/leadStats";

interface AdminLeadsTabProps {
  programsList: Program[];
}

interface LeadDelivery {
  id: string;
  buyerName: string | null;
  priceINR: number | null;
  deliveryType: string;
  deliveredAt: string;
}

interface AdminLead {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  isPhoneVerified: boolean;
  countryId: string | null;
  countryName: string | null;
  programTarget: string | null;
  highestEducation: string | null;
  budgetRangeINR: string | null;
  intakeYear: string | null;
  ieltsScore: string | null;
  leadScore: number | null;
  status: string;
  utmSource: string | null;
  createdAt: string;
  deliveries: LeadDelivery[];
}

const LEAD_STATUSES = [
  "raw",
  "verified",
  "enriched",
  "matched",
  "delivered",
  "converted",
  "disputed",
];

const STATUS_STYLES: Record<string, string> = {
  raw: "bg-slate-100 text-slate-700",
  verified: "bg-sky-100 text-sky-800",
  enriched: "bg-indigo-100 text-indigo-800",
  matched: "bg-amber-100 text-amber-800",
  delivered: "bg-emerald-100 text-emerald-800",
  converted: "bg-emerald-600 text-white",
  disputed: "bg-rose-100 text-rose-700",
};

const NOT_SET = "—";

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

// "12 mins ago", "3 hours ago", else the date
function timeAgo(iso: string): string {
  const minutes = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min${minutes === 1 ? "" : "s"} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days === 1 ? "" : "s"} ago`;
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function AdminLeadsTab({ programsList }: AdminLeadsTabProps) {
  const [leads, setLeads] = useState<AdminLead[]>([]);
  const [stats, setStats] = useState<LeadStats | null>(null);
  const [matchingCount, setMatchingCount] = useState(0);
  const [pageSize, setPageSize] = useState(25);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search runs on the server, 300 ms after typing stops
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchInput.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page: String(page) });
      if (searchQuery) params.set("q", searchQuery);
      if (statusFilter) params.set("status", statusFilter);
      const res = await fetch(`/api/admin/leads?${params}`, {
        headers: await getAuthHeaders(),
        cache: "no-store",
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.error || "Failed to load leads");
        return;
      }
      setLeads(data.leads);
      setStats(data.stats);
      setMatchingCount(data.matchingCount);
      setPageSize(data.pageSize);
    } catch {
      setError("Failed to load leads");
    } finally {
      setLoading(false);
    }
  }, [page, searchQuery, statusFilter]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const programName = (slug: string | null) =>
    slug
      ? (programsList.find((p) => p.slug === slug || p.id === slug)?.name ??
        slug.toUpperCase())
      : NOT_SET;

  const pageCount = Math.max(1, Math.ceil(matchingCount / pageSize));
  const verifiedPct =
    stats && stats.totalLeads > 0
      ? Math.round((stats.phoneVerified / stats.totalLeads) * 100)
      : 0;

  const statCards = [
    {
      label: "Total Leads Captured",
      icon: Users,
      iconClass: "text-[#102C57]",
      valueClass: "text-[#102C57]",
      value: stats ? stats.totalLeads.toLocaleString("en-IN") : NOT_SET,
      note: "All lead form submissions",
    },
    {
      label: "Phone Verified",
      icon: ShieldCheck,
      iconClass: "text-purple-600",
      valueClass: "text-purple-700",
      value: stats ? stats.phoneVerified.toLocaleString("en-IN") : NOT_SET,
      note: stats ? `${verifiedPct}% of all leads` : "",
    },
    {
      label: "Deliveries to Agencies",
      icon: Send,
      iconClass: "text-[#EA5C2B]",
      valueClass: "text-[#EA5C2B]",
      value: stats ? stats.deliveries.toLocaleString("en-IN") : NOT_SET,
      note: "Rows in lead deliveries",
    },
    {
      label: "Delivery Revenue",
      icon: IndianRupee,
      iconClass: "text-emerald-600",
      valueClass: "text-emerald-700",
      value: stats ? formatINRExact(stats.deliveryRevenueINR) : NOT_SET,
      note: "Sum of prices charged",
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Engine Overview */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs"
            >
              <div className="flex items-center gap-2 text-slate-500">
                <Icon className={`h-4 w-4 ${card.iconClass}`} />
                <span className="text-xs font-bold uppercase">
                  {card.label}
                </span>
              </div>
              <p className={`mt-3 text-3xl font-black ${card.valueClass}`}>
                {card.value}
              </p>
              <span className="text-[11px] text-slate-500">{card.note}</span>
            </div>
          );
        })}
      </div>

      {/* Main Leads Table */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
              <Users className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-lg font-black text-[#102C57]">
                Lead Distribution Engine (LDE)
              </h2>
              <p className="text-xs text-slate-500">
                Student leads from the site&apos;s lead forms, newest first,
                with the agencies they were delivered to.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              aria-label="Filter by status"
              className="rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs text-slate-900 focus:border-[#102C57] focus:bg-white outline-none"
            >
              <option value="">All statuses</option>
              {LEAD_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {capitalize(s)}
                </option>
              ))}
            </select>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search name, email or phone..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-[#102C57] focus:bg-white outline-none"
              />
            </div>
            <button
              onClick={fetchLeads}
              disabled={loading}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-60 cursor-pointer"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-5 flex items-start gap-2 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-700">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="mt-5 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Student & Contact</th>
                <th className="px-4 py-3">Target Country & Program</th>
                <th className="px-4 py-3">Budget (INR)</th>
                <th className="px-4 py-3">Intake / IELTS</th>
                <th className="px-4 py-3">Delivered To</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && leads.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-12 text-center text-slate-500"
                  >
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading leads…
                    </span>
                  </td>
                </tr>
              ) : leads.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-12 text-center text-slate-500"
                  >
                    {searchQuery || statusFilter
                      ? "No leads match these filters."
                      : "No leads captured yet."}
                  </td>
                </tr>
              ) : (
                leads.map((lead) => {
                  const revenue = lead.deliveries.reduce(
                    (sum, d) => sum + (d.priceINR ?? 0),
                    0,
                  );
                  return (
                    <tr
                      key={lead.id}
                      className="hover:bg-slate-50/80 transition align-top"
                    >
                      <td className="px-4 py-3.5">
                        <div className="font-bold text-[#102C57]">
                          {lead.fullName}
                        </div>
                        <div className="text-[11px] text-slate-600">
                          {lead.email}
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-600">
                          <span>{lead.phone}</span>
                          {lead.isPhoneVerified && (
                            <span title="Phone verified">
                              <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {timeAgo(lead.createdAt)}
                          {lead.utmSource ? ` • via ${lead.utmSource}` : ""}
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="font-bold text-slate-800">
                          {lead.countryName ?? lead.countryId ?? NOT_SET}
                        </span>
                        <p className="text-[11px] text-slate-500">
                          {programName(lead.programTarget)}
                        </p>
                        {lead.highestEducation && (
                          <p className="text-[10px] text-slate-400">
                            {lead.highestEducation}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3.5 font-semibold text-slate-700">
                        {lead.budgetRangeINR ?? NOT_SET}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="text-slate-700">
                          {lead.intakeYear ?? NOT_SET}
                        </div>
                        {lead.ieltsScore && (
                          <span className="mt-1 inline-block rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-700">
                            {lead.ieltsScore} Band
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        {lead.deliveries.length === 0 ? (
                          <span className="text-slate-400">Not delivered</span>
                        ) : (
                          lead.deliveries.map((d) => (
                            <div
                              key={d.id}
                              className="font-semibold text-indigo-900"
                            >
                              {d.buyerName ?? "Unknown agency"}
                            </div>
                          ))
                        )}
                      </td>
                      <td className="px-4 py-3.5 font-bold text-emerald-700">
                        {lead.deliveries.length > 0
                          ? formatINRExact(revenue)
                          : NOT_SET}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                            STATUS_STYLES[lead.status] ??
                            "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {capitalize(lead.status)}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {matchingCount > 0 && (
          <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
            <span>
              {(page - 1) * pageSize + 1}–
              {Math.min(page * pageSize, matchingCount)} of {matchingCount}
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPage((p) => p - 1)}
                disabled={page <= 1 || loading}
                className="rounded-lg border border-slate-200 p-1.5 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
                aria-label="Previous page"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              <span>
                Page {page} of {pageCount}
              </span>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= pageCount || loading}
                className="rounded-lg border border-slate-200 p-1.5 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
                aria-label="Next page"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
