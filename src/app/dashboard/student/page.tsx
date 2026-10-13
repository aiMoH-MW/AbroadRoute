"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Compass,
  GraduationCap,
  Bookmark,
  FileText,
  Bot,
  ArrowLeft,
  Building2,
  User,
  LogOut,
  Trash2,
} from "lucide-react";
import { fetchLiveUniversities } from "@/lib/supabase/dataFetchers";
import { University } from "@/types";
import { useAuth } from "@/lib/auth/AuthContext";
import {
  getSavedShortlist,
  removeFromShortlist as removeShortlistCookie,
  fetchBackendShortlist,
} from "@/lib/cookies/shortlist";
import { BrandLogo } from "@/components/ui/BrandSignatures";
import { NotProvided, show } from "@/components/tools/NotProvided";
import { useSiteStats } from "@/lib/useSiteStats";
import { withCount } from "@/lib/siteStatsFormat";
import { getAuthHeaders } from "@/lib/supabase/client";

interface StudentInquiry {
  id: string;
  countryName: string | null;
  programName: string | null;
  intakeYear: string | null;
  budgetRange: string | null;
  createdAt: string;
}

export default function StudentDashboardPage() {
  const siteStats = useSiteStats();
  const { user, logout } = useAuth();
  const displayName = user?.name || "Student";
  const [allUniversities, setAllUniversities] = useState<University[]>([]);
  const [shortlistedUnis, setShortlistedUnis] = useState<University[]>([]);
  // Counselling requests this student has submitted (leads with their email)
  const [inquiries, setInquiries] = useState<StudentInquiry[] | null>(null);

  useEffect(() => {
    if (!user?.email) return;
    let active = true;
    (async () => {
      try {
        const res = await fetch("/api/student/inquiries", {
          headers: await getAuthHeaders(),
        });
        const json = await res.json();
        if (active) setInquiries(res.ok && json.success ? json.inquiries : []);
      } catch {
        if (active) setInquiries([]);
      }
    })();
    return () => {
      active = false;
    };
  }, [user?.email]);
  const latestInquiry = inquiries?.[0] ?? null;

  // 1. Fetch universities once on mount
  useEffect(() => {
    fetchLiveUniversities().then((res) => {
      if (res && res.length > 0) {
        setAllUniversities(res);
      }
    });
  }, []);

  // 2. Fetch backend shortlists when authenticated user changes
  useEffect(() => {
    if (user && (user.id || user.email)) {
      fetchBackendShortlist(user).then((slugs) => {
        if (allUniversities.length > 0) {
          const matched = slugs
            .map((slug) => allUniversities.find((u) => u.slug === slug))
            .filter(Boolean) as University[];
          setShortlistedUnis(matched);
        }
      });
    } else {
      setShortlistedUnis([]);
    }
  }, [user?.id, user?.email, allUniversities]);

  // 3. Sync shortlistedUnis on shortlist update events
  useEffect(() => {
    if (!user?.email) {
      setShortlistedUnis([]);
      return;
    }

    const updateMatched = (slugs: string[]) => {
      if (allUniversities.length > 0) {
        const matched = slugs
          .map((slug) => allUniversities.find((u) => u.slug === slug))
          .filter(Boolean) as University[];
        setShortlistedUnis(matched);
      }
    };

    updateMatched(getSavedShortlist(user));

    const handleUpdate = (e: any) => {
      const detail = e.detail;
      const eventEmail = detail?.email?.toLowerCase();
      const currentEmail = user?.email?.toLowerCase();

      // Only respond to events scoped to this exact user or unscoped events
      if (eventEmail && currentEmail && eventEmail !== currentEmail) {
        return;
      }

      const slugs = Array.isArray(detail)
        ? detail
        : Array.isArray(detail?.slugs)
          ? detail.slugs
          : getSavedShortlist(user);
      updateMatched(slugs);
    };

    window.addEventListener("vista_shortlist_updated", handleUpdate);
    return () =>
      window.removeEventListener("vista_shortlist_updated", handleUpdate);
  }, [allUniversities, user?.email]);

  const removeShortlist = (slug: string) => {
    try {
      removeShortlistCookie(slug, user);
      setShortlistedUnis((prev) => prev.filter((u) => u.slug !== slug));
    } catch (e) {
      console.warn("Remove shortlist error:", e);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCF7]">
      {/* Top Navbar */}
      <nav className="border-b border-[#D9CFB8]/60 bg-white/95 backdrop-blur-md px-4 py-3.5 sm:px-6 lg:px-8 sticky top-0 z-30 shadow-xs">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <BrandLogo variant="wordmark" theme="light" size="md" />
            <span className="rounded-full bg-[#1D5A6C]/10 border border-[#1D5A6C]/20 px-3 py-1 text-[11px] font-bold text-[#1D5A6C]">
              Student Dashboard
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <span className="font-semibold text-[#103B47] flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 text-[#D89A3E]" />
              Welcome, {displayName}
            </span>
            <Link
              href="/login"
              onClick={logout}
              className="min-h-[44px] rounded-xl border border-[#D9CFB8] bg-white px-3.5 py-2 font-bold text-[#103B47] hover:bg-[#F5EFE0] flex items-center gap-1.5 transition shadow-xs"
            >
              <LogOut className="h-3.5 w-3.5 text-[#103B47]/70" />
              <span>Log Out</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Dashboard Content */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {user?.role === "university" && (
          <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-2xl border border-[#D9CFB8] bg-[#F5EFE0] p-4 sm:p-5 text-xs font-bold text-[#103B47] shadow-xs">
            <div className="flex items-center gap-3">
              <Building2 className="h-5 w-5 text-[#D89A3E] shrink-0" />
              <span>
                You are signed in with university partner credentials (
                {user.email}).
              </span>
            </div>
            <Link
              href="/portal/university"
              className="min-h-[44px] rounded-xl bg-[#103B47] px-4 py-2.5 text-white hover:bg-[#1D5A6C] transition flex items-center shadow-xs"
            >
              Switch to University Portal →
            </Link>
          </div>
        )}

        {/* Personalized Welcome Banner */}
        <div className="mb-8 rounded-3xl bg-gradient-to-r from-[#103B47] via-[#154654] to-[#1D5A6C] p-6 sm:p-8 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-5 border border-[#103B47]">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold text-[#D89A3E] border border-[#D89A3E]/30">
              <GraduationCap className="h-3.5 w-3.5" /> Aspirant Workspace
            </div>
            <h1 className="mt-2.5 text-2xl font-black font-serif text-white sm:text-3xl">
              Welcome back, {displayName}!
            </h1>
            <p className="mt-1 text-xs text-white/80 font-medium">
              {user?.email ? `Registered email: ${user.email} • ` : ""}Target
              Intake: {latestInquiry?.intakeYear ?? "Not provided"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="min-h-[44px] flex items-center rounded-xl bg-[#D89A3E] px-5 py-2.5 text-xs font-bold text-[#103B47] shadow-xs hover:bg-[#EBC783] transition"
            >
              Explore {withCount(siteStats.countries, "Destinations")} →
            </Link>
          </div>
        </div>

        {/* Profile Card & Stats */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-2xl border border-[#D9CFB8]/60 bg-white p-5 sm:p-6 shadow-xs">
            <div className="flex items-center gap-2 text-[#103B47]">
              <Bookmark className="h-5 w-5 text-[#D89A3E]" />
              <span className="text-xs font-serif font-bold uppercase tracking-wider text-[#103B47]/80">
                Saved Shortlists
              </span>
            </div>
            <p className="mt-3 text-3xl font-mono font-bold text-[#103B47]">
              {shortlistedUnis.length}
            </p>
            <span className="text-[11px] text-[#103B47]/70 mt-1 block">
              Universities in watchlist
            </span>
          </div>

          <div className="rounded-2xl border border-[#D9CFB8]/60 bg-white p-5 sm:p-6 shadow-xs">
            <div className="flex items-center gap-2 text-[#103B47]">
              <FileText className="h-5 w-5 text-[#1D5A6C]" />
              <span className="text-xs font-serif font-bold uppercase tracking-wider text-[#103B47]/80">
                Counselling Requests
              </span>
            </div>
            <p className="mt-3 text-3xl font-mono font-bold text-[#103B47]">
              {inquiries === null ? "—" : inquiries.length}
            </p>
            <span className="text-[11px] text-[#103B47]/70 mt-1 block">
              {latestInquiry
                ? [latestInquiry.programName, latestInquiry.countryName]
                    .filter(Boolean)
                    .join(" · ") || "Latest request"
                : "No requests yet"}
            </span>
          </div>

          <Link
            href="/dashboard/counsellor-chats"
            className="group block rounded-2xl border border-[#D9CFB8]/60 bg-white p-5 sm:p-6 shadow-xs hover:border-[#103B47] transition"
          >
            <div className="flex items-center justify-between text-[#103B47]">
              <div className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-[#1D5A6C]" />
                <span className="text-xs font-serif font-bold uppercase tracking-wider text-[#103B47]/80">
                  AI Chat Sessions
                </span>
              </div>
              <span className="text-xs font-bold text-[#1D5A6C] group-hover:translate-x-0.5 transition">
                View All →
              </span>
            </div>
            <p className="mt-3 text-3xl font-serif font-bold text-[#103B47]">
              Transcripts
            </p>
            <span className="text-[11px] text-[#103B47]/70 mt-1 block">
              Saved Route AI advice & shortlists
            </span>
          </Link>
        </div>

        {/* Shortlist Table */}
        <div className="mt-8 rounded-3xl border border-[#D9CFB8]/60 bg-white p-6 sm:p-8 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#D9CFB8]/40 pb-5">
            <div>
              <h2 className="font-serif text-lg sm:text-xl font-bold text-[#103B47]">
                My Saved University Shortlist
              </h2>
              <p className="text-xs text-[#103B47]/70 mt-0.5">
                Compare rankings, fees, and minimum IELTS cutoffs.
              </p>
            </div>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#D89A3E] hover:underline"
            >
              Explore more universities →
            </Link>
          </div>

          {shortlistedUnis.length === 0 ? (
            <div className="py-12 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F5EFE0] text-[#D89A3E] border border-[#D9CFB8]/60">
                <Bookmark className="h-7 w-7" />
              </div>
              <h3 className="mt-4 font-serif text-base font-bold text-[#103B47]">
                No universities shortlisted yet
              </h3>
              <p className="mt-1 text-xs text-[#103B47]/70 max-w-sm mx-auto leading-relaxed">
                Explore universities across{" "}
                {siteStats.countries > 0
                  ? `${siteStats.countries} countries`
                  : "our destinations"}{" "}
                and click the{" "}
                <strong className="text-[#103B47]">★ Shortlist</strong> button
                on any profile to save it to your dashboard.
              </p>
              <div className="mt-5">
                <Link
                  href="/"
                  className="min-h-[44px] inline-flex items-center gap-2 rounded-xl bg-[#103B47] px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#1D5A6C] transition"
                >
                  <Building2 className="h-4 w-4 text-[#D89A3E]" />
                  <span>Browse Universities</span>
                </Link>
              </div>
            </div>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-[#D9CFB8]/60 bg-[#F5EFE0] text-[10px] uppercase font-serif font-bold tracking-wider text-[#103B47]">
                  <tr>
                    <th className="p-3.5">University</th>
                    <th className="p-3.5">Country</th>
                    <th className="p-3.5">Global Rank</th>
                    <th className="p-3.5">Annual Fees (INR)</th>
                    <th className="p-3.5">IELTS Requirement</th>
                    <th className="p-3.5">Work Visa</th>
                    <th className="p-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D9CFB8]/30">
                  {shortlistedUnis.map((uni) => (
                    <tr key={uni.id} className="hover:bg-[#FDFCF7] transition">
                      <td className="p-3.5 font-bold text-[#103B47]">
                        <Link
                          href={`/universities/${uni.slug}`}
                          className="flex items-center gap-2 hover:underline"
                        >
                          <Building2 className="h-4 w-4 text-[#D89A3E] shrink-0" />
                          <span>{uni.name}</span>
                        </Link>
                      </td>
                      <td className="p-3.5 font-medium text-[#103B47]/80">
                        {show(uni.country)}
                      </td>
                      <td className="p-3.5 font-mono font-bold text-[#103B47]">
                        {show(uni.rankingGlobal, (v) => `#${v}`)}
                      </td>
                      <td className="p-3.5 font-mono font-bold text-[#103B47]">
                        {show(uni.tuitionFeeRangeINR)}
                      </td>
                      <td className="p-3.5 font-mono text-[#103B47]/80">
                        {show(uni.ieltsMinScore, (v) => `${v} Bands`)}
                      </td>
                      <td className="p-3.5 text-emerald-700 font-mono font-semibold">
                        {show(uni.postStudyWorkMonths, (v) => `${v} Months`)}
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/universities/${uni.slug}`}
                            className="min-h-[44px] inline-flex items-center justify-center rounded-xl bg-[#103B47] px-3.5 py-1.5 text-xs font-bold text-white hover:bg-[#1D5A6C] transition shadow-xs"
                          >
                            View
                          </Link>
                          <button
                            onClick={() => removeShortlist(uni.slug)}
                            className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-xl p-2 text-[#103B47]/60 hover:bg-rose-50 hover:text-rose-600 transition cursor-pointer"
                            title="Remove from shortlist"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
