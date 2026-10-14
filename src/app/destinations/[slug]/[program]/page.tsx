import { notFound } from "next/navigation";
import Link from "next/link";
import { Metadata } from "next";
import {
  ChevronRight,
  CheckCircle2,
  Calendar,
  DollarSign,
  Briefcase,
  GraduationCap,
} from "lucide-react";
import {
  fetchLiveCountries,
  fetchLivePrograms,
  fetchLiveUniversities,
  getLiveCountryBySlug,
  getLiveProgramBySlug,
} from "@/lib/supabase/dataFetchers";
import { fitMetaDescription } from "@/lib/seo/metaUtils";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CountryInquiryForm } from "@/components/country/CountryInquiryForm";
import { fetchCountryProgramPages } from "@/lib/siteContent";
import { fetchProgramsByCountry } from "@/lib/siteStats";
import { CountryFlag } from "@/components/ui/CountryFlag";
import { NotProvided, show } from "@/components/tools/NotProvided";

interface Props {
  params: Promise<{ slug: string; program: string }>;
}

export async function generateStaticParams() {
  const [countries, programs] = await Promise.all([
    fetchLiveCountries(),
    fetchLivePrograms(),
  ]);

  const paramSet = new Set<string>();
  const params: { slug: string; program: string }[] = [];

  const addParam = (slug: string, program: string) => {
    const key = `${slug.toLowerCase()}___${program.toLowerCase()}`;
    if (!paramSet.has(key)) {
      paramSet.add(key);
      params.push({ slug: slug.toLowerCase(), program: program.toLowerCase() });
    }
  };

  // 1. Country x program pages set up in admin (country_programs)
  const countrySlugById = new Map(countries.map((c) => [c.id, c.slug]));
  for (const page of await fetchCountryProgramPages()) {
    const slug = countrySlugById.get(page.countryId);
    if (!slug) continue;
    addParam(slug, page.programId);
    if (page.urlAlias) addParam(slug, page.urlAlias);
  }

  // 2. Programs offered by universities in each destination
  const programsByCountry = await fetchProgramsByCountry();
  for (const c of countries) {
    for (const p of programsByCountry.get(c.id) ?? []) {
      addParam(c.slug, p);
      if (p === "ms") addParam(c.slug, "masters");
      if (p === "emba") addParam(c.slug, "executive-mba");
    }
  }

  return params;
}

// "Minimum 6.5 – 7.5" from the values the universities state; others ignored
function rangeLabel(
  values: (number | null | undefined)[],
  format: (v: number) => string,
  prefix: string,
): string {
  const nums = values.filter((v): v is number => typeof v === "number");
  if (nums.length === 0) return "Not provided";
  const min = Math.min(...nums);
  const max = Math.max(...nums);
  return `${prefix} ${min === max ? format(min) : `${format(min)} – ${format(max)}`}`;
}

function greSummary(values: (boolean | null)[]): string {
  const known = values.filter((v): v is boolean => v !== null);
  if (known.length === 0) return "Not provided";
  const required = known.filter(Boolean).length;
  if (required === 0) return "Not required by the listed universities";
  if (required === known.length) return "Required by the listed universities";
  return `Required by ${required} of ${known.length} listed universities`;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, program } = await params;
  const [country, prog] = await Promise.all([
    getLiveCountryBySlug(slug || ""),
    getLiveProgramBySlug(program || ""),
  ]);

  if (!country || !prog) return { title: "Program Not Found" };

  const canonicalProgramSlug =
    program.toLowerCase() === "masters"
      ? "masters"
      : program.toLowerCase() === "executive-mba"
        ? "executive-mba"
        : prog.slug;

  const rawDescription = `Complete admissions guide for ${prog.name} in ${country.name}. Tuition ranges (${country.avgTuitionINR}), post-study work visa (${country.postStudyWorkVisa}), eligibility, and Indian student intake deadlines.`;

  return {
    title: `${prog.name} in ${country.name} for Indian Students (2026-2027) | Top Universities & Fees`,
    description: fitMetaDescription(rawDescription),
    alternates: {
      canonical: `/study-in-${country.slug}/${canonicalProgramSlug}`,
    },
    openGraph: {
      title: `${prog.name} in ${country.name} (2026-2027) — Abroadroute`,
      description: fitMetaDescription(rawDescription),
      url: `/study-in-${country.slug}/${canonicalProgramSlug}`,
      type: "website",
    },
  };
}

export default async function CountryProgramPage({ params }: Props) {
  const { slug, program } = await params;
  const [country, prog, liveUniversities] = await Promise.all([
    getLiveCountryBySlug(slug || ""),
    getLiveProgramBySlug(program || ""),
    fetchLiveUniversities(),
  ]);

  if (!country || !prog) {
    notFound();
  }

  const relevantUniversities = liveUniversities.filter(
    (u) =>
      u.countrySlug === country.slug &&
      (u.programsOffered || []).includes(prog.slug as any),
  );

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: `${prog.name} in ${country.name}`,
    description: `Study ${prog.name} in ${country.name}. Check top universities, tuition fees in INR, entrance requirements, and post-study work visa rights for Indian applicants.`,
    provider: {
      "@type": "EducationalOrganization",
      name: "Abroadroute",
      url: "https://abroadroute.com",
    },
    hasCourseInstance: {
      "@type": "CourseInstance",
      courseMode: "Full-time",
      courseWorkload: prog.duration,
    },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://abroadroute.com",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: `Study in ${country.name}`,
        item: `https://abroadroute.com/study-in-${country.slug}`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: `${prog.name} in ${country.name}`,
        item: `https://abroadroute.com/study-in-${country.slug}/${prog.slug}`,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-[#FDFCF7] flex flex-col justify-between">
      <Header />

      {/* JSON-LD Schemas */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <main className="flex-1 pb-16">
        {/* Breadcrumb Navigation */}
        <div className="border-b border-[#D9CFB8]/60 bg-[#FDFCF7] py-2.5">
          <div className="mx-auto flex max-w-7xl items-center gap-2 px-4 sm:px-6 lg:px-8 text-xs font-semibold text-slate-500">
            <Link href="/" className="hover:text-[#1D5A6C] transition">
              Home
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
            <Link
              href={`/study-in-${country.slug}`}
              className="hover:text-[#1D5A6C] transition"
            >
              {country.name}
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
            <span className="text-[#103B47] font-bold">{prog.name}</span>
          </div>
        </div>

        {/* Hero Conversion Header */}
        <section className="relative overflow-hidden bg-gradient-to-b from-[#103B47] via-[#154654] to-[#1D5A6C] text-white py-12 sm:py-16">
          <div className="pointer-events-none absolute -top-24 left-1/2 -z-0 h-96 w-96 -translate-x-1/2 rounded-full bg-gradient-to-tr from-[#D89A3E]/20 via-[#7C6BAE]/15 to-transparent blur-3xl" />
          <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-1 text-xs font-semibold backdrop-blur-md shadow-inner">
              <CountryFlag code={country.code} name={country.name} size="sm" />
              <span className="text-[#FDFCF7]">
                {show(prog.level, (v) => `${v} Track`)}
              </span>
            </div>

            <h1 className="mt-4 font-display text-3xl sm:text-4xl lg:text-5xl font-semibold text-[#FDFCF7] leading-tight">
              {prog.name} in {country.name} for{" "}
              <span className="text-[#D89A3E] italic font-serif">
                Indian Students
              </span>
            </h1>

            <p className="mt-3 text-sm sm:text-base text-[#FDFCF7]/85 max-w-2xl leading-relaxed font-sans">
              Discover top universities offering {prog.name} in {country.name},
              realistic tuition costs in INR, eligibility criteria, and
              post-study work authorization.
            </p>

            {/* Program Quick Specs */}
            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 max-w-4xl">
              <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-md">
                <span className="text-[10px] uppercase font-bold text-slate-300 font-mono">
                  Typical Duration
                </span>
                <span className="mt-1 block text-sm font-bold text-white font-mono">
                  {show(prog.duration)}
                </span>
              </div>
              <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-md">
                <span className="text-[10px] uppercase font-bold text-slate-300 font-mono">
                  Est. Tuition
                </span>
                <span className="mt-1 block text-sm font-bold text-white font-mono">
                  {show(country.avgTuitionINR)}
                </span>
              </div>
              <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-md">
                <span className="text-[10px] uppercase font-bold text-slate-300 font-mono">
                  Post-Study Visa
                </span>
                <span className="mt-1 block text-sm font-bold text-[#D89A3E] font-mono">
                  {show(country.postStudyWorkVisa)}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Content Layout */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-10">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
            <div className="lg:col-span-8 space-y-8">
              {/* Specialization Areas */}
              <section className="rounded-2xl border border-[#D9CFB8]/70 bg-white p-6 sm:p-8 shadow-xs">
                <h2 className="text-xl font-display font-bold text-[#103B47]">
                  High-Demand Specializations
                </h2>
                <p className="mt-1 text-xs text-slate-500 font-sans">
                  Popular tracks Indian students pursue in {country.name}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {(prog.keyFields || []).map((field: string, i: number) => (
                    <span
                      key={i}
                      className="rounded-lg bg-[#FDFCF7] border border-[#D9CFB8]/60 px-3 py-1.5 text-xs font-semibold text-[#103B47]"
                    >
                      {field}
                    </span>
                  ))}
                </div>
              </section>

              {/* Universities Offering this Program */}
              <section className="rounded-2xl border border-[#D9CFB8]/70 bg-white p-6 sm:p-8 shadow-xs">
                <h2 className="text-xl font-display font-bold text-[#103B47]">
                  Universities in {country.name} Offering {prog.name}
                </h2>
                <div className="mt-6 space-y-4">
                  {relevantUniversities.length > 0 ? (
                    relevantUniversities.map((uni) => (
                      <div
                        key={uni.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between rounded-xl border border-[#D9CFB8]/60 p-4 hover:border-[#1D5A6C] transition bg-[#FDFCF7]"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-[#103B47] font-display">
                              {uni.name}
                            </span>
                            <span className="rounded bg-[#F5EFE0] px-1.5 py-0.5 text-[10px] font-mono font-bold text-[#103B47] border border-[#D9CFB8]">
                              {show(uni.rankingGlobal, (v) => `QS #${v}`)}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-1 font-sans">
                            {[uni.city, country.name]
                              .filter(Boolean)
                              .join(", ")}{" "}
                            • Intakes:{" "}
                            {uni.intakes.join(", ") || "Not provided"}
                          </p>
                        </div>
                        <div className="mt-3 sm:mt-0 flex items-center gap-3">
                          <span className="text-xs font-mono font-semibold text-[#103B47]">
                            {show(uni.tuitionFeeRangeINR)}
                          </span>
                          <Link
                            href={`/universities/${uni.slug}`}
                            className="rounded-lg bg-[#1D5A6C] px-3.5 py-1.5 text-xs font-bold text-white hover:bg-[#103B47] transition active:scale-95"
                          >
                            Explore →
                          </Link>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-xl bg-[#FDFCF7] border border-dashed border-[#D9CFB8] p-6 text-center text-xs text-slate-500">
                      No universities in {country.name} are listed for{" "}
                      {prog.name} yet.
                    </div>
                  )}
                </div>
              </section>

              {/* Admission Requirements */}
              <section className="rounded-2xl border border-[#D9CFB8]/70 bg-white p-6 sm:p-8 shadow-xs">
                <h2 className="text-xl font-display font-bold text-[#103B47]">
                  Entry Requirements for Indian Students
                </h2>
                <p className="mt-1 text-[11px] text-slate-500">
                  Range across the universities listed above.
                </p>
                <div className="mt-4 space-y-2.5 text-xs text-slate-600 font-sans">
                  {[
                    {
                      label: "Academic Background",
                      value: rangeLabel(
                        relevantUniversities.map((u) => u.minPercentage),
                        (v) => `${v}%`,
                        "Minimum",
                      ),
                    },
                    {
                      label: "IELTS",
                      value: rangeLabel(
                        relevantUniversities.map((u) => u.ieltsMinScore),
                        (v) => `${v}`,
                        "Overall band",
                      ),
                    },
                    {
                      label: "TOEFL iBT",
                      value: rangeLabel(
                        relevantUniversities.map((u) => u.toeflMinScore),
                        (v) => `${v}`,
                        "Minimum",
                      ),
                    },
                    {
                      label: "GRE / GMAT",
                      value: greSummary(
                        relevantUniversities.map((u) => u.greGmatRequired),
                      ),
                    },
                  ].map((row) => (
                    <div key={row.label} className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>
                        <strong>{row.label}:</strong> {row.value}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* Right Rail Lead Form */}
            <div className="lg:col-span-4">
              <CountryInquiryForm
                countryName={country.name}
                countrySlug={country.slug}
                availablePrograms={[
                  { id: prog.id, slug: prog.slug, name: prog.name },
                ]}
              />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
