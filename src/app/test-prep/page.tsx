import { Metadata } from "next";
import Link from "next/link";
import {
  Award,
  ChevronRight,
  CheckCircle2,
  HelpCircle,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  BookOpen,
  DollarSign,
  Calendar,
  Globe2,
  Stethoscope,
  GraduationCap,
} from "lucide-react";
import { fetchTestPrepExams } from "@/lib/supabase/dataFetchers";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import {
  HomeModalProvider,
  LeadTriggerButton,
  AICounsellorTriggerButton,
} from "@/components/home/HomeClientContext";
import { TestPrepFilter } from "@/components/test-prep/TestPrepFilter";

export const metadata: Metadata = {
  title:
    "Test Prep & Licensing Hub for Indian Students (2026-2027) | IELTS, GRE, GMAT, NCLEX, PLAB, OET",
  description:
    "Compare exam fees in INR, scoring scales, cutoffs for top global universities, and get free 8-week study blueprints for IELTS, GRE, GMAT, NCLEX, and PLAB.",
  openGraph: {
    title: "International Test Prep & Licensing Hub | Abroadroute",
    description:
      "Compare exam fees in INR, scoring scales, cutoffs for top global universities, and get free 8-week study blueprints for IELTS, GRE, GMAT, NCLEX, and PLAB.",
    url: "https://abroadroute.com/test-prep",
    type: "website",
  },
};

const TEST_PREP_FAQS = [
  {
    question:
      "Which English proficiency test is easiest for Indian students: IELTS, TOEFL, or PTE?",
    answer:
      "PTE Academic is widely considered the most objective because it is 100% computer-graded with automated speech algorithms, eliminating subjective human examiner bias. IELTS Academic remains the gold standard for UK, Canadian, and Australian university admissions and visa processing. TOEFL iBT is ideal for US universities and has a condensed 2-hour format.",
  },
  {
    question:
      "Do German public universities require the GRE for MS in STEM programs?",
    answer:
      "Many top German TU9 universities (such as TU Munich, RWTH Aachen, and University of Stuttgart) either mandate or highly recommend the GRE Quantitative score (usually 160+) for Indian engineering and computer science applicants to bypass stringent applicant screening.",
  },
  {
    question:
      "What is the difference between NCLEX-RN and OET for Indian Nurses migrating abroad?",
    answer:
      "NCLEX-RN is the clinical nursing licensing examination required by US and Canadian State Boards of Nursing to practice as a Registered Nurse. OET (Occupational English Test) is a healthcare-specific English language proficiency test required by UK, Irish, and Australian Nursing Midwifery Councils (NMC/AHPRA) to prove clinical communication skills.",
  },
  {
    question: "Is PLAB replaced by the UKMLA for Indian MBBS doctors?",
    answer:
      "Yes, starting in 2024–2026, the General Medical Council (GMC UK) is transitioning the Professional and Linguistic Assessments Board (PLAB) into the United Kingdom Medical Licensing Assessment (UKMLA). The format remains two parts: the Applied Knowledge Test (AKT) and Clinical Assessment (CPSA).",
  },
  {
    question:
      "Can I use Duolingo English Test (DET) for Canada and Australia student visas?",
    answer:
      "While over 4,500 universities globally accept DET for academic admission, student visa regulations differ. Canada's SDS stream requires IELTS Academic or PTE Academic. Australia primarily mandates PTE Academic or IELTS for visa compliance. However, DET is widely accepted for US universities and European institutions.",
  },
];

// Exams come from Supabase; refresh at most every 5 minutes.
export const revalidate = 300;

export default async function TestPrepHubPage() {
  const exams = await fetchTestPrepExams();

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: TEST_PREP_FAQS.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <HomeModalProvider>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
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
              <span className="text-[#103B47] font-bold">Test Prep Hub</span>
            </div>
          </div>

          {/* Hero Section */}
          <section className="relative overflow-hidden bg-gradient-to-b from-[#103B47] via-[#0E323D] to-[#0A242C] text-white py-14 sm:py-20">
            <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold text-white backdrop-blur-md">
                <Sparkles className="h-4 w-4 text-[#D89A3E]" />
                <span>Phase 1 Standardized Exam Intelligence (2026-2027)</span>
              </div>

              <h1 className="mt-5 font-display text-3xl sm:text-5xl lg:text-6xl font-medium text-white tracking-tight leading-tight">
                Global Test Prep & Licensing Hub{" "}
                <br className="hidden sm:inline" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-[#D89A3E]">
                  for Indian Students
                </span>
              </h1>

              <p className="mt-4 font-sans text-sm sm:text-base text-slate-200 max-w-3xl leading-relaxed font-normal">
                Clear all admissions cutoffs with zero guesswork. Compare
                official examination fees converted to INR, test durations,
                scoring benchmarks for 19 countries, and access tailored 8-week
                study blueprints.
              </p>

              {/* Quick Stat Badges */}
              <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 max-w-4xl">
                <div className="rounded-2xl border border-white/15 bg-white/10 p-3.5 backdrop-blur-xs">
                  <p className="text-2xl font-black font-mono text-[#D89A3E]">
                    9 Tests
                  </p>
                  <p className="text-xs text-slate-300 font-sans">
                    English, Graduate & Medical
                  </p>
                </div>
                <div className="rounded-2xl border border-white/15 bg-white/10 p-3.5 backdrop-blur-xs">
                  <p className="text-2xl font-black font-mono text-emerald-300">
                    100% Free
                  </p>
                  <p className="text-xs text-slate-300 font-sans">8-Week Roadmaps</p>
                </div>
                <div className="rounded-2xl border border-white/15 bg-white/10 p-3.5 backdrop-blur-xs">
                  <p className="text-2xl font-black font-mono text-amber-200">
                    INR Fees
                  </p>
                  <p className="text-xs text-slate-300 font-sans">
                    Live Converted Pricing
                  </p>
                </div>
                <div className="rounded-2xl border border-white/15 bg-white/10 p-3.5 backdrop-blur-xs">
                  <p className="text-2xl font-black font-mono text-sky-200">
                    19 Nations
                  </p>
                  <p className="text-xs text-slate-300 font-sans">Global Score Cutoffs</p>
                </div>
              </div>
            </div>
          </section>

          {/* Main Filter & Exams Catalog */}
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-6">
            <TestPrepFilter exams={exams} />
          </div>

          {/* Decision Matrix Section */}
          <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-16">
            <div className="rounded-3xl border border-[#D9CFB8]/80 bg-white p-6 sm:p-10 shadow-2xs">
              <div className="max-w-2xl">
                <span className="text-xs font-bold uppercase tracking-wider text-[#D89A3E] font-sans">
                  Decision Guide
                </span>
                <h2 className="mt-1 text-2xl sm:text-3xl font-display font-medium text-[#103B47]">
                  Which Examination Should You Take?
                </h2>
                <p className="mt-2 text-xs sm:text-sm text-slate-600">
                  Select your career goal below to determine your mandatory test
                  combinations:
                </p>
              </div>

              <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                <div className="rounded-2xl border border-[#D9CFB8]/70 bg-[#FDFCF7]/60 p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#1D5A6C]/10 text-[#103B47]">
                        <GraduationCap className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">
                          MS in STEM / CS
                        </h3>
                        <p className="text-[11px] text-slate-500">
                          USA, Germany, Canada
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 space-y-2 text-xs">
                      <div className="flex flex-wrap items-center justify-between gap-1 rounded-xl bg-white p-2.5 border border-[#D9CFB8]/60 font-semibold text-slate-800">
                        <span className="text-slate-500">1. Aptitude:</span>
                        <Link
                          href="/test-prep/gre"
                          className="text-[#D89A3E] hover:underline font-bold"
                        >
                          GRE General (315+)
                        </Link>
                      </div>
                      <div className="flex flex-wrap items-center justify-between gap-1 rounded-xl bg-white p-2.5 border border-[#D9CFB8]/60 font-semibold text-slate-800">
                        <span className="text-slate-500">2. Language:</span>
                        <Link
                          href="/test-prep/ielts"
                          className="text-[#103B47] hover:underline font-bold"
                        >
                          IELTS (6.5+) / TOEFL
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-[#D9CFB8]/70 bg-[#FDFCF7]/60 p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#D89A3E]/15 text-[#D89A3E]">
                        <Award className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">
                          Global MBA & Mgmt
                        </h3>
                        <p className="text-[11px] text-slate-500">
                          USA, UK, France, Singapore
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 space-y-2 text-xs">
                      <div className="flex flex-wrap items-center justify-between gap-1 rounded-xl bg-white p-2.5 border border-[#D9CFB8]/60 font-semibold text-slate-800">
                        <span className="text-slate-500">1. Business:</span>
                        <Link
                          href="/test-prep/gmat"
                          className="text-[#D89A3E] hover:underline font-bold"
                        >
                          GMAT Focus (645+)
                        </Link>
                      </div>
                      <div className="flex flex-wrap items-center justify-between gap-1 rounded-xl bg-white p-2.5 border border-[#D9CFB8]/60 font-semibold text-slate-800">
                        <span className="text-slate-500">2. Language:</span>
                        <Link
                          href="/test-prep/toefl"
                          className="text-[#103B47] hover:underline font-bold"
                        >
                          TOEFL (100+) / IELTS
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-[#D9CFB8]/70 bg-[#FDFCF7]/60 p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
                        <Stethoscope className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">
                          Nursing Migration
                        </h3>
                        <p className="text-[11px] text-slate-500">
                          USA, Canada, UK, Australia
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 space-y-2 text-xs">
                      <div className="flex flex-wrap items-center justify-between gap-1 rounded-xl bg-white p-2.5 border border-[#D9CFB8]/60 font-semibold text-slate-800">
                        <span className="text-slate-500">1. Clinical:</span>
                        <Link
                          href="/test-prep/nclex"
                          className="text-[#D89A3E] hover:underline font-bold"
                        >
                          NCLEX-RN (Pass)
                        </Link>
                      </div>
                      <div className="flex flex-wrap items-center justify-between gap-1 rounded-xl bg-white p-2.5 border border-[#D9CFB8]/60 font-semibold text-slate-800">
                        <span className="text-slate-500">
                          2. Healthcare Eng:
                        </span>
                        <Link
                          href="/test-prep/oet"
                          className="text-[#103B47] hover:underline font-bold"
                        >
                          OET (Grade B) / IELTS
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-[#D9CFB8]/70 bg-[#FDFCF7]/60 p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-800">
                        <Stethoscope className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">
                          MBBS Doctor to UK
                        </h3>
                        <p className="text-[11px] text-slate-500">
                          NHS Hospital Practice
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 space-y-2 text-xs">
                      <div className="flex flex-wrap items-center justify-between gap-1 rounded-xl bg-white p-2.5 border border-[#D9CFB8]/60 font-semibold text-slate-800">
                        <span className="text-slate-500">1. Licensing:</span>
                        <Link
                          href="/test-prep/plab"
                          className="text-[#D89A3E] hover:underline font-bold"
                        >
                          PLAB / UKMLA
                        </Link>
                      </div>
                      <div className="flex flex-wrap items-center justify-between gap-1 rounded-xl bg-white p-2.5 border border-[#D9CFB8]/60 font-semibold text-slate-800">
                        <span className="text-slate-500">2. Language:</span>
                        <Link
                          href="/test-prep/oet"
                          className="text-[#103B47] hover:underline font-bold"
                        >
                          OET (Grade B) / IELTS 7.5
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-[#D9CFB8]/70 bg-[#FDFCF7]/60 p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#1D5A6C]/15 text-[#103B47]">
                        <Globe2 className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">
                          Fast-Track English
                        </h3>
                        <p className="text-[11px] text-slate-500">
                          Australia & UK Visas
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 space-y-2 text-xs">
                      <div className="flex flex-wrap items-center justify-between gap-1 rounded-xl bg-white p-2.5 border border-[#D9CFB8]/60 font-semibold text-slate-800">
                        <span className="text-slate-500">
                          1. Computer Test:
                        </span>
                        <Link
                          href="/test-prep/pte"
                          className="text-[#D89A3E] hover:underline font-bold"
                        >
                          PTE Academic (65+)
                        </Link>
                      </div>
                      <div className="flex flex-wrap items-center justify-between gap-1 rounded-xl bg-white p-2.5 border border-[#D9CFB8]/60 font-semibold text-slate-800">
                        <span className="text-slate-500">2. Turnaround:</span>
                        <span className="text-slate-900 font-bold font-mono">
                          Within 48 Hours
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-[#D9CFB8]/70 bg-[#FDFCF7]/60 p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#D89A3E]/15 text-[#D89A3E]">
                        <Sparkles className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">
                          Need Custom Advice?
                        </h3>
                        <p className="text-[11px] text-slate-500">
                          AI Admissions Evaluation
                        </p>
                      </div>
                    </div>
                    <p className="mt-3 text-xs text-slate-600 leading-relaxed">
                      Get personalized cutoff estimates and test recommendations
                      tailored to your profile.
                    </p>
                  </div>
                  <div className="mt-4">
                    <AICounsellorTriggerButton className="w-full min-h-[44px] rounded-xl bg-[#103B47] py-2.5 px-3 text-xs font-bold text-white shadow-2xs hover:bg-[#1D5A6C] transition flex items-center justify-center gap-1.5 cursor-pointer">
                      <Sparkles className="h-3.5 w-3.5 text-[#D89A3E]" />
                      <span>Ask AI Counsellor</span>
                    </AICounsellorTriggerButton>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Master Comparison Table */}
          <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-16">
            <div className="rounded-3xl border border-[#D9CFB8]/80 bg-white p-6 sm:p-10 shadow-2xs overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#D89A3E] font-sans">
                    Comprehensive Matrix
                  </span>
                  <h2 className="mt-1 text-2xl font-display font-medium text-[#103B47]">
                    Master Test Comparison for Indian Applicants
                  </h2>
                </div>
                <LeadTriggerButton className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-[#D89A3E] px-5 py-2.5 text-xs font-sans font-semibold text-[#103B47] shadow-2xs hover:bg-[#c4872f] transition cursor-pointer active:scale-98">
                  <span>Get Free Profile Evaluation</span>
                  <ArrowRight className="h-4 w-4" />
                </LeadTriggerButton>
              </div>

              <div className="mt-8 overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[#D9CFB8]/70 bg-[#FDFCF7] text-slate-700">
                      <th className="p-3.5 font-bold font-sans">Exam</th>
                      <th className="p-3.5 font-bold font-sans">Category</th>
                      <th className="p-3.5 font-bold font-sans">Fee (INR)</th>
                      <th className="p-3.5 font-bold font-sans">Duration</th>
                      <th className="p-3.5 font-bold font-sans">Scoring Scale</th>
                      <th className="p-3.5 font-bold font-sans">Indian Student Target</th>
                      <th className="p-3.5 font-bold font-sans">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#D9CFB8]/40 text-[#3A3A3A]">
                    {exams.map((exam) => (
                      <tr
                        key={exam.id}
                        className="hover:bg-[#FDFCF7]/80 transition"
                      >
                        <td className="p-3.5 font-bold text-[#103B47] font-sans">
                          <Link
                            href={`/test-prep/${exam.slug}`}
                            className="hover:text-[#D89A3E] hover:underline"
                          >
                            {exam.name}
                          </Link>
                          <span className="block text-[10px] font-normal text-[#6B6B6B]">
                            {exam.conductingBody}
                          </span>
                        </td>
                        <td className="p-3.5">
                          <span className="inline-flex rounded-md bg-[#1D5A6C]/10 border border-[#1D5A6C]/20 px-2 py-0.5 text-[10px] font-semibold text-[#103B47] font-sans">
                            {exam.category.split(" ")[0]}
                          </span>
                        </td>
                        <td className="p-3.5 font-bold font-mono text-slate-900">
                          {exam.feeINR}
                        </td>
                        <td className="p-3.5 font-mono">{exam.duration}</td>
                        <td className="p-3.5 font-mono">{exam.scoringScale}</td>
                        <td className="p-3.5 font-bold font-mono text-emerald-700">
                          {exam.targetCutoffIndianStudents}
                        </td>
                        <td className="p-3.5">
                          <Link
                            href={`/test-prep/${exam.slug}`}
                            className="inline-flex items-center gap-1 font-bold text-[#D89A3E] hover:underline min-h-[36px] font-sans"
                          >
                            <span>Blueprint</span>
                            <ChevronRight className="h-3.5 w-3.5" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* FAQs Section */}
          <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-16">
            <div className="rounded-3xl border border-[#D9CFB8]/80 bg-white p-6 sm:p-10 shadow-2xs">
              <div className="max-w-2xl">
                <span className="text-xs font-bold uppercase tracking-wider text-[#D89A3E] font-sans">
                  Expert Answers
                </span>
                <h2 className="mt-1 text-2xl sm:text-3xl font-display font-medium text-[#103B47]">
                  Frequently Asked Questions on Test Preparation
                </h2>
              </div>

              <div className="mt-8 space-y-4">
                {TEST_PREP_FAQS.map((faq, idx) => (
                  <div
                    key={idx}
                    className="rounded-2xl border border-[#D9CFB8]/70 bg-[#FDFCF7]/60 p-5"
                  >
                    <div className="flex items-start gap-3">
                      <HelpCircle className="h-5 w-5 text-[#D89A3E] shrink-0 mt-0.5" />
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 font-sans">
                          {faq.question}
                        </h3>
                        <p className="mt-2 text-xs sm:text-sm leading-relaxed text-[#3A3A3A] font-sans">
                          {faq.answer}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Bottom Lead Banner */}
          <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-16">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#103B47] to-[#0A242C] p-8 sm:p-12 text-white shadow-xl">
              <div className="relative z-10 max-w-2xl">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-1 text-xs font-semibold text-[#D89A3E] font-sans">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Personalized Admissions Support</span>
                </span>
                <h2 className="mt-4 text-2xl sm:text-4xl font-display font-medium text-white">
                  Not Sure Which Test Scores Your Target University Needs?
                </h2>
                <p className="mt-3 text-xs sm:text-sm text-slate-200 leading-relaxed">
                  Connect with our certified admissions mentors. We will
                  evaluate your GPA, target country, program requirements, and
                  build your customized test prep timeline.
                </p>
                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <LeadTriggerButton className="min-h-[44px] rounded-xl bg-[#D89A3E] px-6 py-3 text-xs sm:text-sm font-bold text-slate-950 shadow-md hover:bg-[#c4872f] transition cursor-pointer active:scale-98">
                    Book Free 1-on-1 Profile Strategy
                  </LeadTriggerButton>
                  <AICounsellorTriggerButton className="min-h-[44px] rounded-xl border border-white/20 bg-white/10 px-6 py-3 text-xs sm:text-sm font-bold text-white hover:bg-white/20 transition cursor-pointer">
                    Ask AI Admissions Bot
                  </AICounsellorTriggerButton>
                </div>
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </HomeModalProvider>
  );
}
