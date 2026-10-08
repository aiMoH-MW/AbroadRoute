import { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Hero } from "@/components/home/Hero";
import { CountryGrid } from "@/components/home/CountryGrid";
import { ProgramStreamGrid } from "@/components/home/ProgramStreamGrid";
import { TestPrepShowcase } from "@/components/home/TestPrepShowcase";
import { DeferredCostCalculator } from "@/components/home/HomeInteractiveSections";
import { Footer } from "@/components/layout/Footer";
import {
  Bot,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Banknote,
  Award,
  ArrowRight,
  Calendar,
  TrendingUp,
  Scale,
} from "lucide-react";
import { FeaturedUniversities } from "@/components/home/FeaturedUniversities";
import {
  LeadTriggerButton,
  AICounsellorTriggerButton,
} from "@/components/home/HomeClientContext";

// Destinations and partner universities are read from Supabase on every
// request. Without this the homepage is prerendered at build time and the
// backend data would be frozen into static HTML.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title:
    "Abroadroute | Authoritative International Education Discovery Portal",
  description:
    "Compare 19 global destinations and 8 career disciplines for Indian students. Discover tuition in INR, post-study visas, and verified university rankings.",
};

interface ArticlePreview {
  _id: string;
  title: string;
  slug: string;
  tag: string;
  excerpt: string;
  date: string;
  readTime: string;
}

const FALLBACK_ARTICLES: ArticlePreview[] = [
  {
    _id: "fb-1",
    title:
      "Germany Ausbildung 2027: Complete Dual Vocational Guide for Indian Students",
    slug: "germany-ausbildung-2027-guide",
    tag: "Germany • Vocational",
    readTime: "6 min read",
    excerpt:
      "How to secure €1,100/month monthly stipend with 0 tuition in German hospitals and tech firms.",
    date: "Sep 2026",
  },
  {
    _id: "fb-2",
    title:
      "NMC Foreign Medical Graduate Regulations: Essential Checklist for MBBS Abroad",
    slug: "nmc-fmgl-regulations-mbbs-abroad-checklist",
    tag: "Medical • NMC Guidelines",
    readTime: "8 min read",
    excerpt:
      "54-month course duration, 12-month internship, and CRMI clinical guidelines you must know before applying.",
    date: "Sep 2026",
  },
  {
    _id: "fb-3",
    title:
      "UK Graduate Route vs Canada PGWP: Work Visa Rights Comparison in 2026-2027",
    slug: "uk-graduate-route-vs-canada-pgwp-comparison",
    tag: "Visa • Immigration",
    readTime: "5 min read",
    excerpt:
      "An in-depth breakdown of current visa tenure, PR eligibility, and post-study employment trends.",
    date: "Aug 2026",
  },
  {
    _id: "fb-4",
    title:
      "How to Build a High-Probability SOP for Top US & German Universities",
    slug: "how-to-write-winning-sop-us-germany",
    tag: "Admissions • Prep",
    readTime: "7 min read",
    excerpt:
      "The 5 critical elements admissions committees evaluate in Indian engineering and MBA applicants.",
    date: "Aug 2026",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* Top Header */}
      <Header />

      <main>
        {/* Hero Section */}
        <Hero />

        {/* 19 Destinations Grid (Server Rendered) */}
        <div id="destinations-grid">
          <CountryGrid />
        </div>

        {/* 8 Programs Disciplines Grid (Server Rendered) */}
        <div id="programs-grid">
          <ProgramStreamGrid />
        </div>

        {/* Featured Universities Section - fetched from backend */}
        <FeaturedUniversities />

        {/* Test Prep & Global Licensing Hub (Server Rendered) */}
        <TestPrepShowcase />

        {/* Interactive Cost Calculator */}
        <DeferredCostCalculator />

        {/* AI Counsellor Showcase (Per Document W10 & W11 DOCX Specifications) */}
        <section className="cv-auto relative overflow-hidden bg-gradient-to-br from-[#103B47] via-[#103B47] to-[#0D2F39] border-y border-[#1D5A6C]/30 py-20 text-white">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#D89A3E_1px,transparent_1px)] [background-size:24px_24px] opacity-10" />
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
              <div className="lg:col-span-6">
                <div className="inline-flex items-center gap-2 rounded-full border border-[#7C6BAE]/40 bg-[#7C6BAE]/15 px-3.5 py-1 text-[11px] font-sans font-medium uppercase tracking-[0.28em] text-[#EBC783]">
                  <span className="text-[#D89A3E] font-bold">✦</span>
                  Route AI Counsellor
                </div>
                <h2 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                  Ask anything. Get instant, personalized answers.
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-slate-300 font-sans">
                  24/7 admissions guidance, context-aware, zero sales bias. Trained on verified university data, official visa rules, and current fee structures.
                </p>

                <div className="mt-6 flex flex-wrap gap-4 text-xs font-semibold text-slate-200 font-sans">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-[#A8CDBD]" />
                    Real-time INR conversion
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-[#A8CDBD]" />
                    Post-study work rights
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-[#A8CDBD]" />
                    Zero sales bias
                  </div>
                </div>

                <div className="mt-8 flex flex-wrap items-center gap-4">
                  <AICounsellorTriggerButton className="inline-flex items-center gap-2 rounded-full bg-[#D89A3E] px-6 py-3.5 text-xs font-bold text-[#103B47] shadow-xl transition hover:bg-[#EBC783] hover:scale-102">
                    <span className="text-base font-bold">✦</span>
                    Start Free Route AI Chat →
                  </AICounsellorTriggerButton>
                  <span className="text-[11px] text-slate-400 font-mono">
                    Member access • 24/7 Route AI ready
                  </span>
                </div>
              </div>

              {/* Chat Interface Mockup */}
              <div className="lg:col-span-6">
                <div className="rounded-3xl border border-white/20 bg-[#0D2F39] sm:bg-[#0D2F39]/90 border border-white/15 p-5 shadow-2xl sm:p-7">
                  <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#7C6BAE]/30 border border-[#7C6BAE]/40 text-[#D89A3E] font-bold text-base shadow-inner">
                        ✦
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">
                          ✦ Route AI Admissions Assistant
                        </p>
                        <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>{" "}
                          Online & Ready
                        </span>
                      </div>
                    </div>
                    <span className="rounded-full bg-[#7C6BAE]/20 border border-[#7C6BAE]/30 px-2.5 py-1 text-[10px] font-semibold text-[#EBC783] flex items-center gap-1">
                      ✦ Route AI Engine
                    </span>
                  </div>

                  <div className="mt-5 space-y-3.5 text-xs">
                    {/* User Question */}
                    <div className="flex justify-end">
                      <div className="max-w-[85%] rounded-2xl rounded-tr-none bg-[#1D5A6C] px-4 py-2.5 text-white shadow-sm font-medium">
                        What are the best UK universities for MSc Data Science?
                      </div>
                    </div>

                    {/* AI Answer */}
                    <div className="flex justify-start">
                      <div className="max-w-[90%] rounded-2xl rounded-tl-none border border-white/15 bg-[#103B47]/90 px-4 py-3 text-slate-100">
                        <p className="font-semibold text-[#D89A3E]">
                          Top UK Universities for MSc Data Science (2026-2027):
                        </p>
                        <ul className="mt-2 space-y-1 text-[11px] text-slate-300">
                          <li>
                            • <strong>University of Oxford:</strong> £33,970/yr
                            | 2-Yr Graduate Work Visa
                          </li>
                          <li>
                            • <strong>Imperial College London:</strong>{" "}
                            £39,800/yr | High AI Placement
                          </li>
                          <li>
                            • <strong>University of Edinburgh:</strong>{" "}
                            £35,900/yr | Strong Research Focus
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <AICounsellorTriggerButton
                    initialQuery="What are the best UK universities for MSc Data Science?"
                    className="mt-5 flex w-full items-center justify-between rounded-xl border border-white/20 bg-white/5 px-4 py-2.5 text-left text-xs text-slate-300 hover:bg-white/10 transition"
                  >
                    <span>
                      Ask sample question: &apos;What are the best UK
                      universities for MSc Data Science?&apos;
                    </span>
                    <Sparkles className="h-4 w-4 text-[#D89A3E]" />
                  </AICounsellorTriggerButton>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Tools Grid (Per Document W10 T-01: 6 Interactive Decision Tools in 3-col grid) */}
        <section className="cv-auto bg-slate-50 py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
              <div>
                <div className="inline-flex items-center gap-1.5 rounded-full bg-[#103B47]/10 px-3 py-1 text-xs font-bold text-[#103B47]">
                  Student Utilities
                </div>
                <h2 className="mt-2.5 font-serif text-3xl font-extrabold tracking-tight text-[#103B47] sm:text-4xl">
                  Tools Built for Decisions
                </h2>
                <p className="mt-2 text-sm text-slate-600">
                  Interactive utilities designed to calculate real expenses,
                  model career ROI, and progressively qualify your profile.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href="/compare"
                  className="rounded-xl bg-[#103B47] px-4 py-2 text-xs font-bold text-white hover:bg-[#0c2242] transition shadow-xs flex items-center gap-1"
                >
                  <span>Compare Universities Matrix</span>
                  <ArrowRight className="h-3.5 w-3.5 text-[#D89A3E]" />
                </Link>
                <Link
                  href="/cost-calculator"
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-[#103B47] hover:bg-slate-100 transition shadow-xs"
                >
                  Cost Calculator →
                </Link>
              </div>
            </div>

            <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {/* Tool 1 */}
              <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-lg transition group">
                <div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-[#D89A3E]">
                    <Banknote className="h-6 w-6" />
                  </div>
                  <h3 className="mt-4 text-base font-black text-[#103B47] group-hover:text-[#D89A3E] transition">
                    Cost Calculator
                  </h3>
                  <p className="mt-2 text-xs text-slate-500 leading-relaxed">
                    Estimate tuition fees and living costs by university,
                    program and city in ₹ Lakhs.
                  </p>
                </div>
                <Link
                  href="/cost-calculator"
                  className="mt-5 inline-flex items-center gap-1.5 text-xs font-bold text-[#D89A3E] group-hover:translate-x-0.5 transition"
                >
                  Open Cost Calculator →
                </Link>
              </div>

              {/* Tool 2 */}
              <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-lg transition group">
                <div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                    <Scale className="h-6 w-6" />
                  </div>
                  <h3 className="mt-4 text-base font-black text-[#103B47] group-hover:text-[#D89A3E] transition">
                    Compare Universities
                  </h3>
                  <p className="mt-2 text-xs text-slate-500 leading-relaxed">
                    Save up to 4 global institutions and compare tuition fees,
                    IELTS cutoffs, QS rankings, and post-study work visas side
                    by side.
                  </p>
                </div>
                <Link
                  href="/compare"
                  className="mt-5 inline-flex items-center gap-1.5 text-xs font-bold text-[#D89A3E] group-hover:translate-x-0.5 transition text-left"
                >
                  Open University Comparator →
                </Link>
              </div>

              {/* Tool 3 - EMBA ROI Calculator per Doc 1 v2.0 */}
              <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-lg transition group">
                <div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                    <TrendingUp className="h-6 w-6" />
                  </div>
                  <h3 className="mt-4 text-base font-black text-[#103B47] group-hover:text-[#D89A3E] transition">
                    EMBA / Masters ROI Calculator
                  </h3>
                  <p className="mt-2 text-xs text-slate-500 leading-relaxed">
                    Model 5-year career payback timelines, pre- vs post-degree
                    salary bumps, and tax-adjusted take-home earnings across
                    Tier 1 countries.
                  </p>
                </div>
                <LeadTriggerButton className="mt-5 inline-flex items-center gap-1.5 text-xs font-bold text-[#D89A3E] group-hover:translate-x-0.5 transition text-left">
                  Model 5-Year ROI →
                </LeadTriggerButton>
              </div>

              {/* Tool 4 */}
              <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-lg transition group">
                <div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700">
                    <Award className="h-6 w-6" />
                  </div>
                  <h3 className="mt-4 text-base font-black text-[#103B47] group-hover:text-[#D89A3E] transition">
                    Eligibility Checker
                  </h3>
                  <p className="mt-2 text-xs text-slate-500 leading-relaxed">
                    Check admission readiness: match your 10th, 12th,
                    undergraduate GPA, and IELTS/GRE test scores with realistic
                    university brackets.
                  </p>
                </div>
                <LeadTriggerButton className="mt-5 inline-flex items-center gap-1.5 text-xs font-bold text-[#D89A3E] group-hover:translate-x-0.5 transition text-left">
                  Check Admission Readiness →
                </LeadTriggerButton>
              </div>

              {/* Tool 5 */}
              <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-lg transition group">
                <div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 text-purple-700">
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                  <h3 className="mt-4 text-base font-black text-[#103B47] group-hover:text-[#D89A3E] transition">
                    Loan Pre-Approval
                  </h3>
                  <p className="mt-2 text-xs text-slate-500 leading-relaxed">
                    Explore collateral and non-collateral education financing,
                    interest rate comparisons, and loan sanctions with top
                    Indian banking partners.
                  </p>
                </div>
                <LeadTriggerButton className="mt-5 inline-flex items-center gap-1.5 text-xs font-bold text-[#D89A3E] group-hover:translate-x-0.5 transition text-left">
                  Explore Education Loans →
                </LeadTriggerButton>
              </div>

              {/* Tool 6 - Deadline Tracker per W10 T-01 */}
              <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-lg transition group">
                <div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
                    <Calendar className="h-6 w-6" />
                  </div>
                  <h3 className="mt-4 text-base font-black text-[#103B47] group-hover:text-[#D89A3E] transition">
                    Deadline Tracker
                  </h3>
                  <p className="mt-2 text-xs text-slate-500 leading-relaxed">
                    Track critical 2027 intake cutoffs, scholarship deadlines,
                    and visa processing windows personalized to your target
                    destinations.
                  </p>
                </div>
                <LeadTriggerButton className="mt-5 inline-flex items-center gap-1.5 text-xs font-bold text-[#D89A3E] group-hover:translate-x-0.5 transition text-left">
                  Track Application Deadlines →
                </LeadTriggerButton>
              </div>
            </div>
          </div>
        </section>

        {/* Latest Content Freshness (Per Document W10 T-01: 4 Cards showing newest guides) */}
        <section className="cv-auto border-t border-slate-200 bg-white py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
              <div>
                <div className="inline-flex items-center gap-1.5 rounded-full bg-[#103B47]/10 px-3 py-1 text-xs font-bold text-[#103B47]">
                  Admissions Intelligence
                </div>
                <h2 className="mt-2.5 font-serif text-3xl font-extrabold tracking-tight text-[#103B47] sm:text-4xl">
                  Latest Study Abroad Guides & Visa Updates
                </h2>
                <p className="mt-2 text-sm text-slate-600">
                  Authoritative, constantly updated research compiled by
                  admissions strategists at Dnyanal Educon.
                </p>
              </div>
              <Link
                href="/articles"
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-[#103B47] hover:bg-slate-50 transition"
              >
                View All Guides & Articles →
              </Link>
            </div>

            <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {FALLBACK_ARTICLES.map((article) => (
                <div
                  key={article._id}
                  className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-slate-50/50 p-5 transition hover:bg-white hover:shadow-lg hover:border-slate-300"
                >
                  <div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span className="font-bold text-[#D89A3E]">
                        {article.tag}
                      </span>
                      <span>{article.readTime}</span>
                    </div>
                    <Link href={`/articles/${article.slug}`}>
                      <h3 className="mt-3 text-sm font-bold leading-snug text-[#103B47] hover:text-[#D89A3E] cursor-pointer">
                        {article.title}
                      </h3>
                    </Link>
                    <p className="mt-2 text-xs leading-relaxed text-slate-600">
                      {article.excerpt}
                    </p>
                  </div>

                  <div className="mt-5 flex items-center justify-between border-t border-slate-200/60 pt-3 text-[11px] text-slate-500">
                    <span>{article.date}</span>
                    <Link
                      href={`/articles/${article.slug}`}
                      className="font-bold text-[#103B47] hover:text-[#D89A3E] flex items-center gap-1"
                    >
                      Read Guide <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Why Indian Families Choose Us */}
        <section className="cv-auto bg-slate-50 py-16 text-center border-t border-slate-200">
          <div className="mx-auto max-w-4xl px-4">
            <h2 className="font-serif text-2xl font-black text-[#103B47] sm:text-3xl">
              Why Indian Students & Families Choose Abroadroute
            </h2>
            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3 text-left">
              <div className="rounded-2xl bg-white p-5 shadow-xs border border-slate-200">
                <CheckCircle2 className="h-6 w-6 text-emerald-600 mb-2" />
                <h3 className="font-bold text-xs text-[#103B47]">
                  Zero Hidden Charges
                </h3>
                <p className="mt-1 text-[11px] text-slate-500">
                  Open access to real tuition fee structures, official visa
                  rules, and living expense estimates.
                </p>
              </div>

              <div className="rounded-2xl bg-white p-5 shadow-xs border border-slate-200">
                <ShieldCheck className="h-6 w-6 text-[#103B47] mb-2" />
                <h3 className="font-bold text-xs text-[#103B47]">
                  NMC & Accreditation Safe
                </h3>
                <p className="mt-1 text-[11px] text-slate-500">
                  Every medical university is verified against National Medical
                  Commission & WHO licensing standards.
                </p>
              </div>

              <div className="rounded-2xl bg-white p-5 shadow-xs border border-slate-200">
                <Sparkles className="h-6 w-6 text-[#D89A3E] mb-2" />
                <h3 className="font-bold text-xs text-[#103B47]">
                  24/7 AI Smart Advisor
                </h3>
                <p className="mt-1 text-[11px] text-slate-500">
                  Get personalized recommendations, fee calculations, and
                  deadline reminders anytime on WhatsApp or web.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Student Story Testimonial (Per HTML Template: Dark Navy with Gold eyebrow) */}
        <section className="cv-auto bg-white py-16">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="rounded-3xl bg-[#103B47] border border-[#1D5A6C]/40 p-8 sm:p-12 text-white shadow-xl relative overflow-hidden">
              <div className="pointer-events-none absolute right-0 top-0 -mt-10 -mr-10 h-60 w-60 rounded-full bg-[#D89A3E]/10 blur-2xl" />
              <span className="text-xs font-extrabold uppercase tracking-widest text-[#D89A3E]">
                Student Story · Authenticated Guidance
              </span>
              <p className="mt-4 font-serif text-xl sm:text-2xl leading-relaxed text-slate-100">
                “The shortlist and cost comparison helped our family understand
                the realistic total expenses in ₹ Lakhs before we ever committed
                to speaking with a counsellor.”
              </p>
              <div className="mt-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#D89A3E] text-xs font-bold text-[#103B47]">
                  RV
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Rohan Verma</p>
                  <p className="text-[11px] text-slate-300">
                    MS in Computer Science · Admitted to TU Munich
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Global Footer */}
      <Footer />
    </div>
  );
}
