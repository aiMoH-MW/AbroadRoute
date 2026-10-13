import Link from "next/link";
import { Metadata } from "next";
import {
  Compass,
  ArrowRight,
  Banknote,
  Clock,
  ShieldCheck,
  Award,
  ChevronRight,
} from "lucide-react";
import { fetchLiveCountries } from "@/lib/supabase/dataFetchers";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CountryFlag } from "@/components/ui/CountryFlag";
import { CountryGridTabs } from "@/components/home/CountryGridTabs";
import { PeacockEye } from "@/components/ui/BrandSignatures";
import { NotProvided, show } from "@/components/tools/NotProvided";
import { fetchSiteStats, withCount, tuitionRangeLabel } from "@/lib/siteStats";

export const metadata: Metadata = {
  title: "All Study Destinations | Compare Tuition, Visas & Rankings",
  description:
    "Explore global study destinations for Indian students. Compare tuition in ₹ Lakhs, post-study work visas, and acceptance criteria across Tier 1, Tier 2, and MBBS hubs.",
  alternates: {
    canonical: "/destinations",
  },
};


export default async function DestinationsIndexPage() {
  const [countries, stats] = await Promise.all([
    fetchLiveCountries(),
    fetchSiteStats(),
  ]);
  const tuitionRange = tuitionRangeLabel(stats);

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
            <span className="text-[#103B47] font-bold">Destinations</span>
          </div>
        </div>

        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-b from-[#103B47] via-[#154654] to-[#1D5A6C] text-white py-14 sm:py-20">
          <div className="pointer-events-none absolute -top-24 left-1/2 -z-0 h-96 w-96 -translate-x-1/2 rounded-full bg-gradient-to-tr from-[#D89A3E]/20 via-[#7C6BAE]/15 to-transparent blur-3xl" />
          <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center sm:text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-xs font-semibold backdrop-blur-md shadow-inner">
              <PeacockEye size={12} />
              <span className="text-[#FDFCF7]">
                Authoritative Admissions Engine
              </span>
            </div>

            <h1 className="mt-4 font-display text-3xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-[#FDFCF7] leading-tight">
              {withCount(countries.length, "Global Destinations")},{" "}
              <span className="text-[#D89A3E] italic font-serif">
                One Honest Place.
              </span>
            </h1>

            <p className="mt-4 text-sm sm:text-base text-[#FDFCF7]/85 max-w-2xl leading-relaxed font-sans">
              Compare genuine tuition in ₹ Lakhs, real post-study visa rights,
              and admission criteria across top English-speaking, European, and
              medical destinations.
            </p>

            {/* Quick Micro-Stats */}
            <div className="mt-8 grid grid-cols-3 gap-3 sm:gap-6 max-w-md border-t border-white/15 pt-6 text-left">
              <div>
                <span className="font-mono text-xl sm:text-2xl font-bold text-white">
                  {countries.length || "—"}
                </span>
                <p className="text-[11px] text-slate-300 font-sans">
                  Countries
                </p>
              </div>
              <div>
                <span className="font-mono text-xl sm:text-2xl font-bold text-[#D89A3E]">
                  {stats.universities || "—"}
                </span>
                <p className="text-[11px] text-slate-300 font-sans">
                  Universities
                </p>
              </div>
              <div>
                <span className="font-mono text-xl sm:text-2xl font-bold text-[#A8CDBD]">
                  {tuitionRange ?? "—"}
                </span>
                <p className="text-[11px] text-slate-300 font-sans">
                  {tuitionRange ? "Tuition / yr" : "Tuition not provided"}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Directory Grid & Tabs */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-12">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#D9CFB8]/60 pb-6">
            <div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#103B47]">
                Explore All Study Destinations
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-slate-500 font-sans">
                Filter by priority tiers, post-study work policies, or medical
                compliance.
              </p>
            </div>
            <CountryGridTabs
              allCount={countries.length}
              anchorCount={
                countries.filter((c) => c.isAnchor)
                  .length
              }
            />
          </div>

          {/* Cards Grid */}
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {countries.map((country) => {
              const isAnchor = country.isAnchor;
              return (
                <div
                  key={country.id}
                  id={`country-${country.slug}`}
                  data-country-tier={country.tier}
                  data-is-anchor={isAnchor ? "true" : "false"}
                  className="group relative flex flex-col justify-between rounded-2xl border border-[#D9CFB8]/70 bg-white p-6 shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-[#1D5A6C] hover:shadow-xl"
                >
                  <div>
                    {/* Header with Flag and Tier */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <CountryFlag
                          code={country.code}
                          name={country.name}
                          size="md"
                        />
                        <div>
                          <h3 className="text-lg font-bold text-[#103B47] font-display transition group-hover:text-[#D89A3E]">
                            {country.name}
                          </h3>
                          <span className="text-[11px] font-semibold text-slate-500 font-mono">
                            {country.code} • {country.tier}
                          </span>
                        </div>
                      </div>
                      <span className="rounded-full bg-[#1D5A6C]/10 px-2.5 py-1 text-[10px] font-bold text-[#1D5A6C]">
                        {show(country.safetyRating, (v) => `${v} ★ Safety`)}
                      </span>
                    </div>

                    <p className="mt-3.5 text-xs leading-relaxed text-slate-600 line-clamp-2 font-sans">
                      {show(country.heroTagline)}
                    </p>

                    {/* Key Metrics */}
                    <div className="mt-5 space-y-2 border-t border-[#D9CFB8]/40 pt-4 text-xs">
                      <div className="flex items-center justify-between text-slate-700">
                        <span className="flex items-center gap-1.5 text-slate-500">
                          <Banknote className="h-3.5 w-3.5 text-[#D89A3E]" />
                          Avg. Tuition:
                        </span>
                        <span className="font-mono font-bold text-[#103B47]">
                          {show(country.avgTuitionINR)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-slate-700">
                        <span className="flex items-center gap-1.5 text-slate-500">
                          <Clock className="h-3.5 w-3.5 text-[#1D5A6C]" />
                          Post-Study Visa:
                        </span>
                        <span className="font-mono font-bold text-[#D89A3E]">
                          {show(country.postStudyWorkVisa)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-slate-700">
                        <span className="flex items-center gap-1.5 text-slate-500">
                          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                          Cost of Living:
                        </span>
                        <span className="font-mono font-medium text-slate-700">
                          {show(country.avgLivingCostINR)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card Bottom CTA */}
                  <div className="mt-6 border-t border-[#D9CFB8]/40 pt-4">
                    <Link
                      href={`/study-in-${country.slug}`}
                      className="flex w-full min-h-[44px] items-center justify-center gap-2 rounded-xl bg-[#1D5A6C]/5 py-2.5 text-xs font-bold text-[#1D5A6C] border border-[#1D5A6C]/20 transition group-hover:bg-[#1D5A6C] group-hover:text-white"
                    >
                      <Compass className="h-3.5 w-3.5 text-[#D89A3E]" />
                      <span>Explore {country.name} Guide</span>
                      <ArrowRight className="h-3.5 w-3.5 text-[#D89A3E]" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
