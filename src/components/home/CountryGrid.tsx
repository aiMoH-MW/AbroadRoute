import { Suspense } from "react";
import Link from "next/link";
import { ArrowRight, Clock, Banknote, ShieldCheck } from "lucide-react";
import { CountryGridTabs } from "./CountryGridTabs";
import { LeadTriggerButton } from "@/components/home/HomeClientContext";
import { CountryFlag } from "@/components/ui/CountryFlag";
import { CountryCardsSkeleton } from "./HomeSkeletons";
import { SectionError } from "@/components/ui/SectionError";
import { SectionEmpty } from "@/components/ui/SectionEmpty";
import { fetchCountriesFromBackend } from "@/lib/data/liveContent";
import { formatINRRate } from "@/lib/exchangeRates";
import { ExchangeRateCredit } from "@/components/ui/ExchangeRateCredit";
import { NotProvided, show } from "@/components/tools/NotProvided";
import { fetchSiteStats, withCount } from "@/lib/siteStats";


/**
 * Async cards. Suspended by the shell below, so the section heading
 * and tabs paint immediately while destinations stream in from Supabase.
 */
async function CountryCards() {
  let countries;
  try {
    countries = await fetchCountriesFromBackend();
  } catch (err) {
    console.error("CountryGrid backend fetch failed:", err);
    return (
      <div className="mt-10">
        <SectionError
          title="Couldn't load destinations"
          message="We couldn't reach the server to fetch study destinations."
        />
      </div>
    );
  }

  if (countries.length === 0) {
    return (
      <div className="mt-10">
        <SectionEmpty
          title="No destinations available"
          message="No active study destinations are published right now. Please check back soon."
        />
      </div>
    );
  }

  const ratesUpdatedAt = countries.find(
    (c) => c.exchangeRateUpdatedAt,
  )?.exchangeRateUpdatedAt;

  return (
    <>
      <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {countries.map((country) => {
          const isAnchor = country.isAnchor;
          return (
            <div
              key={country.id}
              id={`country-${country.slug}`}
              data-country-tier={country.tier}
              data-is-anchor={isAnchor ? "true" : "false"}
              style={isAnchor ? undefined : { display: "none" }}
              className="group relative flex flex-col justify-between rounded-2xl border border-[#D9CFB8]/60 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-[#1D5A6C]/40 hover:shadow-xl"
            >
              <div>
                {/* Header with Flag and Tier - Clickable to /study-in-[country] */}
                <div className="flex items-center justify-between">
                  <Link
                    href={`/study-in-${country.slug}`}
                    className="flex items-center gap-3 group/link cursor-pointer"
                    title={`Explore study opportunities in ${country.name}`}
                  >
                    <div className="transition transform group-hover/link:scale-105">
                      <CountryFlag
                        countryCode={country.code}
                        countryName={country.name}
                        size="lg"
                      />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-[#1D5A6C] font-display transition group-hover/link:text-[#D89A3E] group-hover/link:underline">
                        {country.name}
                      </h3>
                      <span className="text-[11px] font-semibold text-slate-500">
                        {country.code} • {country.tier}
                      </span>
                    </div>
                  </Link>
                  <span className="rounded-full bg-[#1D5A6C]/10 px-2.5 py-1 text-[10px] font-bold text-[#1D5A6C]">
                    {show(country.safetyRating, (v) => `${v} ★ Safety`)}
                  </span>
                </div>

                <Link href={`/study-in-${country.slug}`} className="block">
                  <p className="mt-3.5 text-xs leading-relaxed text-slate-600 hover:text-[#1D5A6C] transition">
                    {show(country.heroTagline)}
                  </p>
                </Link>

                {/* Key Metrics */}
                <div className="mt-5 space-y-2 border-t border-[#D9CFB8]/40 pt-4 text-xs">
                  <div className="flex items-center justify-between text-slate-700">
                    <span className="flex items-center gap-1.5 text-slate-500">
                      <Banknote className="h-3.5 w-3.5 text-[#D89A3E]" />
                      Avg. Tuition:
                    </span>
                    <span className="font-mono font-bold text-[#1D5A6C]">
                      {show(country.avgTuitionINR)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-700">
                    <span className="flex items-center gap-1.5 text-slate-500">
                      <Clock className="h-3.5 w-3.5 text-[#D89A3E]" />
                      Work Visa (PSW):
                    </span>
                    <span className="font-semibold text-emerald-700">
                      {show(country.postStudyWorkVisa)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-700">
                    <span className="flex items-center gap-1.5 text-slate-500">
                      <ShieldCheck className="h-3.5 w-3.5 text-[#D89A3E]" />
                      Top Intakes:
                    </span>
                    <span className="text-slate-700">
                      {country.topIntakes.join(", ")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-6 flex items-center justify-between border-t border-[#D9CFB8]/40 pt-4">
                <span className="text-[11px] font-mono text-slate-500">
                  {country.exchangeRateToINR !== null
                    ? `${country.currency} (${country.currencySymbol}) ≈ ₹${formatINRRate(country.exchangeRateToINR)}`
                    : "Exchange rate not provided"}
                </span>
                <LeadTriggerButton
                  country={country.name}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1D5A6C] transition hover:text-[#D89A3E]"
                >
                  Apply / Inquire
                  <ArrowRight className="h-3.5 w-3.5 text-[#D89A3E]" />
                </LeadTriggerButton>
              </div>
            </div>
          );
        })}
      </div>
      <ExchangeRateCredit
        updatedAt={ratesUpdatedAt}
        className="mt-4 block text-right text-[11px] font-mono text-slate-500"
      />
    </>
  );
}

export async function CountryGrid() {
  const stats = await fetchSiteStats();
  return (
    <section className="cv-auto py-16 sm:py-24 bg-[#FDFCF7]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-[#1D5A6C]/10 px-3 py-1 text-xs font-bold text-[#1D5A6C]">
              ✦ Global Destinations
            </div>
            <h2 className="mt-2.5 font-display text-3xl font-bold tracking-tight text-[#103B47] sm:text-4xl">
              Anchor Destinations & {withCount(stats.countries, "Global Countries")}
            </h2>
            <p className="mt-2 text-sm text-slate-600 max-w-2xl">
              Explore our anchor study destinations alongside high-ROI
              European and accredited medical countries.
            </p>
          </div>

          {/* Tier / Anchor Filter Tabs Client Component */}
          <CountryGridTabs
            allCount={stats.countries}
            anchorCount={stats.anchorCountries}
          />
        </div>

        {/* Countries Grid */}
        <Suspense fallback={<CountryCardsSkeleton />}>
          <CountryCards />
        </Suspense>
      </div>
    </section>
  );
}
