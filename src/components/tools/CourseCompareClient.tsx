"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  GraduationCap,
  Check,
  X,
  Plus,
  Trash2,
  DollarSign,
  Award,
  BookOpen,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Search,
  Calendar,
  Layers,
  Building2,
  SlidersHorizontal,
} from "lucide-react";
import type { CompareCourse } from "@/lib/compareTypes";
import { formatDateOnly } from "@/lib/deadlines";
import { formatCurrency } from "@/lib/utils";
import { useHomeModals } from "@/components/home/HomeClientContext";
import { CountryFlag } from "@/components/ui/CountryFlag";
import { NotProvided } from "./NotProvided";

const MAX_COMPARE = 5;

interface CourseOption {
  programId: string;
  name: string;
  level: string | null;
  offerings: CompareCourse[];
}

const locationOf = (c: CompareCourse) =>
  [c.city, c.countryName].filter(Boolean).join(", ");

export function CourseCompareClient() {
  const homeModals = useHomeModals();
  const [coursesPool, setCoursesPool] = useState<CompareCourse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [selectedProgramId, setSelectedProgramId] = useState<string | null>(
    null,
  );
  const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>([]);
  const [courseSearchQuery, setCourseSearchQuery] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const [highlightDifferences, setHighlightDifferences] = useState(false);

  useEffect(() => {
    async function loadCourses() {
      try {
        const res = await fetch("/api/compare/courses");
        const json = await res.json();
        if (!res.ok || !Array.isArray(json.courses)) {
          throw new Error(json.error || "Failed to load courses");
        }
        setCoursesPool(json.courses);
      } catch (err) {
        console.warn("Compare courses fetch error:", err);
        setLoadError(true);
      } finally {
        setIsLoading(false);
      }
    }
    loadCourses();
  }, []);

  const activeCourses = selectedCourseIds
    .map((id) => coursesPool.find((c) => c.id === id))
    .filter(Boolean) as CompareCourse[];

  // Programs and the universities offering each (Step 1 picker)
  const allCourseOptions = Array.from(
    coursesPool
      .reduce((map, c) => {
        const existing = map.get(c.programId);
        if (existing) {
          existing.offerings.push(c);
        } else {
          map.set(c.programId, {
            programId: c.programId,
            name: c.name,
            level: c.level,
            offerings: [c],
          });
        }
        return map;
      }, new Map<string, CourseOption>())
      .values(),
  );

  const courseOptions = allCourseOptions
    .filter((o) => {
      const q = courseSearchQuery.toLowerCase();
      return (
        o.name.toLowerCase().includes(q) ||
        (o.level ?? "").toLowerCase().includes(q)
      );
    })
    .sort(
      (a, b) =>
        b.offerings.length - a.offerings.length || a.name.localeCompare(b.name),
    );

  const selectedCourseName =
    allCourseOptions.find((o) => o.programId === selectedProgramId)?.name ??
    null;

  const selectCourse = (option: CourseOption) => {
    setSelectedProgramId(option.programId);
    setSelectedCourseIds(
      option.offerings.slice(0, MAX_COMPARE).map((c) => c.id),
    );
    setCourseSearchQuery("");
  };

  const resetCourseSelection = () => {
    setSelectedProgramId(null);
    setSelectedCourseIds([]);
    setIsSelectorOpen(false);
  };

  const isSameCourse = (c: CompareCourse) => c.programId === selectedProgramId;

  const addCourse = (id: string) => {
    if (
      activeCourses.length < MAX_COMPARE &&
      !activeCourses.some((c) => c.id === id)
    ) {
      setSelectedCourseIds([...activeCourses.map((c) => c.id), id]);
      setIsSelectorOpen(false);
      setSearchQuery("");
    }
  };

  const removeCourse = (id: string) => {
    if (activeCourses.length > 1) {
      setSelectedCourseIds(
        activeCourses.filter((c) => c.id !== id).map((c) => c.id),
      );
    }
  };

  // Same course at other universities is listed first
  const availableCourses = coursesPool
    .filter((c) => {
      const q = searchQuery.toLowerCase();
      return (
        !activeCourses.some((ac) => ac.id === c.id) &&
        (c.name.toLowerCase().includes(q) ||
          c.universityName.toLowerCase().includes(q) ||
          (c.countryName ?? "").toLowerCase().includes(q) ||
          (c.level ?? "").toLowerCase().includes(q))
      );
    })
    .sort((a, b) => Number(isSameCourse(b)) - Number(isSameCourse(a)));

  return (
    <div className="min-h-screen bg-[#FDFCF7] pb-20 pt-8 sm:pt-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header Hero */}
        <div className="mb-8 text-center sm:text-left">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#D89A3E]/30 bg-[#D89A3E]/10 px-3.5 py-1 text-xs font-bold text-[#103B47]">
            <Sparkles className="h-3.5 w-3.5 text-[#D89A3E]" />
            <span>
              Interactive Utility • Compare Up to 5 Academic Courses & Degrees
              Side-by-Side
            </span>
          </div>
          <h1 className="font-serif text-3xl font-black text-[#103B47] sm:text-4xl lg:text-5xl">
            Course & Program Comparison Matrix
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-600 sm:text-base font-normal">
            Compare course specializations, tuition fees in INR, minimum IELTS
            cutoffs, GRE/GMAT waiver rules, application deadlines, and STEM
            post-study work authorization across top international degree
            offerings.
          </p>
        </div>

        {selectedCourseName === null ? (
          /* Step 1: Select Course */
          <div className="rounded-3xl border border-[#D9CFB8]/80 bg-white p-5 shadow-sm sm:p-8">
            <div className="mb-5">
              <span className="inline-block rounded-md bg-[#D89A3E]/15 border border-[#D89A3E]/30 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#103B47]">
                Step 1
              </span>
              <h2 className="mt-2 font-serif text-xl font-bold text-[#103B47] sm:text-2xl">
                Select a course to compare
              </h2>
              <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                Pick the course you are interested in and we&apos;ll line up the
                universities offering it side-by-side.
              </p>
            </div>

            <div className="relative">
              <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search course e.g. MS, MBA, MBBS..."
                value={courseSearchQuery}
                onChange={(e) => setCourseSearchQuery(e.target.value)}
                className="w-full min-h-[44px] rounded-xl border border-[#D9CFB8] bg-[#FDFCF7] py-2.5 pl-10 pr-4 text-xs sm:text-sm focus:border-[#103B47] focus:outline-none focus:ring-1 focus:ring-[#103B47]"
              />
            </div>

            <div className="mt-4 grid max-h-[28rem] gap-2 overflow-y-auto pr-1 sm:grid-cols-2">
              {courseOptions.length === 0 ? (
                <p className="py-6 text-center text-xs text-slate-400 sm:col-span-2">
                  {isLoading
                    ? "Loading courses..."
                    : loadError
                      ? "Courses could not be loaded right now. Please try again later."
                      : coursesPool.length === 0
                        ? "No courses are available to compare yet."
                        : "No courses match your search."}
                </p>
              ) : (
                courseOptions.map((o) => (
                  <button
                    key={o.programId}
                    onClick={() => selectCourse(o)}
                    className="flex w-full items-center justify-between gap-3 rounded-xl border border-[#D9CFB8]/60 bg-[#FDFCF7]/60 p-3 text-left text-xs transition hover:border-[#D89A3E] hover:bg-white cursor-pointer min-h-[44px]"
                  >
                    <div>
                      <p className="font-bold text-[#103B47]">{o.name}</p>
                      <p className="mt-0.5 text-[11px] text-slate-500">
                        {o.level && `${o.level} • `}Offered by{" "}
                        {o.offerings.length}{" "}
                        {o.offerings.length === 1
                          ? "university"
                          : "universities"}
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 shrink-0 text-[#D89A3E]" />
                  </button>
                ))
              )}
            </div>
          </div>
        ) : (
          <>
            {/* Selected Course Banner */}
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#D89A3E]/30 bg-[#D89A3E]/10 px-4 py-3 text-xs">
              <div className="flex items-center gap-2 text-[#103B47]">
                <BookOpen className="h-4 w-4 text-[#D89A3E]" />
                <span>
                  Selected course:{" "}
                  <span className="font-bold">{selectedCourseName}</span>
                </span>
              </div>
              <button
                onClick={resetCourseSelection}
                className="min-h-[36px] rounded-lg border border-[#103B47]/30 bg-white px-3 py-1.5 font-bold text-[#103B47] transition hover:bg-[#103B47] hover:text-white cursor-pointer"
              >
                Change Course
              </button>
            </div>

            {/* Controls Bar */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#D9CFB8]/80 bg-white p-4 shadow-2xs">
              <div className="flex items-center gap-4 text-xs font-bold text-[#103B47]">
                <div className="flex items-center gap-1.5">
                  <GraduationCap className="h-4 w-4 text-[#D89A3E]" />
                  <span>
                    Comparing {activeCourses.length} of {MAX_COMPARE} Courses
                  </span>
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
                {activeCourses.length < MAX_COMPARE && (
                  <button
                    onClick={() => setIsSelectorOpen(true)}
                    className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl bg-[#103B47] px-4 py-2 text-xs font-bold text-white transition hover:bg-[#1D5A6C] cursor-pointer"
                  >
                    <Plus className="h-4 w-4 text-[#D89A3E]" />
                    <span>
                      Add Course ({MAX_COMPARE - activeCourses.length} left)
                    </span>
                  </button>
                )}
                <button
                  onClick={() => homeModals.openLeadModal()}
                  className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl bg-[#D89A3E] px-4 py-2 text-xs font-bold text-slate-950 transition hover:bg-[#c4872f] cursor-pointer active:scale-98"
                >
                  <span>Get Course Eligibility Review</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Modal Overlay to Add Course */}
            {isSelectorOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xs">
                <div className="relative w-full max-w-lg rounded-3xl border border-[#D9CFB8] bg-[#FDFCF7] p-6 shadow-2xl animate-in fade-in zoom-in-95">
                  <div className="flex items-center justify-between border-b border-[#D9CFB8]/60 pb-4">
                    <div>
                      <h3 className="text-base font-serif font-bold text-[#103B47]">
                        Select Course / Program to Compare
                      </h3>
                      <p className="text-[11px] text-[#1D5A6C] font-medium mt-0.5">
                        {coursesPool.length} Courses Available
                      </p>
                    </div>
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
                      placeholder="Search course title or university..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full min-h-[44px] rounded-xl border border-[#D9CFB8] bg-white py-2.5 pl-10 pr-4 text-xs sm:text-sm focus:border-[#103B47] focus:outline-none focus:ring-1 focus:ring-[#103B47]"
                    />
                  </div>

                  <div className="mt-4 max-h-72 space-y-1.5 overflow-y-auto pr-1 text-xs">
                    {availableCourses.length === 0 ? (
                      <p className="py-6 text-center text-xs text-slate-400">
                        No more matching courses available.
                      </p>
                    ) : (
                      availableCourses.map((c) => (
                        <button
                          key={c.id}
                          onClick={() => addCourse(c.id)}
                          className="flex w-full items-center justify-between rounded-xl p-3 text-left transition hover:bg-white border border-[#D9CFB8]/50 bg-white/60 cursor-pointer min-h-[44px]"
                        >
                          <div>
                            <p className="font-bold text-[#103B47]">{c.name}</p>
                            <p className="text-[11px] text-slate-500">
                              {c.universityName}
                              {c.countryName && ` • ${c.countryName}`}
                            </p>
                            {isSameCourse(c) && (
                              <span className="mt-1 inline-block rounded bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700">
                                Same course
                              </span>
                            )}
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

            {/* Comparison Table */}
            <div className="overflow-x-auto rounded-3xl border border-[#D9CFB8]/80 bg-white shadow-sm">
              <table className="w-full min-w-[760px] border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-[#D9CFB8]/70 bg-[#FDFCF7]">
                    <th className="w-48 p-4 font-bold uppercase tracking-wider text-slate-400">
                      Course Parameters
                    </th>
                    {activeCourses.map((course) => (
                      <th key={course.id} className="p-4 align-top w-64">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            {course.level && (
                              <span className="inline-block rounded-md bg-[#1D5A6C]/10 border border-[#1D5A6C]/20 px-2 py-0.5 text-[10px] font-bold text-[#103B47] mb-1">
                                {course.level}
                              </span>
                            )}
                            <h4 className="font-serif font-bold text-[#103B47] text-xs leading-snug">
                              {course.name}
                            </h4>
                            <p className="mt-1 flex items-center gap-1 text-[11px] text-slate-500 font-normal">
                              {course.countryId && (
                                <CountryFlag
                                  code={course.countryId}
                                  countryName={course.countryName ?? undefined}
                                  size="sm"
                                />
                              )}
                              {course.universityName}
                            </p>
                          </div>
                          {activeCourses.length > 1 && (
                            <button
                              onClick={() => removeCourse(course.id)}
                              className="rounded-lg p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition shrink-0 cursor-pointer"
                              title="Remove course from comparison"
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
                  {/* Row 1: University & Country */}
                  <tr>
                    <td className="bg-[#FDFCF7]/60 p-4 font-bold text-[#103B47]">
                      <div className="flex items-center gap-1.5">
                        <Building2 className="h-4 w-4 text-[#1D5A6C]" />
                        <span>Institution & Location</span>
                      </div>
                    </td>
                    {activeCourses.map((c) => (
                      <td
                        key={c.id}
                        className="p-4 font-semibold text-slate-900"
                      >
                        <Link
                          href={`/universities/${c.universitySlug}`}
                          className="hover:text-[#D89A3E] transition"
                        >
                          {c.universityName}
                        </Link>
                        <span className="block text-[11px] text-slate-500 font-normal mt-0.5">
                          {locationOf(c) || <NotProvided />}
                        </span>
                      </td>
                    ))}
                  </tr>

                  {/* Row 2: Course Duration */}
                  <tr className={highlightDifferences ? "bg-[#D89A3E]/10" : ""}>
                    <td className="bg-[#FDFCF7]/60 p-4 font-bold text-[#103B47]">
                      <div className="flex items-center gap-1.5">
                        <Layers className="h-4 w-4 text-slate-500" />
                        <span>Duration</span>
                      </div>
                    </td>
                    {activeCourses.map((c) => (
                      <td
                        key={c.id}
                        className="p-4 font-bold text-slate-800 font-mono"
                      >
                        {c.duration ?? <NotProvided />}
                      </td>
                    ))}
                  </tr>

                  {/* Row 3: Tuition Fees (INR) */}
                  <tr className={highlightDifferences ? "bg-[#D89A3E]/10" : ""}>
                    <td className="bg-[#FDFCF7]/60 p-4 font-bold text-[#103B47]">
                      <div className="flex items-center gap-1.5">
                        <DollarSign className="h-4 w-4 text-emerald-600" />
                        <span>Tuition Fee (INR / yr)</span>
                      </div>
                    </td>
                    {activeCourses.map((c) => (
                      <td
                        key={c.id}
                        className="p-4 font-bold font-mono text-[#103B47] text-sm"
                      >
                        {c.yearlyTuitionINR !== null ? (
                          c.yearlyTuitionINR === 0 ? (
                            "₹0 (Tuition Free)"
                          ) : (
                            `${formatCurrency(c.yearlyTuitionINR)} / yr`
                          )
                        ) : (
                          <NotProvided />
                        )}
                      </td>
                    ))}
                  </tr>

                  {/* Row 4: IELTS Cutoff */}
                  <tr className={highlightDifferences ? "bg-[#D89A3E]/10" : ""}>
                    <td className="bg-[#FDFCF7]/60 p-4 font-bold text-[#103B47]">
                      <div className="flex items-center gap-1.5">
                        <BookOpen className="h-4 w-4 text-sky-600" />
                        <span>Min. IELTS Band</span>
                      </div>
                    </td>
                    {activeCourses.map((c) => (
                      <td key={c.id} className="p-4 font-semibold">
                        {c.ieltsMinScore !== null ? (
                          <span className="rounded-md bg-sky-50 border border-sky-200 px-2 py-0.5 text-sky-900 font-bold font-mono">
                            {c.ieltsMinScore} Overall
                          </span>
                        ) : (
                          <NotProvided />
                        )}
                      </td>
                    ))}
                  </tr>

                  {/* Row 5: GRE / GMAT Requirement */}
                  <tr className={highlightDifferences ? "bg-[#D89A3E]/10" : ""}>
                    <td className="bg-[#FDFCF7]/60 p-4 font-bold text-[#103B47]">
                      <div className="flex items-center gap-1.5">
                        <GraduationCap className="h-4 w-4 text-[#D89A3E]" />
                        <span>GRE / GMAT Policy</span>
                      </div>
                    </td>
                    {activeCourses.map((c) => (
                      <td key={c.id} className="p-4 font-medium">
                        {c.greGmatRequired === null ? (
                          <NotProvided />
                        ) : c.greGmatRequired ? (
                          <span className="inline-flex items-center gap-1 text-amber-800 font-bold bg-[#D89A3E]/15 border border-[#D89A3E]/30 px-2 py-0.5 rounded">
                            <Check className="h-3.5 w-3.5" /> Required
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                            <Check className="h-3.5 w-3.5 text-emerald-600" />{" "}
                            Waived / Optional
                          </span>
                        )}
                      </td>
                    ))}
                  </tr>

                  {/* Row 6: Post-Study Work Visa */}
                  <tr className={highlightDifferences ? "bg-[#D89A3E]/10" : ""}>
                    <td className="bg-[#FDFCF7]/60 p-4 font-bold text-[#103B47]">
                      <div className="flex items-center gap-1.5">
                        <ShieldCheck className="h-4 w-4 text-[#D89A3E]" />
                        <span>Post-Study Work Rights</span>
                      </div>
                    </td>
                    {activeCourses.map((c) => (
                      <td
                        key={c.id}
                        className="p-4 font-bold font-mono text-[#D89A3E]"
                      >
                        {c.postStudyWorkMonths !== null ? (
                          `${c.postStudyWorkMonths} Months (${Math.round(c.postStudyWorkMonths / 12)} Yrs)`
                        ) : (
                          <NotProvided />
                        )}
                      </td>
                    ))}
                  </tr>

                  {/* Row 7: Upcoming Application Deadline */}
                  <tr>
                    <td className="bg-[#FDFCF7]/60 p-4 font-bold text-[#103B47]">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-4 w-4 text-[#1D5A6C]" />
                        <span>Upcoming Deadline</span>
                      </div>
                    </td>
                    {activeCourses.map((c) => (
                      <td
                        key={c.id}
                        className="p-4 font-semibold text-slate-800"
                      >
                        {c.nextDeadline ? (
                          <>
                            {c.nextDeadline.isRolling
                              ? "Rolling"
                              : formatDateOnly(c.nextDeadline.deadlineDate)}
                            <span className="block text-[11px] font-normal text-slate-500 mt-0.5">
                              {c.nextDeadline.intakeTerm}{" "}
                              {c.nextDeadline.intakeYear} Intake
                              {c.nextDeadline.roundName &&
                                ` • ${c.nextDeadline.roundName}`}
                            </span>
                          </>
                        ) : (
                          <NotProvided />
                        )}
                      </td>
                    ))}
                  </tr>

                  {/* Row 8: ROI Score */}
                  <tr>
                    <td className="bg-[#FDFCF7]/60 p-4 font-bold text-[#103B47]">
                      <div className="flex items-center gap-1.5">
                        <Award className="h-4 w-4 text-[#D89A3E]" />
                        <span>ROI Score</span>
                      </div>
                    </td>
                    {activeCourses.map((c) => (
                      <td
                        key={c.id}
                        className="p-4 font-extrabold text-[#103B47]"
                      >
                        {c.roiScore !== null ? (
                          <span className="rounded-lg bg-[#D89A3E]/15 border border-[#D89A3E]/30 px-2.5 py-1 text-[#103B47] font-mono font-black">
                            {c.roiScore} / 100
                          </span>
                        ) : (
                          <NotProvided />
                        )}
                      </td>
                    ))}
                  </tr>

                  {/* Row 9: Key Fields of Study */}
                  <tr>
                    <td className="bg-[#FDFCF7]/60 p-4 font-bold text-[#103B47]">
                      <span>Key Fields of Study</span>
                    </td>
                    {activeCourses.map((c) => (
                      <td key={c.id} className="p-4">
                        {c.keyFields.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {c.keyFields.map((m, idx) => (
                              <span
                                key={idx}
                                className="rounded bg-[#1D5A6C]/10 border border-[#1D5A6C]/15 px-2 py-0.5 text-[10px] font-semibold text-[#103B47]"
                              >
                                {m}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <NotProvided />
                        )}
                      </td>
                    ))}
                  </tr>

                  {/* Row 10: Action CTAs */}
                  <tr className="bg-[#FDFCF7]/40">
                    <td className="bg-[#FDFCF7]/60 p-4 font-bold text-[#103B47]">
                      <span>Course Action</span>
                    </td>
                    {activeCourses.map((c) => (
                      <td key={c.id} className="p-4">
                        <div className="space-y-2">
                          <Link
                            href={`/universities/${c.universitySlug}`}
                            className="block w-full min-h-[40px] leading-[38px] rounded-xl border border-[#103B47] text-center text-xs font-bold text-[#103B47] hover:bg-[#103B47] hover:text-white transition cursor-pointer"
                          >
                            University Page
                          </Link>
                          <button
                            onClick={() =>
                              homeModals.openLeadModal(
                                c.countryName ?? undefined,
                              )
                            }
                            className="block w-full min-h-[40px] rounded-xl bg-[#D89A3E] text-center text-xs font-bold text-slate-950 hover:bg-[#c4872f] transition shadow-2xs cursor-pointer active:scale-98"
                          >
                            Review Eligibility
                          </button>
                        </div>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
