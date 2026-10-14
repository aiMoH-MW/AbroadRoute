import { notFound } from "next/navigation";
import Link from "next/link";
import { Metadata } from "next";
import {
  ChevronRight,
  Clock,
  Banknote,
  Award,
  Calendar,
  CheckCircle2,
  HelpCircle,
  Building2,
  ArrowRight,
  Globe2,
  BookOpen,
  Sparkles,
  Layers,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { fetchTestPrepExams, getTestPrepExamBySlug } from "@/lib/supabase/dataFetchers";
import { fitMetaDescription } from "@/lib/seo/metaUtils";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import {
  HomeModalProvider,
  LeadTriggerButton,
  AICounsellorTriggerButton,
} from "@/components/home/HomeClientContext";
import { show } from "@/components/tools/NotProvided";

interface Props {
  params: Promise<{ slug: string }>;
}

// Exams come from Supabase; refresh at most every 5 minutes.
export const revalidate = 300;

export async function generateStaticParams() {
  const exams = await fetchTestPrepExams();
  return exams.map((exam) => ({
    slug: exam.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const exam = await getTestPrepExamBySlug(slug);

  if (!exam) {
    return { title: "Exam Not Found | AbroadRoute" };
  }

  const rawDescription = `Complete guide to ${exam.name} (${exam.fullName}). ${exam.feeINR ? `Official fee ${exam.feeINR}, ` : ""}test format, score cutoffs for top universities, and free study blueprints.`;
  const formattedDesc = fitMetaDescription(rawDescription);

  return {
    title: `${exam.name} Preparation Guide (2026-2027) | Fees in INR, Syllabus & Cutoffs for Indian Students`,
    description: formattedDesc,
    openGraph: {
      title: `${exam.name} Exam Guide: Fees in INR, Cutoffs & 8-Week Roadmap`,
      description: formattedDesc,
      url: `https://abroadroute.com/test-prep/${exam.slug}`,
      type: "article",
    },
    alternates: {
      canonical: `/test-prep/${exam.slug}`,
    },
  };
}

export default async function TestPrepDetailPage({ params }: Props) {
  const { slug } = await params;
  const allExams = await fetchTestPrepExams();
  const exam = allExams.find(
    (e) => e.slug.toLowerCase() === slug.toLowerCase(),
  );

  if (!exam) {
    notFound();
  }

  // Related exams from the same category or common combinations
  const relatedExams = allExams.filter(
    (e) =>
      e.id !== exam.id &&
      (e.category === exam.category ||
        (exam.category === "Graduate Admissions" &&
          e.category === "English Proficiency")),
  );

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: exam.faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  const courseJsonLd = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: `${exam.name} Master Preparation Blueprint`,
    description: exam.overview,
    provider: {
      "@type": "Organization",
      name: "AbroadRoute / Dnyanal Educon Pvt. Ltd.",
      sameAs: "https://abroadroute.com",
    },
  };

  return (
    <HomeModalProvider>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(courseJsonLd) }}
      />

      <div className="min-h-screen bg-[#FDFCF7] flex flex-col justify-between">
        <Header />

        <main className="flex-1 pb-16">
          {/* Breadcrumbs */}
          <div className="border-b border-[#D9CFB8]/60 bg-white/70 backdrop-blur-xs py-2.5">
            <div className="mx-auto flex max-w-7xl items-center gap-2 px-4 sm:px-6 lg:px-8 text-xs font-semibold text-slate-500">
              <Link href="/" className="hover:text-[#103B47] transition">
                Home
              </Link>
              <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
              <Link
                href="/test-prep"
                className="hover:text-[#103B47] transition"
              >
                Test Prep Hub
              </Link>
              <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
              <span className="text-[#103B47] font-bold">{exam.name}</span>
            </div>
          </div>

          {/* Hero Section */}
          <section className="relative overflow-hidden bg-gradient-to-b from-[#103B47] via-[#0E323D] to-[#0A242C] text-white py-12 sm:py-16">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-white backdrop-blur-xs">
                  {exam.category}
                </span>
                <span className="inline-flex items-center rounded-full bg-[#D89A3E]/20 px-3 py-1 text-xs font-bold text-[#D89A3E] border border-[#D89A3E]/30">
                  Conducted by: {show(exam.conductingBody)}
                </span>
              </div>

              <h1 className="mt-4 font-display text-3xl sm:text-5xl font-medium text-white tracking-tight">
                {exam.name}
              </h1>
              <p className="mt-1 font-serif italic text-lg sm:text-xl text-[#A8CDBD]">
                {exam.fullName}
              </p>

              <p className="mt-4 font-sans text-sm sm:text-base text-slate-200 max-w-3xl leading-relaxed">
                {show(exam.heroTagline)}
              </p>

              {/* Quick Metrics Bar */}
              <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
                <div className="rounded-2xl border border-white/15 bg-white/10 p-3.5 backdrop-blur-xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300">
                    Exam Fee (INR)
                  </span>
                  <p className="mt-1 text-base sm:text-lg font-black font-mono text-[#D89A3E]">
                    {show(exam.feeINR)}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/15 bg-white/10 p-3.5 backdrop-blur-xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300">
                    Total Duration
                  </span>
                  <p className="mt-1 text-sm font-bold font-mono text-white">
                    {show(exam.duration)}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/15 bg-white/10 p-3.5 backdrop-blur-xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300">
                    Score Validity
                  </span>
                  <p className="mt-1 text-sm font-bold font-mono text-white">
                    {show(exam.validityYears, (v) => (v === 99 ? "Lifetime" : `${v} Years`))}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/15 bg-white/10 p-3.5 backdrop-blur-xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300">
                    Score Scale
                  </span>
                  <p className="mt-1 text-sm font-bold font-mono text-white">
                    {show(exam.scoringScale)}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/15 bg-white/10 p-3.5 backdrop-blur-xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300">
                    Indian Target Cutoff
                  </span>
                  <p className="mt-1 text-sm font-black font-mono text-emerald-300">
                    {show(exam.targetCutoffIndianStudents)}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/15 bg-white/10 p-3.5 backdrop-blur-xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300">
                    Delivery Mode
                  </span>
                  <p
                    className="mt-1 text-xs font-bold text-white truncate"
                    title={exam.formatMode ?? undefined}
                  >
                    {show(exam.formatMode, (v) => v.split(" ")[0])}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link
                  href={`/test-prep/${exam.slug}/online-test`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-h-[44px] rounded-xl bg-[#D89A3E] px-6 py-3 text-xs sm:text-sm font-bold text-slate-950 shadow-md hover:bg-[#c4872f] transition inline-flex items-center gap-2 cursor-pointer active:scale-98"
                >
                  <span>Take the {exam.shortName} Online Test</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
                {/* <LeadTriggerButton
                  country={exam.targetCountries[0]}
                  className="min-h-[44px] rounded-xl bg-[#D89A3E] px-6 py-3 text-xs sm:text-sm font-bold text-slate-950 shadow-md hover:bg-[#c4872f] transition inline-flex items-center gap-2 cursor-pointer active:scale-98"
                >
                  <span>Get Free {exam.shortName} Prep Assessment</span>
                  <ArrowRight className="h-4 w-4" />
                </LeadTriggerButton> */}
                <AICounsellorTriggerButton className="min-h-[44px] rounded-xl border border-white/25 bg-white/10 px-5 py-3 text-xs sm:text-sm font-bold text-white hover:bg-white/20 transition inline-flex items-center gap-2 cursor-pointer">
                  <Sparkles className="h-4 w-4 text-[#D89A3E]" />
                  <span>Ask AI for {exam.shortName} Tips</span>
                </AICounsellorTriggerButton>
              </div>
            </div>
          </section>

          {/* Content Layout */}
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-10">
            <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
              {/* Main Content Area (2 cols) */}
              <div className="lg:col-span-2 space-y-10">
                {/* 1. Overview Section */}
                <section className="rounded-3xl border border-[#D9CFB8]/80 bg-white p-6 sm:p-8 shadow-2xs">
                  <h2 className="text-xl sm:text-2xl font-display font-medium text-[#103B47] flex items-center gap-2.5">
                    <BookOpen className="h-5 w-5 text-[#D89A3E]" />
                    <span>About {exam.name}</span>
                  </h2>
                  <p className="mt-4 text-xs sm:text-sm leading-relaxed text-[#3A3A3A] font-sans font-normal">
                    {show(exam.overview)}
                  </p>

                  <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-[#D9CFB8]/40 pt-6">
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-[#6B6B6B] font-sans">
                        Target Degrees & Programs
                      </h3>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {exam.targetPrograms.map((prog) => (
                          <span
                            key={prog}
                            className="rounded-lg bg-[#1D5A6C]/10 border border-[#1D5A6C]/20 px-2.5 py-1 text-xs font-bold text-[#103B47] font-sans"
                          >
                            {prog}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-[#6B6B6B] font-sans">
                        Conducting Body & Frequency
                      </h3>
                      <p className="mt-2 text-xs font-bold text-slate-900 font-sans">
                        {show(exam.conductingBody)}
                      </p>
                      <p className="text-xs text-[#6B6B6B] font-sans">{show(exam.frequency)}</p>
                    </div>
                  </div>
                </section>

                {/* 2. Section-by-Section Exam Format */}
                <section className="rounded-3xl border border-[#D9CFB8]/80 bg-white p-6 sm:p-8 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl sm:text-2xl font-display font-medium text-[#103B47] flex items-center gap-2.5">
                      <Layers className="h-5 w-5 text-[#D89A3E]" />
                      <span>{exam.shortName} Section Breakdown & Syllabus</span>
                    </h2>
                    <span className="text-xs font-bold text-[#6B6B6B] font-mono">
                      {exam.sections.length} Sections
                    </span>
                  </div>

                  <div className="mt-6 space-y-4">
                    {exam.sections.map((sec, idx) => (
                      <div
                        key={idx}
                        className="rounded-2xl border border-[#D9CFB8]/70 bg-[#FDFCF7]/60 p-5 hover:border-[#1D5A6C]/30 transition"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#103B47] text-[10px] font-bold text-white font-mono">
                              {idx + 1}
                            </span>
                            <h3 className="text-sm font-bold text-slate-900 font-sans">
                              {sec.name}
                            </h3>
                          </div>
                          <div className="flex items-center gap-3 text-xs font-semibold text-slate-500">
                            <span className="flex items-center gap-1 font-mono">
                              <Clock className="h-3.5 w-3.5 text-slate-400" />
                              {show(sec.duration)}
                            </span>
                            <span>•</span>
                            <span className="font-mono">
                              {show(sec.questionsCount)}
                            </span>
                          </div>
                        </div>

                        <div className="mt-3 text-xs text-[#3A3A3A] font-sans">
                          <p>
                            <strong className="text-slate-900">
                              Skills Tested:
                            </strong>{" "}
                            {show(sec.skillsTested)}
                          </p>
                          <div className="mt-2.5 rounded-xl bg-amber-50 border border-amber-200/80 p-3 text-slate-800">
                            <p className="text-[11px] font-bold text-amber-800 uppercase tracking-wider mb-0.5 font-sans">
                              Strategy for Indian Students:
                            </p>
                            <p className="text-xs leading-relaxed text-[#3A3A3A] font-sans">
                              {show(sec.tips)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* 3. Minimum Cutoffs & Country Score Requirements */}
                <section className="rounded-3xl border border-[#D9CFB8]/80 bg-white p-6 sm:p-8 shadow-2xs">
                  <h2 className="text-xl sm:text-2xl font-display font-medium text-[#103B47] flex items-center gap-2.5">
                    <Globe2 className="h-5 w-5 text-[#D89A3E]" />
                    <span>Target Score Requirements by Destination</span>
                  </h2>
                  <p className="mt-1 text-xs text-[#6B6B6B] font-sans">
                    Minimum eligibility thresholds vs. competitive scores for
                    top-tier university admissions and visa approvals:
                  </p>

                  <div className="mt-6 overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-[#D9CFB8]/70 bg-[#FDFCF7] text-slate-700">
                          <th className="p-3 font-bold font-sans">Destination Country</th>
                          <th className="p-3 font-bold font-sans">Minimum Threshold</th>
                          <th className="p-3 font-bold text-emerald-800 font-sans">
                            Competitive Target Score
                          </th>
                          <th className="p-3 font-bold text-right font-sans">
                            Destination Guide
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#D9CFB8]/40 text-[#3A3A3A]">
                        {exam.scoreRequirementsByCountry.map((req, idx) => (
                          <tr
                            key={idx}
                            className="hover:bg-[#FDFCF7]/80 transition"
                          >
                            <td className="p-3 font-bold text-slate-900 flex items-center gap-2 font-sans">
                              <span className="text-xl">{req.flag}</span>
                              <span>{req.country}</span>
                            </td>
                            <td className="p-3 font-medium text-slate-700 font-mono">
                              {req.minRequired}
                            </td>
                            <td className="p-3 font-bold text-emerald-700 font-mono">
                              {req.competitiveScore}
                            </td>
                            <td className="p-3 text-right">
                              <Link
                                href={`/destinations/${req.country.toLowerCase().replace(/\s+/g, "-")}`}
                                className="font-bold text-[#103B47] hover:text-[#D89A3E] hover:underline font-sans"
                              >
                                View Country
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>

                {/* 4. 8-Week Preparation Roadmap */}
                <section className="rounded-3xl border border-[#D9CFB8]/80 bg-white p-6 sm:p-8 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl sm:text-2xl font-display font-medium text-[#103B47] flex items-center gap-2.5">
                      <Zap className="h-5 w-5 text-[#D89A3E]" />
                      <span>8-Week Structured Study Roadmap</span>
                    </h2>
                    <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 font-mono">
                      Step-by-Step
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-[#6B6B6B] font-sans">
                    Proven phased roadmap designed for working professionals and
                    university students in India:
                  </p>

                  <div className="mt-6 space-y-4">
                    {exam.prepRoadmap.map((item, idx) => (
                      <div
                        key={idx}
                        className="relative flex gap-4 rounded-2xl border border-[#D9CFB8]/70 bg-[#FDFCF7]/60 p-5"
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#103B47] text-xs font-bold text-white font-mono">
                          {idx + 1}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="rounded-md bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800 font-mono">
                              {item.week}
                            </span>
                            <h3 className="text-sm font-bold text-slate-900 font-sans">
                              {item.title}
                            </h3>
                          </div>
                          <p className="mt-2 text-xs leading-relaxed text-[#3A3A3A] font-sans font-normal">
                            {item.milestone}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* 5. Frequently Asked Questions */}
                <section className="rounded-3xl border border-[#D9CFB8]/80 bg-white p-6 sm:p-8 shadow-2xs">
                  <h2 className="text-xl sm:text-2xl font-display font-medium text-[#103B47] flex items-center gap-2.5">
                    <HelpCircle className="h-5 w-5 text-[#D89A3E]" />
                    <span>Frequently Asked Questions about {exam.name}</span>
                  </h2>

                  <div className="mt-6 space-y-4">
                    {exam.faqs.map((faq, idx) => (
                      <div
                        key={idx}
                        className="rounded-2xl border border-[#D9CFB8]/70 bg-[#FDFCF7]/60 p-5"
                      >
                        <h3 className="text-sm font-bold text-slate-900">
                          {faq.question}
                        </h3>
                        <p className="mt-2 text-xs sm:text-sm leading-relaxed text-slate-600">
                          {faq.answer}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>
              </div>

              {/* Sidebar (1 col) */}
              <div className="space-y-6">
                {/* 1. Quick Profile Assessment Card */}
                <div className="sticky top-24 space-y-6">
                  <div className="rounded-3xl border border-[#D9CFB8] bg-white p-6 sm:p-7 shadow-lg">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#D89A3E]/15 text-[#D89A3E] mb-4">
                      <Sparkles className="h-6 w-6 text-[#D89A3E]" />
                    </div>
                    <h3 className="text-2xl font-display font-medium text-[#103B47] tracking-tight leading-snug">
                      Get Free {exam.shortName} Readiness Evaluation
                    </h3>
                    <p className="mt-2.5 text-xs sm:text-sm text-[#3A3A3A] leading-relaxed font-normal font-sans">
                      Share your target intake, destination, and current score
                      to receive personalized university shortlisting and fee
                      waiver tips.
                    </p>

                    <div className="mt-6 space-y-3">
                      <Link
                        href={`/test-prep/${exam.slug}/online-test`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full min-h-[44px] rounded-xl bg-[#D89A3E] px-6 py-3 text-xs sm:text-sm font-bold text-slate-950 shadow-md hover:bg-[#c4872f] transition flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                      >
                        <span>Take the {exam.shortName} Online Test</span>
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                      {/* <LeadTriggerButton
                        country={exam.targetCountries[0]}
                        className="w-full min-h-[44px] rounded-xl bg-[#D89A3E] py-3 text-xs sm:text-sm font-bold text-slate-950 shadow-xs hover:bg-[#c4872f] transition flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                      >
                        <span>Schedule Free Strategy Call</span>
                        <ArrowRight className="h-4 w-4" />
                      </LeadTriggerButton> */}

                      <AICounsellorTriggerButton className="w-full min-h-[44px] rounded-xl border border-[#D9CFB8] bg-[#FDFCF7] py-3 text-xs sm:text-sm font-bold text-[#103B47] hover:bg-white transition flex items-center justify-center gap-2 cursor-pointer">
                        <Sparkles className="h-4 w-4 text-[#D89A3E]" />
                        <span>Instant AI Consultation</span>
                      </AICounsellorTriggerButton>
                    </div>

                    <div className="mt-6 border-t border-[#D9CFB8]/60 pt-4 text-xs text-[#6B6B6B] space-y-2.5 font-sans font-medium">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                        <span>100% Free Zero-Bias Counseling</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                        <span>Official IDP & ETS Partner Guidance</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                        <span>DPDP Act 2023 Compliant</span>
                      </div>
                    </div>
                  </div>

                  {/* 2. Related Exams Widget */}
                  <div className="rounded-3xl border border-[#D9CFB8]/80 bg-white p-6 shadow-2xs">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#103B47] mb-4">
                      Related & Alternative Tests
                    </h3>
                    <ul className="space-y-3 text-xs">
                      {relatedExams.slice(0, 4).map((rel) => (
                        <li key={rel.id}>
                          <Link
                            href={`/test-prep/${rel.slug}`}
                            className="group flex items-center justify-between rounded-xl border border-[#D9CFB8]/60 bg-[#FDFCF7]/60 p-3 hover:border-[#103B47]/30 hover:bg-white transition"
                          >
                            <div>
                              <p className="font-bold text-slate-900 group-hover:text-[#103B47] transition">
                                {rel.name}
                              </p>
                              <p className="text-[10px] text-slate-400 font-mono">
                                {rel.feeINR} • {rel.category.split(" ")[0]}
                              </p>
                            </div>
                            <ChevronRight className="h-4 w-4 text-slate-400 group-hover:translate-x-0.5 group-hover:text-[#D89A3E] transition-transform" />
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </HomeModalProvider>
  );
}
