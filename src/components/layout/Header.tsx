"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import {
  Compass,
  Search,
  Bot,
  ChevronDown,
  Menu,
  X,
  Lock,
  User,
  LogOut,
  Calculator,
  Briefcase,
  Building2,
  ArrowRight,
  GraduationCap,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
  Clock,
  Award,
  Banknote,
} from "lucide-react";
import {
  fetchLiveUniversities,
  fetchLiveCountries,
  fetchLivePrograms,
  fetchTestPrepExams,
} from "@/lib/supabase/dataFetchers";
import { University, Country, Program, TestPrepExam } from "@/types";

type TestPrepMenuItem = Pick<TestPrepExam, "id" | "slug" | "name" | "shortName" | "category">;

const TEST_PREP_MENU_GROUPS: {
  category: TestPrepExam["category"];
  label: string;
  color: string;
}[] = [
  { category: "English Proficiency", label: "English", color: "text-[#1D5A6C]" },
  { category: "Graduate Admissions", label: "Graduate & MBA", color: "text-[#D89A3E]" },
  { category: "Medical & Healthcare Licensing", label: "Medical & Healthcare", color: "text-emerald-700" },
];
import { useAuth } from "@/lib/auth/AuthContext";
import { useHomeModals } from "@/components/home/HomeClientContext";
import { CountryFlag } from "@/components/ui/CountryFlag";
import { BrandLogo } from "@/components/ui/BrandSignatures";
import { NotProvided, show } from "@/components/tools/NotProvided";


interface HeaderProps {
  onOpenSearch?: () => void;
  onOpenAICounsellor?: () => void;
  onOpenLeadModal?: () => void;
}

export function Header({
  onOpenSearch,
  onOpenAICounsellor,
  onOpenLeadModal,
}: HeaderProps) {
  const { user, isLoggedIn, logout } = useAuth();
  const homeModals = useHomeModals();

  const handleSearch = onOpenSearch || homeModals.openSearch;
  const handleAI = onOpenAICounsellor || homeModals.openAICounsellor;
  const handleLead = onOpenLeadModal || homeModals.openLeadModal;

  const headerRef = useRef<HTMLElement>(null);
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [destinationsOpen, setDestinationsOpen] = useState(false);
  const [programsOpen, setProgramsOpen] = useState(false);
  const [universitiesOpen, setUniversitiesOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [testPrepOpen, setTestPrepOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [countriesList, setCountriesList] = useState<Country[]>([]);
  const [programsList, setProgramsList] = useState<Program[]>([]);
  const [universitiesList, setUniversitiesList] = useState<University[]>([]);
  const [testPrepExams, setTestPrepExams] = useState<TestPrepMenuItem[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock background body scroll when mobile navigation drawer is active
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
      document.body.style.touchAction = "none";
    } else {
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
    };
  }, [mobileMenuOpen]);

  const closeAllDropdowns = () => {
    setDestinationsOpen(false);
    setProgramsOpen(false);
    setUniversitiesOpen(false);
    setToolsOpen(false);
    setTestPrepOpen(false);
    setAuthOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        closeAllDropdowns();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    let isMounted = true;
    async function loadCatalog() {
      try {
        const res = await fetch("/api/catalog");
        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            if (data.countries && data.countries.length > 0)
              setCountriesList(data.countries);
            if (data.programs && data.programs.length > 0)
              setProgramsList(data.programs);
            if (data.universities && data.universities.length > 0)
              setUniversitiesList(data.universities);
            if (data.testPrepExams && data.testPrepExams.length > 0)
              setTestPrepExams(data.testPrepExams);
            return;
          }
        }
      } catch (err) {
        console.warn("Catalog fetch error:", err);
      }

      // Fallback to direct fetchers
      fetchLiveCountries().then(
        (res) => isMounted && res?.length && setCountriesList(res),
      );
      fetchLivePrograms().then(
        (res) => isMounted && res?.length && setProgramsList(res),
      );
      fetchLiveUniversities().then(
        (res) => isMounted && res?.length && setUniversitiesList(res),
      );
      fetchTestPrepExams().then(
        (res) => isMounted && res?.length && setTestPrepExams(res),
      );
    }

    loadCatalog();
    return () => {
      isMounted = false;
    };
  }, []);

  // Global Keyboard shortcut (Ctrl+K, Cmd+K, or /) to trigger search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is already typing in an input or textarea
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        handleSearch();
      } else if (e.key === "/") {
        e.preventDefault();
        handleSearch();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleSearch]);

  const anchorCountries = countriesList.filter((c) =>
    c.isAnchor,
  );
  const tier1Countries = countriesList.filter((c) => c.tier === "Tier 1");
  const tier2Countries = countriesList.filter((c) => c.tier === "Tier 2");
  const tier3Countries = countriesList.filter((c) => c.tier === "Tier 3");

  return (
    <header
      ref={headerRef}
      className="sticky top-0 z-40 w-full border-b border-[#D9CFB8]/60 bg-[#FDFCF7]/95 backdrop-blur-md transition-all"
    >
      <div className="mx-auto flex max-w-7xl h-16 items-center justify-between px-4 sm:px-6 lg:px-8 gap-4">
        {/* Brand Logo */}
        <BrandLogo
          variant="wordmark"
          theme="light"
          size="md"
          showTagline={false}
        />

        {/* Desktop Global Navigation - Clean & Refined */}
        <nav className="hidden items-center gap-5 xl:gap-7 lg:flex shrink-0 whitespace-nowrap">
          {/* Destinations Mega Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setDestinationsOpen(true)}
            onMouseLeave={() => setDestinationsOpen(false)}
          >
            <button
              onClick={() => setDestinationsOpen((prev) => !prev)}
              aria-label="Open destinations menu"
              aria-expanded={destinationsOpen}
              className="group flex items-center gap-1 py-1.5 text-[13px] font-semibold text-[#103B47] hover:text-[#1D5A6C] transition whitespace-nowrap"
            >
              <span>Destinations</span>
              {countriesList.length > 0 && (
                <span className="text-[10px] text-slate-400 font-normal">
                  ({countriesList.length})
                </span>
              )}
              <ChevronDown className="h-3.5 w-3.5 text-slate-400 group-hover:text-[#1D5A6C] transition duration-150" />
            </button>

            {destinationsOpen && (
              <div className="absolute -left-20 top-full pt-2">
                <div className="w-[620px] rounded-2xl border border-[#D9CFB8]/60 bg-white p-6 shadow-2xl">
                  <div className="grid grid-cols-3 gap-6">
                    <div>
                      <p className="mb-2.5 text-[11px] font-bold uppercase tracking-wider text-[#103B47]">
                        Tier 1
                      </p>
                      <ul className="space-y-1.5 text-xs">
                        {tier1Countries.map((c) => (
                          <li key={c.id}>
                            <Link
                              href={`/study-in-${c.slug}`}
                              className="flex items-center gap-2 text-slate-600 hover:text-[#D89A3E]"
                            >
                              <CountryFlag
                                code={c.code}
                                name={c.name}
                                className="h-3.5 w-5 object-cover rounded-xs shadow-2xs border border-slate-200"
                              />
                              <span className="font-medium">{c.name}</span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <p className="mb-2.5 text-[11px] font-bold uppercase tracking-wider text-[#103B47]">
                        Tier 2
                      </p>
                      <ul className="space-y-1.5 text-xs">
                        {tier2Countries.map((c) => (
                          <li key={c.id}>
                            <Link
                              href={`/study-in-${c.slug}`}
                              className="flex items-center gap-2 text-slate-600 hover:text-[#D89A3E]"
                            >
                              <CountryFlag
                                code={c.code}
                                name={c.name}
                                className="h-3.5 w-5 object-cover rounded-xs shadow-2xs border border-slate-200"
                              />
                              <span className="font-medium">{c.name}</span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <p className="mb-2.5 text-[11px] font-bold uppercase tracking-wider text-[#103B47]">
                        Tier 3
                      </p>
                      <ul className="space-y-1.5 text-xs">
                        {tier3Countries.map((c) => (
                          <li key={c.id}>
                            <Link
                              href={`/study-in-${c.slug}`}
                              className="flex items-center gap-2 text-slate-600 hover:text-[#D89A3E]"
                            >
                              <CountryFlag
                                code={c.code}
                                name={c.name}
                                className="h-3.5 w-5 object-cover rounded-xs shadow-2xs border border-slate-200"
                              />
                              <span className="font-medium">{c.name}</span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 2. Universities Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setUniversitiesOpen(true)}
            onMouseLeave={() => setUniversitiesOpen(false)}
          >
            <button
              onClick={() => setUniversitiesOpen((prev) => !prev)}
              aria-label="Open universities menu"
              aria-expanded={universitiesOpen}
              className="group flex items-center gap-1 py-1.5 text-[13px] font-semibold text-[#103B47] hover:text-[#1D5A6C] transition whitespace-nowrap"
            >
              <span>Universities</span>
              <span className="text-[10px] text-slate-400 font-normal">
                ({universitiesList.length || 18})
              </span>
              <ChevronDown
                className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-150 ${universitiesOpen ? "rotate-180 text-[#1D5A6C]" : ""}`}
              />
            </button>

            {universitiesOpen && (
              <div className="absolute -left-10 top-full pt-2">
                <div className="w-80 rounded-2xl border border-[#D9CFB8]/60 bg-white p-4 shadow-2xl ring-1 ring-slate-900/5">
                  <div className="mb-2 px-2 pb-2 border-b border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#103B47]">
                      Featured Institutions
                    </span>
                  </div>
                  <ul className="space-y-1 max-h-80 overflow-y-auto">
                    {universitiesList.map((u) => (
                      <li key={u.slug || u.id}>
                        <Link
                          href={`/universities/${u.slug}`}
                          className="block rounded-xl p-2 hover:bg-slate-50 transition group/uni"
                        >
                          <p className="text-xs font-bold text-[#103B47] group-hover/uni:text-[#D89A3E] transition">
                            {u.name}
                          </p>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            {show(u.rankingGlobal, (v) => `#${v}`)} Global • {show(u.country)}
                          </p>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* 3. Programs Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setProgramsOpen(true)}
            onMouseLeave={() => setProgramsOpen(false)}
          >
            <button
              onClick={() => setProgramsOpen((prev) => !prev)}
              aria-label="Open programs menu"
              aria-expanded={programsOpen}
              className="group flex items-center gap-1 py-1.5 text-[13px] font-semibold text-[#103B47] hover:text-[#1D5A6C] transition whitespace-nowrap"
            >
              <span>Programs</span>
              {programsList.length > 0 && (
                <span className="text-[10px] text-slate-400 font-normal">
                  ({programsList.length})
                </span>
              )}
              <ChevronDown
                className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-150 ${programsOpen ? "rotate-180 text-[#1D5A6C]" : ""}`}
              />
            </button>

            {programsOpen && (
              <div className="absolute left-0 top-full pt-2">
                <div className="w-72 rounded-2xl border border-[#D9CFB8]/60 bg-white p-4 shadow-2xl">
                  <ul className="space-y-1.5">
                    {programsList.map((p) => (
                      <li key={p.id}>
                        <Link
                          href={`/programs/${p.slug}`}
                          className="block rounded-xl p-2 hover:bg-slate-50 transition"
                        >
                          <p className="text-xs font-bold text-[#103B47] hover:text-[#D89A3E]">
                            {p.name}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            {show(p.duration)} • Top:{" "}
                            {p.topDestinations.slice(0, 3).join(", ")}
                          </p>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* 4. Test Prep Mega Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setTestPrepOpen(true)}
            onMouseLeave={() => setTestPrepOpen(false)}
          >
            <button
              onClick={() => setTestPrepOpen((prev) => !prev)}
              aria-label="Open test prep menu"
              aria-expanded={testPrepOpen}
              className="group flex items-center gap-1 py-1.5 text-[13px] font-semibold text-[#103B47] hover:text-[#1D5A6C] transition whitespace-nowrap"
            >
              <span>Test Prep</span>
              {testPrepExams.length > 0 && (
                <span className="text-[10px] text-slate-400 font-normal">
                  ({testPrepExams.length})
                </span>
              )}
              <ChevronDown
                className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-150 ${testPrepOpen ? "rotate-180 text-[#1D5A6C]" : ""}`}
              />
            </button>

            {testPrepOpen && (
              <div className="absolute -left-20 top-full pt-2">
                <div className="w-[520px] rounded-2xl border border-[#D9CFB8]/60 bg-white p-5 shadow-2xl ring-1 ring-slate-900/5">
                  <div className="grid grid-cols-3 gap-4">
                    {TEST_PREP_MENU_GROUPS.map((group) => {
                      const groupExams = testPrepExams.filter(
                        (e) => e.category === group.category,
                      );
                      return (
                        <div key={group.category}>
                          <p
                            className={`mb-2 text-[10px] font-bold uppercase tracking-wider ${group.color}`}
                          >
                            {group.label} ({groupExams.length})
                          </p>
                          <ul className="space-y-1 text-xs">
                            {groupExams.map((exam) => (
                              <li key={exam.id}>
                                <Link
                                  href={`/test-prep/${exam.slug}`}
                                  className="block rounded-lg p-1.5 hover:bg-slate-50 font-medium text-slate-700 hover:text-[#D89A3E]"
                                >
                                  {exam.name}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-slate-400">
                      All fees in INR & 8-week roadmaps
                    </span>
                    <Link
                      href="/test-prep"
                      className="font-bold text-[#D89A3E] hover:underline flex items-center gap-1"
                    >
                      <span>Explore Test Prep Hub →</span>
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 5. Tools Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setToolsOpen(true)}
            onMouseLeave={() => setToolsOpen(false)}
          >
            <button
              onClick={() => setToolsOpen((prev) => !prev)}
              aria-label="Open tools menu"
              aria-expanded={toolsOpen}
              className="group flex items-center gap-1 py-1.5 text-[13px] font-semibold text-[#103B47] hover:text-[#1D5A6C] transition whitespace-nowrap"
            >
              <span>Tools</span>
              <ChevronDown
                className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-150 ${toolsOpen ? "rotate-180 text-[#1D5A6C]" : ""}`}
              />
            </button>

            {toolsOpen && (
              <div className="absolute -left-8 top-full pt-2">
                <div className="w-[480px] rounded-2xl border border-[#D9CFB8]/60 bg-white p-3 shadow-2xl ring-1 ring-slate-900/5">
                  <div className="border-b border-slate-100 bg-[#FDFCF7] p-3 rounded-xl mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#103B47]">
                      Discovery & Decision Engines
                    </span>
                  </div>
                  <ul className="grid grid-cols-2 gap-1 p-2">
                    <li>
                      <Link
                        href="/cost-calculator"
                        className="flex items-center gap-2.5 rounded-xl p-2 hover:bg-slate-50 transition group/tool"
                      >
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50 text-[#D89A3E] shrink-0">
                          <Calculator className="h-3.5 w-3.5" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-[#103B47] group-hover/tool:text-[#D89A3E]">
                            Cost Calculator
                          </p>
                          <p className="text-[10px] text-slate-400">
                            INR Tuition & Living
                          </p>
                        </div>
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/compare/universities"
                        className="flex items-center gap-2.5 rounded-xl p-2 hover:bg-slate-50 transition group/tool"
                      >
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-50 text-[#1D5A6C] shrink-0">
                          <Building2 className="h-3.5 w-3.5" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-[#103B47] group-hover/tool:text-[#1D5A6C]">
                            Compare Universities
                          </p>
                          <p className="text-[10px] text-slate-400">
                            Up to 5 side-by-side
                          </p>
                        </div>
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/compare/courses"
                        className="flex items-center gap-2.5 rounded-xl p-2 hover:bg-slate-50 transition group/tool"
                      >
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-50 text-[#7C6BAE] shrink-0">
                          <GraduationCap className="h-3.5 w-3.5" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-[#103B47] group-hover/tool:text-[#7C6BAE]">
                            Compare Courses
                          </p>
                          <p className="text-[10px] text-slate-400">
                            Fees, IELTS & modules
                          </p>
                        </div>
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/roi-calculator"
                        className="flex items-center gap-2.5 rounded-xl p-2 hover:bg-slate-50 transition group/tool"
                      >
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 shrink-0">
                          <TrendingUp className="h-3.5 w-3.5" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-[#103B47] group-hover/tool:text-emerald-700">
                            EMBA ROI Calculator
                          </p>
                          <p className="text-[10px] text-slate-400">
                            Payback & 10Y Gain
                          </p>
                        </div>
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/deadline-tracker"
                        className="flex items-center gap-2.5 rounded-xl p-2 hover:bg-slate-50 transition group/tool"
                      >
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-700 shrink-0">
                          <Clock className="h-3.5 w-3.5" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-[#103B47] group-hover/tool:text-indigo-700">
                            Deadline Tracker
                          </p>
                          <p className="text-[10px] text-slate-400">
                            90-Day Intake Alerts
                          </p>
                        </div>
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/scholarships"
                        className="flex items-center gap-2.5 rounded-xl p-2 hover:bg-slate-50 transition group/tool"
                      >
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50 text-[#D89A3E] shrink-0">
                          <Award className="h-3.5 w-3.5" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-[#103B47] group-hover/tool:text-[#D89A3E]">
                            Scholarship Finder
                          </p>
                          <p className="text-[10px] text-slate-400">
                            Match grants to your profile
                          </p>
                        </div>
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/eligibility-checker"
                        className="flex items-center gap-2.5 rounded-xl p-2 hover:bg-slate-50 transition group/tool"
                      >
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-50 text-[#1D5A6C] shrink-0">
                          <ShieldCheck className="h-3.5 w-3.5" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-[#103B47] group-hover/tool:text-[#1D5A6C]">
                            Eligibility Checker
                          </p>
                          <p className="text-[10px] text-slate-400">
                            Safe, Target & Reach
                          </p>
                        </div>
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/loan-calculator"
                        className="flex items-center gap-2.5 rounded-xl p-2 hover:bg-slate-50 transition group/tool"
                      >
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-50 text-rose-700 shrink-0">
                          <Banknote className="h-3.5 w-3.5" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-[#103B47] group-hover/tool:text-rose-700">
                            Loan EMI Calculator
                          </p>
                          <p className="text-[10px] text-slate-400">
                            Compare lender rates & EMI
                          </p>
                        </div>
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* 6. Blog & Guides */}
          <Link
            href="/blog"
            className="py-1.5 text-[13px] font-semibold text-[#103B47] hover:text-[#1D5A6C] transition whitespace-nowrap"
          >
            Blog & Guides
          </Link>
        </nav>

        {/* Right CTA Actions - Cleaned & Streamlined */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          {/* Compact Search Trigger */}
          <button
            onClick={handleSearch}
            aria-label="Search"
            className="flex items-center gap-1.5 rounded-full border border-[#D9CFB8] bg-[#FDFCF7] px-3.5 py-1.5 text-xs text-slate-600 hover:border-[#1D5A6C] hover:text-[#103B47] transition cursor-pointer shrink-0 shadow-2xs"
            title="Search universities, courses, programs"
          >
            <Search className="h-3.5 w-3.5 text-[#1D5A6C] shrink-0" />
            <span className="hidden sm:inline font-medium text-slate-700 text-xs">
              Search
            </span>
          </button>

          {/* User Auth state & 4 Portals Dropdown */}
          {isLoggedIn ? (
            <div className="flex items-center gap-2 shrink-0">
              <Link
                href={
                  user?.role === "buyer"
                    ? "/portal/buyer"
                    : user?.role === "university"
                      ? "/portal/university"
                      : user?.role === "admin"
                        ? "/admin"
                        : "/dashboard/student"
                }
                className="flex items-center gap-2 rounded-full border border-[#D9CFB8] bg-white px-3.5 py-1.5 text-xs font-bold text-[#103B47] hover:bg-slate-50 transition shrink-0 shadow-2xs"
                title={`Logged in as ${user?.name || user?.email}`}
              >
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#1D5A6C]/10 text-[#1D5A6C] font-extrabold text-[11px] shrink-0">
                  {user?.name ? (
                    user.name.trim().charAt(0).toUpperCase()
                  ) : (
                    <User className="h-3 w-3 text-[#1D5A6C]" />
                  )}
                </div>
                <span className="font-bold whitespace-nowrap max-w-[150px] truncate">
                  {user?.name || user?.email?.split("@")[0] || "My Account"}
                </span>
                {user?.role && user.role !== "student" && (
                  <span className="rounded-md bg-indigo-50 px-1.5 py-0.5 text-[10px] font-extrabold text-indigo-700 capitalize shrink-0 border border-indigo-100/60">
                    {user.role === "buyer" ? "B2B" : user.role}
                  </span>
                )}
              </Link>
              <button
                onClick={logout}
                aria-label="Sign out"
                className="rounded-full p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition shrink-0 cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div
              className="relative hidden sm:block"
              onMouseEnter={() => setAuthOpen(true)}
              onMouseLeave={() => setAuthOpen(false)}
            >
              <button
                onClick={() => setAuthOpen((prev) => !prev)}
                aria-label="Open portals and login menu"
                aria-expanded={authOpen}
                className="flex items-center gap-1.5 rounded-full bg-[#1D5A6C] px-4 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-[#103B47] active:scale-98"
              >
                <User className="h-3.5 w-3.5 text-white" />
                <span>Portals & Login</span>
                <ChevronDown
                  className={`h-3 w-3 text-white/80 transition-transform duration-150 ${authOpen ? "rotate-180" : ""}`}
                />
              </button>

              {authOpen && (
                <div className="absolute right-0 top-full pt-2">
                  <div className="w-80 rounded-2xl border border-[#D9CFB8]/60 bg-white p-3 shadow-2xl ring-1 ring-slate-900/5">
                    <div className="mb-2 px-2 pb-2 border-b border-slate-100 flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#103B47]">
                        Portals & Sign In
                      </span>
                      <Link
                        href="/signup"
                        className="text-[10px] font-bold text-[#D89A3E] hover:underline"
                      >
                        Register Free →
                      </Link>
                    </div>

                    <div className="space-y-1">
                      {/* Portal 1: Student Dashboard */}
                      <Link
                        href="/login"
                        className="flex items-start gap-2.5 rounded-xl p-2 hover:bg-slate-50 transition group/item"
                      >
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-[#D89A3E] mt-0.5">
                          <User className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-[#103B47] group-hover/item:text-[#D89A3E]">
                              Student Dashboard
                            </span>
                            <span className="rounded bg-amber-100 px-1 py-0.2 text-[9px] font-bold text-[#103B47]">
                              Aspirants
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400">
                            Shortlists, applications & AI chat history
                          </p>
                        </div>
                      </Link>

                      {/* Portal 2: B2B Consultant Portal */}
                      <Link
                        href="/portal/buyer"
                        className="flex items-start gap-2.5 rounded-xl p-2 hover:bg-slate-50 transition group/item"
                      >
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-[#1D5A6C] mt-0.5">
                          <Briefcase className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-[#103B47] group-hover/item:text-[#1D5A6C]">
                              B2B Consultant Portal
                            </span>
                            <span className="rounded bg-teal-100 px-1 py-0.2 text-[9px] font-bold text-[#103B47]">
                              Consultants
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400">
                            Lead marketplace feed & wallet top-up
                          </p>
                        </div>
                      </Link>

                      {/* Portal 3: University Partner Portal */}
                      <Link
                        href="/portal/university"
                        className="flex items-start gap-2.5 rounded-xl p-2 hover:bg-slate-50 transition group/item"
                      >
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 mt-0.5">
                          <Building2 className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-[#103B47] group-hover/item:text-emerald-700">
                              University Portal
                            </span>
                            <span className="rounded bg-emerald-100 px-1 py-0.2 text-[9px] font-bold text-emerald-700">
                              Partners
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400">
                            Manage listings, programs & analytics
                          </p>
                        </div>
                      </Link>
                    </div>

                    <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs px-2">
                      <Link
                        href="/login"
                        className="font-bold text-[#103B47] hover:underline"
                      >
                        Standard Sign In →
                      </Link>
                      <Link
                        href="/signup"
                        className="font-bold text-[#D89A3E] hover:underline"
                      >
                        Create Account
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Mobile Menu Toggle (44px touch target per NFR-USE-021) */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-slate-200 text-slate-700 lg:hidden cursor-pointer active:scale-95 transition"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer (W10 Template Standard: Slide-over Drawer with Flag Badges & Ecosystem Portals) */}
      {mounted &&
        mobileMenuOpen &&
        createPortal(
          <div className="fixed inset-0 z-[100] flex flex-col bg-[#FDFCF7] lg:hidden overflow-y-auto">
            {/* Mobile Drawer Top Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#D9CFB8]/60 bg-[#FDFCF7]/98 px-4 py-3 backdrop-blur-md shadow-xs">
              <div onClick={() => setMobileMenuOpen(false)}>
                <BrandLogo
                  variant="wordmark"
                  theme="light"
                  size="sm"
                  showTagline={false}
                />
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-[#D9CFB8] bg-white text-[#103B47] hover:bg-[#F4EFE6] transition active:scale-95 cursor-pointer shadow-2xs"
                aria-label="Close Mobile Navigation Drawer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Mobile Drawer Main Scroll Area */}
            <div className="flex-1 p-4 space-y-6 pb-6 bg-[#FDFCF7]">
              {/* Search Trigger */}
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleSearch();
                }}
                className="w-full flex items-center gap-2.5 rounded-xl border border-[#D9CFB8] bg-white px-3.5 py-2.5 text-xs text-[#5C6E67] shadow-2xs hover:border-[#1D5A6C] transition text-left"
              >
                <Search className="h-4 w-4 text-[#8C9B90]" />
                <span className="font-medium text-[#103B47]">
                  Search universities, courses, programs...
                </span>
              </button>

              {/* 1. AI Counsellor Banner */}
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleAI();
                }}
                className="w-full text-left rounded-2xl bg-gradient-to-r from-[#103B47] to-[#1D5A6C] p-4 text-white shadow-md relative overflow-hidden group border border-[#103B47]"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-[#D89A3E] backdrop-blur-sm border border-white/10">
                      <Bot className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white font-serif">
                          ✦ Route AI Counsellor
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#D89A3E]/20 px-2 py-0.5 text-[9px] font-bold text-[#E5B56E] border border-[#D89A3E]/30">
                          <span className="h-1.5 w-1.5 rounded-full bg-[#D89A3E] animate-pulse" />
                          24/7 Live
                        </span>
                      </div>
                      <p className="text-[11px] text-[#A8CDBD] mt-0.5">
                        Instant eligibility, fee calculation & university
                        shortlists
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-white/70 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>

              {/* 2. Anchor Destinations & 19 Countries */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#103B47]">
                    Primary Destinations
                    {countriesList.length > 0 &&
                      ` (${countriesList.length} Countries)`}
                  </h3>
                  <Link
                    href="/#destinations-grid"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-[11px] font-bold text-[#1D5A6C] hover:underline"
                  >
                    View All →
                  </Link>
                </div>

                {/* Anchor Six Grid Cards */}
                <div className="grid grid-cols-2 gap-2">
                  {anchorCountries.map((c) => (
                    <Link
                      key={c.id}
                      href={`/study-in-${c.slug}`}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2.5 rounded-xl border border-[#D9CFB8]/70 bg-white p-2.5 hover:border-[#1D5A6C] transition shadow-2xs"
                    >
                      <CountryFlag code={c.code} name={c.name} size="sm" />
                      <div className="overflow-hidden">
                        <p className="text-xs font-bold text-[#103B47] truncate">
                          {c.name}
                        </p>
                        <p className="text-[10px] text-[#5C6E67] truncate">
                          {show(c.avgTuitionINR)}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>

                {/* Secondary Tier 2 & Tier 3 quick chips */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {tier2Countries
                    .slice(0, 4)
                    .concat(tier3Countries.slice(0, 3))
                    .map((c) => (
                      <Link
                        key={c.id}
                        href={`/study-in-${c.slug}`}
                        onClick={() => setMobileMenuOpen(false)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-[#D9CFB8] bg-white px-2.5 py-1 text-[11px] font-semibold text-[#103B47] hover:border-[#1D5A6C]"
                      >
                        <CountryFlag code={c.code} name={c.name} size="sm" />
                        <span>{c.name}</span>
                      </Link>
                    ))}
                </div>
              </div>

              {/* 3. Study Programs & Disciplines */}
              <div className="space-y-2.5 pt-2 border-t border-[#D9CFB8]/60">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#103B47]">
                  Study Streams
                  {programsList.length > 0 &&
                    ` (${programsList.length} Disciplines)`}
                </h3>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {programsList.map((p) => (
                    <Link
                      key={p.id}
                      href={`/programs/${p.slug}`}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2 rounded-xl border border-[#D9CFB8]/50 bg-white p-2.5 hover:border-[#1D5A6C] hover:bg-[#F4EFE6]/50 transition"
                    >
                      <GraduationCap className="h-4 w-4 text-[#1D5A6C] shrink-0" />
                      <span className="font-semibold text-[#103B47] truncate">
                        {p.name}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>

              {/* 4. Interactive Student Tools */}
              <div className="space-y-2.5 pt-2 border-t border-[#D9CFB8]/60">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#103B47]">
                  Discovery Tools & Matrices
                </h3>
                <div className="grid grid-cols-1 gap-2 text-xs">
                  <Link
                    href="/cost-calculator"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 rounded-xl border border-[#D9CFB8]/70 bg-white p-3 shadow-2xs hover:border-[#1D5A6C] transition"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#D89A3E]/15 text-[#D89A3E]">
                      <Calculator className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-bold text-[#103B47]">
                        INR Tuition & Living Calculator
                      </p>
                      <p className="text-[10px] text-[#5C6E67]">
                        Living costs, rent & tuition converted to INR
                      </p>
                    </div>
                  </Link>

                  <Link
                    href="/compare/universities"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 rounded-xl border border-[#D9CFB8]/70 bg-white p-3 shadow-2xs hover:border-[#1D5A6C] transition"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1D5A6C]/15 text-[#1D5A6C]">
                      <Building2 className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-bold text-[#103B47]">
                        University Compare Matrix
                      </p>
                      <p className="text-[10px] text-[#5C6E67]">
                        Side-by-side comparison for up to 5 universities
                      </p>
                    </div>
                  </Link>

                  <Link
                    href="/compare/courses"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 rounded-xl border border-[#D9CFB8]/70 bg-white p-3 shadow-2xs hover:border-[#1D5A6C] transition"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#7C6BAE]/15 text-[#7C6BAE]">
                      <GraduationCap className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-bold text-[#103B47]">
                        Course & Degree Compare Matrix
                      </p>
                      <p className="text-[10px] text-[#5C6E67]">
                        Fees, IELTS cutoffs & work permit rights
                      </p>
                    </div>
                  </Link>

                  <Link
                    href="/roi-calculator"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 rounded-xl border border-[#D9CFB8]/70 bg-white p-3 shadow-2xs hover:border-[#1D5A6C] transition"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                      <TrendingUp className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-bold text-[#103B47]">
                        EMBA ROI Calculator
                      </p>
                      <p className="text-[10px] text-[#5C6E67]">
                        Break-even payback & 10-year cumulative gain
                      </p>
                    </div>
                  </Link>

                  <Link
                    href="/deadline-tracker"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 rounded-xl border border-[#D9CFB8]/70 bg-white p-3 shadow-2xs hover:border-[#1D5A6C] transition"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-700">
                      <Clock className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-bold text-[#103B47]">
                        Intake Deadline Tracker
                      </p>
                      <p className="text-[10px] text-[#5C6E67]">
                        90, 60, 30-day countdowns & reminders
                      </p>
                    </div>
                  </Link>

                  <Link
                    href="/scholarships"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 rounded-xl border border-[#D9CFB8]/70 bg-white p-3 shadow-2xs hover:border-[#1D5A6C] transition"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#D89A3E]/15 text-[#D89A3E]">
                      <Award className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-bold text-[#103B47]">
                        Scholarship Finder
                      </p>
                      <p className="text-[10px] text-[#5C6E67]">
                        Match scholarships and grants to your profile
                      </p>
                    </div>
                  </Link>

                  <Link
                    href="/eligibility-checker"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 rounded-xl border border-[#D9CFB8]/70 bg-white p-3 shadow-2xs hover:border-[#1D5A6C] transition"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1D5A6C]/15 text-[#1D5A6C]">
                      <ShieldCheck className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-bold text-[#103B47]">
                        Admission Eligibility Checker
                      </p>
                      <p className="text-[10px] text-[#5C6E67]">
                        Safe, Target & Reach acceptance probability
                      </p>
                    </div>
                  </Link>

                  <Link
                    href="/loan-calculator"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 rounded-xl border border-[#D9CFB8]/70 bg-white p-3 shadow-2xs hover:border-[#1D5A6C] transition"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#B8593E]/15 text-[#B8593E]">
                      <Banknote className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-bold text-[#103B47]">
                        Education Loan & EMI Calculator
                      </p>
                      <p className="text-[10px] text-[#5C6E67]">
                        Compare lender interest rates and EMIs
                      </p>
                    </div>
                  </Link>
                </div>
              </div>

              {/* 5. 4 Ecosystem Portals & User Auth */}
              <div className="space-y-2.5 pt-2 border-t border-[#D9CFB8]/60">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#103B47]">
                  Portals & User Access
                </h3>
                {isLoggedIn ? (
                  <div className="flex items-center justify-between p-3 rounded-xl bg-[#103B47] text-white">
                    <div className="flex items-center gap-2.5">
                      <User className="h-4 w-4 text-[#D89A3E]" />
                      <div>
                        <p className="text-xs font-bold text-white">
                          {user?.name || user?.email}
                        </p>
                        <p className="text-[10px] text-[#A8CDBD] capitalize">
                          Role: {user?.role}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        logout();
                        setMobileMenuOpen(false);
                      }}
                      className="text-xs font-bold text-rose-300 hover:underline cursor-pointer"
                    >
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <Link
                      href="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex flex-col items-start gap-1 p-3 rounded-xl border border-[#D9CFB8] bg-white hover:border-[#1D5A6C]"
                    >
                      <span className="font-bold text-[#103B47]">
                        Student Login
                      </span>
                      <span className="text-[10px] text-[#5C6E67]">
                        Dashboard & AI history
                      </span>
                    </Link>
                    <Link
                      href="/portal/buyer"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex flex-col items-start gap-1 p-3 rounded-xl border border-[#D9CFB8] bg-white hover:border-[#1D5A6C]"
                    >
                      <span className="font-bold text-[#1D5A6C]">
                        B2B Consultant
                      </span>
                      <span className="text-[10px] text-[#5C6E67]">
                        Lead marketplace feed
                      </span>
                    </Link>
                    <Link
                      href="/portal/university"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex flex-col items-start gap-1 p-3 rounded-xl border border-[#D9CFB8] bg-white hover:border-[#1D5A6C]"
                    >
                      <span className="font-bold text-[#103B47]">
                        University Portal
                      </span>
                      <span className="text-[10px] text-[#5C6E67]">
                        Institution profiles
                      </span>
                    </Link>
                    <Link
                      href="/signup"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex flex-col items-start gap-1 p-3 rounded-xl bg-[#103B47] text-white hover:bg-[#1D5A6C]"
                    >
                      <span className="font-bold text-[#D89A3E]">
                        Create Account
                      </span>
                      <span className="text-[10px] text-[#A8CDBD]">
                        Free student registration
                      </span>
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile Drawer Bottom Fixed CTA */}
            <div className="sticky bottom-0 left-0 right-0 z-20 border-t border-[#D9CFB8]/80 bg-[#FDFCF7] p-4 shadow-lg">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLead();
                }}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#1D5A6C] py-3 text-sm font-bold text-white shadow-md active:scale-98 hover:bg-[#103B47] transition cursor-pointer"
              >
                <span>Book Free Consultation Call</span>
                <ArrowRight className="h-4 w-4 text-[#D89A3E]" />
              </button>
            </div>
          </div>,
          document.body,
        )}
    </header>
  );
}
