"use client";

import { useState, useMemo } from "react";
import {
  ShieldCheck,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  Mail,
  Building2,
  UserCheck,
  Calendar,
  Globe,
} from "lucide-react";
import { CountryFlag } from "@/components/ui/CountryFlag";

interface AdminClaimsTabProps {
  claimsList: any[];
  onApproveClaim: (claim: any) => Promise<void>;
  onRefreshClaims: () => Promise<void>;
  isRefreshing: boolean;
}

export function AdminClaimsTab({
  claimsList,
  onApproveClaim,
  onRefreshClaims,
  isRefreshing,
}: AdminClaimsTabProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "pending" | "approved" | "rejected"
  >("all");
  const [approvingId, setApprovingId] = useState<string | null>(null);

  const filteredClaims = useMemo(() => {
    return claimsList.filter((c) => {
      const isApprovedOrVerified = c.status === "approved" || c.status === "verified";
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "approved" && isApprovedOrVerified) ||
        (statusFilter === "pending" && c.status === "pending") ||
        (statusFilter === "rejected" && (c.status === "rejected" || c.status === "declined"));
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        (c.universityName && c.universityName.toLowerCase().includes(q)) ||
        (c.applicantName && c.applicantName.toLowerCase().includes(q)) ||
        (c.officialEmail && c.officialEmail.toLowerCase().includes(q)) ||
        (c.countryName && c.countryName.toLowerCase().includes(q));
      return matchesStatus && matchesSearch;
    });
  }, [claimsList, searchQuery, statusFilter]);

  const pendingCount = claimsList.filter((c) => c.status === "pending").length;
  const approvedCount = claimsList.filter(
    (c) => c.status === "approved" || c.status === "verified",
  ).length;

  const handleApprove = async (claim: any) => {
    setApprovingId(claim.id);
    try {
      await onApproveClaim(claim);
    } catch (err: any) {
      window.alert(err?.message || "Failed to approve claim.");
    } finally {
      setApprovingId(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header & Controls */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-[#102C57]">
                <ShieldCheck className="h-5 w-5 text-[#EA5C2B]" />
              </div>
              <div>
                <h2 className="text-lg font-black text-[#102C57]">
                  University Profile Claims Queue
                </h2>
                <p className="text-xs text-slate-500">
                  Review and verify official domain email claims from
                  international university representatives.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onRefreshClaims}
              disabled={isRefreshing}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 text-[#EA5C2B] ${isRefreshing ? "animate-spin" : ""}`}
              />
              <span>Refresh Queue</span>
            </button>
            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">
              {pendingCount} Pending Review
            </span>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="mt-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by university, applicant, or official email..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-[#102C57] focus:bg-white outline-none"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setStatusFilter("all")}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                statusFilter === "all"
                  ? "bg-[#102C57] text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              All Claims ({claimsList.length})
            </button>
            <button
              onClick={() => setStatusFilter("pending")}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                statusFilter === "pending"
                  ? "bg-amber-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Pending ({pendingCount})
            </button>
            <button
              onClick={() => setStatusFilter("approved")}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                statusFilter === "approved"
                  ? "bg-emerald-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Approved ({approvedCount})
            </button>
          </div>
        </div>
      </div>

      {/* Claims List */}
      <div className="space-y-3">
        {filteredClaims.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
            <UserCheck className="mx-auto h-12 w-12 text-slate-300 mb-3" />
            <h3 className="text-base font-bold text-slate-800">
              No profile claims found
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {searchQuery
                ? "Try refining your search term."
                : "All incoming university claims are currently processed."}
            </p>
          </div>
        ) : (
          filteredClaims.map((claim) => (
            <div
              key={claim.id}
              className="flex flex-col lg:flex-row lg:items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:border-slate-300 transition gap-4"
            >
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  {claim.countryCode && (
                    <CountryFlag
                      code={claim.countryCode}
                      name={claim.countryName}
                      size="sm"
                    />
                  )}
                  <h3 className="text-sm font-black text-[#102C57]">
                    {claim.universityName}
                  </h3>
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-bold text-slate-600">
                    {claim.countryName || claim.countryId || "Country not set"}
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                      claim.status === "approved" || claim.status === "verified"
                        ? "bg-emerald-100 text-emerald-800"
                        : claim.status === "rejected" || claim.status === "declined"
                          ? "bg-red-100 text-red-800"
                          : "bg-amber-100 text-amber-800 animate-pulse"
                    }`}
                  >
                    {claim.status === "verified" ? "verified partner" : claim.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-xs text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-400">Representative:</span>
                    <strong className="text-slate-900">
                      {claim.applicantName}
                    </strong>
                    {claim.designation && (
                      <span className="text-slate-500">
                        ({claim.designation})
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-indigo-600" />
                    <code className="bg-indigo-50 px-1.5 py-0.5 rounded text-indigo-700 font-semibold text-[11px]">
                      {claim.officialEmail}
                    </code>
                  </div>
                </div>

                {claim.verificationNotes && (
                  <p className="text-[11px] text-slate-500 italic bg-slate-50 p-2 rounded-lg border border-slate-100">
                    "{claim.verificationNotes}"
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 self-end lg:self-center">
                {claim.status === "pending" ? (
                  <button
                    onClick={() => handleApprove(claim)}
                    disabled={approvingId === claim.id}
                    className="flex items-center gap-1.5 rounded-xl bg-[#102C57] px-4 py-2 text-xs font-bold text-white hover:bg-[#0c2242] transition cursor-pointer shadow-xs disabled:opacity-50"
                  >
                    <ShieldCheck className="h-3.5 w-3.5 text-[#EA5C2B]" />
                    <span>
                      {approvingId === claim.id
                        ? "Approving..."
                        : "Approve Claim & Grant Portal Access"}
                    </span>
                  </button>
                ) : claim.status === "approved" || claim.status === "verified" ? (
                  <span className="rounded-xl bg-emerald-50 border border-emerald-200 px-3.5 py-1.5 text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    Verified Institution Partner
                  </span>
                ) : (
                  <span className="rounded-xl bg-red-50 border border-red-200 px-3.5 py-1.5 text-xs font-bold text-red-800 flex items-center gap-1.5">
                    <XCircle className="h-4 w-4 text-red-600" />
                    Claim Declined
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
