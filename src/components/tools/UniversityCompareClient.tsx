"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Building2,
  Check,
  X,
  Plus,
  Trash2,
  GraduationCap,
  DollarSign,
  Award,
  Globe,
  BookOpen,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Search,
  Calendar,
  Layers,
  SlidersHorizontal,
  FileCheck,
} from "lucide-react";
import { University } from "@/types";
import { fetchLiveUniversities } from "@/lib/supabase/dataFetchers";
import { useHomeModals } from "@/components/home/HomeClientContext";
import { CountryFlag } from "@/components/ui/CountryFlag";

// Helper function to return institutional scholarships based on country & ranking
function getScholarshipInfo(uni: University): string {
  if (uni.countrySlug === "germany") {
    return "DAAD & Deutschlandstipendium (€300 - €934/mo) • 100% Tuition Free";
  }
  if (uni.countrySlug === "usa") {
    return uni.rankingGlobal <= 30
      ? "Dean's Merit Fellowship & Graduate RA/TA (Up to 100% Tuition + Stipend)"
      : "Merit Scholarships ($5,000 - $25,000/yr) & Campus Assistantships";
  }
  if (uni.countrySlug === "uk") {
    return "Chevening, Great Scholarships & Vice-Chancellor Excellence (£5,000 - £12,000)";
  }
  if (uni.countrySlug === "canada") {
    return "Vanier CGS, Ontario Graduate Scholarship & Entrance Bursaries (CAD $5k - $20k)";
  }
  if (uni.countrySlug === "australia") {
    return "Australia Awards & International Vice-Chancellor's Merit (20% - 50% Fee Waiver)";
  }
  if (uni.countrySlug === "ireland") {
    return "Government of Ireland International Scholarship (€10k Stipend + Full Fee Waiver)";
  }
  if (uni.countrySlug === "france") {
    return "Eiffel Excellence Scholarship (€1,181 - €1,800/mo) & Campus France Grants";
  }
  return "International Merit Grants & Institutional Need-Based Financial Aid";
}

// Helper function to return application deadlines based on country & intakes
function getApplicationDeadline(uni: University): string {
  if (uni.countrySlug === "usa") {
    return "Fall: Dec 15 / Jan 15 • Spring: Oct 1";
  }
  if (uni.countrySlug === "germany") {
    return "Winter (Oct): May 31 / Jul 15 • Summer: Jan 15";
  }
  if (uni.countrySlug === "uk") {
    return "Fall (Sep): Jan 25 / Jun 30 • Spring: Nov 15";
  }
  if (uni.countrySlug === "canada") {
    return "Fall: Jan 15 / Mar 1 • Winter: Sep 1";
  }
  if (uni.countrySlug === "australia") {
    return "Semester 1 (Feb): Nov 30 • Semester 2 (Jul): Apr 30";
  }
  if (uni.countrySlug === "ireland") {
    return "Autumn (Sep): May 31 • Spring: Oct 31";
  }
  return "Priority: Jan 15 • Regular: May 31";
}

// Program title formatter
const PROGRAM_LABELS: Record<string, string> = {
  ms: "Master's (MS/MSc)",
  mba: "MBA (Management)",
  emba: "Executive MBA",
  mbbs: "MBBS / Medicine",
  ausbildung: "Ausbildung (Vocational)",
  nursing: "Nursing & Health",
  bachelors: "Bachelor's (UG)",
  phd: "PhD / Research",
};

export function UniversityCompareClient() {
  const homeModals = useHomeModals();
  const [allUniversities, setAllUniversities] = useState<University[]>([]);
  const [selectedSlugs, setSelectedSlugs] = useState<string[]>([
    "technical-university-of-munich",
    "stanford-university",
    "university-of-toronto",
    "georgia-tech",
    "university-of-manchester",
  ]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const [highlightDifferences, setHighlightDifferences] = useState(false);

  useEffect(() => {
    fetchLiveUniversities().then((res) => {
      if (res && res.length > 0) {
        setAllUniversities(res);
      }
    });
  }, []);

  const selectedUnis = selectedSlugs
    .map((slug) =>
      allUniversities.find((u) => u.slug === slug || u.id === slug),
    )
    .filter(Boolean) as University[];

  const activeUnis =
    selectedUnis.length > 0 ? selectedUnis : allUniversities.slice(0, 5);

  const addUniversity = (slug: string) => {
    if (
      activeUnis.length < 5 &&
      !activeUnis.some((u) => u.slug === slug || u.id === slug)
    ) {
      setSelectedSlugs([...activeUnis.map((u) => u.slug), slug]);
      setIsSelectorOpen(false);
      setSearchQuery("");
    }
  };

  const removeUniversity = (slug: string) => {
    if (activeUnis.length > 1) {
      setSelectedSlugs(
        activeUnis
          .filter((u) => u.slug !== slug && u.id !== slug)
          .map((u) => u.slug),
      );
    }
  };

  const availableUnis = allUniversities.filter(
    (u) =>
      !activeUnis.some((au) => au.slug === u.slug || au.id === u.id) &&
      (u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.city.toLowerCase().includes(searchQuery.toLowerCase())),
  );

  return (
    <div className="min-h-screen bg-[#FDFCF7] pb-20 pt-8 sm:pt-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header Breadcrumb & Hero */}
        <div className="mb-8 text-center sm:text-left">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#D89A3E]/30 bg-[#D89A3E]/10 px-3.5 py-1 text-xs font-bold text-[#103B47]">
            <Sparkles className="h-3.5 w-3.5 text-[#D89A3E]" />
            <span>
              Interactive Decision Utility • Compare Up to 5 Global Universities
              Side-by-Side
            </span>
          </div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-[#103B47] sm:text-4xl lg:text-5xl">
            University Comparison Matrix
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-600 sm:text-base font-sans font-normal">
            Compare QS global rankings, annual tuition in INR, admission cutoffs
            (IELTS, GRE/GMAT, Acceptance Rates), intake windows, scholarship
            schemes, degree programs offered, and application deadlines
            side-by-side.
          </p>
        </div>

        {/* Top Controls Bar */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#D9CFB8]/80 bg-white p-4 shadow-2xs">
          <div className="flex items-center gap-4 text-xs font-bold text-[#103B47]">
            <div className="flex items-center gap-1.5">
              <Building2 className="h-4 w-4 text-[#D89A3E]" />
              <span>Comparing {activeUnis.length} of 5 Universities</span>
            </div>

            {/* Highlight Differences Toggle */}
            <button
              onClick={() => setHighlightDifferences(!highlightDifferences)}
              className={`flex min-h-[40px] items-center gap-1.5 rounded-xl border px-3.5 py-1.5 transition cursor-pointer ${
                highlightDifferences
                  ? "border-[#D89A3E] bg-[#D89A3E]/15 text-[#103B47] font-bold"
                  : "border-[#D9CFB8] bg-[#FDFCF7] text-slate-700 hover:bg-white"
              }`}
            >
              <SlidersHorizontal className="h-3.5 w-3.5 text-[#D89A3E]" />
              <span>
                {highlightDifferences
                  ? "Differences Highlighted ✓"
                  : "Highlight Differences"}
              </span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            {activeUnis.length < 5 && (
              <button
                onClick={() => setIsSelectorOpen(true)}
                className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl bg-[#103B47] px-4 py-2 text-xs font-bold text-white transition hover:bg-[#1D5A6C] cursor-pointer"
              >
                <Plus className="h-4 w-4 text-[#D89A3E]" />
                <span>Add University ({5 - activeUnis.length} left)</span>
              </button>
            )}
            <button
              onClick={() => homeModals.openLeadModal()}
              className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl bg-[#D89A3E] px-4 py-2 text-xs font-bold text-slate-950 transition hover:bg-[#c4872f] cursor-pointer active:scale-98"
            >
              <span>Get Expert Shortlist Help</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Modal / Dropdown overlay to Add University */}
        {isSelectorOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xs">
            <div className="relative w-full max-w-lg rounded-3xl border border-[#D9CFB8] bg-[#FDFCF7] p-6 shadow-2xl animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between border-b border-[#D9CFB8]/60 pb-4">
                <h3 className="text-base font-display font-bold text-[#103B47]">
                  Select University to Compare
                </h3>
                <button
                  onClick={() => setIsSelectorOpen(false)}
                  className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-4 relative">
                <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search university or country..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full min-h-[44px] rounded-xl border border-[#D9CFB8] bg-white py-2.5 pl-10 pr-4 text-xs sm:text-sm focus:border-[#103B47] focus:outline-none focus:ring-1 focus:ring-[#103B47]"
                />
              </div>

              <div className="mt-4 max-h-72 space-y-1.5 overflow-y-auto pr-1">
                {availableUnis.length === 0 ? (
                  <p className="py-6 text-center text-xs text-slate-400">
                    No matching universities found.
                  </p>
                ) : (
                  availableUnis.map((uni) => (
                    <button
                      key={uni.id}
                      onClick={() => addUniversity(uni.slug)}
                      className="flex w-full items-center justify-between rounded-xl p-3 text-left transition hover:bg-white border border-[#D9CFB8]/50 bg-white/60 cursor-pointer min-h-[44px]"
                    >
                      <div>
                        <p className="text-xs font-bold text-[#103B47]">
                          {uni.name}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          {uni.city}, {uni.country} • Rank #{uni.rankingGlobal}
                        </p>
                      </div>
                      <span className="rounded-lg bg-[#D89A3E]/15 border border-[#D89A3E]/30 px-2.5 py-1 text-[11px] font-bold text-[#103B47] hover:bg-[#D89A3E] hover:text-slate-950 transition">
                        + Add
                      </span>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Comparison Table Grid */}
        <div className="overflow-x-auto rounded-3xl border border-[#D9CFB8]/80 bg-white shadow-sm">
          <table className="w-full min-w-[800px] border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-[#D9CFB8]/70 bg-[#FDFCF7]">
                <th className="w-52 p-4 font-bold uppercase tracking-wider text-slate-400">
                  Criteria / Parameters
                </th>
                {activeUnis.map((uni) => (
                  <th key={uni.id} className="p-4 align-top w-64">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5 mb-1">
                          <CountryFlag code={uni.countrySlug} size="sm" />
                          <span className="text-[10px] font-bold text-slate-500 uppercase">
                            {uni.country}
                          </span>
                        </div>
                        <Link
                          href={`/universities/${uni.slug}`}
                          className="font-display font-bold text-[#103B47] hover:text-[#D89A3E] transition text-sm leading-snug block"
                        >
                          {uni.name}
                        </Link>
                        <p className="mt-0.5 text-[11px] text-slate-500 font-normal">
                          {uni.city}
                        </p>
                      </div>
                      {activeUnis.length > 1 && (
                        <button
                          onClick={() => removeUniversity(uni.slug)}
                          className="rounded-lg p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition shrink-0 cursor-pointer"
                          title="Remove from comparison"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D9CFB8]/40 text-slate-700">
              {/* 1. Global & National Ranking */}
              <tr className={highlightDifferences ? "bg-[#D89A3E]/10" : ""}>
                <td className="bg-[#FDFCF7]/60 p-4 font-bold text-[#103B47]">
                  <div className="flex items-center gap-1.5">
                    <Award className="h-4 w-4 text-[#D89A3E]" />
                    <span>Global Ranking (QS / THE)</span>
                  </div>
                </td>
                {activeUnis.map((uni) => (
                  <td
                    key={uni.id}
                    className="p-4 font-extrabold text-slate-900 text-sm"
                  >
                    <span className="rounded-lg bg-[#D89A3E]/15 border border-[#D89A3E]/30 px-2.5 py-1 text-[#103B47] font-mono font-black">
                      #{uni.rankingGlobal} Global
                    </span>
                    {uni.rankingNational && (
                      <span className="ml-2 text-[11px] font-semibold text-slate-500 block sm:inline font-mono">
                        (#{uni.rankingNational} National)
                      </span>
                    )}
                  </td>
                ))}
              </tr>

              {/* 2. Tuition Fee (INR / yr) */}
              <tr className={highlightDifferences ? "bg-[#D89A3E]/10" : ""}>
                <td className="bg-[#FDFCF7]/60 p-4 font-bold text-[#103B47]">
                  <div className="flex items-center gap-1.5">
                    <DollarSign className="h-4 w-4 text-emerald-600" />
                    <span>Tuition Fee (Annual INR)</span>
                  </div>
                </td>
                {activeUnis.map((uni) => (
                  <td
                    key={uni.id}
                    className="p-4 font-bold font-mono text-[#103B47] text-sm"
                  >
                    {uni.tuitionFeeRangeINR}
                    <span className="block text-[10px] font-normal text-slate-400 mt-0.5">
                      {uni.countrySlug === "germany"
                        ? "Public / Tuition Free"
                        : "Standard International Rate"}
                    </span>
                  </td>
                ))}
              </tr>

              {/* 3. Admission Requirements (IELTS, GRE/GMAT, Acceptance Rate) */}
              <tr className={highlightDifferences ? "bg-[#D89A3E]/10" : ""}>
                <td className="bg-[#FDFCF7]/60 p-4 font-bold text-[#103B47]">
                  <div className="flex items-center gap-1.5">
                    <BookOpen className="h-4 w-4 text-sky-600" />
                    <span>Admission Requirements</span>
                  </div>
                </td>
                {activeUnis.map((uni) => (
                  <td key={uni.id} className="p-4 space-y-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className="rounded bg-sky-50 border border-sky-200 px-2 py-0.5 text-[11px] font-bold text-sky-900 font-mono">
                        IELTS: {uni.ieltsMinScore} Min
                      </span>
                      {uni.toeflMinScore && (
                        <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600 font-mono">
                          TOEFL: {uni.toeflMinScore}
                        </span>
                      )}
                    </div>
                    <div>
                      {uni.greGmatRequired ? (
                        <span className="inline-flex items-center gap-1 text-[11px] text-amber-800 font-bold bg-[#D89A3E]/15 border border-[#D89A3E]/30 px-2 py-0.5 rounded">
                          <Check className="h-3 w-3 text-[#D89A3E]" /> GRE/GMAT
                          Required
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-800 font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                          <Check className="h-3 w-3 text-emerald-600" />{" "}
                          GRE/GMAT Waived
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-600">
                      Acceptance Rate:{" "}
                      <strong className="font-mono text-[#103B47]">
                        {uni.acceptanceRate}%
                      </strong>
                    </div>
                  </td>
                ))}
              </tr>

              {/* 4. Programs Offered */}
              <tr>
                <td className="bg-[#FDFCF7]/60 p-4 font-bold text-[#103B47]">
                  <div className="flex items-center gap-1.5">
                    <Layers className="h-4 w-4 text-[#1D5A6C]" />
                    <span>Programs Offered</span>
                  </div>
                </td>
                {activeUnis.map((uni) => (
                  <td key={uni.id} className="p-4">
                    <div className="flex flex-wrap gap-1">
                      {uni.programsOffered && uni.programsOffered.length > 0 ? (
                        uni.programsOffered.map((prog, idx) => (
                          <span
                            key={idx}
                            className="rounded-md bg-[#1D5A6C]/10 border border-[#1D5A6C]/20 px-2 py-0.5 text-[10px] font-bold text-[#103B47]"
                          >
                            {PROGRAM_LABELS[prog] || prog.toUpperCase()}
                          </span>
                        ))
                      ) : (
                        <span className="text-slate-400 text-[11px]">
                          MS, MBA, Bachelors, PhD
                        </span>
                      )}
                    </div>
                  </td>
                ))}
              </tr>

              {/* 5. Intake Semesters */}
              <tr>
                <td className="bg-[#FDFCF7]/60 p-4 font-bold text-[#103B47]">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 text-[#1D5A6C]" />
                    <span>Intake Semesters</span>
                  </div>
                </td>
                {activeUnis.map((uni) => (
                  <td key={uni.id} className="p-4 text-slate-800 font-semibold">
                    <div className="flex items-center gap-1.5">
                      <span className="inline-block h-2 w-2 rounded-full bg-[#D89A3E]"></span>
                      <span>
                        {uni.intakes && uni.intakes.length > 0
                          ? uni.intakes.join(", ")
                          : "Fall (Aug/Sep), Spring (Jan)"}
                      </span>
                    </div>
                  </td>
                ))}
              </tr>

              {/* 6. Application Deadlines */}
              <tr className={highlightDifferences ? "bg-[#D89A3E]/10" : ""}>
                <td className="bg-[#FDFCF7]/60 p-4 font-bold text-[#103B47]">
                  <div className="flex items-center gap-1.5">
                    <FileCheck className="h-4 w-4 text-[#D89A3E]" />
                    <span>Application Deadlines</span>
                  </div>
                </td>
                {activeUnis.map((uni) => (
                  <td key={uni.id} className="p-4 text-slate-800 font-medium">
                    <span className="rounded-md bg-[#D89A3E]/15 border border-[#D89A3E]/30 text-[#103B47] font-bold px-2 py-1 text-[11px] block sm:inline-block">
                      {getApplicationDeadline(uni)}
                    </span>
                  </td>
                ))}
              </tr>

              {/* 7. Scholarships & Financial Aid */}
              <tr>
                <td className="bg-[#FDFCF7]/60 p-4 font-bold text-[#103B47]">
                  <div className="flex items-center gap-1.5">
                    <Award className="h-4 w-4 text-[#D89A3E]" />
                    <span>Scholarships & Grants</span>
                  </div>
                </td>
                {activeUnis.map((uni) => (
                  <td key={uni.id} className="p-4 text-slate-700 text-xs">
                    <div className="rounded-xl bg-[#FDFCF7] border border-[#D9CFB8]/60 p-2.5">
                      <span className="font-bold text-[#103B47] block mb-1">
                        Available Aid:
                      </span>
                      <p className="text-[11px] text-slate-600 leading-relaxed">
                        {getScholarshipInfo(uni)}
                      </p>
                    </div>
                  </td>
                ))}
              </tr>

              {/* 8. Post-Study Work Permit (PSW) */}
              <tr className={highlightDifferences ? "bg-[#D89A3E]/10" : ""}>
                <td className="bg-[#FDFCF7]/60 p-4 font-bold text-[#103B47]">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4 text-[#D89A3E]" />
                    <span>Post-Study Work Rights</span>
                  </div>
                </td>
                {activeUnis.map((uni) => (
                  <td
                    key={uni.id}
                    className="p-4 font-bold font-mono text-[#D89A3E] text-xs"
                  >
                    {uni.postStudyWorkMonths} Months (
                    {Math.round(uni.postStudyWorkMonths / 12)} Years)
                  </td>
                ))}
              </tr>

              {/* 9. Action CTAs */}
              <tr className="bg-[#FDFCF7]/40">
                <td className="bg-[#FDFCF7]/60 p-4 font-bold text-[#103B47]">
                  <span>Admissions Action</span>
                </td>
                {activeUnis.map((uni) => (
                  <td key={uni.id} className="p-4">
                    <div className="space-y-2">
                      <Link
                        href={`/universities/${uni.slug}`}
                        className="block w-full min-h-[40px] leading-[38px] rounded-xl border border-[#103B47] text-center text-xs font-bold text-[#103B47] hover:bg-[#103B47] hover:text-white transition cursor-pointer"
                      >
                        View Full Profile
                      </Link>
                      <button
                        onClick={() => homeModals.openLeadModal(uni.country)}
                        className="block w-full min-h-[40px] rounded-xl bg-[#D89A3E] text-center text-xs font-bold text-slate-950 hover:bg-[#c4872f] transition shadow-2xs cursor-pointer active:scale-98"
                      >
                        Apply / Shortlist
                      </button>
                    </div>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
