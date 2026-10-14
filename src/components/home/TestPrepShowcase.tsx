import Link from "next/link";
import { 
  Sparkles, 
  ArrowRight, 
  BookOpen, 
  Banknote, 
  Award, 
  CheckCircle2, 
  Layers,
  Globe2,
  Stethoscope,
  GraduationCap
} from "lucide-react";
import { fetchTestPrepExams } from "@/lib/supabase/dataFetchers";
import { show } from "@/components/tools/NotProvided";

export async function TestPrepShowcase() {
  const exams = await fetchTestPrepExams();
  const allEnglishExams = exams.filter((e) => e.category === "English Proficiency");
  const englishExams = allEnglishExams.slice(0, 3);
  const graduateExams = exams.filter((e) => e.category === "Graduate Admissions");
  const healthcareExams = exams.filter((e) => e.category === "Medical & Healthcare Licensing");

  return (
    <section id="test-prep-hub" className="cv-auto border-t border-[#D9CFB8]/70 bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-[#D89A3E]/15 border border-[#D89A3E]/30 px-3 py-1 text-xs font-bold text-[#103B47]">
              <Sparkles className="h-3.5 w-3.5 text-[#D89A3E]" />
              Standardized Exam Intelligence
            </div>
            <h2 className="mt-2.5 font-serif text-3xl font-black tracking-tight text-[#103B47] sm:text-4xl">
              Test Prep & Global Licensing Hub
            </h2>
            <p className="mt-2 text-sm text-slate-600 max-w-2xl leading-relaxed">
              Official fees converted to INR, minimum score cutoffs, and free structured study roadmaps for Indian applicants.
            </p>
          </div>
          <Link
            href="/test-prep"
            className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-[#103B47] px-5 py-2.5 text-xs font-bold text-white shadow-2xs hover:bg-[#1D5A6C] transition shrink-0 cursor-pointer"
          >
            <span>
              Explore All {exams.length > 0 ? `${exams.length} ` : ""}Exams Hub
            </span>
            <ArrowRight className="h-4 w-4 text-[#D89A3E]" />
          </Link>
        </div>

        {/* 3 Categories Showcase Grid */}
        <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* 1. English Proficiency Card */}
          <div className="rounded-3xl border border-[#D9CFB8]/80 bg-[#FDFCF7]/60 p-6 flex flex-col justify-between transition hover:border-[#103B47]/30 hover:shadow-md">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-100 text-[#103B47]">
                  <Globe2 className="h-5 w-5" />
                </div>
                <span className="rounded-full bg-sky-50 border border-sky-200 px-2.5 py-0.5 text-[10px] font-bold text-sky-800 font-mono">
                  {allEnglishExams.length} Exams Available
                </span>
              </div>

              <h3 className="mt-4 text-lg font-serif font-bold text-[#103B47]">English Language Proficiency</h3>
              <p className="mt-1 text-xs text-slate-500">
                {allEnglishExams.map((e) => e.name).join(", ") || "Not provided"}
              </p>

              <div className="mt-5 space-y-2.5">
                {englishExams.map((exam) => (
                  <Link
                    key={exam.id}
                    href={`/test-prep/${exam.slug}`}
                    className="group flex items-center justify-between rounded-xl border border-[#D9CFB8]/60 bg-white p-3 hover:border-[#103B47]/30 transition"
                  >
                    <div>
                      <p className="text-xs font-bold text-slate-900 group-hover:text-[#103B47] transition">{exam.name}</p>
                      <p className="text-[10px] text-slate-400 font-mono">Target: {show(exam.targetCutoffIndianStudents)} • {show(exam.feeINR)}</p>
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 text-slate-400 group-hover:translate-x-1 group-hover:text-[#D89A3E] transition-transform" />
                  </Link>
                ))}
              </div>
            </div>

            <Link
              href="/test-prep"
              className="mt-6 block text-center text-xs font-bold text-[#103B47] hover:text-[#D89A3E] hover:underline"
            >
              Compare All English Tests →
            </Link>
          </div>

          {/* 2. Graduate & MBA Admissions */}
          <div className="rounded-3xl border border-[#D9CFB8]/80 bg-[#FDFCF7]/60 p-6 flex flex-col justify-between transition hover:border-[#103B47]/30 hover:shadow-md">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#D89A3E]/15 text-[#D89A3E]">
                  <GraduationCap className="h-5 w-5" />
                </div>
                <span className="rounded-full bg-[#D89A3E]/10 border border-[#D89A3E]/30 px-2.5 py-0.5 text-[10px] font-bold text-[#D89A3E] font-mono">
                  MS & MBA Focus
                </span>
              </div>

              <h3 className="mt-4 text-lg font-serif font-bold text-[#103B47]">Graduate & MBA Admissions</h3>
              <p className="mt-1 text-xs text-slate-500">Aptitude exams for STEM Master&apos;s and Top Global Business Schools.</p>

              <div className="mt-5 space-y-2.5">
                {graduateExams.map((exam) => (
                  <Link
                    key={exam.id}
                    href={`/test-prep/${exam.slug}`}
                    className="group flex items-center justify-between rounded-xl border border-[#D9CFB8]/60 bg-white p-3 hover:border-[#103B47]/30 transition"
                  >
                    <div>
                      <p className="text-xs font-bold text-slate-900 group-hover:text-[#103B47] transition">{exam.name}</p>
                      <p className="text-[10px] text-slate-400 font-mono">Target: {show(exam.targetCutoffIndianStudents)} • {show(exam.feeINR)}</p>
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 text-slate-400 group-hover:translate-x-1 group-hover:text-[#D89A3E] transition-transform" />
                  </Link>
                ))}
              </div>
            </div>

            <Link
              href="/test-prep"
              className="mt-6 block text-center text-xs font-bold text-[#103B47] hover:text-[#D89A3E] hover:underline"
            >
              View Graduate Cutoff Matrix →
            </Link>
          </div>

          {/* 3. Medical & Healthcare Licensing */}
          <div className="rounded-3xl border border-[#D9CFB8]/80 bg-[#FDFCF7]/60 p-6 flex flex-col justify-between transition hover:border-[#103B47]/30 hover:shadow-md">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
                  <Stethoscope className="h-5 w-5" />
                </div>
                <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 font-mono">
                  High Demand Migration
                </span>
              </div>

              <h3 className="mt-4 text-lg font-serif font-bold text-[#103B47]">Medical & Nursing Licensing</h3>
              <p className="mt-1 text-xs text-slate-500">Licensing roadmaps for Indian MBBS doctors and Nursing graduates.</p>

              <div className="mt-5 space-y-2.5">
                {healthcareExams.map((exam) => (
                  <Link
                    key={exam.id}
                    href={`/test-prep/${exam.slug}`}
                    className="group flex items-center justify-between rounded-xl border border-[#D9CFB8]/60 bg-white p-3 hover:border-[#103B47]/30 transition"
                  >
                    <div>
                      <p className="text-xs font-bold text-slate-900 group-hover:text-[#103B47] transition">{exam.name}</p>
                      <p className="text-[10px] text-slate-400 font-mono">Target: {show(exam.targetCutoffIndianStudents)} • {show(exam.feeINR)}</p>
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 text-slate-400 group-hover:translate-x-1 group-hover:text-[#D89A3E] transition-transform" />
                  </Link>
                ))}
              </div>
            </div>

            <Link
              href="/test-prep"
              className="mt-6 block text-center text-xs font-bold text-[#103B47] hover:text-[#D89A3E] hover:underline"
            >
              Explore Healthcare Licensing →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
