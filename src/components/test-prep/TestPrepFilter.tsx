"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  ArrowRight,
  Clock,
  Banknote,
  Award,
  BookOpen,
  CheckCircle2,
  Layers,
  Globe2,
  Stethoscope,
  GraduationCap,
} from "lucide-react";
import type { TestPrepExam } from "@/types";
import { LeadTriggerButton } from "@/components/home/HomeClientContext";
import { show } from "@/components/tools/NotProvided";

type CategoryFilter =
  | "ALL"
  | "English Proficiency"
  | "Graduate Admissions"
  | "Medical & Healthcare Licensing";

export function TestPrepFilter({ exams }: { exams: TestPrepExam[] }) {
  const [selectedCategory, setSelectedCategory] =
    useState<CategoryFilter>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("ALL");

  // All unique countries across all exams
  const allCountries = useMemo(() => {
    const set = new Set<string>();
    exams.forEach((exam) => {
      exam.targetCountries.forEach((c) => set.add(c));
    });
    return Array.from(set).sort();
  }, [exams]);

  const filteredExams = useMemo(() => {
    return exams.filter((exam) => {
      const matchCategory =
        selectedCategory === "ALL" || exam.category === selectedCategory;
      const matchCountry =
        selectedCountry === "ALL" ||
        exam.targetCountries.includes(selectedCountry);
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        exam.name.toLowerCase().includes(q) ||
        exam.shortName.toLowerCase().includes(q) ||
        exam.fullName.toLowerCase().includes(q) ||
        exam.category.toLowerCase().includes(q) ||
        exam.targetPrograms.some((p) => p.toLowerCase().includes(q)) ||
        exam.targetCountries.some((c) => c.toLowerCase().includes(q));

      return matchCategory && matchCountry && matchSearch;
    });
  }, [exams, selectedCategory, selectedCountry, searchQuery]);

  const categoryCounts = useMemo(() => {
    return {
      ALL: exams.length,
      "English Proficiency": exams.filter(
        (e) => e.category === "English Proficiency",
      ).length,
      "Graduate Admissions": exams.filter(
        (e) => e.category === "Graduate Admissions",
      ).length,
      "Medical & Healthcare Licensing": exams.filter(
        (e) => e.category === "Medical & Healthcare Licensing",
      ).length,
    };
  }, [exams]);

  return (
    <div className="space-y-8">
      {/* Search & Filter Bar */}
      <div className="rounded-3xl border border-[#D9CFB8]/80 bg-white p-5 sm:p-7 shadow-2xs">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by exam (IELTS, GRE, NCLEX), degree, or destination..."
              className="w-full min-h-[44px] rounded-2xl border border-[#D9CFB8] bg-[#FDFCF7]/60 py-3 pl-10 pr-4 text-xs sm:text-sm text-slate-900 placeholder-slate-400 transition focus:border-[#103B47] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#103B47]/10"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          {/* Country Dropdown Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">
              Destination:
            </span>
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="min-h-[44px] rounded-2xl border border-[#D9CFB8] bg-[#FDFCF7]/60 px-3.5 py-2.5 text-xs font-semibold text-slate-700 transition focus:border-[#103B47] focus:bg-white focus:outline-none cursor-pointer"
            >
              <option value="ALL">
                All Destinations ({allCountries.length})
              </option>
              {allCountries.map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-[#D9CFB8]/40 pt-4">
          <span className="text-xs font-bold text-slate-400 mr-1 uppercase tracking-wider">
            Filter Category:
          </span>

          <button
            onClick={() => setSelectedCategory("ALL")}
            className={`inline-flex min-h-[40px] items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition cursor-pointer ${
              selectedCategory === "ALL"
                ? "bg-[#103B47] text-white shadow-2xs"
                : "bg-[#FDFCF7] border border-[#D9CFB8] text-slate-700 hover:bg-white hover:border-slate-300"
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>All Exams</span>
            <span
              className={`rounded-full px-1.5 py-0.2 text-[10px] font-mono ${selectedCategory === "ALL" ? "bg-white/20 text-white" : "bg-slate-200 text-slate-600"}`}
            >
              {categoryCounts.ALL}
            </span>
          </button>

          <button
            onClick={() => setSelectedCategory("English Proficiency")}
            className={`inline-flex min-h-[40px] items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition cursor-pointer ${
              selectedCategory === "English Proficiency"
                ? "bg-[#103B47] text-white shadow-2xs"
                : "bg-[#FDFCF7] border border-[#D9CFB8] text-slate-700 hover:bg-white hover:border-slate-300"
            }`}
          >
            <Globe2 className="h-3.5 w-3.5 text-sky-400" />
            <span>English Proficiency</span>
            <span
              className={`rounded-full px-1.5 py-0.2 text-[10px] font-mono ${selectedCategory === "English Proficiency" ? "bg-white/20 text-white" : "bg-slate-200 text-slate-600"}`}
            >
              {categoryCounts["English Proficiency"]}
            </span>
          </button>

          <button
            onClick={() => setSelectedCategory("Graduate Admissions")}
            className={`inline-flex min-h-[40px] items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition cursor-pointer ${
              selectedCategory === "Graduate Admissions"
                ? "bg-[#103B47] text-white shadow-2xs"
                : "bg-[#FDFCF7] border border-[#D9CFB8] text-slate-700 hover:bg-white hover:border-slate-300"
            }`}
          >
            <GraduationCap className="h-3.5 w-3.5 text-[#D89A3E]" />
            <span>Graduate & MBA</span>
            <span
              className={`rounded-full px-1.5 py-0.2 text-[10px] font-mono ${selectedCategory === "Graduate Admissions" ? "bg-white/20 text-white" : "bg-slate-200 text-slate-600"}`}
            >
              {categoryCounts["Graduate Admissions"]}
            </span>
          </button>

          <button
            onClick={() =>
              setSelectedCategory("Medical & Healthcare Licensing")
            }
            className={`inline-flex min-h-[40px] items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition cursor-pointer ${
              selectedCategory === "Medical & Healthcare Licensing"
                ? "bg-[#103B47] text-white shadow-2xs"
                : "bg-[#FDFCF7] border border-[#D9CFB8] text-slate-700 hover:bg-white hover:border-slate-300"
            }`}
          >
            <Stethoscope className="h-3.5 w-3.5 text-emerald-400" />
            <span>Medical & Healthcare</span>
            <span
              className={`rounded-full px-1.5 py-0.2 text-[10px] font-mono ${selectedCategory === "Medical & Healthcare Licensing" ? "bg-white/20 text-white" : "bg-slate-200 text-slate-600"}`}
            >
              {categoryCounts["Medical & Healthcare Licensing"]}
            </span>
          </button>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-slate-500">
          Showing{" "}
          <span className="font-bold text-[#103B47] font-mono">
            {filteredExams.length}
          </span>{" "}
          standardized tests & licensing exams
        </p>
        {(searchQuery ||
          selectedCategory !== "ALL" ||
          selectedCountry !== "ALL") && (
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("ALL");
              setSelectedCountry("ALL");
            }}
            className="text-xs font-bold text-[#D89A3E] hover:underline cursor-pointer"
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* Grid of Exams */}
      {filteredExams.length === 0 ? (
        <div className="rounded-3xl border border-[#D9CFB8] bg-white p-12 text-center shadow-2xs">
          <BookOpen className="mx-auto h-10 w-10 text-slate-300" />
          <h3 className="mt-3 text-base font-serif font-bold text-[#103B47]">
            No matching exams found
          </h3>
          <p className="mt-1 text-xs text-slate-500">
            Try loosening your search terms or resetting the destination filter.
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("ALL");
              setSelectedCountry("ALL");
            }}
            className="mt-4 min-h-[44px] rounded-xl bg-[#103B47] px-5 py-2 text-xs font-bold text-white shadow-2xs hover:bg-[#1D5A6C] transition cursor-pointer"
          >
            Show All {exams.length} Exams
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredExams.map((exam) => (
            <ExamCard key={exam.id} exam={exam} />
          ))}
        </div>
      )}
    </div>
  );
}

function ExamCard({ exam }: { exam: TestPrepExam }) {
  const categoryBadgeColor = {
    "English Proficiency": "bg-sky-50 text-sky-800 border-sky-200",
    "Graduate Admissions": "bg-[#D89A3E]/15 text-[#D89A3E] border-[#D89A3E]/30",
    "Medical & Healthcare Licensing":
      "bg-emerald-50 text-emerald-800 border-emerald-200",
  }[exam.category];

  return (
    <div className="group flex flex-col justify-between rounded-3xl border border-[#D9CFB8]/80 bg-white p-6 shadow-2xs transition duration-200 hover:-translate-y-1 hover:border-[#103B47]/30 hover:shadow-md">
      <div>
        {/* Category & Conducting Body */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span
            className={`inline-flex items-center rounded-lg border px-2.5 py-0.5 text-[10px] font-bold ${categoryBadgeColor}`}
          >
            {exam.category}
          </span>
          <span
            className="text-[11px] font-medium text-slate-500 truncate"
            title={exam.conductingBody ?? undefined}
          >
            {show(exam.conductingBody)}
          </span>
        </div>

        {/* Title */}
        <div className="mt-4">
          <h3 className="text-xl font-serif font-bold tracking-tight text-[#103B47] group-hover:text-[#1D5A6C] transition">
            {exam.name}
          </h3>
          <p className="text-xs text-slate-500 mt-1 leading-snug">
            {exam.fullName}
          </p>
        </div>

        {/* Tagline */}
        <p className="mt-3 text-xs leading-relaxed text-slate-600 line-clamp-2">
          {show(exam.heroTagline)}
        </p>

        {/* Key Metrics Box */}
        <div className="mt-5 rounded-2xl bg-[#FDFCF7] border border-[#D9CFB8]/60 p-3.5 space-y-2.5">
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="flex items-start gap-2">
              <Banknote className="h-4 w-4 text-[#D89A3E] shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Fee (INR)
                </p>
                <p className="font-bold font-mono text-slate-900">
                  {show(exam.feeINR)}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Clock className="h-4 w-4 text-slate-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Duration
                </p>
                <p className="font-bold font-mono text-slate-900">
                  {show(exam.duration)}
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-[#D9CFB8]/40 pt-2 grid grid-cols-2 gap-3 text-xs">
            <div className="flex items-start gap-2">
              <Award className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Target Score
                </p>
                <p className="font-bold font-mono text-emerald-700 leading-tight">
                  {show(exam.targetCutoffIndianStudents)}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-[#1D5A6C] shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Validity
                </p>
                <p className="font-bold font-mono text-slate-900">
                  {show(exam.validityYears, (v) => (v === 99 ? "Lifetime" : `${v} Years`))}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Accepted Destinations Badges */}
        <div className="mt-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
            Key Destinations:
          </p>
          <div className="flex flex-wrap gap-1">
            {exam.targetCountries.slice(0, 4).map((country) => (
              <span
                key={country}
                className="rounded-lg bg-[#1D5A6C]/10 border border-[#1D5A6C]/20 px-2 py-0.5 text-[10px] font-semibold text-[#103B47]"
              >
                {country}
              </span>
            ))}
            {exam.targetCountries.length > 4 && (
              <span className="rounded-lg bg-[#1D5A6C]/5 border border-[#1D5A6C]/15 px-1.5 py-0.5 text-[10px] font-semibold text-[#1D5A6C]">
                +{exam.targetCountries.length - 4} more
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="mt-6 pt-4 border-t border-[#D9CFB8]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Link
          href={`/test-prep/${exam.slug}`}
          className="inline-flex min-h-[44px] items-center gap-1.5 text-xs font-bold text-[#103B47] hover:text-[#D89A3E] transition"
        >
          <span>View 8-Week Blueprint</span>
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
        </Link>

        <LeadTriggerButton
          country={exam.targetCountries[0]}
          className="inline-flex min-h-[44px] items-center justify-center rounded-xl bg-[#D89A3E]/15 border border-[#D89A3E]/30 px-3.5 py-1.5 text-xs font-bold text-[#103B47] hover:bg-[#D89A3E] hover:text-slate-950 transition shadow-2xs cursor-pointer"
        >
          Book Prep Advice
        </LeadTriggerButton>
      </div>
    </div>
  );
}
