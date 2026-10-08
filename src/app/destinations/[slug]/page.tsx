import { notFound } from "next/navigation";
import Link from "next/link";
import { Metadata } from "next";
import {
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Building2,
  ArrowRight,
  Plane,
  Coins,
} from "lucide-react";
import {
  fetchLiveCountries,
  fetchLivePrograms,
  fetchLiveUniversities,
  getLiveCountryBySlug,
  COUNTRY_ALIASES,
} from "@/lib/supabase/dataFetchers";
import { fitMetaDescription } from "@/lib/seo/metaUtils";
import { formatINRRate } from "@/lib/exchangeRates";
import { ExchangeRateCredit } from "@/components/ui/ExchangeRateCredit";
import { getCountryEditorial } from "@/lib/data/contentData";
import { getPillarGuideByCountry } from "@/lib/sanity/fetchers";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CountryInquiryForm } from "@/components/country/CountryInquiryForm";
import { CountryFlag } from "@/components/ui/CountryFlag";
import { CostCalculatorWidget } from "@/components/home/CostCalculatorWidget";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const liveCountries = await fetchLiveCountries();
  const canonicalParams = liveCountries.map((c) => ({
    slug: c.slug,
  }));
  const aliasParams = Object.keys(COUNTRY_ALIASES).map((alias) => ({
    slug: alias,
  }));
  return [...canonicalParams, ...aliasParams];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const country = await getLiveCountryBySlug(slug || "");
  if (!country) return { title: "Country Not Found" };

  const rawDescription = `Complete guide to studying in ${country.name} for Indian students. Compare tuition fees in INR (${country.avgTuitionINR}), post-study work visa (${country.postStudyWorkVisa}), top universities, and scholarships.`;

  return {
    title: `Study in ${country.name} for Indian Students (2026-2027) | Cost, Visas & Top Universities`,
    description: fitMetaDescription(rawDescription),
    alternates: {
      canonical: `/study-in-${country.slug}`,
    },
  };
}

export default async function CountryHubPage({ params }: Props) {
  const resolvedParams = await params;
  let rawSlug = resolvedParams?.slug || "";
  if (rawSlug.startsWith("study-in-")) {
    rawSlug = rawSlug.replace("study-in-", "");
  }
  const [country, allLiveUnis, allPrograms] = await Promise.all([
    getLiveCountryBySlug(rawSlug),
    fetchLiveUniversities(),
    fetchLivePrograms(),
  ]);

  if (!country) {
    notFound();
  }

  const baseEditorial = getCountryEditorial(country.slug);
  const sanityGuide = await getPillarGuideByCountry(country.slug);
  const editorial = baseEditorial
    ? {
        ...baseEditorial,
        heroSubtitle: sanityGuide?.heroSubtitle || baseEditorial.heroSubtitle,
        overviewParagraphs: sanityGuide?.overview
          ? [sanityGuide.overview]
          : baseEditorial.overviewParagraphs,
        faqs:
          sanityGuide?.faqs && sanityGuide.faqs.length > 0
            ? sanityGuide.faqs
            : baseEditorial.faqs,
      }
    : null;
  const universitiesInCountry = allLiveUnis.filter(
    (u) => u.countrySlug === country.slug,
  );

  const popularProgs = Array.isArray(country.popularPrograms)
    ? country.popularPrograms
    : ["ms", "mba"];
  const availablePrograms = allPrograms.filter((p) =>
    popularProgs.includes(p.slug as any),
  );

  const topIntakesList = Array.isArray(country.topIntakes)
    ? country.topIntakes
    : ["Fall", "Spring"];

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
            <Link
              href="/destinations"
              className="hover:text-[#1D5A6C] transition"
            >
              Destinations
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
            <span className="text-[#103B47] font-bold">{country.name}</span>
          </div>
        </div>

        {/* 1. Hero with Quick Stats (Brand Guidelines v5.1 Spec) */}
        <section className="relative overflow-hidden bg-gradient-to-b from-[#103B47] via-[#154654] to-[#1D5A6C] text-white py-12 sm:py-16">
          <div className="pointer-events-none absolute -top-24 left-1/2 -z-0 h-96 w-96 -translate-x-1/2 rounded-full bg-gradient-to-tr from-[#D89A3E]/20 via-[#7C6BAE]/15 to-transparent blur-3xl" />
          <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-1 text-xs font-semibold backdrop-blur-md shadow-inner">
              <CountryFlag
                countryCode={country.code}
                countryName={country.name}
                size="sm"
              />
              <span className="text-[#FDFCF7]">
                Destination Guide • {country.tier}
              </span>
            </div>

            <h1 className="mt-4 font-display text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-[#FDFCF7] leading-tight">
              Study in {country.name} for{" "}
              <span className="text-[#D89A3E] italic font-serif">
                Indian Students
              </span>{" "}
              (2026–2027)
            </h1>

            <p className="mt-3 text-sm sm:text-base text-[#FDFCF7]/85 max-w-3xl leading-relaxed font-sans">
              {editorial?.heroSubtitle || country.heroTagline}
            </p>

            {/* Quick Stats Grid */}
            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
              <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-md">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-300 font-mono">
                  Avg Tuition
                </span>
                <span className="mt-1 block text-sm sm:text-base font-mono font-bold text-white">
                  {country.avgTuitionINR}
                </span>
              </div>
              <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-md">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-300 font-mono">
                  Living Costs
                </span>
                <span className="mt-1 block text-sm sm:text-base font-mono font-bold text-white">
                  {country.avgLivingCostINR}
                </span>
              </div>
              <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-md">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-300 font-mono">
                  Post-Study Visa
                </span>
                <span className="mt-1 block text-sm sm:text-base font-mono font-bold text-[#D89A3E]">
                  {country.postStudyWorkVisa}
                </span>
              </div>
              <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-md">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-300 font-mono">
                  Top Intakes
                </span>
                <span className="mt-1 block text-xs sm:text-sm font-bold text-white">
                  {topIntakesList.join(", ")}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* 2-Column Main Content + Sticky Lead Form */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-10">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
            {/* Left Content Area (8 Cols) */}
            <div className="lg:col-span-8 min-w-0 space-y-12">
              {/* 2. Overview & Why Choose */}
              <section className="rounded-2xl border border-[#D9CFB8]/70 bg-white p-6 sm:p-8 shadow-xs">
                <h2 className="text-xl sm:text-2xl font-display font-bold tracking-tight text-[#103B47]">
                  {editorial?.overviewHeading || `Why Choose ${country.name}?`}
                </h2>
                <div className="mt-4 space-y-3 text-sm text-slate-600 leading-relaxed font-sans">
                  {editorial ? (
                    editorial.overviewParagraphs.map((p, idx) => (
                      <p key={idx}>{p}</p>
                    ))
                  ) : (
                    <p>{country.overview}</p>
                  )}
                </div>

                {editorial && (
                  <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {editorial.whyChooseReasons.map((r, i) => (
                      <div
                        key={i}
                        className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-4"
                      >
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 mb-2" />
                        <h4 className="text-xs font-bold text-emerald-900">
                          {r.title}
                        </h4>
                        <p className="mt-1 text-[11px] text-slate-600 leading-snug">
                          {r.desc}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {editorial && editorial.tradeoffsToKnow.length > 0 && (
                  <div className="mt-6 rounded-xl border border-[#D89A3E]/30 bg-[#F5EFE0]/50 p-4">
                    <div className="flex items-center gap-2 text-xs font-bold text-[#103B47] mb-2 font-mono">
                      <AlertCircle className="h-4 w-4 text-[#D89A3E]" />
                      <span>
                        Important Trade-Offs & Requirements to Know Upfront
                      </span>
                    </div>
                    <div className="space-y-2 text-[11px] text-slate-700">
                      {editorial.tradeoffsToKnow.map((t, idx) => (
                        <p key={idx}>
                          <strong>{t.title}:</strong> {t.desc}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </section>

              {/* 3. Programs in Country */}
              <section className="rounded-2xl border border-[#D9CFB8]/70 bg-white p-6 sm:p-8 shadow-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-display font-bold text-[#103B47]">
                      Available Programs in {country.name}
                    </h2>
                    <p className="mt-1 text-xs text-slate-500">
                      Explore eligible study tracks with Indian qualifications
                    </p>
                  </div>
                  <span className="text-xs font-bold text-[#1D5A6C] bg-[#1D5A6C]/10 px-2.5 py-1 rounded-lg">
                    {availablePrograms.length} Core Streams
                  </span>
                </div>

                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {availablePrograms.map((prog) => (
                    <Link
                      key={prog.id}
                      href={`/destinations/${country.slug}/${prog.slug}`}
                      className="group flex flex-col justify-between rounded-xl border border-[#D9CFB8]/60 p-4 transition-all hover:border-[#1D5A6C] hover:shadow-md bg-white"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-[#103B47] group-hover:text-[#D89A3E] transition-colors">
                            {prog.name}
                          </span>
                          <span className="rounded-md bg-[#FDFCF7] border border-[#D9CFB8]/50 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                            {prog.duration}
                          </span>
                        </div>
                        <p className="mt-1.5 text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                          {prog.summary}
                        </p>
                      </div>
                      <div className="mt-3 flex items-center gap-1 text-[11px] font-bold text-[#1D5A6C] group-hover:translate-x-1 transition-transform">
                        <span>View universities & requirements</span>
                        <ArrowRight className="h-3 w-3 text-[#D89A3E]" />
                      </div>
                    </Link>
                  ))}
                </div>
              </section>

              {/* 4. Cost Breakdown Table */}
              <section className="rounded-2xl border border-[#D9CFB8]/70 bg-white p-6 sm:p-8 shadow-xs">
                <div className="flex items-center gap-2 mb-2">
                  <Coins className="h-5 w-5 text-[#D89A3E]" />
                  <h2 className="text-xl font-display font-bold text-[#103B47]">
                    Cost of Studying in {country.name} (INR Estimates)
                  </h2>
                </div>
                <p className="text-xs text-slate-500 mb-6">
                  Based on current currency exchange rates ({country.currency} 1
                  ≈ ₹{formatINRRate(country.exchangeRateToINR)}).{" "}
                  <ExchangeRateCredit updatedAt={country.exchangeRateUpdatedAt} />
                </p>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-[#D9CFB8] text-[11px] uppercase tracking-wider text-[#103B47] bg-[#F5EFE0] font-mono">
                        <th className="py-2.5 px-3">Program Track</th>
                        <th className="py-2.5 px-3">Tuition / Year</th>
                        <th className="py-2.5 px-3">Living Costs</th>
                        <th className="py-2.5 px-3">Total Annual</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium font-mono">
                      {editorial?.costBreakdown ? (
                        editorial.costBreakdown.map((c, i) => (
                          <tr key={i} className="hover:bg-[#FDFCF7] transition">
                            <td className="py-3 px-3 font-sans font-bold text-[#103B47]">
                              {c.programType}
                            </td>
                            <td className="py-3 px-3 text-slate-600">
                              {c.tuitionRangeINR}
                            </td>
                            <td className="py-3 px-3 text-slate-600">
                              {c.livingCostINR}
                            </td>
                            <td className="py-3 px-3 font-bold text-[#1D5A6C]">
                              {c.totalAnnualINR}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td className="py-3 px-3 font-sans font-bold text-[#103B47]">
                            General Degree Average
                          </td>
                          <td className="py-3 px-3">{country.avgTuitionINR}</td>
                          <td className="py-3 px-3">
                            {country.avgLivingCostINR}
                          </td>
                          <td className="py-3 px-3 font-bold text-[#1D5A6C]">
                            ₹25 - 45 Lakhs
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {editorial?.hiddenCosts && (
                  <div className="mt-6 pt-6 border-t border-[#D9CFB8]/40">
                    <h4 className="text-xs font-bold text-[#103B47] mb-2.5 font-mono">
                      Other Mandatory Incidental Costs:
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                      {editorial.hiddenCosts.map((h, i) => (
                        <div
                          key={i}
                          className="rounded-lg bg-[#FDFCF7] p-2.5 border border-[#D9CFB8]/60"
                        >
                          <span className="block text-slate-500 font-sans">
                            {h.item}
                          </span>
                          <span className="font-bold text-[#103B47] font-mono">
                            {h.costINR}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </section>

              {/* [FR-TOOLS-002] Embedded Country-Specific Cost Calculator */}
              <div className="my-2">
                <CostCalculatorWidget
                  defaultCountry={country.slug}
                  variant="embedded"
                />
              </div>

              {/* 5. Top Universities */}
              <section className="rounded-2xl border border-[#D9CFB8]/70 bg-white p-6 sm:p-8 shadow-xs">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-display font-bold text-[#103B47]">
                      Featured Universities in {country.name}
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      Institutions actively recruiting Indian candidates
                    </p>
                  </div>
                </div>

                {universitiesInCountry.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {universitiesInCountry.map((uni) => (
                      <Link
                        key={uni.id}
                        href={`/universities/${uni.slug}`}
                        className="group rounded-xl border border-[#D9CFB8]/60 p-4 transition hover:border-[#1D5A6C] hover:shadow-md bg-white"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#1D5A6C]/10 text-[#1D5A6C]">
                            <Building2 className="h-5 w-5 text-[#D89A3E]" />
                          </div>
                          <span className="rounded-md bg-[#F5EFE0] px-2 py-0.5 text-[10px] font-mono font-bold text-[#103B47] border border-[#D9CFB8]">
                            QS #{uni.rankingGlobal}
                          </span>
                        </div>
                        <h3 className="mt-3 text-sm font-bold text-[#103B47] group-hover:text-[#D89A3E] transition font-sans">
                          {uni.name}
                        </h3>
                        <span className="text-xs text-slate-500">
                          {uni.city}, {country.name}
                        </span>
                        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                          <span className="text-slate-500 font-mono font-medium">
                            {uni.tuitionFeeRangeINR}
                          </span>
                          <span className="font-bold text-[#1D5A6C] group-hover:text-[#D89A3E]">
                            View Profile →
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-[#D9CFB8] p-6 text-center text-xs text-slate-500">
                    Showing all institutional programs matching {country.name}{" "}
                    curriculum standards.
                  </div>
                )}
              </section>

              {/* 6. Visa & Post-Study Work */}
              <section className="rounded-2xl border border-[#D9CFB8]/70 bg-white p-6 sm:p-8 shadow-xs">
                <div className="flex items-center gap-2 mb-4">
                  <Plane className="h-5 w-5 text-[#D89A3E]" />
                  <h2 className="text-xl font-display font-bold text-[#103B47]">
                    Student Visa & Post-Study Work Rights
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="rounded-xl bg-[#FDFCF7] p-4 border border-[#D9CFB8]/60">
                    <span className="text-[10px] font-bold uppercase text-slate-400 font-mono">
                      Visa Classification
                    </span>
                    <p className="mt-1 font-bold text-[#103B47]">
                      {editorial?.visaDetails.visaType ||
                        `${country.name} Student Visa`}
                    </p>
                    <span className="mt-2 block text-[10px] font-bold uppercase text-slate-400 font-mono">
                      Processing Time
                    </span>
                    <p className="mt-1 font-medium text-slate-700">
                      {editorial?.visaDetails.processingTime || "4 to 6 weeks"}
                    </p>
                  </div>
                  <div className="rounded-xl bg-[#FDFCF7] p-4 border border-[#D9CFB8]/60">
                    <span className="text-[10px] font-bold uppercase text-slate-400 font-mono">
                      Part-Time Work Limit
                    </span>
                    <p className="mt-1 font-bold text-[#103B47]">
                      {editorial?.visaDetails.workHoursDuringTerm ||
                        "20 hours / week during terms"}
                    </p>
                    <span className="mt-2 block text-[10px] font-bold uppercase text-slate-400 font-mono">
                      Post-Study Work (PSW)
                    </span>
                    <p className="mt-1 font-mono font-bold text-[#D89A3E]">
                      {editorial?.visaDetails.postStudyWorkDuration ||
                        country.postStudyWorkVisa}
                    </p>
                  </div>
                </div>

                {editorial?.visaDetails.prPathwaySummary && (
                  <div className="mt-4 rounded-xl bg-indigo-50/60 p-4 border border-indigo-100 text-xs">
                    <span className="font-bold text-indigo-950">
                      Permanent Residency (PR) & Settlement Outlook:
                    </span>
                    <p className="mt-1 text-slate-600 leading-relaxed">
                      {editorial.visaDetails.prPathwaySummary}
                    </p>
                  </div>
                )}
              </section>

              {/* 7. FAQs */}
              {editorial?.faqs && editorial.faqs.length > 0 && (
                <section className="rounded-2xl border border-[#D9CFB8]/70 bg-white p-6 sm:p-8 shadow-xs">
                  <div className="flex items-center gap-2 mb-6">
                    <HelpCircle className="h-5 w-5 text-[#D89A3E]" />
                    <h2 className="text-xl font-display font-bold text-[#103B47]">
                      Frequently Asked Questions ({country.name})
                    </h2>
                  </div>

                  <div className="space-y-3.5">
                    {editorial.faqs.map((faq, i) => (
                      <div
                        key={i}
                        className="rounded-xl border border-[#D9CFB8]/50 bg-[#FDFCF7] p-4"
                      >
                        <h4 className="text-xs font-bold text-[#103B47]">
                          {faq.question}
                        </h4>
                        <p className="mt-1.5 text-xs text-slate-600 leading-relaxed font-sans">
                          {faq.answer}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>

            {/* Right Sticky Rail: Interactive Lead Capture Widget */}
            <div className="lg:col-span-4">
              <CountryInquiryForm
                countryName={country.name}
                countrySlug={country.slug}
                availablePrograms={availablePrograms}
              />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
