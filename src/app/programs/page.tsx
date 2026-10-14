import Link from "next/link";
import { Metadata } from "next";
import {
  GraduationCap,
  ArrowRight,
  Compass,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { fetchLivePrograms } from "@/lib/supabase/dataFetchers";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { PeacockEye } from "@/components/ui/BrandSignatures";
import { NotProvided, show } from "@/components/tools/NotProvided";

export const metadata: Metadata = {
  title: "Core Academic Programs Abroad | Compare ROI, Tuition & Visas",
  description:
    "Explore core degree tracks for Indian students. Compare tuition in INR, global ROI rankings, and top destinations across STEM Master's, MBA, MBBS, Ausbildung, and Nursing.",
  alternates: {
    canonical: "/programs",
  },
};

export default async function ProgramsIndexPage() {
  const programs = await fetchLivePrograms();

  return (
    <div className="min-h-screen bg-[#FDFCF7] flex flex-col justify-between">
      <Header />

      <main className="flex-1 pb-16">
        {/* Breadcrumb Navigation */}
        <div className="border-b border-[#D9CFB8]/60 bg-[#FDFCF7] py-2.5">
          <div className="mx-auto flex max-w-7xl items-center gap-2 px-4 sm:px-6 lg:px-8 text-xs font-semibold text-slate-500">
            <Link href="/" className="hover:text-[#1D5A6C] transition">
              Home
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
            <span className="text-[#103B47] font-bold">Programs</span>
          </div>
        </div>

        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-b from-[#103B47] via-[#154654] to-[#1D5A6C] text-white py-14 sm:py-20">
          <div className="pointer-events-none absolute -top-24 left-1/2 -z-0 h-96 w-96 -translate-x-1/2 rounded-full bg-gradient-to-tr from-[#D89A3E]/20 via-[#7C6BAE]/15 to-transparent blur-3xl" />
          <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center sm:text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-xs font-semibold backdrop-blur-md shadow-inner">
              <PeacockEye size={12} />
              <span className="text-[#FDFCF7]">
                {programs.length > 0
                  ? `${programs.length} Core Career Disciplines`
                  : "Core Career Disciplines"}
              </span>
            </div>

            <h1 className="mt-4 font-display text-3xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-[#FDFCF7] leading-tight">
              Degree Tracks Tailored for{" "}
              <span className="text-[#D89A3E] italic font-serif">
                Global Career Growth.
              </span>
            </h1>

            <p className="mt-4 text-sm sm:text-base text-[#FDFCF7]/85 max-w-2xl leading-relaxed font-sans">
              From high-ROI STEM Master&apos;s and Executive MBAs to
              NMC-compliant medical degrees and Germany Ausbildung vocational
              apprenticeships.
            </p>
          </div>
        </section>

        {/* Directory Grid */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-12">
          <div className="border-b border-[#D9CFB8]/60 pb-6 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#103B47]">
                All Academic Streams & Degree Levels
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-slate-500 font-sans">
                Explore specialized tracks, global ROI scores, and eligible
                countries.
              </p>
            </div>
            <span className="self-start sm:self-auto rounded-full bg-[#1D5A6C]/10 px-3.5 py-1 text-xs font-bold text-[#1D5A6C]">
              {programs.length} Verified Disciplines
            </span>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {programs.map((program) => (
              <div
                key={program.id}
                id={`program-${program.slug}`}
                className="group flex flex-col justify-between rounded-2xl border border-[#D9CFB8]/70 bg-white p-6 shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-[#1D5A6C] hover:shadow-xl"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#FDFCF7] text-[#1D5A6C] border border-[#D9CFB8]/60">
                      <GraduationCap className="h-6 w-6 text-[#D89A3E]" />
                    </div>
                  </div>

                  <h3 className="mt-4 font-display text-lg font-bold text-[#103B47] group-hover:text-[#D89A3E] transition">
                    {program.name}
                  </h3>
                  <span className="text-[11px] font-semibold text-slate-500 font-mono">
                    {[program.level, program.duration].filter(Boolean).join(" • ") || <NotProvided />}
                  </span>

                  <p className="mt-3 text-xs leading-relaxed text-slate-600 line-clamp-3 font-sans">
                    {show(program.summary)}
                  </p>

                  {/* Specializations */}
                  <div className="mt-4">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#103B47] font-mono">
                      Specializations:
                    </span>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {program.keyFields.slice(0, 3).map((field) => (
                        <span
                          key={field}
                          className="rounded-lg bg-[#FDFCF7] border border-[#D9CFB8]/60 px-2 py-0.5 text-[10px] font-medium text-[#103B47]"
                        >
                          {field}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Top Destinations */}
                  <div className="mt-4 pt-3 border-t border-[#D9CFB8]/40">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                      Top Destinations:
                    </span>
                    <p className="mt-0.5 text-xs font-semibold text-[#1D5A6C] truncate font-sans">
                      {program.topDestinations.join(", ")}
                    </p>
                  </div>
                </div>

                <div className="mt-6 border-t border-[#D9CFB8]/40 pt-4">
                  <Link
                    href={`/programs/${program.slug}`}
                    className="flex w-full min-h-[44px] items-center justify-center gap-2 rounded-xl bg-[#1D5A6C]/5 px-3.5 py-2.5 text-xs font-bold text-[#1D5A6C] border border-[#1D5A6C]/20 transition group-hover:bg-[#1D5A6C] group-hover:text-white"
                  >
                    <Compass className="h-3.5 w-3.5 text-[#D89A3E] shrink-0" />
                    <span>Explore Program Track</span>
                    <ArrowRight className="h-3.5 w-3.5 text-[#D89A3E] shrink-0" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
