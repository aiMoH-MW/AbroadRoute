import { notFound } from "next/navigation";
import Link from "next/link";
import { Metadata } from "next";
import {
  ChevronRight,
  Globe2,
  ArrowRight,
  CheckCircle2,
  Award,
  Sparkles,
} from "lucide-react";
import {
  fetchLivePrograms,
  fetchLiveCountries,
  getLiveProgramBySlug,
  getSpecialisationsByProgramSlug,
  PROGRAM_ALIASES,
} from "@/lib/supabase/dataFetchers";
import { fetchProgramsByCountry } from "@/lib/siteStats";
import { fitMetaDescription } from "@/lib/seo/metaUtils";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CountryFlag } from "@/components/ui/CountryFlag";
import { NotProvided, show } from "@/components/tools/NotProvided";

interface Props {
  params: Promise<{ program: string }>;
}

export async function generateStaticParams() {
  const livePrograms = await fetchLivePrograms();
  const canonicalParams = livePrograms.map((p) => ({
    program: p.slug,
  }));
  const aliasParams = Object.keys(PROGRAM_ALIASES).map((alias) => ({
    program: alias,
  }));
  return [...canonicalParams, ...aliasParams];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { program } = await params;
  const prog = await getLiveProgramBySlug(program);
  if (!prog) return { title: "Program Not Found" };

  const rawDescription = `Complete guide to studying ${prog.name} abroad for Indian students. Compare top destinations (${prog.topDestinations.join(", ")}), tuition fees in INR, eligibility cutoffs, and career ROI.`;

  return {
    title: `Study ${prog.name} Abroad for Indian Students (2026-2027) | Global Comparison & Top Countries`,
    description: fitMetaDescription(rawDescription),
    alternates: {
      canonical: `/programs/${prog.slug}`,
    },
  };
}

export default async function ProgramHubPage({ params }: Props) {
  const { program } = await params;
  const [prog, liveCountries, specialisations] = await Promise.all([
    getLiveProgramBySlug(program),
    fetchLiveCountries(),
    getSpecialisationsByProgramSlug(program),
  ]);

  if (!prog) {
    notFound();
  }

  // Destinations named for the program, or where universities offer it
  const programsByCountry = await fetchProgramsByCountry();
  const topCountries = liveCountries.filter(
    (c) =>
      prog.topDestinations
        .map((d) => d.toLowerCase())
        .includes(c.name.toLowerCase()) ||
      programsByCountry.get(c.id)?.has(prog.id),
  );

  return (
    <div className="min-h-screen bg-[#FDFCF7] flex flex-col justify-between">
      <Header />

      <main className="flex-1 pb-16">
        {/* Breadcrumbs */}
        <div className="border-b border-[#D9CFB8]/60 bg-[#FDFCF7] py-2.5">
          <div className="mx-auto flex max-w-7xl items-center gap-2 px-4 sm:px-6 lg:px-8 text-xs font-semibold text-slate-500">
            <Link href="/" className="hover:text-[#1D5A6C] transition">
              Home
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
            <Link href="/programs" className="hover:text-[#1D5A6C] transition">
              Programs
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
            <span className="text-[#103B47] font-bold">{prog.name}</span>
          </div>
        </div>

        {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-to-b from-[#103B47] via-[#154654] to-[#1D5A6C] text-white py-14 sm:py-20">
          <div className="pointer-events-none absolute -top-24 left-1/2 -z-0 h-96 w-96 -translate-x-1/2 rounded-full bg-gradient-to-tr from-[#D89A3E]/20 via-[#7C6BAE]/15 to-transparent blur-3xl" />
          <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-xs font-semibold backdrop-blur-md shadow-inner">
              <Award className="h-3.5 w-3.5 text-[#D89A3E]" />
              <span className="text-[#FDFCF7]">
                {show(prog.level, (v) => `${v} Academic Track`)}
              </span>
            </div>

            <h1 className="mt-4 font-display text-3xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-[#FDFCF7] leading-tight">
              Study {prog.name} Abroad for{" "}
              <span className="text-[#D89A3E] italic font-serif">
                Indian Students
              </span>
            </h1>

            <p className="mt-4 text-sm sm:text-base text-[#FDFCF7]/85 max-w-3xl leading-relaxed font-sans">
              {show(prog.summary)}
            </p>

            {/* Quick Specs Grid */}
            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4 max-w-3xl">
              <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-md">
                <span className="block text-[10px] uppercase font-bold text-slate-300 font-mono">
                  Typical Duration
                </span>
                <span className="mt-1 block text-sm sm:text-base font-bold text-white">
                  {show(prog.duration)}
                </span>
              </div>
              <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-md">
                <span className="block text-[10px] uppercase font-bold text-slate-300 font-mono">
                  Career ROI Score
                </span>
                <span className="mt-1 block text-sm sm:text-base font-mono font-bold text-[#D89A3E]">
                  {show(prog.roiScore, (v) => `${v}/100`)}
                </span>
              </div>
              <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-md">
                <span className="block text-[10px] uppercase font-bold text-slate-300 font-mono">
                  Degree Level
                </span>
                <span className="mt-1 block text-sm sm:text-base font-bold text-white">
                  {show(prog.level)}
                </span>
              </div>
              <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-md">
                <span className="block text-[10px] uppercase font-bold text-slate-300 font-mono">
                  Top Destinations
                </span>
                <span className="mt-1 block text-xs sm:text-sm font-bold text-white truncate">
                  {prog.topDestinations.slice(0, 3).join(", ")}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Specialisations Scope & Pathways Table */}
        {specialisations && specialisations.length > 0 ? (
          <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-10">
            <div className="rounded-3xl border border-[#D9CFB8]/70 bg-white p-6 sm:p-8 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#D9CFB8]/50 pb-5">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-[#1D5A6C]/10 border border-[#1D5A6C]/20 px-3 py-1 text-[11px] font-bold text-[#1D5A6C] mb-2">
                    <Sparkles className="h-3.5 w-3.5 text-[#D89A3E]" />
                    <span>Official Curriculum & Specialisation Scope</span>
                  </div>
                  <h2 className="font-display text-xl sm:text-2xl font-bold text-[#103B47]">
                    Specialisations & Degree Formats for {prog.name}
                  </h2>
                  <p className="mt-1 text-xs sm:text-sm text-slate-500 font-sans">
                    Structured focus disciplines, delivery durations, and global
                    licensing pathways.
                  </p>
                </div>
                <span className="self-start sm:self-auto rounded-xl bg-[#F5EFE0] px-3 py-1.5 text-xs font-mono font-bold text-[#103B47] border border-[#D9CFB8]">
                  {specialisations.length} Anchor Focus Tracks
                </span>
              </div>

              {/* Responsive Table */}
              <div className="mt-6 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-[#D9CFB8]/70 bg-[#F5EFE0] text-[10px] uppercase font-serif font-bold tracking-wider text-[#103B47]">
                    <tr>
                      <th className="p-4 rounded-tl-xl">
                        Specialisation Track
                      </th>
                      <th className="p-4">Focus Disciplines</th>
                      <th className="p-4">Duration & Formats</th>
                      <th className="p-4">Top Hubs</th>
                      <th className="p-4 rounded-tr-xl">
                        Licensing / Content Share
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#D9CFB8]/40 font-sans">
                    {specialisations.map((spec) => (
                      <tr
                        key={spec.id}
                        className="hover:bg-[#FDFCF7] transition"
                      >
                        <td className="p-4 align-top">
                          <div className="font-bold text-[#103B47] text-sm font-display">
                            {spec.name}
                          </div>
                          <span className="mt-1 inline-block text-[10px] font-mono font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                            {spec.anchorCategory}
                          </span>
                          {spec.description && (
                            <p className="mt-1.5 text-[11px] text-slate-600 leading-relaxed max-w-xs">
                              {spec.description}
                            </p>
                          )}
                        </td>
                        <td className="p-4 align-top">
                          <div className="flex flex-wrap gap-1.5 max-w-sm">
                            {spec.focusAreas.map((area, i) => (
                              <span
                                key={i}
                                className="rounded-lg bg-[#FDFCF7] border border-[#D9CFB8] px-2.5 py-1 text-[11px] font-medium text-[#103B47]"
                              >
                                ✦ {area}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="p-4 align-top">
                          <div className="space-y-1">
                            {spec.durationFormats.map((d, i) => (
                              <span
                                key={i}
                                className="inline-block rounded-md bg-white border border-[#D9CFB8]/80 px-2 py-0.5 text-[11px] font-mono font-semibold text-slate-700 mr-1"
                              >
                                {d}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="p-4 align-top">
                          <div className="flex flex-wrap gap-1 max-w-[140px]">
                            {spec.targetDestinations.map((dest, i) => (
                              <span
                                key={i}
                                className="rounded bg-[#1D5A6C]/10 text-[#1D5A6C] px-1.5 py-0.5 text-[10px] font-bold font-mono"
                              >
                                {dest}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="p-4 align-top">
                          {spec.licensingPathways &&
                          spec.licensingPathways.length > 0 ? (
                            <div className="space-y-1 mb-2">
                              <span className="block text-[10px] font-bold uppercase tracking-wider text-emerald-800 font-mono">
                                Pathways:
                              </span>
                              {spec.licensingPathways.map((lp, i) => (
                                <span
                                  key={i}
                                  className="inline-block rounded bg-emerald-50 border border-emerald-200 text-emerald-800 px-2 py-0.5 text-[10px] font-mono font-bold mr-1"
                                >
                                  ✓ {lp}
                                </span>
                              ))}
                            </div>
                          ) : null}
                          {spec.contentInvestmentShare && (
                            <div className="text-[11px] font-mono font-semibold text-slate-500">
                              <span className="text-slate-400">Weight: </span>
                              <strong className="text-[#103B47]">
                                {spec.contentInvestmentShare}
                              </strong>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        ) : (
          prog.keyFields &&
          prog.keyFields.length > 0 && (
            <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-10">
              <div className="rounded-2xl border border-[#D9CFB8]/70 bg-white p-6 sm:p-8 shadow-xs">
                <h2 className="font-display text-xl sm:text-2xl font-bold text-[#103B47]">
                  High-Demand Specializations & Tracks
                </h2>
                <p className="mt-1 text-xs sm:text-sm text-slate-500 font-sans">
                  Most popular {prog.name} disciplines chosen by Indian students
                  for global career growth
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {prog.keyFields.map((field, i) => (
                    <span
                      key={i}
                      className="rounded-xl bg-[#FDFCF7] border border-[#D9CFB8]/80 px-3.5 py-1.5 text-xs font-semibold text-[#103B47] shadow-2xs"
                    >
                      ✦ {field}
                    </span>
                  ))}
                </div>
              </div>
            </section>
          )
        )}

        {/* Top Countries Grid */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-10">
          <div className="border-b border-[#D9CFB8]/60 pb-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="font-display text-2xl font-bold text-[#103B47]">
                Top Destinations Offering {prog.name}
              </h2>
              <p className="text-xs text-slate-500 font-sans">
                Compare tuition fees in ₹ Lakhs, post-study visa rights, and
                admission criteria.
              </p>
            </div>
            <span className="self-start sm:self-auto rounded-full bg-[#1D5A6C]/10 px-3 py-1 text-xs font-bold text-[#1D5A6C]">
              {topCountries.length} Eligible Destinations
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {topCountries.map((country) => (
              <Link
                key={country.id}
                href={`/study-in-${country.slug}/${prog.slug}`}
                className="group flex flex-col justify-between rounded-2xl border border-[#D9CFB8]/70 bg-white p-6 shadow-xs hover:border-[#1D5A6C] hover:shadow-xl transition-all duration-200"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <CountryFlag
                      code={country.code}
                      name={country.name}
                      size="md"
                    />
                    <span className="rounded-md bg-[#F5EFE0] px-2 py-0.5 text-[10px] font-mono font-bold text-[#103B47] border border-[#D9CFB8]">
                      {country.tier}
                    </span>
                  </div>

                  <h3 className="mt-4 text-lg font-bold text-[#103B47] font-display group-hover:text-[#D89A3E] transition">
                    {country.name}
                  </h3>

                  <p className="mt-1 text-xs text-slate-500 line-clamp-2 font-sans">
                    {show(country.heroTagline)}
                  </p>

                  <div className="mt-5 space-y-2 border-t border-[#D9CFB8]/40 pt-4 text-xs font-mono">
                    <div className="flex items-center justify-between text-slate-700">
                      <span className="font-sans text-slate-500">
                        Avg Tuition:
                      </span>
                      <span className="font-bold text-[#103B47]">
                        {show(country.avgTuitionINR)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-slate-700">
                      <span className="font-sans text-slate-500">
                        Post-Study Visa:
                      </span>
                      <span className="font-bold text-[#D89A3E]">
                        {show(country.postStudyWorkVisa)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-3 border-t border-[#D9CFB8]/40 flex items-center justify-between text-xs font-bold text-[#1D5A6C]">
                  <span>
                    Explore {country.name} {prog.name} →
                  </span>
                  <ArrowRight className="h-4 w-4 text-[#D89A3E] group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
