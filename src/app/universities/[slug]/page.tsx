import { notFound } from "next/navigation";
import Link from "next/link";
import { Metadata } from "next";
import type { ReactNode } from "react";
import {
  Building2,
  MapPin,
  ChevronRight,
  Calendar,
  Layers,
  BookOpen,
  Award,
  ExternalLink,
} from "lucide-react";
import { fetchLiveUniversities } from "@/lib/supabase/dataFetchers";
import { fetchUniversityProfile } from "@/lib/compareData";
import type { CompareUniversity } from "@/lib/compareTypes";
import { formatDateOnly } from "@/lib/deadlines";
import { formatCurrency } from "@/lib/utils";
import { fitMetaDescription } from "@/lib/seo/metaUtils";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { UniversityInquiryForm } from "@/components/university/UniversityInquiryForm";
import { UniversityActions } from "@/components/university/UniversityActions";
import { NotProvided } from "@/components/tools/NotProvided";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const dynamicParams = true;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const unis = await fetchLiveUniversities();
  return unis.map((u) => ({
    slug: u.slug,
  }));
}

const locationOf = (uni: CompareUniversity) =>
  [uni.city, uni.countryName].filter(Boolean).join(", ");

const yesNo = (value: boolean | null) =>
  value === null ? <NotProvided /> : value ? "Required" : "Not required";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const uni = await fetchUniversityProfile(slug);
  if (!uni) return { title: "University Not Found" };

  // Only facts the database actually has
  const facts = [
    uni.rankingGlobal !== null && `Global QS rank #${uni.rankingGlobal}`,
    uni.tuitionFeeRangeINR && `tuition fees (${uni.tuitionFeeRangeINR})`,
    uni.ieltsMinScore !== null && `IELTS ${uni.ieltsMinScore}+`,
  ].filter(Boolean);
  const location = locationOf(uni);
  const rawDescription = `Admissions guide for ${uni.name}${
    location ? ` in ${location}` : ""
  }.${facts.length > 0 ? ` ${facts.join(", ")}.` : ""} Eligibility, intakes and application deadlines for Indian students.`;

  return {
    title: `${uni.name} Admission for Indian Students (2026-2027) | Fees, Eligibility & Rankings`,
    description: fitMetaDescription(rawDescription),
    alternates: {
      canonical: `/universities/${uni.slug}`,
    },
    ...(uni.bannerUrl || uni.logoUrl
      ? {
          openGraph: {
            title: `${uni.name} Admission for Indian Students`,
            description: fitMetaDescription(rawDescription),
            images: [uni.bannerUrl || uni.logoUrl!],
          },
        }
      : {}),
  };
}

function FactTile({
  label,
  children,
  accent = false,
}: {
  label: string;
  children: ReactNode;
  accent?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-[#D9CFB8]/80 bg-white p-4 shadow-2xs">
      <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">
        {label}
      </span>
      <span
        className={`${
          accent ? "text-[#D89A3E]" : "text-[#103B47]"
        } font-mono font-black text-sm mt-1.5 block`}
      >
        {children}
      </span>
    </div>
  );
}

function RequirementRow({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5">
      <dt className="text-xs text-slate-600">{label}</dt>
      <dd className="text-xs font-bold text-[#103B47] text-right">
        {children}
      </dd>
    </div>
  );
}

export default async function UniversityDetailPage({ params }: Props) {
  const { slug } = await params;
  const uni = await fetchUniversityProfile(slug);

  if (!uni) {
    notFound();
  }

  const offersMbbs = uni.programs.some((p) => p.id === "mbbs");

  return (
    <div className="min-h-screen bg-[#FDFCF7] flex flex-col justify-between">
      <Header />

      <main className="flex-1 pb-16">
        {/* Breadcrumb */}
        <div className="border-b border-[#D9CFB8]/60 bg-white/70 backdrop-blur-xs py-2.5">
          <div className="mx-auto flex max-w-7xl items-center gap-2 px-4 sm:px-6 lg:px-8 text-xs font-semibold text-slate-500">
            <Link href="/" className="hover:text-[#103B47] transition">
              Home
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
            {uni.countryId ? (
              <Link
                href={`/destinations/${uni.countryId}`}
                className="hover:text-[#103B47] transition"
              >
                {uni.countryName ?? uni.countryId}
              </Link>
            ) : (
              <Link
                href="/universities"
                className="hover:text-[#103B47] transition"
              >
                Universities
              </Link>
            )}
            <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
            <span className="text-[#103B47] font-bold truncate max-w-[200px] sm:max-w-none">
              {uni.name}
            </span>
          </div>
        </div>

        {/* Campus Banner */}
        {uni.bannerUrl && (
          <div className="relative h-40 sm:h-56 lg:h-72 w-full overflow-hidden bg-[#103B47]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={uni.bannerUrl}
              alt={`${uni.name} campus`}
              className="h-full w-full object-cover"
              fetchPriority="high"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#103B47]/40 to-transparent" />
          </div>
        )}

        {/* University Header Hero */}
        <section
          className={`bg-white border-b border-[#D9CFB8]/70 ${
            uni.bannerUrl ? "pb-8 sm:pb-10 pt-4" : "py-8 sm:py-10"
          }`}
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="flex items-start gap-4">
                {uni.logoUrl ? (
                  <div
                    className={`relative flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center overflow-hidden rounded-2xl border border-[#D9CFB8] bg-white p-2 shadow-md shrink-0 ${
                      uni.bannerUrl ? "-mt-12 sm:-mt-16" : ""
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={uni.logoUrl}
                      alt={`${uni.name} logo`}
                      className="h-full w-full object-contain"
                    />
                  </div>
                ) : (
                  <div
                    className={`relative flex h-16 w-16 items-center justify-center rounded-2xl bg-[#103B47] text-white shadow-md shrink-0 ring-1 ring-[#D89A3E]/30 ${
                      uni.bannerUrl ? "-mt-10" : ""
                    }`}
                  >
                    <Building2 className="h-8 w-8 text-[#D89A3E]" />
                  </div>
                )}
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-md bg-[#D89A3E]/10 px-2.5 py-0.5 text-xs font-bold text-[#D89A3E] border border-[#D89A3E]/30 font-mono">
                      QS World Rank{" "}
                      {uni.rankingGlobal !== null ? (
                        `#${uni.rankingGlobal}`
                      ) : (
                        <NotProvided />
                      )}
                    </span>
                    <span className="rounded-md bg-[#1D5A6C]/10 px-2.5 py-0.5 text-xs font-bold text-[#1D5A6C] border border-[#1D5A6C]/20 font-mono">
                      National{" "}
                      {uni.rankingNational !== null ? (
                        `#${uni.rankingNational}`
                      ) : (
                        <NotProvided />
                      )}
                    </span>
                  </div>
                  <h1 className="mt-2 text-2xl sm:text-3xl lg:text-4xl font-serif font-black text-[#103B47]">
                    {uni.name}
                  </h1>
                  <p className="mt-1 text-xs sm:text-sm text-slate-600 flex items-center gap-1.5 font-medium">
                    <MapPin className="h-4 w-4 text-[#D89A3E]" />
                    {locationOf(uni) || <NotProvided />}
                  </p>
                </div>
              </div>

              <UniversityActions
                universityId={uni.id}
                universitySlug={uni.slug}
                universityName={uni.name}
                countrySlug={uni.countryId ?? ""}
                claimedStatus={uni.claimedStatus || "unclaimed"}
              />
            </div>
          </div>
        </section>

        {/* Tab-Style Content */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-6">
              {/* Key Overview Facts */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <FactTile label="Tuition Estimate">
                  {uni.tuitionFeeRangeINR ?? <NotProvided />}
                </FactTile>
                <FactTile label="Min. IELTS">
                  {uni.ieltsMinScore !== null ? (
                    `${uni.ieltsMinScore} Bands`
                  ) : (
                    <NotProvided />
                  )}
                </FactTile>
                <FactTile label="Acceptance Rate">
                  {uni.acceptanceRate !== null ? (
                    `${uni.acceptanceRate}%`
                  ) : (
                    <NotProvided />
                  )}
                </FactTile>
                <FactTile label="PSW Duration" accent>
                  {uni.postStudyWorkMonths !== null ? (
                    `${uni.postStudyWorkMonths} Months`
                  ) : (
                    <NotProvided />
                  )}
                </FactTile>
              </div>

              {/* Programs Offered */}
              <div className="rounded-2xl border border-[#D9CFB8]/80 bg-white p-6 shadow-2xs">
                <h2 className="flex items-center gap-2 text-lg font-serif font-bold text-[#103B47]">
                  <Layers className="h-5 w-5 text-[#1D5A6C]" />
                  Programs Offered
                </h2>
                {uni.programs.length > 0 ? (
                  <div className="mt-4 overflow-x-auto">
                    <table className="w-full min-w-[480px] text-left text-xs">
                      <thead>
                        <tr className="border-b border-[#D9CFB8]/70 text-[10px] uppercase tracking-wider text-slate-400">
                          <th className="py-2 pr-3 font-bold">Program</th>
                          <th className="py-2 pr-3 font-bold">Level</th>
                          <th className="py-2 pr-3 font-bold">Duration</th>
                          <th className="py-2 font-bold">Tuition (INR / yr)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#D9CFB8]/40">
                        {uni.programs.map((p) => (
                          <tr key={p.id}>
                            <td className="py-2.5 pr-3 font-bold text-[#103B47]">
                              {p.name}
                            </td>
                            <td className="py-2.5 pr-3 text-slate-700">
                              {p.level ?? <NotProvided />}
                            </td>
                            <td className="py-2.5 pr-3 text-slate-700">
                              {p.duration ?? <NotProvided />}
                            </td>
                            <td className="py-2.5 font-mono font-bold text-[#103B47]">
                              {p.yearlyTuitionINR === null ? (
                                <NotProvided />
                              ) : p.yearlyTuitionINR === 0 ? (
                                "₹0 (Tuition Free)"
                              ) : (
                                formatCurrency(p.yearlyTuitionINR)
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="mt-3">
                    <NotProvided />
                  </p>
                )}
              </div>

              {/* Admission Requirements */}
              <div className="rounded-2xl border border-[#D9CFB8]/80 bg-white p-6 shadow-2xs">
                <h2 className="flex items-center gap-2 text-lg font-serif font-bold text-[#103B47]">
                  <BookOpen className="h-5 w-5 text-sky-600" />
                  Admission Requirements
                </h2>
                <dl className="mt-3 grid grid-cols-1 sm:grid-cols-2 sm:gap-x-8 divide-y divide-[#D9CFB8]/40 sm:divide-y-0">
                  <RequirementRow label="Min. Academic Score">
                    {uni.minPercentage !== null ? (
                      `${uni.minPercentage}%`
                    ) : (
                      <NotProvided />
                    )}
                  </RequirementRow>
                  <RequirementRow label="IELTS (overall)">
                    {uni.ieltsMinScore ?? <NotProvided />}
                  </RequirementRow>
                  <RequirementRow label="TOEFL iBT">
                    {uni.toeflMinScore ?? <NotProvided />}
                  </RequirementRow>
                  <RequirementRow label="PTE Academic">
                    {uni.pteMinScore ?? <NotProvided />}
                  </RequirementRow>
                  <RequirementRow label="Duolingo English Test">
                    {uni.duolingoMinScore ?? <NotProvided />}
                  </RequirementRow>
                  <RequirementRow label="GRE / GMAT">
                    {yesNo(uni.greGmatRequired)}
                  </RequirementRow>
                  <RequirementRow label="APS Certificate">
                    {yesNo(uni.apsRequired)}
                  </RequirementRow>
                  <RequirementRow label="4-Year Bachelor's Degree">
                    {yesNo(uni.fourYearDegreeRequired)}
                  </RequirementRow>
                  <RequirementRow label="Max. Backlogs Accepted">
                    {uni.maxBacklogs ?? <NotProvided />}
                  </RequirementRow>
                  {offersMbbs && (
                    <RequirementRow label="NMC Compliant (MBBS)">
                      {uni.nmcCompliant === null ? (
                        <NotProvided />
                      ) : uni.nmcCompliant ? (
                        "Yes"
                      ) : (
                        "No"
                      )}
                    </RequirementRow>
                  )}
                </dl>
                {(uni.requirementsSourceUrl || uni.requirementsVerifiedOn) && (
                  <p className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500">
                    {uni.requirementsVerifiedOn && (
                      <span>
                        Verified on {formatDateOnly(uni.requirementsVerifiedOn)}
                      </span>
                    )}
                    {uni.requirementsSourceUrl && (
                      <a
                        href={uni.requirementsSourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 font-bold text-[#1D5A6C] hover:text-[#D89A3E]"
                      >
                        Official source <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </p>
                )}
              </div>

              {/* Admissions & Intakes */}
              <div className="rounded-2xl border border-[#D9CFB8]/80 bg-white p-6 shadow-2xs">
                <h2 className="flex items-center gap-2 text-lg font-serif font-bold text-[#103B47]">
                  <Calendar className="h-5 w-5 text-[#1D5A6C]" />
                  Upcoming Intakes & Application Windows
                </h2>
                <div className="mt-4 flex flex-wrap gap-2">
                  {uni.intakes.length > 0 ? (
                    uni.intakes.map((intake, i) => (
                      <span
                        key={i}
                        className="rounded-xl bg-[#1D5A6C]/10 border border-[#1D5A6C]/20 px-3.5 py-1.5 text-xs font-bold text-[#103B47]"
                      >
                        {intake}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-600">
                      Intakes: <NotProvided />
                    </span>
                  )}
                </div>

                <h3 className="mt-5 text-xs font-bold uppercase tracking-wider text-slate-400">
                  Application Deadlines
                </h3>
                {uni.deadlines.length > 0 ? (
                  <ul className="mt-2 divide-y divide-[#D9CFB8]/40">
                    {uni.deadlines.map((d, i) => {
                      const programName = d.programId
                        ? (uni.programs.find((p) => p.id === d.programId)
                            ?.name ?? d.programId)
                        : null;
                      return (
                        <li
                          key={i}
                          className="flex flex-wrap items-center justify-between gap-2 py-2.5 text-xs"
                        >
                          <span className="font-semibold text-[#103B47]">
                            {d.intakeTerm} {d.intakeYear}
                            {d.roundName && ` • ${d.roundName}`}
                            {programName && (
                              <span className="ml-1.5 font-normal text-slate-500">
                                ({programName})
                              </span>
                            )}
                          </span>
                          <span className="rounded-md bg-[#D89A3E]/15 border border-[#D89A3E]/30 px-2 py-0.5 font-mono font-bold text-[#103B47]">
                            {d.isRolling
                              ? "Rolling"
                              : formatDateOnly(d.deadlineDate)}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p className="mt-2">
                    <NotProvided />
                  </p>
                )}

                <p className="mt-4 text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                  {`Indian applicants are strongly advised to apply 4–6 months prior to intake deadlines to ensure adequate time for document verification${
                    uni.apsRequired ? ", APS certification" : ""
                  }, scholarship consideration, and student visa processing.`}
                </p>
              </div>

              {/* Scholarships */}
              <div className="rounded-2xl border border-[#D9CFB8]/80 bg-white p-6 shadow-2xs">
                <h2 className="flex items-center gap-2 text-lg font-serif font-bold text-[#103B47]">
                  <Award className="h-5 w-5 text-[#D89A3E]" />
                  Scholarships & Grants
                </h2>
                {uni.scholarships.length > 0 ? (
                  <ul className="mt-3 space-y-2">
                    {uni.scholarships.map((s) => (
                      <li
                        key={s.id}
                        className="rounded-xl border border-[#D9CFB8]/60 bg-[#FDFCF7] p-3"
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-bold text-[#103B47]">
                            {s.name}
                          </span>
                          {s.universitySpecific && (
                            <span className="rounded bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700">
                              University scholarship
                            </span>
                          )}
                        </div>
                        {s.awardSummary && (
                          <p className="mt-1 text-[11px] text-slate-600">
                            {s.awardSummary}
                          </p>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-3">
                    <NotProvided />
                  </p>
                )}
                <Link
                  href="/scholarships"
                  className="mt-3 inline-block text-xs font-bold text-[#1D5A6C] hover:text-[#D89A3E]"
                >
                  Explore all scholarships →
                </Link>
              </div>
            </div>

            {/* Right Sticky Inquiry Card */}
            <div className="lg:col-span-4">
              <UniversityInquiryForm
                universityId={uni.id}
                universityName={uni.name}
                countrySlug={uni.countryId ?? ""}
                programs={uni.programs.map((p) => ({ id: p.id, name: p.name }))}
              />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
