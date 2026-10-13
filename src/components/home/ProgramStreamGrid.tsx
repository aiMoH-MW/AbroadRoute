import Link from "next/link";
import { fetchLivePrograms } from "@/lib/supabase/dataFetchers";
import { Program } from "@/types";
import { GraduationCap, Award, Compass, ArrowRight } from "lucide-react";
import { LeadTriggerButton } from "@/components/home/HomeClientContext";
import { NotProvided, show } from "@/components/tools/NotProvided";

interface ProgramStreamGridProps {
  onOpenLeadModal?: (programSlug: string) => void;
  programs?: Program[];
}

export async function ProgramStreamGrid({
  onOpenLeadModal,
  programs: propPrograms,
}: ProgramStreamGridProps) {
  const livePrograms = propPrograms || (await fetchLivePrograms());
  return (
    <section
      id="programs-grid"
      className="cv-auto bg-[#FDFCF7] py-16 sm:py-20 border-t border-[#D9CFB8]/40"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-[#1D5A6C]/10 px-3 py-1 text-xs font-bold text-[#1D5A6C]">
            ✦ Academic Streams
          </div>
          <h2 className="mt-2.5 font-display text-3xl font-bold tracking-tight text-[#103B47] sm:text-4xl">
            {livePrograms.length > 0 ? `${livePrograms.length} ` : ""}Core
            Programs Tailored for Global Career Growth
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            From STEM master&apos;s and Executive MBA to NMC-compliant medical
            degrees and Germany Ausbildung.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {livePrograms.map((program) => (
            <div
              key={program.id}
              id={`program-${program.slug}`}
              className="flex flex-col justify-between rounded-2xl border border-[#D9CFB8]/60 bg-white p-6 shadow-sm transition hover:border-[#1D5A6C]/40 hover:shadow-lg"
            >
              <div>
                <div className="flex items-center justify-between">
                  <Link
                    href={`/programs/${program.slug}`}
                    className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#FDFCF7] text-[#1D5A6C] border border-[#D9CFB8]/40 transition hover:scale-105 hover:border-[#1D5A6C]"
                    title={`Explore ${program.name} Degree Details`}
                  >
                    <GraduationCap className="h-6 w-6 text-[#D89A3E]" />
                  </Link>
                  <div className="flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
                    <Award className="h-3 w-3" />
                    ROI: {show(program.roiScore, (v) => `${v}/100`)}
                  </div>
                </div>

                <Link
                  href={`/programs/${program.slug}`}
                  className="group/title block mt-4"
                >
                  <h3 className="font-display text-lg font-bold text-[#1D5A6C] transition group-hover/title:text-[#D89A3E] group-hover/title:underline">
                    {program.name}
                  </h3>
                  <span className="text-[11px] font-semibold text-slate-500">
                    {[program.level, program.duration].filter(Boolean).join(" • ") || <NotProvided />}
                  </span>
                </Link>

                <Link href={`/programs/${program.slug}`} className="block mt-3">
                  <p className="text-xs leading-relaxed text-slate-600 hover:text-[#1D5A6C] transition line-clamp-3">
                    {show(program.summary)}
                  </p>
                </Link>

                {/* Key Fields */}
                <div className="mt-4">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    High Demand Specializations:
                  </span>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {program.keyFields.map((field) => (
                      <span
                        key={field}
                        className="rounded-full bg-[#1D5A6C]/5 px-2.5 py-0.5 text-[10px] font-medium text-[#103B47]"
                      >
                        {field}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Top Destinations */}
                <div className="mt-4">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Recommended Destinations:
                  </span>
                  <p className="mt-1 text-xs font-semibold text-[#1D5A6C]">
                    {program.topDestinations.join(", ")}
                  </p>
                </div>
              </div>

              <div className="mt-6 border-t border-[#D9CFB8]/40 pt-4 flex flex-col gap-2.5">
                <Link
                  href={`/programs/${program.slug}`}
                  className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-[#1D5A6C] px-3.5 py-2.5 text-xs font-bold text-white transition hover:bg-[#103B47] shadow-xs"
                >
                  <span>Explore Program</span>
                  <ArrowRight className="h-3.5 w-3.5 text-[#D89A3E] shrink-0" />
                </Link>
                <LeadTriggerButton
                  country={program.slug}
                  className="flex min-h-[44px] w-full items-center justify-center gap-1.5 rounded-xl bg-[#FDFCF7] px-3.5 py-2 text-xs font-semibold text-slate-700 border border-[#D9CFB8]/80 transition hover:bg-[#F5EFE0] cursor-pointer"
                >
                  <Compass className="h-3.5 w-3.5 text-[#D89A3E] shrink-0" />
                  <span>Check Eligibility / Apply</span>
                </LeadTriggerButton>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
