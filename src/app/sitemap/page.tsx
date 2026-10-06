import { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CountryFlag } from "@/components/ui/CountryFlag";
import {
  Compass,
  ChevronRight,
  Globe2,
  GraduationCap,
  BookOpen,
  Calculator,
  Building2,
  ShieldCheck,
  FileText,
  ArrowRight,
  Sparkles,
  Layers,
  Award,
} from "lucide-react";
import {
  fetchLiveCountries,
  fetchLivePrograms,
  fetchLiveUniversities,
  fetchTestPrepExams,
} from "@/lib/supabase/dataFetchers";
import type { TestPrepExam } from "@/types";

const TEST_PREP_SITEMAP_GROUPS: {
  category: TestPrepExam["category"];
  label: string;
  color: string;
  hover: string;
}[] = [
  {
    category: "English Proficiency",
    label: "English Language Tests",
    color: "text-blue-700",
    hover: "hover:bg-blue-50/70",
  },
  {
    category: "Graduate Admissions",
    label: "Graduate Aptitude Tests",
    color: "text-indigo-700",
    hover: "hover:bg-indigo-50/70",
  },
  {
    category: "Medical & Healthcare Licensing",
    label: "Medical & Healthcare Licensing",
    color: "text-emerald-800",
    hover: "hover:bg-emerald-50/70",
  },
];

export const metadata: Metadata = {
  title: "HTML Sitemap & Complete URL Directory | Abroadroute",
  description:
    "Comprehensive navigational sitemap and directory of all 19 country guides, 8 academic programs, 9 test prep blueprints, verified universities, and tools.",
  openGraph: {
    title: "Complete Website Sitemap | Abroadroute",
    description:
      "Comprehensive navigational sitemap and directory of all 19 country guides, 8 academic programs, 9 test prep blueprints, verified universities, and tools.",
    url: "https://abroadroute.com/sitemap",
    type: "website",
  },
};

export default async function SitemapPage() {
  const [countries, programs, universities, testPrepExams] = await Promise.all([
    fetchLiveCountries(),
    fetchLivePrograms(),
    fetchLiveUniversities(),
    fetchTestPrepExams(),
  ]);

  const tier1Countries = countries.filter((c) => c.tier === "Tier 1");
  const tier2Countries = countries.filter((c) => c.tier === "Tier 2");
  const tier3Countries = countries.filter((c) => c.tier === "Tier 3");

  return (
    <div className="min-h-screen bg-[#FDFCF7] flex flex-col justify-between">
      <Header />

      <main className="flex-1 pb-20 pt-6 sm:pt-10">
        {/* Breadcrumbs */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-6">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <Link href="/" className="hover:text-[#1D5A6C] transition">
              Home
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
            <span className="text-[#1D5A6C] font-bold">HTML Sitemap</span>
          </div>
        </div>

        {/* Hero Header */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-gradient-to-r from-[#103B47] to-[#1D5A6C] p-8 sm:p-12 text-white shadow-md">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1 text-xs font-semibold text-[#D89A3E]">
              <Compass className="h-3.5 w-3.5" />
              <span>Complete Portal Directory</span>
            </div>
            <h1 className="mt-4 font-display text-3xl sm:text-5xl font-bold text-white tracking-tight">
              Abroadroute Sitemap
            </h1>
            <p className="mt-3 text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Explore the complete structured index of all 19 global destination
              guides, 8 academic degree disciplines, 9 standardized test
              blueprints, decision tools, and institutional portals.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-4 text-xs font-medium text-slate-300">
              <span className="flex items-center gap-1.5">
                <Globe2 className="h-4 w-4 text-[#EA5C2B]" /> 19 Destinations
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <GraduationCap className="h-4 w-4 text-emerald-400" /> 8
                Disciplines
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <BookOpen className="h-4 w-4 text-amber-300" /> 9 Test Preps
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Building2 className="h-4 w-4 text-blue-300" /> Top Universities
              </span>
            </div>
          </div>
        </div>

        {/* Sitemap Directory Sections */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-12 space-y-10">
          {/* Section 1: Main Platform & Discovery Hubs */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
            <h2 className="text-lg font-bold text-[#102C57] flex items-center gap-2 border-b border-slate-100 pb-4">
              <Compass className="h-5 w-5 text-[#EA5C2B]" />
              <span>Core Portals & Admissions Hubs</span>
            </h2>
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <Link
                href="/"
                className="rounded-xl border border-slate-100 bg-slate-50 p-4 hover:border-[#102C57] hover:bg-slate-100 transition group"
              >
                <p className="font-bold text-[#102C57] group-hover:text-[#EA5C2B]">
                  Home Page
                </p>
                <p className="text-slate-500 mt-1 text-[11px]">
                  Main Discovery & AI Admissions Engine
                </p>
              </Link>
              <Link
                href="/cost-calculator"
                className="rounded-xl border border-slate-100 bg-slate-50 p-4 hover:border-[#102C57] hover:bg-slate-100 transition group"
              >
                <p className="font-bold text-[#102C57] group-hover:text-[#EA5C2B]">
                  Cost Calculator
                </p>
                <p className="text-slate-500 mt-1 text-[11px]">
                  Living Expenses & Tuition in INR
                </p>
              </Link>
              <Link
                href="/test-prep"
                className="rounded-xl border border-slate-100 bg-slate-50 p-4 hover:border-[#102C57] hover:bg-slate-100 transition group"
              >
                <p className="font-bold text-[#102C57] group-hover:text-[#EA5C2B]">
                  Test Prep Hub
                </p>
                <p className="text-slate-500 mt-1 text-[11px]">
                  9 Exams, Cutoffs & 8-Week Roadmaps
                </p>
              </Link>
              <Link
                href="/blog"
                className="rounded-xl border border-slate-100 bg-slate-50 p-4 hover:border-[#102C57] hover:bg-slate-100 transition group"
              >
                <p className="font-bold text-[#102C57] group-hover:text-[#EA5C2B]">
                  Admissions Blog
                </p>
                <p className="text-slate-500 mt-1 text-[11px]">
                  Editorial Guides & Visa Insights
                </p>
              </Link>
            </div>
          </div>

          {/* Section 2: 19 Destination Guides */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-2">
              <h2 className="text-lg font-bold text-[#102C57] flex items-center gap-2">
                <Globe2 className="h-5 w-5 text-[#EA5C2B]" />
                <span>Global Country Hubs (19 Destinations)</span>
              </h2>
              <span className="text-xs font-semibold text-slate-400">
                All 19 Destinations in Phase 1
              </span>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-8 text-xs">
              {/* Tier 1 */}
              <div>
                <p className="font-bold text-[#102C57] uppercase tracking-wider text-[11px] mb-3 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-orange-500"></span>
                  <span>Tier 1 (High Demand & PR Pathways)</span>
                </p>
                <ul className="space-y-2">
                  {tier1Countries.map((c) => (
                    <li key={c.id}>
                      <Link
                        href={`/study-in-${c.slug}`}
                        className="flex items-center justify-between rounded-lg p-2 hover:bg-slate-50 text-slate-700 hover:text-[#EA5C2B] transition"
                      >
                        <span className="font-semibold flex items-center gap-2">
                          <CountryFlag
                            code={c.code}
                            name={c.name}
                            className="h-3.5 w-5 rounded-xs border border-slate-200 shadow-2xs"
                          />
                          <span>Study in {c.name}</span>
                        </span>
                        <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Tier 2 */}
              <div>
                <p className="font-bold text-[#102C57] uppercase tracking-wider text-[11px] mb-3 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                  <span>Tier 2 (Affordable / Low-Fee Europe & Asia)</span>
                </p>
                <ul className="space-y-2">
                  {tier2Countries.map((c) => (
                    <li key={c.id}>
                      <Link
                        href={`/study-in-${c.slug}`}
                        className="flex items-center justify-between rounded-lg p-2 hover:bg-slate-50 text-slate-700 hover:text-[#EA5C2B] transition"
                      >
                        <span className="font-semibold flex items-center gap-2">
                          <CountryFlag
                            code={c.code}
                            name={c.name}
                            className="h-3.5 w-5 rounded-xs border border-slate-200 shadow-2xs"
                          />
                          <span>Study in {c.name}</span>
                        </span>
                        <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Tier 3 */}
              <div>
                <p className="font-bold text-[#102C57] uppercase tracking-wider text-[11px] mb-3 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                  <span>Tier 3 (Budget MBBS & Medical)</span>
                </p>
                <ul className="space-y-2">
                  {tier3Countries.map((c) => (
                    <li key={c.id}>
                      <Link
                        href={`/study-in-${c.slug}`}
                        className="flex items-center justify-between rounded-lg p-2 hover:bg-slate-50 text-slate-700 hover:text-[#EA5C2B] transition"
                      >
                        <span className="font-semibold flex items-center gap-2">
                          <CountryFlag
                            code={c.code}
                            name={c.name}
                            className="h-3.5 w-5 rounded-xs border border-slate-200 shadow-2xs"
                          />
                          <span>MBBS in {c.name}</span>
                        </span>
                        <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Section 3: 8 Program Disciplines */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
            <h2 className="text-lg font-bold text-[#102C57] flex items-center gap-2 border-b border-slate-100 pb-4">
              <GraduationCap className="h-5 w-5 text-[#EA5C2B]" />
              <span>Academic Degree Programs (8 Disciplines)</span>
            </h2>
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              {programs.map((p) => (
                <Link
                  key={p.id}
                  href={`/programs/${p.slug}`}
                  className="rounded-2xl border border-slate-100 bg-slate-50 p-4 hover:border-[#102C57] hover:bg-white hover:shadow-xs transition group"
                >
                  <span className="rounded-md bg-white border border-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                    {p.level}
                  </span>
                  <h3 className="mt-2.5 font-bold text-slate-900 group-hover:text-[#EA5C2B] transition">
                    {p.name}
                  </h3>
                  <p className="mt-1 text-[11px] text-slate-500">
                    Duration: {p.duration}
                  </p>
                  <p className="mt-2 text-[10px] font-medium text-[#102C57]">
                    Top: {p.topDestinations.slice(0, 3).join(", ")}
                  </p>
                </Link>
              ))}
            </div>
          </div>

          {/* Section 4: Test Preparation & Licensing Guides */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
            <h2 className="text-lg font-bold text-[#102C57] flex items-center gap-2 border-b border-slate-100 pb-4">
              <BookOpen className="h-5 w-5 text-[#EA5C2B]" />
              <span>
                Test Prep & Licensing Blueprints ({testPrepExams.length} Global Exams)
              </span>
            </h2>
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs">
              {TEST_PREP_SITEMAP_GROUPS.map((group) => (
                <div key={group.category}>
                  <p
                    className={`font-bold uppercase tracking-wider text-[11px] mb-2.5 ${group.color}`}
                  >
                    {group.label}
                  </p>
                  <ul className="space-y-2">
                    {testPrepExams
                      .filter((exam) => exam.category === group.category)
                      .map((exam) => (
                        <li key={exam.id}>
                          <Link
                            href={`/test-prep/${exam.slug}`}
                            className={`block rounded-xl p-2.5 bg-slate-50 border border-slate-100 transition ${group.hover}`}
                          >
                            <p className="font-bold text-slate-900">{exam.name}</p>
                            <p className="text-[10px] text-slate-500">
                              {[exam.conductingBody, exam.feeINR]
                                .filter(Boolean)
                                .join(" • ")}
                            </p>
                          </Link>
                        </li>
                      ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Section 5: Decision Engines & Interactive Tools */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
            <h2 className="text-lg font-bold text-[#102C57] flex items-center gap-2 border-b border-slate-100 pb-4">
              <Calculator className="h-5 w-5 text-[#EA5C2B]" />
              <span>Decision Engines & Comparison Utilities</span>
            </h2>
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <Link
                href="/cost-calculator"
                className="rounded-xl border border-slate-100 bg-slate-50 p-4 hover:border-[#102C57] hover:bg-white transition group"
              >
                <p className="font-bold text-orange-700">
                  Cost & Living Calculator
                </p>
                <p className="text-slate-500 mt-1 text-[11px]">
                  Tuition, living expenses & blocked account in ₹ INR
                </p>
              </Link>
              <Link
                href="/compare/universities"
                className="rounded-xl border border-slate-100 bg-slate-50 p-4 hover:border-[#102C57] hover:bg-white transition group"
              >
                <p className="font-bold text-blue-700">
                  University Comparison Matrix
                </p>
                <p className="text-slate-500 mt-1 text-[11px]">
                  Compare 2-5 universities by QS rank, fees, cutoffs & visas
                </p>
              </Link>
              <Link
                href="/compare/courses"
                className="rounded-xl border border-slate-100 bg-slate-50 p-4 hover:border-[#102C57] hover:bg-white transition group"
              >
                <p className="font-bold text-purple-700">
                  Course & Degree Comparator
                </p>
                <p className="text-slate-500 mt-1 text-[11px]">
                  Syllabus modules, fees, IELTS and work permit duration
                </p>
              </Link>
            </div>
          </div>

          {/* Section 6: Featured Universities */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
            <h2 className="text-lg font-bold text-[#102C57] flex items-center gap-2 border-b border-slate-100 pb-4">
              <Building2 className="h-5 w-5 text-[#EA5C2B]" />
              <span>Featured Global Universities</span>
            </h2>
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
              {universities.map((u) => (
                <Link
                  key={u.id}
                  href={`/universities/${u.slug}`}
                  className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-3.5 hover:border-[#102C57] hover:bg-white transition group"
                >
                  <div>
                    <p className="font-bold text-slate-900 group-hover:text-[#EA5C2B] transition">
                      {u.name}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {u.city}, {u.country} • Rank #{u.rankingGlobal}
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-[#EA5C2B] transition" />
                </Link>
              ))}
            </div>
          </div>

          {/* Section 7: Ecosystem Portals & User Accounts */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
            <h2 className="text-lg font-bold text-[#102C57] flex items-center gap-2 border-b border-slate-100 pb-4">
              <Layers className="h-5 w-5 text-[#EA5C2B]" />
              <span>Ecosystem Portals & User Access</span>
            </h2>
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <Link
                href="/portal/buyer"
                className="rounded-xl border border-slate-100 bg-slate-50 p-4 hover:border-[#102C57] transition group"
              >
                <p className="font-bold text-orange-700">
                  B2B Consultant Portal
                </p>
                <p className="text-slate-500 mt-1 text-[11px]">
                  Lead Marketplace & Wallet Recharge
                </p>
              </Link>
              <Link
                href="/portal/university"
                className="rounded-xl border border-slate-100 bg-slate-50 p-4 hover:border-[#102C57] transition group"
              >
                <p className="font-bold text-emerald-700">
                  University Partner Portal
                </p>
                <p className="text-slate-500 mt-1 text-[11px]">
                  Institution Catalog & Analytics
                </p>
              </Link>
              <Link
                href="/dashboard/student"
                className="rounded-xl border border-slate-100 bg-slate-50 p-4 hover:border-[#102C57] transition group"
              >
                <p className="font-bold text-blue-700">Student Dashboard</p>
                <p className="text-slate-500 mt-1 text-[11px]">
                  Saved Colleges, Shortlists & Profile
                </p>
              </Link>
              <Link
                href="/login"
                className="rounded-xl border border-slate-100 bg-slate-50 p-4 hover:border-[#102C57] transition group"
              >
                <p className="font-bold text-[#102C57]">Account Access</p>
                <p className="text-slate-500 mt-1 text-[11px]">
                  Secure Login, Signup & Reset
                </p>
              </Link>
            </div>
          </div>

          {/* Section 8: Company, Trust & Legal Compliance */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
            <h2 className="text-lg font-bold text-[#102C57] flex items-center gap-2 border-b border-slate-100 pb-4">
              <ShieldCheck className="h-5 w-5 text-emerald-600" />
              <span>Company, Trust & Legal Compliance</span>
            </h2>
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 text-xs">
              <Link
                href="/about"
                className="rounded-xl border border-slate-100 bg-slate-50 p-3 hover:bg-slate-100 font-semibold text-slate-700 hover:text-[#EA5C2B] transition"
              >
                About Us
              </Link>
              <Link
                href="/contact"
                className="rounded-xl border border-slate-100 bg-slate-50 p-3 hover:bg-slate-100 font-semibold text-slate-700 hover:text-[#EA5C2B] transition"
              >
                Contact Desk
              </Link>
              <Link
                href="/privacy-policy"
                className="rounded-xl border border-slate-100 bg-slate-50 p-3 hover:bg-slate-100 font-semibold text-slate-700 hover:text-[#EA5C2B] transition"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms-of-service"
                className="rounded-xl border border-slate-100 bg-slate-50 p-3 hover:bg-slate-100 font-semibold text-slate-700 hover:text-[#EA5C2B] transition"
              >
                Terms of Service
              </Link>
              <Link
                href="/refund-policy"
                className="rounded-xl border border-slate-100 bg-slate-50 p-3 hover:bg-slate-100 font-semibold text-slate-700 hover:text-[#EA5C2B] transition"
              >
                Refund Policy
              </Link>
              <Link
                href="/dpdp-consent"
                className="rounded-xl border border-slate-100 bg-slate-50 p-3 hover:bg-slate-100 font-semibold text-slate-700 hover:text-[#EA5C2B] transition"
              >
                DPDP Consent
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
