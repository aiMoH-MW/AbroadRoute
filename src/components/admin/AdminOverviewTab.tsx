"use client";

import {
  Users,
  IndianRupee,
  Globe2,
  ShieldAlert,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  Building2,
  BookOpen,
  Clock,
  Activity,
} from "lucide-react";
import { Country, University, Program } from "@/types";

interface AdminOverviewTabProps {
  countriesCount: number;
  universitiesCount: number;
  programsCount: number;
  pendingClaimsCount: number;
  onNavigateTab: (tabId: string) => void;
  claimsList: any[];
}

export function AdminOverviewTab({
  countriesCount,
  universitiesCount,
  programsCount,
  pendingClaimsCount,
  onNavigateTab,
  claimsList,
}: AdminOverviewTabProps) {
  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Top Operational Metrics */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div
          onClick={() => onNavigateTab("leads")}
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:border-slate-300 hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-500">
              <Users className="h-4 w-4 text-[#102C57]" />
              <span className="text-xs font-bold uppercase tracking-wider">
                Total Leads
              </span>
            </div>
            <ArrowRight className="h-3.5 w-3.5 text-slate-300 group-hover:text-[#102C57] transition-transform group-hover:translate-x-0.5" />
          </div>
          <p className="mt-3 text-3xl font-black text-[#102C57]">3,420</p>
          <span className="text-[11px] text-slate-500">
            100% Indian SMS OTP verified
          </span>
        </div>

        <div
          onClick={() => onNavigateTab("leads")}
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:border-slate-300 hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-500">
              <IndianRupee className="h-4 w-4 text-emerald-600" />
              <span className="text-xs font-bold uppercase tracking-wider">
                Wallet Revenue
              </span>
            </div>
            <ArrowRight className="h-3.5 w-3.5 text-slate-300 group-hover:text-emerald-600 transition-transform group-hover:translate-x-0.5" />
          </div>
          <p className="mt-3 text-3xl font-black text-emerald-700">
            ₹4.85 Lakhs
          </p>
          <span className="text-[11px] text-slate-500">
            B2B Consultant prepaid balance
          </span>
        </div>

        <div
          onClick={() => onNavigateTab("universities")}
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:border-slate-300 hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-500">
              <Globe2 className="h-4 w-4 text-[#EA5C2B]" />
              <span className="text-xs font-bold uppercase tracking-wider">
                Catalog Coverage
              </span>
            </div>
            <ArrowRight className="h-3.5 w-3.5 text-slate-300 group-hover:text-[#EA5C2B] transition-transform group-hover:translate-x-0.5" />
          </div>
          <p className="mt-3 text-3xl font-black text-[#102C57]">
            {universitiesCount} Unis
          </p>
          <span className="text-[11px] text-slate-500">
            Across {countriesCount} Global Destinations
          </span>
        </div>

        <div
          onClick={() => onNavigateTab("claims")}
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:border-slate-300 hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-500">
              <ShieldCheck className="h-4 w-4 text-indigo-600" />
              <span className="text-xs font-bold uppercase tracking-wider">
                Pending Claims
              </span>
            </div>
            <ArrowRight className="h-3.5 w-3.5 text-slate-300 group-hover:text-indigo-600 transition-transform group-hover:translate-x-0.5" />
          </div>
          <p className="mt-3 text-3xl font-black text-indigo-700">
            {pendingClaimsCount}
          </p>
          <span className="text-[11px] text-slate-500">
            Requires verification review
          </span>
        </div>
      </div>

      {/* Quick Access Modules */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Claims Preview */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-[#EA5C2B]" />
                <h3 className="text-sm font-black text-[#102C57]">
                  University Claims Queue
                </h3>
              </div>
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                {pendingClaimsCount} Pending
              </span>
            </div>
            <p className="mt-3 text-xs text-slate-600">
              Institutional administrators submit proof of representation.
              Manage verification requests and grant portal access.
            </p>
            <div className="mt-4 space-y-2">
              {claimsList.slice(0, 3).map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between rounded-xl bg-slate-50 p-2.5 text-xs"
                >
                  <div>
                    <span className="font-bold text-slate-800">
                      {c.universityName}
                    </span>
                    <p className="text-[10px] text-slate-500">
                      {c.officialEmail}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      c.status === "approved" || c.status === "verified"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {c.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <button
            onClick={() => onNavigateTab("claims")}
            className="mt-5 flex items-center justify-center gap-1.5 w-full rounded-xl bg-[#102C57] py-2.5 text-xs font-bold text-white hover:bg-[#0c2242] transition cursor-pointer"
          >
            <span>Open Claims Management</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Catalog Highlights */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-[#102C57]" />
                <h3 className="text-sm font-black text-[#102C57]">
                  Institutional Directory
                </h3>
              </div>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                {universitiesCount} Listed
              </span>
            </div>
            <p className="mt-3 text-xs text-slate-600">
              Manage real-time global university criteria, QS rankings, minimum
              IELTS bands, INR tuition fee ranges, and post-study work periods.
            </p>
            <div className="mt-4 grid grid-cols-2 gap-2 text-center text-xs">
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                <p className="text-xl font-black text-[#102C57]">
                  {countriesCount}
                </p>
                <p className="text-[10px] font-medium text-slate-500">
                  Destinations
                </p>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                <p className="text-xl font-black text-[#102C57]">
                  {programsCount}
                </p>
                <p className="text-[10px] font-medium text-slate-500">
                  Streams
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab("universities")}
            className="mt-5 flex items-center justify-center gap-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          >
            <span>Manage Universities Catalog</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Security & System Health */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-emerald-600" />
                <h3 className="text-sm font-black text-[#102C57]">
                  System Operations
                </h3>
              </div>
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" /> Live
              </span>
            </div>
            <div className="mt-4 space-y-3 text-xs">
              <div className="flex items-center justify-between border-b border-slate-50 pb-2">
                <span className="text-slate-500">Database Connection</span>
                <span className="font-bold text-emerald-700">
                  Supabase Connected
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-50 pb-2">
                <span className="text-slate-500">DPDP Compliance</span>
                <span className="font-bold text-purple-700">
                  100% Encrypted & Audited
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-50 pb-2">
                <span className="text-slate-500">OTP Gateway</span>
                <span className="font-bold text-emerald-700">
                  99.9% Delivery
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Lead Engine Distribution</span>
                <span className="font-bold text-[#102C57]">
                  Active (Instant B2B)
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab("leads")}
            className="mt-5 flex items-center justify-center gap-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          >
            <span>View Lead Distribution Engine</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
