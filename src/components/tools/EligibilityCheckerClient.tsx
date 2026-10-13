"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Ban,
  FileText,
  Info,
  Loader2,
} from "lucide-react";
import { useHomeModals } from "@/components/home/HomeClientContext";
import { CountryFlag } from "@/components/ui/CountryFlag";
import { Country, University } from "@/types";
import {
  fetchLiveCountries,
  fetchLiveUniversities,
} from "@/lib/supabase/dataFetchers";
import {
  AcademicScale,
  DEGREE_OPTIONS,
  ENGLISH_TESTS,
  EligibilityDegree,
  EligibilityProfile,
  EligibilityResult,
  EnglishTest,
  MatchTier,
  evaluateProfile,
  toPercentage,
} from "@/lib/eligibility";
import { formatDateOnly } from "@/lib/deadlines";

const SCALE_OPTIONS: {
  value: AcademicScale;
  label: string;
  min: number;
  max: number;
  step: number;
  initial: number;
}[] = [
  { value: "percentage", label: "Percentage", min: 0, max: 100, step: 0.5, initial: 75 },
  { value: "cgpa10", label: "CGPA (out of 10)", min: 0, max: 10, step: 0.1, initial: 7.5 },
  { value: "gpa4", label: "GPA (out of 4)", min: 0, max: 4, step: 0.1, initial: 3.0 },
];

const ENGLISH_DEFAULTS: Record<EnglishTest, number> = {
  ielts: 6.5,
  toefl: 90,
  pte: 60,
  duolingo: 115,
  none: 0,
};

const TIERS: {
  tier: MatchTier;
  title: string;
  subtitle: string;
  icon: typeof CheckCircle2;
  box: string;
  card: string;
  badge: string;
  iconBox: string;
}[] = [
  {
    tier: "strong",
    title: "Strong Match",
    subtitle: "You clear the published minimums with room to spare.",
    icon: CheckCircle2,
    box: "border-[#A8CDBD]",
    card: "border-[#A8CDBD]/50 bg-[#A8CDBD]/10",
    badge: "bg-[#A8CDBD]/20 border-[#A8CDBD] text-[#103B47]",
    iconBox: "bg-[#A8CDBD]/20 text-[#1D5A6C]",
  },
  {
    tier: "possible",
    title: "Possible",
    subtitle: "You meet the minimums. A strong SOP and LORs will matter.",
    icon: AlertTriangle,
    box: "border-[#D9CFB8]",
    card: "border-[#D9CFB8]/80 bg-[#FDFCF7]",
    badge: "bg-[#F5EFE0] border-[#D9CFB8] text-[#D89A3E]",
    iconBox: "bg-[#F5EFE0] text-[#D89A3E]",
  },
  {
    tier: "ambitious",
    title: "Ambitious",
    subtitle: "You are eligible, but competition is intense.",
    icon: XCircle,
    box: "border-[#7C6BAE]/30",
    card: "border-[#7C6BAE]/20 bg-[#7C6BAE]/5",
    badge: "bg-[#7C6BAE]/15 border-[#7C6BAE]/30 text-[#7C6BAE]",
    iconBox: "bg-[#7C6BAE]/10 text-[#7C6BAE]",
  },
];

const inputClass =
  "min-h-[44px] w-full rounded-xl border border-[#D9CFB8] bg-[#FDFCF7] px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-[#103B47] focus:outline-none focus:border-[#1D5A6C]";
const labelClass =
  "block text-xs font-mono font-bold uppercase tracking-wider text-[#103B47] mb-1.5";

function numberOr(value: string, fallback: number): number {
  const num = Number(value);
  return value === "" || Number.isNaN(num) ? fallback : num;
}

function englishRequirement(u: University): string {
  const parts: string[] = [];
  if (u.ieltsMinScore !== null) {
    parts.push(
      `IELTS ${u.ieltsMinScore}` +
        (u.ieltsMinBand !== undefined ? ` (${u.ieltsMinBand} each)` : ""),
    );
  }
  if (u.toeflMinScore !== undefined) parts.push(`TOEFL ${u.toeflMinScore}`);
  if (u.pteMinScore !== undefined) parts.push(`PTE ${u.pteMinScore}`);
  if (u.duolingoMinScore !== undefined) parts.push(`DET ${u.duolingoMinScore}`);
  return parts.length > 0 ? parts.join(" / ") : "Not provided";
}

function ResultCard({
  result,
  countryName,
  countryCode,
  cardClass,
}: {
  result: EligibilityResult;
  countryName: string;
  countryCode?: string;
  cardClass: string;
}) {
  const u = result.university;
  return (
    <div className={`p-4 rounded-xl border transition flex flex-col justify-between ${cardClass}`}>
      <div>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <CountryFlag code={countryCode} name={countryName} size="sm" />
            <span className="text-[10px] font-mono font-bold text-[#6B6B6B] uppercase truncate">
              {countryName}
            </span>
          </div>
          {u.rankingGlobal ? (
            <span className="text-[11px] font-mono font-bold text-[#103B47] shrink-0">
              QS #{u.rankingGlobal}
            </span>
          ) : null}
        </div>
        <Link
          href={`/universities/${u.slug}`}
          className="block text-xs sm:text-sm font-bold text-[#103B47] mt-2 hover:underline"
        >
          {u.name}
        </Link>

        {result.blockers.length > 0 && (
          <ul className="mt-2 space-y-1">
            {result.blockers.map((b) => (
              <li key={b} className="text-xs text-[#9B2C2C] flex gap-1.5">
                <Ban className="h-3.5 w-3.5 shrink-0 mt-px" />
                <span>{b}</span>
              </li>
            ))}
          </ul>
        )}
        {result.actions.length > 0 && (
          <ul className="mt-2 space-y-1">
            {result.actions.map((a) => (
              <li key={a} className="text-xs text-[#8A5A14] flex gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-px" />
                <span>{a}</span>
              </li>
            ))}
          </ul>
        )}
        {result.eligible && result.notes.length > 0 && (
          <ul className="mt-2 space-y-1">
            {result.notes.map((n) => (
              <li key={n} className="text-xs text-[#6B6B6B]">
                {n}
              </li>
            ))}
          </ul>
        )}
      </div>

      <dl className="mt-3 pt-2 border-t border-[#D9CFB8]/50 space-y-1 text-[11px] font-mono text-[#103B47]">
        <div className="flex justify-between gap-2">
          <dt className="text-[#6B6B6B]">English:</dt>
          <dd className="font-bold text-right">{englishRequirement(u)}</dd>
        </div>
        <div className="flex justify-between gap-2">
          <dt className="text-[#6B6B6B]">Tuition:</dt>
          <dd className="font-bold text-right">
            {u.tuitionFeeRangeINR ?? "Not provided"}
          </dd>
        </div>
        <div className="flex justify-between gap-2">
          <dt className="text-[#6B6B6B]">Post-study work:</dt>
          <dd className="font-bold text-right">
            {u.postStudyWorkMonths !== null
              ? `up to ${u.postStudyWorkMonths} months`
              : "Not provided"}
          </dd>
        </div>
        <div className="pt-1 text-[10px] text-[#6B6B6B]">
          {u.requirementsVerifiedOn ? (
            <>
              Verified {formatDateOnly(u.requirementsVerifiedOn)}
              {u.requirementsSourceUrl && (
                <>
                  {" · "}
                  <a
                    href={u.requirementsSourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-[#103B47]"
                  >
                    Official source
                  </a>
                </>
              )}
            </>
          ) : (
            "Confirm requirements on the university's website."
          )}
        </div>
      </dl>
    </div>
  );
}

export function EligibilityCheckerClient() {
  const homeModals = useHomeModals();

  const [universities, setUniversities] = useState<University[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);

  // Profile inputs
  const [degree, setDegree] = useState<EligibilityDegree>("ms");
  const [countrySlug, setCountrySlug] = useState("");
  const [academicScale, setAcademicScale] = useState<AcademicScale>("percentage");
  const [academicScore, setAcademicScore] = useState(75);
  const [englishTest, setEnglishTest] = useState<EnglishTest>("ielts");
  const [englishScore, setEnglishScore] = useState(6.5);
  const [ieltsLowestBand, setIeltsLowestBand] = useState(6.0);
  const [greTaken, setGreTaken] = useState(false);
  const [greScore, setGreScore] = useState(310);
  const [workExperienceYears, setWorkExperienceYears] = useState(0);
  const [backlogs, setBacklogs] = useState(0);
  const [bachelorYears, setBachelorYears] = useState<3 | 4>(4);
  const [neetQualified, setNeetQualified] = useState(false);
  const [hasAps, setHasAps] = useState(false);

  useEffect(() => {
    let active = true;
    Promise.all([fetchLiveUniversities(), fetchLiveCountries()])
      .then(([unis, ctrs]) => {
        if (!active) return;
        setUniversities(unis);
        setCountries(ctrs);
      })
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  const countryBySlug = useMemo(() => {
    const map = new Map<string, Country>();
    countries.forEach((c) => {
      map.set(c.slug, c);
      map.set(c.id, c);
    });
    return map;
  }, [countries]);

  // Only countries that have a university offering the chosen degree
  const countryOptions = useMemo(() => {
    const slugs = new Set(
      universities
        .filter((u) => (u.programsOffered || []).includes(degree))
        .map((u) => u.countrySlug)
        .filter((slug): slug is string => slug !== null),
    );
    return Array.from(slugs)
      .map((slug) => ({ slug, name: countryBySlug.get(slug)?.name || slug }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [universities, degree, countryBySlug]);

  const activeCountry =
    countrySlug && countryOptions.some((c) => c.slug === countrySlug)
      ? countrySlug
      : "";

  const profile: EligibilityProfile = {
    degree,
    academicScale,
    academicScore,
    englishTest,
    englishScore,
    ieltsLowestBand,
    greTaken,
    greScore,
    workExperienceYears,
    backlogs,
    bachelorYears,
    neetQualified,
    hasAps,
  };
  const results = evaluateProfile(universities, profile, activeCountry);
  const eligible = results.filter((r) => r.eligible);
  const notEligible = results.filter((r) => !r.eligible);
  const anyApsRequired = results.some((r) => r.university.apsRequired);

  const isPostgraduate = degree !== "bachelors" && degree !== "mbbs";
  const scale = SCALE_OPTIONS.find((s) => s.value === academicScale)!;
  const test = ENGLISH_TESTS.find((t) => t.value === englishTest)!;
  const academicLabel =
    degree === "mbbs"
      ? "Class 12 Score (PCB)"
      : degree === "bachelors"
        ? "Class 12 Score"
        : "Bachelor's Score";

  const countryInfo = (u: University) => {
    const c = u.countrySlug ? countryBySlug.get(u.countrySlug) : undefined;
    return { name: c?.name ?? u.country ?? "Not provided", code: c?.code };
  };

  const leadSummary = [
    DEGREE_OPTIONS.find((d) => d.value === degree)?.label,
    `${academicLabel} ${academicScore} (${scale.label})`,
    englishTest === "none" ? "No English test" : `${test.label} ${englishScore}`,
    isPostgraduate && greTaken ? `GRE ${greScore}` : null,
    isPostgraduate ? `Exp ${workExperienceYears}y, ${backlogs} backlogs` : null,
    degree === "mbbs" ? `NEET ${neetQualified ? "qualified" : "not qualified"}` : null,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="min-h-screen bg-[#FDFCF7] pb-20 pt-8 sm:pt-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Hero */}
        <div className="mb-8 text-center sm:text-left">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#D9CFB8] bg-[#F5EFE0] px-3.5 py-1 text-xs font-semibold text-[#1D5A6C]">
            <ShieldCheck className="h-3.5 w-3.5 text-[#D89A3E]" />
            <span>Admission Eligibility Checker</span>
          </div>
          <h1 className="font-serif text-3xl font-black text-[#103B47] sm:text-4xl lg:text-5xl">
            Admission Eligibility Checker
          </h1>
          <p className="mt-3 max-w-3xl text-xs sm:text-sm md:text-base leading-relaxed text-[#6B6B6B]">
            Enter your academic scores and English test result to see which
            universities you are eligible for, what is still missing, and how
            competitive each one is for your profile.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Profile inputs */}
          <div className="lg:col-span-4 rounded-2xl border border-[#D9CFB8] bg-white p-6 sm:p-8 shadow-xs space-y-5 h-fit">
            <h2 className="text-base font-serif font-bold text-[#103B47] flex items-center gap-2">
              <FileText className="h-4 w-4 text-[#D89A3E]" />
              <span>Your Profile</span>
            </h2>

            <div>
              <label htmlFor="ec-degree" className={labelClass}>
                Degree You Want
              </label>
              <select
                id="ec-degree"
                value={degree}
                onChange={(e) => setDegree(e.target.value as EligibilityDegree)}
                className={inputClass}
              >
                {DEGREE_OPTIONS.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="ec-country" className={labelClass}>
                Country
              </label>
              <select
                id="ec-country"
                value={activeCountry}
                onChange={(e) => setCountrySlug(e.target.value)}
                className={inputClass}
              >
                <option value="">All countries</option>
                {countryOptions.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="ec-academic" className={labelClass}>
                {academicLabel}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <select
                  aria-label="Score format"
                  value={academicScale}
                  onChange={(e) => {
                    const next = SCALE_OPTIONS.find((s) => s.value === e.target.value)!;
                    setAcademicScale(next.value);
                    setAcademicScore(next.initial);
                  }}
                  className={inputClass}
                >
                  {SCALE_OPTIONS.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
                <input
                  id="ec-academic"
                  type="number"
                  min={scale.min}
                  max={scale.max}
                  step={scale.step}
                  value={academicScore}
                  onChange={(e) =>
                    setAcademicScore(
                      Math.min(scale.max, Math.max(0, numberOr(e.target.value, 0))),
                    )
                  }
                  className={inputClass}
                />
              </div>
              {academicScale !== "percentage" && (
                <p className="mt-1 text-[11px] font-mono text-[#6B6B6B]">
                  ≈ {toPercentage(academicScale, academicScore).toFixed(1)}%
                  {academicScale === "cgpa10" ? " (CGPA × 9.5)" : " (approx.)"}
                </p>
              )}
            </div>

            {isPostgraduate && (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label htmlFor="ec-years" className={labelClass}>
                    Degree Length
                  </label>
                  <select
                    id="ec-years"
                    value={bachelorYears}
                    onChange={(e) => setBachelorYears(Number(e.target.value) as 3 | 4)}
                    className={inputClass}
                  >
                    <option value={4}>4 years</option>
                    <option value={3}>3 years</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="ec-backlogs" className={labelClass}>
                    Backlogs
                  </label>
                  <input
                    id="ec-backlogs"
                    type="number"
                    min={0}
                    max={50}
                    value={backlogs}
                    onChange={(e) =>
                      setBacklogs(Math.max(0, Math.round(numberOr(e.target.value, 0))))
                    }
                    className={inputClass}
                  />
                </div>
              </div>
            )}

            <div>
              <label htmlFor="ec-english" className={labelClass}>
                English Test
              </label>
              <div className={englishTest === "none" ? "" : "grid grid-cols-2 gap-2"}>
                <select
                  aria-label="English test"
                  value={englishTest}
                  onChange={(e) => {
                    const next = e.target.value as EnglishTest;
                    setEnglishTest(next);
                    setEnglishScore(ENGLISH_DEFAULTS[next]);
                  }}
                  className={inputClass}
                >
                  {ENGLISH_TESTS.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
                {englishTest !== "none" && (
                  <input
                    id="ec-english"
                    type="number"
                    min={test.min}
                    max={test.max}
                    step={test.step}
                    value={englishScore}
                    onChange={(e) =>
                      setEnglishScore(
                        Math.min(test.max, Math.max(0, numberOr(e.target.value, 0))),
                      )
                    }
                    aria-label={`${test.label} overall score`}
                    className={inputClass}
                  />
                )}
              </div>
              {englishTest === "ielts" && (
                <div className="mt-2 flex items-center justify-between gap-2">
                  <label htmlFor="ec-band" className="text-xs font-semibold text-[#103B47]">
                    Lowest section band
                  </label>
                  <input
                    id="ec-band"
                    type="number"
                    min={4}
                    max={9}
                    step={0.5}
                    value={ieltsLowestBand}
                    onChange={(e) =>
                      setIeltsLowestBand(
                        Math.min(9, Math.max(0, numberOr(e.target.value, 0))),
                      )
                    }
                    className={`${inputClass} max-w-[110px]`}
                  />
                </div>
              )}
              {englishTest !== "ielts" && englishTest !== "none" && (
                <p className="mt-1 text-[11px] text-[#6B6B6B]">
                  Compared using official score concordances where a university
                  states no {test.label.split(" ")[0]} minimum.
                </p>
              )}
            </div>

            {isPostgraduate && (
              <>
                <div>
                  <label className="flex items-center gap-2 text-xs font-semibold text-[#103B47] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={greTaken}
                      onChange={(e) => setGreTaken(e.target.checked)}
                      className="h-4 w-4 accent-[#1D5A6C]"
                    />
                    <span>I have a GRE score</span>
                  </label>
                  {greTaken && (
                    <div className="mt-2">
                      <div className="flex justify-between items-center text-xs font-semibold mb-1.5">
                        <span className="text-[#103B47]">GRE General</span>
                        <span className="text-[#103B47] font-mono font-bold bg-[#F5EFE0] border border-[#D9CFB8]/70 px-2.5 py-1 rounded-md text-sm">
                          {greScore} / 340
                        </span>
                      </div>
                      <input
                        type="range"
                        min={260}
                        max={340}
                        step={1}
                        value={greScore}
                        aria-label="GRE score"
                        onChange={(e) => setGreScore(Number(e.target.value))}
                        className="w-full accent-[#1D5A6C] cursor-pointer h-2 bg-[#F5EFE0] rounded-lg"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex justify-between items-center text-xs font-semibold mb-1.5">
                    <span className="text-[#103B47]">Work Experience</span>
                    <span className="text-[#103B47] font-mono font-bold bg-[#F5EFE0] border border-[#D9CFB8]/70 px-2.5 py-1 rounded-md text-sm">
                      {workExperienceYears} {workExperienceYears === 1 ? "Year" : "Years"}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={15}
                    step={1}
                    value={workExperienceYears}
                    aria-label="Work experience in years"
                    onChange={(e) => setWorkExperienceYears(Number(e.target.value))}
                    className="w-full accent-[#1D5A6C] cursor-pointer h-2 bg-[#F5EFE0] rounded-lg"
                  />
                </div>
              </>
            )}

            {degree === "mbbs" && (
              <label className="flex items-center gap-2 text-xs font-semibold text-[#103B47] cursor-pointer">
                <input
                  type="checkbox"
                  checked={neetQualified}
                  onChange={(e) => setNeetQualified(e.target.checked)}
                  className="h-4 w-4 accent-[#1D5A6C]"
                />
                <span>I have qualified NEET-UG</span>
              </label>
            )}

            {anyApsRequired && (
              <label className="flex items-center gap-2 text-xs font-semibold text-[#103B47] cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasAps}
                  onChange={(e) => setHasAps(e.target.checked)}
                  className="h-4 w-4 accent-[#1D5A6C]"
                />
                <span>I have my APS certificate (Germany)</span>
              </label>
            )}

            <button
              type="button"
              onClick={() => homeModals.openLeadModal(`Profile Evaluation: ${leadSummary}`)}
              className="min-h-[44px] w-full flex items-center justify-center gap-2 rounded-xl bg-[#D89A3E] py-3.5 px-6 text-xs sm:text-sm font-bold text-[#103B47] shadow-md hover:bg-[#c4872d] transition cursor-pointer"
            >
              <span>Get a Counsellor to Review My Profile →</span>
            </button>
          </div>

          {/* Results */}
          <div className="lg:col-span-8 space-y-6">
            {loading ? (
              <div className="flex items-center justify-center gap-2 rounded-2xl border border-[#D9CFB8] bg-white p-10 text-sm text-[#6B6B6B]">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Loading universities…</span>
              </div>
            ) : results.length === 0 ? (
              <div className="rounded-2xl border border-[#D9CFB8] bg-white p-8 text-center text-sm text-[#6B6B6B]">
                {universities.length === 0
                  ? "We couldn't load universities right now. Please try again shortly."
                  : "No universities in our catalogue offer this degree in the selected country yet."}
              </div>
            ) : (
              <>
                <p className="text-sm text-[#103B47]">
                  You are eligible for <strong>{eligible.length}</strong> of{" "}
                  <strong>{results.length}</strong> universities offering this degree
                  {activeCountry ? ` in ${countryBySlug.get(activeCountry)?.name || activeCountry}` : ""}.
                </p>

                {TIERS.map((t) => {
                  const items = eligible.filter((r) => r.tier === t.tier);
                  const Icon = t.icon;
                  return (
                    <section key={t.tier} className={`rounded-2xl border bg-white p-5 sm:p-6 shadow-xs ${t.box}`}>
                      <div className="flex items-center gap-2.5 mb-4">
                        <span className={`flex h-7 w-7 items-center justify-center rounded-lg font-bold ${t.iconBox}`}>
                          <Icon className="h-4 w-4" />
                        </span>
                        <div>
                          <h3 className="text-sm font-bold text-[#103B47] flex items-center gap-2">
                            <span>{t.title}</span>
                            <span className={`rounded-md border px-2 py-0.5 text-[10px] font-mono font-bold ${t.badge}`}>
                              {items.length}
                            </span>
                          </h3>
                          <p className="text-xs text-[#6B6B6B] mt-0.5">{t.subtitle}</p>
                        </div>
                      </div>
                      {items.length === 0 ? (
                        <p className="text-xs text-[#6B6B6B]">No universities in this group for your profile.</p>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {items.map((r) => {
                            const c = countryInfo(r.university);
                            return (
                              <ResultCard
                                key={r.university.slug}
                                result={r}
                                countryName={c.name}
                                countryCode={c.code}
                                cardClass={t.card}
                              />
                            );
                          })}
                        </div>
                      )}
                    </section>
                  );
                })}

                {notEligible.length > 0 && (
                  <section className="rounded-2xl border border-[#E8C4C4] bg-white p-5 sm:p-6 shadow-xs">
                    <div className="flex items-center gap-2.5 mb-4">
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#F8E5E5] text-[#9B2C2C] font-bold">
                        <Ban className="h-4 w-4" />
                      </span>
                      <div>
                        <h3 className="text-sm font-bold text-[#103B47] flex items-center gap-2">
                          <span>Not Eligible Yet</span>
                          <span className="rounded-md border border-[#E8C4C4] bg-[#F8E5E5] px-2 py-0.5 text-[10px] font-mono font-bold text-[#9B2C2C]">
                            {notEligible.length}
                          </span>
                        </h3>
                        <p className="text-xs text-[#6B6B6B] mt-0.5">
                          You miss at least one published minimum. Each card shows what to fix.
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {notEligible.map((r) => {
                        const c = countryInfo(r.university);
                        return (
                          <ResultCard
                            key={r.university.slug}
                            result={r}
                            countryName={c.name}
                            countryCode={c.code}
                            cardClass="border-[#E8C4C4]/70 bg-[#FDF7F7]"
                          />
                        );
                      })}
                    </div>
                  </section>
                )}
              </>
            )}

            <div className="flex gap-2 rounded-xl border border-[#D9CFB8] bg-[#F5EFE0]/60 p-4 text-[11px] leading-relaxed text-[#6B6B6B]">
              <Info className="h-4 w-4 shrink-0 text-[#1D5A6C]" />
              <p>
                This is guidance, not an admission prediction. It compares your
                scores with each university&apos;s published minimums and how
                selective it is. Where a university has not stated an academic
                minimum, we estimate it from its QS ranking. Requirements vary by
                program and change every year, so always confirm on the
                university&apos;s official admissions page.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
