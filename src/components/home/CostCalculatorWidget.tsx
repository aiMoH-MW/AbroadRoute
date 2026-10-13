"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Banknote,
  Building,
  Home,
  GraduationCap,
  ShoppingCart,
  Bus,
  ShieldAlert,
  CalendarClock,
  MapPin,
  Info,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  fetchLiveCities,
  fetchLiveCountries,
  fetchLivePrograms,
  fetchLiveUniversities,
} from "@/lib/supabase/dataFetchers";
import {
  City,
  Country,
  Program,
  University,
} from "@/types";
import { formatCurrency } from "@/lib/utils";
import { useHomeModals } from "@/components/home/HomeClientContext";
import { CountryFlag } from "@/components/ui/CountryFlag";
import { PeacockEye } from "@/components/ui/BrandSignatures";
import { ExchangeRateCredit } from "@/components/ui/ExchangeRateCredit";
import { formatINRRate } from "@/lib/exchangeRates";
import { NotProvided, show } from "@/components/tools/NotProvided";

interface CostCalculatorProps {
  defaultCountry?: string;
  variant?: "standalone" | "embedded";
  onOpenLeadModal?: () => void;
}

// All figures come from the database: duration and tuition from
// university_programs, living costs from cities, rates from countries. A cost that is not set there is shown as
// "Not added yet" and left out of the totals.

// Years to budget for, from a program's duration text such as "1 to 2 Years"
// or "5 to 6 Years": the upper bound, so the estimate covers finishing the course.
function durationToYears(duration: string | undefined | null): number | null {
  const numbers = (duration?.match(/\d+(\.\d+)?/g) ?? []).map(Number);
  if (numbers.length === 0) return null;
  return Math.max(1, Math.ceil(Math.max(...numbers)));
}

const normalizeName = (name: string | undefined) =>
  (name ?? "").trim().toLowerCase();

const NOT_SET = "Not added yet";

export function CostCalculatorWidget({
  defaultCountry,
  variant = "standalone",
  onOpenLeadModal,
}: CostCalculatorProps) {
  const homeModals = useHomeModals();
  const handleLead = onOpenLeadModal || homeModals.openLeadModal;
  const [countriesList, setCountriesList] = useState<Country[]>([]);
  const [countrySlug, setCountrySlug] = useState(defaultCountry || "");
  const [programsList, setProgramsList] = useState<Program[]>([]);
  const [chosenProgramSlug, setProgramSlug] = useState("");
  const [citiesList, setCitiesList] = useState<City[]>([]);
  const [cityId, setCityId] = useState("");
  const [universitiesList, setUniversitiesList] = useState<University[]>([]);
  const [universityId, setUniversityId] = useState("");
  const [currencyMode, setCurrencyMode] = useState<"inr" | "dual">("dual");

  useEffect(() => {
    fetchLiveCountries().then((c) => {
      if (!c || c.length === 0) return;
      setCountriesList(c);
      const wanted = defaultCountry?.toLowerCase();
      const found = wanted
        ? c.find(
            (item) =>
              item.slug.toLowerCase() === wanted ||
              item.name.toLowerCase().includes(wanted),
          )
        : undefined;
      setCountrySlug((current) =>
        found
          ? found.slug
          : c.some((item) => item.slug === current)
            ? current
            : c[0].slug,
      );
    });
  }, [defaultCountry]);

  useEffect(() => {
    fetchLivePrograms().then(setProgramsList);
    fetchLiveCities().then(setCitiesList);
    fetchLiveUniversities().then((u) =>
      setUniversitiesList([...u].sort((a, b) => a.name.localeCompare(b.name))),
    );
  }, []);

  // Selected country, university, program and city
  const selectedCountry = countriesList.find((c) => c.slug === countrySlug);
  const exchangeRate = selectedCountry?.exchangeRateToINR || null;
  const currencySymbol = selectedCountry?.currencySymbol || "";
  const showForeign = currencyMode === "dual" && exchangeRate !== null;
  const countryCities = citiesList.filter(
    (c) => c.countryId === selectedCountry?.id || c.countryId === countrySlug,
  );
  const findCityOf = (u: University) =>
    countryCities.find(
      (c) =>
        c.id === u.cityId ||
        (u.city !== null && normalizeName(c.name) === normalizeName(u.city)),
    );
  const countryUniversities = universitiesList.filter(
    (u) =>
      u.countrySlug === countrySlug || u.countrySlug === selectedCountry?.id,
  );
  // Optional; cleared automatically when the country changes.
  const selectedUniversity = countryUniversities.find(
    (u) => u.id === universityId,
  );

  // Cities: only the selected university's city (none when it is not listed),
  // else all of the country's. Falls back to the first one (e.g. after a
  // country change).
  const universityCity = selectedUniversity
    ? findCityOf(selectedUniversity)
    : undefined;
  const cityOptions = selectedUniversity
    ? universityCity
      ? [universityCity]
      : []
    : countryCities;
  const selectedCity =
    cityOptions.find((c) => c.id === cityId) ?? cityOptions[0];

  // Programs: the selected university's rows in university_programs, else all.
  // Falls back to the first one offered.
  const universityProgramIds = (selectedUniversity?.programs ?? []).map(
    (p) => p.programId,
  );
  const programOptions = selectedUniversity
    ? programsList.filter((p) => universityProgramIds.includes(p.slug))
    : programsList;
  const programSlug = programOptions.some((p) => p.slug === chosenProgramSlug)
    ? chosenProgramSlug
    : (programOptions[0]?.slug ?? "");
  const selectedProgram = programsList.find((p) => p.slug === programSlug);
  // This university's fee/duration for the program, when assigned
  const universityProgram = selectedUniversity?.programs?.find(
    (p) => p.programId === programSlug,
  );

  // Picking a university also selects its city, when that city is listed.
  const handleUniversityChange = (id: string) => {
    setUniversityId(id);
    const university = countryUniversities.find((u) => u.id === id);
    const city = university && findCityOf(university);
    if (city) setCityId(city.id);
  };

  // Picking a different city drops a university that is not in it.
  const handleCityChange = (id: string) => {
    setCityId(id);
    if (selectedUniversity && findCityOf(selectedUniversity)?.id !== id) {
      setUniversityId("");
    }
  };

  // Course duration and yearly education cost: only this university's
  // university_programs row for the program
  const durationText = universityProgram?.duration || null;
  const durationYears = durationToYears(durationText);

  const educationCostINR = universityProgram?.yearlyTuitionINR ?? null;
  const educationCostNote =
    educationCostINR !== null
      ? `${selectedProgram?.name} fee at this university`
      : "Education cost not added yet";

  // Yearly living costs in INR from the city's monthly figures
  const yearly = (monthly: number | null | undefined) =>
    monthly != null ? monthly * 12 : null;
  const accommodationAnnualINR = yearly(selectedCity?.accommodationMonthly);
  const foodAnnualINR = yearly(selectedCity?.foodMonthly);
  const transportAnnualINR = yearly(selectedCity?.transportMonthly);
  const miscBaseAnnualINR = yearly(selectedCity?.miscMonthly);
  // Emergency buffer: the city's % on top of its other living costs
  const bufferPercentage = selectedCity?.costBufferPercentage ?? null;
  const livingBeforeBufferINR = [
    accommodationAnnualINR,
    foodAnnualINR,
    transportAnnualINR,
    miscBaseAnnualINR,
  ].reduce<number>((sum, v) => sum + (v ?? 0), 0);
  const bufferAnnualINR =
    bufferPercentage !== null
      ? Math.round((livingBeforeBufferINR * bufferPercentage) / 100)
      : null;
  const miscAnnualINR =
    miscBaseAnnualINR === null && bufferAnnualINR === null
      ? null
      : (miscBaseAnnualINR ?? 0) + (bufferAnnualINR ?? 0);

  // Yearly cost lines (INR, null when not set); the first is education
  const costLines: {
    key: string;
    label: string;
    icon: LucideIcon;
    iconClass: string;
    annualINR: number | null;
  }[] = [
    {
      key: "education",
      label: "Yearly Education Cost",
      icon: GraduationCap,
      iconClass: "text-[#D89A3E]",
      annualINR: educationCostINR,
    },
    {
      key: "accommodation",
      label: "Accommodation",
      icon: Home,
      iconClass: "text-[#A8CDBD]",
      annualINR: accommodationAnnualINR,
    },
    {
      key: "food",
      label: "Food & Groceries",
      icon: ShoppingCart,
      iconClass: "text-[#A8CDBD]",
      annualINR: foodAnnualINR,
    },
    {
      key: "transport",
      label: "Public Transport",
      icon: Bus,
      iconClass: "text-[#A8CDBD]",
      annualINR: transportAnnualINR,
    },
    {
      key: "misc",
      label: bufferPercentage
        ? `Miscellaneous (incl. ${bufferPercentage}% buffer)`
        : "Miscellaneous",
      icon: ShieldAlert,
      iconClass: "text-[#A8CDBD]",
      annualINR: miscAnnualINR,
    },
  ];
  const missingLines = costLines.filter((line) => line.annualINR === null);
  const livingMissing = missingLines.some((line) => line.key !== "education");

  // Totals over the course duration (only the costs that are set)
  const years = durationYears ?? 0;
  const totalTuitionINR = (educationCostINR ?? 0) * years;
  const totalLivingINR =
    costLines.slice(1).reduce((sum, line) => sum + (line.annualINR ?? 0), 0) *
    years;
  const totalCostINR = totalTuitionINR + totalLivingINR;
  const hasTotal = durationYears !== null && totalCostINR > 0;

  // Foreign currency equivalent
  // Whole units, but cents below 100 so small amounts don't round to 0
  const formatForeign = (inrAmount: number) => {
    if (!exchangeRate) return "";
    const amount = inrAmount / exchangeRate;
    const digits = amount !== 0 && Math.abs(amount) < 100 ? 2 : 0;
    return `${currencySymbol} ${amount.toLocaleString("en-US", {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    })}`;
  };

  // Percentages for visual bar
  const tuitionPct =
    totalCostINR > 0 ? Math.round((totalTuitionINR / totalCostINR) * 100) : 0;
  const livingPct = totalCostINR > 0 ? 100 - tuitionPct : 0;

  const yearsLabel = durationYears
    ? `${durationYears} ${durationYears === 1 ? "Year" : "Years"}`
    : null;
  const selectClass =
    "w-full rounded-lg border border-[#D9CFB8] bg-[#FDFCF7] px-4 py-2.5 text-xs sm:text-sm font-semibold text-[#1A1A1A] focus:border-[#1D5A6C] focus:bg-white focus:outline-none cursor-pointer transition disabled:cursor-not-allowed disabled:opacity-70";

  return (
    <div
      id="cost-calculator"
      className={`mx-auto ${
        variant === "embedded" ? "max-w-full" : "max-w-5xl"
      } w-full min-w-0 rounded-2xl border border-[#D9CFB8] bg-white p-4 sm:p-8 lg:p-10 shadow-xs transition-all`}
    >
      {/* 1. Header Bar with Currency Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#D9CFB8]/60 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-[#F5EFE0] border border-[#D9CFB8] px-3.5 py-1 text-xs font-semibold text-[#1D5A6C]">
            <PeacockEye size={12} />
            <span>Interactive Cost & Living Estimator</span>
          </div>
          <h3 className="mt-2.5 font-display text-2xl sm:text-3xl font-normal tracking-tight text-[#103B47]">
            Study & Living Cost Breakdown
          </h3>
          <p className="mt-1 text-xs sm:text-sm text-[#6B6B6B] leading-relaxed">
            Pick your destination, university, program and city to see tuition,
            rent, food, transport and other costs for the full course in{" "}
            <span className="font-mono text-[#103B47] font-medium">
              ₹ Lakhs
            </span>
            .
          </p>
        </div>

        {/* Currency Switcher */}
        <div className="flex items-center gap-1 self-start sm:self-center rounded-lg bg-[#F5EFE0] border border-[#D9CFB8] p-1 text-xs font-semibold shrink-0">
          <button
            type="button"
            onClick={() => setCurrencyMode("inr")}
            className={`rounded-md px-3.5 py-1.5 transition cursor-pointer font-mono ${
              currencyMode === "inr"
                ? "bg-[#1D5A6C] text-white shadow-xs font-bold"
                : "text-[#6B6B6B] hover:text-[#103B47]"
            }`}
          >
            INR (₹) Only
          </button>
          <button
            type="button"
            onClick={() => setCurrencyMode("dual")}
            className={`rounded-md px-3.5 py-1.5 transition cursor-pointer font-mono ${
              currencyMode === "dual"
                ? "bg-[#1D5A6C] text-white shadow-xs font-bold"
                : "text-[#6B6B6B] hover:text-[#103B47]"
            }`}
          >
            Dual (₹ + {currencySymbol || "local"})
          </button>
        </div>
      </div>

      {/* 2. Step 1: Input Preferences Section */}
      <div className="mt-8">
        {/* Country + University + Program + City */}
        <div
          className={`grid grid-cols-1 md:grid-cols-2 gap-5 [&>*]:min-w-0 ${
            variant === "embedded" ? "" : "lg:grid-cols-4"
          }`}
        >
          {/* Target Country */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#103B47] mb-2 font-mono">
              1. Destination Country
            </label>
            <div className="relative flex items-center">
              <div className="absolute left-3.5 pointer-events-none z-10">
                <CountryFlag code={countrySlug} size="sm" />
              </div>
              <select
                id="calc-destination"
                aria-label="Target study destination"
                value={countrySlug}
                onChange={(e) => setCountrySlug(e.target.value)}
                className={`${selectClass} pl-11 pr-8`}
              >
                {countriesList.map((c) => (
                  <option
                    key={c.id}
                    value={c.slug}
                    className="text-slate-900 bg-white"
                  >
                    {c.name}
                    {c.exchangeRateToINR !== null &&
                      ` (${c.currency} ≈ ₹${formatINRRate(c.exchangeRateToINR)})`}
                    {c.tier && ` · ${c.tier}`}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* University (optional) */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#103B47] mb-2 font-mono">
              2. University
            </label>
            <select
              aria-label="University"
              value={selectedUniversity?.id ?? ""}
              onChange={(e) => handleUniversityChange(e.target.value)}
              disabled={countryUniversities.length === 0}
              className={selectClass}
            >
              <option value="">
                {countryUniversities.length === 0
                  ? "No universities listed"
                  : "Any university"}
              </option>
              {countryUniversities.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                  {u.city ? ` · ${u.city}` : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Program */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#103B47] mb-2 font-mono">
              3. Program
            </label>
            <select
              aria-label="Program"
              value={programSlug}
              onChange={(e) => setProgramSlug(e.target.value)}
              disabled={programOptions.length === 0}
              className={selectClass}
            >
              {programOptions.length === 0 ? (
                <option value="">No programs listed</option>
              ) : (
                programOptions.map((p) => (
                  <option key={p.id} value={p.slug}>
                    {p.name} · {show(p.level)}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* City */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#103B47] mb-2 font-mono">
              4. City
            </label>
            <select
              aria-label="City"
              value={selectedCity?.id ?? ""}
              onChange={(e) => handleCityChange(e.target.value)}
              disabled={cityOptions.length <= (selectedUniversity ? 1 : 0)}
              className={selectClass}
            >
              {cityOptions.length === 0 ? (
                <option value="">
                  {selectedUniversity?.city || "No cities listed"}
                </option>
              ) : (
                cityOptions.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                    {c.stateRegion ? `, ${c.stateRegion}` : ""}
                  </option>
                ))
              )}
            </select>
          </div>
        </div>
      </div>

      {/* 3. Step 2: Full-Width Visual Financial Output Dashboard */}
      <div className="mt-8 rounded-2xl border border-[#1D5A6C] bg-[#103B47] text-[#FDFCF7] p-6 sm:p-8 shadow-md relative overflow-hidden">
        {/* Top Summary Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1D5A6C]/50 pb-6">
          <div>
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#A8CDBD]">
              Total Estimated Budget
              {yearsLabel ? ` (${yearsLabel})` : ""}
            </span>
            <div className="mt-2 flex items-baseline flex-wrap gap-3">
              <div className="text-3xl sm:text-5xl font-mono font-bold text-[#EBC783] tracking-tight">
                {hasTotal ? formatCurrency(totalCostINR) : NOT_SET}
              </div>
              {hasTotal && showForeign && (
                <div className="rounded-md bg-white/10 px-3 py-1 text-sm font-mono font-semibold text-[#EBC783] border border-[#1D5A6C]">
                  ≈ {formatForeign(totalCostINR)} ({currencySymbol})
                </div>
              )}
            </div>
            {hasTotal && missingLines.length > 0 && (
              <p className="mt-1.5 text-[11px] text-[#A8CDBD]">
                Excludes {missingLines.map((l) => l.label).join(", ")} (not
                added yet)
              </p>
            )}
          </div>

          <div className="sm:text-right">
            <span className="inline-block rounded-md bg-[#1D5A6C]/60 border border-[#A8CDBD]/40 px-3.5 py-1 text-xs font-mono font-semibold text-[#A8CDBD]">
              {selectedCountry?.name || "Target Country"}
              {yearsLabel ? ` · ${yearsLabel} Total` : ""}
            </span>
            <p className="mt-1.5 text-xs text-[#F5EFE0]/80">
              Includes Tuition + Living Costs
            </p>
          </div>
        </div>

        {/* Course Duration, City & University */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs [&>*]:min-w-0">
          <div className="flex items-center gap-3 rounded-xl bg-white/5 p-3.5 border border-[#1D5A6C]">
            <CalendarClock className="h-5 w-5 text-[#D89A3E] shrink-0" />
            <div className="min-w-0">
              <div className="text-[#A8CDBD] font-medium">Course Duration</div>
              <div className="text-sm sm:text-base font-mono font-bold text-white">
                {yearsLabel || NOT_SET}
              </div>
              {durationText && (
                <div className="text-[11px] text-[#A8CDBD]">
                  {selectedProgram?.name}: {durationText}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl bg-white/5 p-3.5 border border-[#1D5A6C]">
            <MapPin className="h-5 w-5 text-[#A8CDBD] shrink-0" />
            <div className="min-w-0">
              <div className="text-[#A8CDBD] font-medium">City</div>
              <div className="text-sm sm:text-base font-mono font-bold text-white">
                {selectedCity?.name || selectedUniversity?.city || "Not selected"}
              </div>
              {livingMissing && (
                <div className="text-[11px] text-[#A8CDBD]">
                  Some living costs not added yet
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl bg-white/5 p-3.5 border border-[#1D5A6C]">
            <Building className="h-5 w-5 text-[#D89A3E] shrink-0" />
            <div className="min-w-0">
              <div className="text-[#A8CDBD] font-medium">University</div>
              <div className="text-sm sm:text-base font-mono font-bold text-white truncate">
                {selectedUniversity?.name || "Not selected"}
              </div>
              <div className="text-[11px] text-[#A8CDBD]">
                {educationCostNote}
              </div>
            </div>
          </div>
        </div>

        {/* Itemized Cost Breakdown */}
        <div className="mt-6 overflow-x-auto rounded-xl border border-[#1D5A6C] text-xs">
          <table className="w-full">
            <thead className="bg-white/5 text-[#A8CDBD] font-mono">
              <tr>
                <th className="px-3.5 py-2.5 text-left font-semibold">
                  Cost Item
                </th>
                <th className="px-3.5 py-2.5 text-right font-semibold">
                  Per Year
                </th>
                <th className="px-3.5 py-2.5 text-right font-semibold">
                  Total{yearsLabel ? ` (${yearsLabel})` : ""}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1D5A6C]/60">
              {costLines.map(
                ({ key, label, icon: Icon, iconClass, annualINR }) => (
                  <tr key={key}>
                    <td className="px-3.5 py-3">
                      <div className="flex items-center gap-2 font-medium text-[#FDFCF7]">
                        <Icon className={`h-4 w-4 shrink-0 ${iconClass}`} />
                        <span>{label}</span>
                      </div>
                    </td>
                    {annualINR === null ? (
                      <td
                        colSpan={2}
                        className="px-3.5 py-3 text-right font-mono text-[#A8CDBD]"
                      >
                        {NOT_SET}
                      </td>
                    ) : (
                      <>
                        <td className="px-3.5 py-3 text-right font-mono text-white">
                          {formatCurrency(annualINR)}
                          {showForeign && (
                            <div className="text-[11px] text-[#A8CDBD]">
                              {formatForeign(annualINR)}
                            </div>
                          )}
                        </td>
                        <td className="px-3.5 py-3 text-right font-mono font-bold text-white">
                          {durationYears !== null ? (
                            <>
                              {formatCurrency(annualINR * durationYears)}
                              {showForeign && (
                                <div className="text-[11px] font-normal text-[#A8CDBD]">
                                  {formatForeign(annualINR * durationYears)}
                                </div>
                              )}
                            </>
                          ) : (
                            "—"
                          )}
                        </td>
                      </>
                    )}
                  </tr>
                ),
              )}
            </tbody>
          </table>
        </div>

        {/* Visual Progress Distribution Bar */}
        {hasTotal && (
          <div className="mt-6 space-y-2">
            <div className="flex justify-between text-xs font-mono text-[#A8CDBD]">
              <span>Financial Distribution:</span>
              <span>
                Tuition {tuitionPct}% · Living {livingPct}%
              </span>
            </div>
            <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-[#0B2830]">
              <div
                style={{ width: `${tuitionPct}%` }}
                className="bg-[#D89A3E]"
                title="Tuition"
              />
              <div
                style={{ width: `${livingPct}%` }}
                className="bg-[#A8CDBD]"
                title="Living"
              />
            </div>
          </div>
        )}

        {/* Footer Actions & Exchange Rate */}
        <div className="mt-6 pt-5 border-t border-[#1D5A6C]/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-[11px] text-[#A8CDBD]">
            {exchangeRate !== null && (
              <>
                <Info className="h-3.5 w-3.5 text-[#D89A3E] shrink-0" />
                <span className="font-mono">
                  Exchange rate: 1 {currencySymbol} ≈ ₹
                  {formatINRRate(exchangeRate)}.{" "}
                  {/* <ExchangeRateCredit
                    updatedAt={selectedCountry?.exchangeRateUpdatedAt}
                  /> */}
                </span>
              </>
            )}
          </div>

          <div className="w-full sm:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
            {/* Carries the total and course length into the loan calculator */}
            {hasTotal && durationYears !== null && (
              <Link
                href={`/loan-calculator?cost=${Math.round(totalCostINR)}&course=${durationYears * 12}`}
                className="flex items-center justify-center gap-2 rounded-md border border-[#D89A3E] py-3 px-5 text-xs sm:text-sm font-semibold text-[#EBC783] transition hover:bg-[#D89A3E]/10"
              >
                Plan a Loan for This Budget →
              </Link>
            )}
            <button
              onClick={() =>
                handleLead(
                  `${selectedUniversity ? `${selectedUniversity.name}, ` : ""}${selectedCountry?.name || countrySlug}${selectedCity ? ` (${selectedCity.name})` : ""} - ${selectedProgram?.name || programSlug.toUpperCase()} Budget${hasTotal ? ` (${formatCurrency(totalCostINR)})` : ""}`,
                )
              }
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-md bg-[#D89A3E] py-3 px-6 text-xs sm:text-sm font-semibold text-[#103B47] shadow-sm transition hover:bg-[#c4872d] cursor-pointer"
            >
              <Banknote className="h-4 w-4" />
              <span>
                Get Scholarship & Loan Evaluation for{" "}
                {selectedCountry?.name || "Country"} →
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
