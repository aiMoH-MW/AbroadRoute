"use client";

import { useEffect, useMemo, useState } from "react";
import { Award, CheckCircle2, Search, XCircle } from "lucide-react";
import { useHomeModals } from "@/components/home/HomeClientContext";
import { CountryFlag } from "@/components/ui/CountryFlag";
import { ExchangeRateCredit } from "@/components/ui/ExchangeRateCredit";
import { formatCurrency } from "@/lib/utils";
import { Scholarship, SocialCategory, StudyLevel } from "@/types";
import { fetchLiveScholarships } from "@/lib/supabase/dataFetchers";
import { formatDateOnly } from "@/lib/deadlines";
import {
  SOCIAL_CATEGORIES,
  STUDY_LEVELS,
  ScholarshipStatus,
  StudentProfile,
  emptyProfile,
  isProfileEmpty,
  matchProfile,
  coverageLabel,
  fundingTypeLabel,
  scholarshipDestination,
  scholarshipStatus,
  socialCategoryLabel,
  studyLevelLabel,
} from "@/lib/scholarships";

// Open first (soonest deadline), then no fixed date, opening soon, closed
const STATUS_ORDER: Record<ScholarshipStatus, number> = {
  open: 0,
  unknown: 1,
  opens_soon: 2,
  closed: 3,
};

const STATUS_STYLES: Record<ScholarshipStatus, string> = {
  open: "bg-emerald-50 text-emerald-800 border-emerald-200",
  opens_soon: "bg-sky-50 text-sky-800 border-sky-200",
  closed: "bg-slate-100 text-slate-500 border-slate-200",
  unknown: "bg-amber-50 text-amber-800 border-amber-200",
};

export function ScholarshipFinderClient() {
  const homeModals = useHomeModals();
  // From the scholarships table; null while loading
  const [scholarships, setScholarships] = useState<Scholarship[] | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDestination, setSelectedDestination] = useState("all");
  // Optional profile; only the fields filled in are checked
  const [profile, setProfile] = useState<StudentProfile>(emptyProfile);
  const [onlyEligible, setOnlyEligible] = useState(false);
  const [womenOnly, setWomenOnly] = useState(false);
  const [hideClosed, setHideClosed] = useState(false);

  useEffect(() => {
    fetchLiveScholarships().then(setScholarships);
  }, []);

  // Destinations that have at least one scholarship
  const destinations = useMemo(
    () => [...new Set((scholarships ?? []).map(scholarshipDestination))].sort(),
    [scholarships],
  );

  const query = searchQuery.trim().toLowerCase();
  const results = (scholarships ?? [])
    .map((s) => ({
      s,
      status: scholarshipStatus(s),
      match: matchProfile(s, profile),
    }))
    .filter(({ s, status, match }) => {
      const matchesSearch =
        !query ||
        [s.name, s.provider, scholarshipDestination(s), s.fields]
          .filter(Boolean)
          .some((v) => v!.toLowerCase().includes(query));
      const matchesDestination =
        selectedDestination === "all" ||
        scholarshipDestination(s) === selectedDestination;
      const matchesProfile = !onlyEligible || match.eligible;
      const matchesWomen = !womenOnly || s.womenOnly;
      const matchesStatus = !hideClosed || status.status !== "closed";
      return (
        matchesSearch &&
        matchesDestination &&
        matchesProfile &&
        matchesWomen &&
        matchesStatus
      );
    })
    .sort(
      (a, b) =>
        STATUS_ORDER[a.status.status] - STATUS_ORDER[b.status.status] ||
        (a.s.deadline ?? "9999").localeCompare(b.s.deadline ?? "9999") ||
        a.s.sortOrder - b.s.sortOrder,
    );

  const selectClass =
    "w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-700 focus:border-[#102C57] focus:outline-none cursor-pointer";

  return (
    <div className="min-h-screen bg-slate-50/60 pb-20 pt-8 sm:pt-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header Breadcrumb & Hero */}
        <div className="mb-8 text-center sm:text-left">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-bold text-[#EA5C2B]">
            <Award className="h-3.5 w-3.5" />
            <span>Government & Foundation Scholarships</span>
          </div>
          <h1 className="font-serif text-3xl font-black text-[#102C57] sm:text-4xl lg:text-5xl">
            International Scholarship Finder
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-600 sm:text-base">
            Search scholarships, fellowships and grants open to Indian
            applicants. Deadlines and amounts change every cycle, so check the
            provider&apos;s official page before applying.
          </p>
        </div>

        {/* Filter Toolbar */}
        <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="relative">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search name, provider or field..."
                className="w-full rounded-xl border border-slate-200 pl-10 pr-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 focus:border-[#102C57] focus:outline-none"
              />
            </div>
            <select
              aria-label="Filter by destination"
              value={selectedDestination}
              onChange={(e) => setSelectedDestination(e.target.value)}
              className={selectClass}
            >
              <option value="all">All Destinations</option>
              {destinations.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs font-semibold text-slate-700">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={hideClosed}
                onChange={(e) => setHideClosed(e.target.checked)}
                className="h-3.5 w-3.5 accent-[#EA5C2B]"
              />
              Hide closed scholarships
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={womenOnly}
                onChange={(e) => setWomenOnly(e.target.checked)}
                className="h-3.5 w-3.5 accent-[#EA5C2B]"
              />
              Only scholarships for women
            </label>
          </div>
        </div>

        {/* Optional profile: check eligibility against each scholarship */}
        <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <div>
              <h2 className="text-sm font-extrabold text-[#102C57]">
                Check What You Qualify For
              </h2>
              <p className="text-[11px] text-slate-500">
                Optional. Fill in what you know; each scholarship is checked
                against its listed criteria. Always confirm on the official
                page.
              </p>
            </div>
            {!isProfileEmpty(profile) && (
              <button
                type="button"
                onClick={() => {
                  setProfile(emptyProfile);
                  setOnlyEligible(false);
                }}
                className="self-start text-[11px] font-bold text-slate-500 hover:text-[#102C57] cursor-pointer"
              >
                Clear profile
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <select
              aria-label="Your study level"
              value={profile.level}
              onChange={(e) =>
                setProfile((p) => ({
                  ...p,
                  level: e.target.value as StudyLevel | "",
                }))
              }
              className={selectClass}
            >
              <option value="">Study level…</option>
              {STUDY_LEVELS.map((l) => (
                <option key={l.value} value={l.value}>
                  {l.label}
                </option>
              ))}
            </select>
            <input
              type="number"
              min={0}
              max={50}
              step={0.5}
              aria-label="Your years of work experience"
              value={profile.workExperienceYears ?? ""}
              onChange={(e) =>
                setProfile((p) => ({
                  ...p,
                  workExperienceYears:
                    e.target.value === ""
                      ? null
                      : Math.max(0, Number(e.target.value)),
                }))
              }
              placeholder="Work experience (years)"
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-700 placeholder-slate-400 focus:border-[#102C57] focus:outline-none"
            />
            <select
              aria-label="Your gender"
              value={profile.gender}
              onChange={(e) =>
                setProfile((p) => ({
                  ...p,
                  gender: e.target.value as StudentProfile["gender"],
                }))
              }
              className={selectClass}
            >
              <option value="">Gender…</option>
              <option value="woman">Woman</option>
              <option value="man">Man</option>
            </select>
            <select
              aria-label="Your category"
              value={profile.category}
              onChange={(e) =>
                setProfile((p) => ({
                  ...p,
                  category: e.target.value as SocialCategory | "general" | "",
                }))
              }
              className={selectClass}
            >
              <option value="">Category…</option>
              <option value="general">General</option>
              {SOCIAL_CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
          {!isProfileEmpty(profile) && (
            <label className="mt-3 flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={onlyEligible}
                onChange={(e) => setOnlyEligible(e.target.checked)}
                className="h-3.5 w-3.5 accent-[#EA5C2B]"
              />
              Only show scholarships I qualify for
            </label>
          )}
        </div>

        {/* Results List */}
        {scholarships === null ? (
          <div className="py-12 text-center text-sm text-slate-500">
            Loading scholarships…
          </div>
        ) : results.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-12 text-center text-sm text-slate-500">
            {scholarships.length === 0
              ? "Scholarships not added yet."
              : "No scholarships match these filters."}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {results.map(({ s, status, match }) => {
              const tags = [
                ...s.studyLevels.map(studyLevelLabel),
                s.minWorkExperienceMonths
                  ? `${s.minWorkExperienceMonths >= 12 && s.minWorkExperienceMonths % 12 === 0 ? `${s.minWorkExperienceMonths / 12}+ yrs` : `${s.minWorkExperienceMonths}+ months`} work experience`
                  : null,
                s.womenOnly ? "Women only" : null,
                s.socialCategories.length > 0
                  ? `${s.socialCategories.map(socialCategoryLabel).join(" / ")} only`
                  : null,
                s.needBased ? "Need-based" : null,
                s.fields,
              ].filter(Boolean) as string[];
              return (
                <div
                  key={s.id}
                  className={`rounded-2xl border border-slate-200 bg-white p-6 shadow-xs hover:border-[#102C57] transition flex flex-col justify-between group ${status.status === "closed" ? "opacity-75" : ""}`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-2">
                        <CountryFlag
                          code={s.countryCode ?? undefined}
                          name={s.countryName ?? undefined}
                          size="sm"
                        />
                        <span className="truncate text-[11px] font-bold uppercase tracking-wider text-slate-500">
                          {scholarshipDestination(s)}
                        </span>
                      </div>
                      <span className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-700 border border-emerald-200">
                        {coverageLabel(s.coverage)}
                      </span>
                    </div>

                    <h3 className="text-base font-extrabold text-[#102C57] mt-3 group-hover:text-[#EA5C2B] transition">
                      {s.name}
                    </h3>
                    <p className="text-[11px] text-slate-500 font-semibold mt-0.5">
                      {fundingTypeLabel(s.fundingType)}
                      {s.provider ? ` · ${s.provider}` : ""}
                      {s.universityName ? ` · ${s.universityName}` : ""}
                    </p>

                    {(s.awardSummary || s.awardValueINR !== undefined) && (
                      <div className="mt-3 rounded-xl bg-slate-50 p-3 border border-slate-100">
                        <span className="text-[10px] font-bold uppercase text-slate-400">
                          Award:
                        </span>
                        {s.awardSummary && (
                          <p className="text-xs font-bold text-slate-800 mt-0.5">
                            {s.awardSummary}
                          </p>
                        )}
                        {s.awardValueINR !== undefined && (
                          <p className="text-[11px] text-slate-600 mt-0.5">
                            ≈ {formatCurrency(s.awardValueINR)}
                            {s.awardPeriod === "month"
                              ? " / month"
                              : s.awardPeriod === "year"
                                ? " / year"
                                : " in total"}
                            {s.rateUpdatedAt && (
                              <ExchangeRateCredit
                                updatedAt={s.rateUpdatedAt}
                                className="block text-[10px] text-slate-400"
                              />
                            )}
                          </p>
                        )}
                      </div>
                    )}

                    {s.overview && (
                      <p className="text-xs text-slate-600 mt-3 leading-relaxed">
                        {s.overview}
                      </p>
                    )}

                    {tags.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-lg bg-indigo-50/70 border border-indigo-100 px-2 py-0.5 text-[10px] font-semibold text-indigo-800"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    {!isProfileEmpty(profile) && (
                      <div
                        className={`mt-3 rounded-xl border p-2.5 text-[11px] ${match.eligible ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-rose-200 bg-rose-50 text-rose-700"}`}
                      >
                        <p className="flex items-center gap-1.5 font-bold">
                          {match.eligible ? (
                            <CheckCircle2 className="h-3.5 w-3.5" />
                          ) : (
                            <XCircle className="h-3.5 w-3.5" />
                          )}
                          {match.eligible
                            ? "You meet the listed criteria"
                            : match.reasons.join(" · ")}
                        </p>
                        {match.eligible && match.notes.length > 0 && (
                          <p className="mt-0.5 pl-5">
                            Also check: {match.notes.join(" · ")}
                          </p>
                        )}
                      </div>
                    )}
                    {s.eligibilityNote && (
                      <p className="mt-2 text-[11px] text-slate-500 leading-relaxed">
                        <strong className="text-slate-700">Eligibility:</strong>{" "}
                        {s.eligibilityNote}
                      </p>
                    )}
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-100 space-y-3 text-xs">
                    <div className="flex items-center justify-between gap-3">
                      <span
                        className={`rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${STATUS_STYLES[status.status]}`}
                      >
                        {status.label}
                      </span>
                      <button
                        onClick={() =>
                          homeModals.openLeadModal(
                            `Scholarship Application Assistance: ${s.name} (${scholarshipDestination(s)})`,
                          )
                        }
                        className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-[#102C57] px-3.5 py-1.5 text-xs font-bold text-white hover:bg-[#0c2242] transition shadow-2xs cursor-pointer"
                      >
                        Get Application Help →
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-500">
                      {s.lastVerifiedOn
                        ? `Last checked ${formatDateOnly(s.lastVerifiedOn)}`
                        : "Not yet checked"}
                      {s.websiteUrl && (
                        <>
                          {" · "}
                          <a
                            href={s.websiteUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-semibold text-[#102C57] hover:underline"
                          >
                            Official page
                          </a>
                        </>
                      )}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
