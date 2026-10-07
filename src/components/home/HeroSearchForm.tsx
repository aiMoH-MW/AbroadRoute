"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, GraduationCap, Loader2 } from "lucide-react";
import {
  fetchLiveCountries,
  fetchLivePrograms,
} from "@/lib/supabase/dataFetchers";
import { Country, Program, TierCategory, ProgramCategory } from "@/types";
import { CountryFlag } from "@/components/ui/CountryFlag";

const ANCHOR_SLUGS = ["uk", "usa", "germany", "canada", "australia", "ireland"];

interface FallbackCountry {
  id: string;
  name: string;
  slug: string;
  code: string;
  tier: TierCategory;
}

const DEFAULT_COUNTRIES: FallbackCountry[] = [
  {
    id: "germany",
    name: "Germany",
    slug: "germany",
    code: "DE",
    tier: "Tier 1",
  },
  { id: "usa", name: "United States", slug: "usa", code: "US", tier: "Tier 1" },
  { id: "uk", name: "United Kingdom", slug: "uk", code: "GB", tier: "Tier 1" },
  { id: "canada", name: "Canada", slug: "canada", code: "CA", tier: "Tier 1" },
  {
    id: "australia",
    name: "Australia",
    slug: "australia",
    code: "AU",
    tier: "Tier 1",
  },
  {
    id: "ireland",
    name: "Ireland",
    slug: "ireland",
    code: "IE",
    tier: "Tier 1",
  },
  { id: "france", name: "France", slug: "france", code: "FR", tier: "Tier 2" },
  { id: "italy", name: "Italy", slug: "italy", code: "IT", tier: "Tier 2" },
  {
    id: "netherlands",
    name: "Netherlands",
    slug: "netherlands",
    code: "NL",
    tier: "Tier 2",
  },
  {
    id: "singapore",
    name: "Singapore",
    slug: "singapore",
    code: "SG",
    tier: "Tier 2",
  },
  {
    id: "new-zealand",
    name: "New Zealand",
    slug: "new-zealand",
    code: "NZ",
    tier: "Tier 2",
  },
  {
    id: "uae",
    name: "United Arab Emirates",
    slug: "uae",
    code: "AE",
    tier: "Tier 2",
  },
  {
    id: "malaysia",
    name: "Malaysia",
    slug: "malaysia",
    code: "MY",
    tier: "Tier 2",
  },
  { id: "russia", name: "Russia", slug: "russia", code: "RU", tier: "Tier 3" },
  {
    id: "uzbekistan",
    name: "Uzbekistan",
    slug: "uzbekistan",
    code: "UZ",
    tier: "Tier 3",
  },
  {
    id: "kazakhstan",
    name: "Kazakhstan",
    slug: "kazakhstan",
    code: "KZ",
    tier: "Tier 3",
  },
  {
    id: "kyrgyzstan",
    name: "Kyrgyzstan",
    slug: "kyrgyzstan",
    code: "KG",
    tier: "Tier 3",
  },
  {
    id: "georgia",
    name: "Georgia",
    slug: "georgia",
    code: "GE",
    tier: "Tier 3",
  },
  {
    id: "philippines",
    name: "Philippines",
    slug: "philippines",
    code: "PH",
    tier: "Tier 3",
  },
];

interface FallbackProgram {
  id: string;
  name: string;
  slug: ProgramCategory;
}

const DEFAULT_PROGRAMS: FallbackProgram[] = [
  { id: "ms", name: "Master's (MS / MSc / MEng)", slug: "ms" },
  { id: "mba", name: "MBA (Management)", slug: "mba" },
  { id: "emba", name: "Executive MBA (EMBA)", slug: "emba" },
  { id: "mbbs", name: "MBBS / Medicine (NMC)", slug: "mbbs" },
  {
    id: "ausbildung",
    name: "Germany Ausbildung (Dual Vocational)",
    slug: "ausbildung",
  },
  { id: "nursing", name: "Nursing & Healthcare", slug: "nursing" },
  { id: "bachelors", name: "Bachelor's (BS / BA / BEng)", slug: "bachelors" },
  { id: "phd", name: "PhD / Doctoral Research", slug: "phd" },
];

export function HeroSearchForm() {
  const router = useRouter();
  const [countries, setCountries] =
    useState<(Country | FallbackCountry)[]>(DEFAULT_COUNTRIES);
  const [programs, setPrograms] =
    useState<(Program | FallbackProgram)[]>(DEFAULT_PROGRAMS);
  const [selectedCountry, setSelectedCountry] = useState("germany");
  const [selectedProgram, setSelectedProgram] = useState("ms");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchLiveCountries().then((c) => {
      if (c && c.length > 0) setCountries(c);
    });
    fetchLivePrograms().then((p) => {
      if (p && p.length > 0) setPrograms(p);
    });
  }, []);

  const anchorCountries = countries.filter(
    (c) => ANCHOR_SLUGS.includes(c.slug) || c.tier === "Tier 1",
  );
  const tier2Countries = countries.filter(
    (c) =>
      !ANCHOR_SLUGS.includes(c.slug) &&
      (c.tier === "Tier 2" ||
        [
          "france",
          "italy",
          "netherlands",
          "singapore",
          "new-zealand",
          "uae",
          "malaysia",
        ].includes(c.slug)),
  );
  const tier3Countries = countries.filter(
    (c) =>
      c.tier === "Tier 3" ||
      [
        "russia",
        "uzbekistan",
        "kazakhstan",
        "kyrgyzstan",
        "georgia",
        "philippines",
      ].includes(c.slug),
  );

  const currentCountry =
    countries.find((c) => c.slug === selectedCountry) ||
    DEFAULT_COUNTRIES.find((c) => c.slug === selectedCountry);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (selectedCountry) {
      const targetUrl = selectedProgram
        ? `/study-in-${selectedCountry}?program=${encodeURIComponent(selectedProgram)}`
        : `/study-in-${selectedCountry}`;
      router.push(targetUrl);
    } else if (selectedProgram) {
      router.push(`/programs/${encodeURIComponent(selectedProgram)}`);
    } else {
      router.push("/destinations");
    }
  };

  return (
    <form
      onSubmit={handleSearchSubmit}
      className="mt-8 rounded-2xl border border-white/20 bg-[#103B47]/80 sm:bg-white/10 p-2 sm:backdrop-blur-xl shadow-2xl sm:flex sm:items-center sm:gap-2 max-w-xl"
    >
      {/* Country Selector */}
      <div className="flex flex-1 min-h-[44px] items-center gap-2.5 rounded-xl bg-white/10 px-3.5 py-2.5 sm:bg-transparent">
        <CountryFlag
          code={
            currentCountry?.code || currentCountry?.slug?.toUpperCase() || "DE"
          }
          name={currentCountry?.name}
          size="sm"
        />
        <div className="text-left w-full">
          <label
            htmlFor="country-select"
            className="block text-[9px] font-bold uppercase tracking-wider text-slate-300 font-mono"
          >
            Destination
          </label>
          <select
            id="country-select"
            aria-label="Select study destination country"
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
            className="w-full bg-transparent text-xs font-bold text-white focus:outline-none cursor-pointer [&>option]:text-slate-900 [&>optgroup]:text-slate-900"
          >
            <optgroup label="Anchor Six (Tier 1)">
              {anchorCountries.map((c) => (
                <option key={c.id || c.slug} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </optgroup>
            {tier2Countries.length > 0 && (
              <optgroup label="Europe & Asia (Tier 2)">
                {tier2Countries.map((c) => (
                  <option key={c.id || c.slug} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </optgroup>
            )}
            {tier3Countries.length > 0 && (
              <optgroup label="Medical & Value (Tier 3)">
                {tier3Countries.map((c) => (
                  <option key={c.id || c.slug} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </optgroup>
            )}
          </select>
        </div>
      </div>

      <div className="my-2 h-7 w-px bg-white/20 hidden sm:block" />

      {/* Program Selector */}
      <div className="flex flex-1 min-h-[44px] items-center gap-2 rounded-xl bg-white/10 px-3.5 py-2.5 sm:bg-transparent">
        <GraduationCap className="h-4 w-4 text-[#D89A3E] shrink-0" />
        <div className="text-left w-full">
          <label
            htmlFor="program-select"
            className="block text-[9px] font-bold uppercase tracking-wider text-slate-300 font-mono"
          >
            Program
          </label>
          <select
            id="program-select"
            aria-label="Select degree or study stream"
            value={selectedProgram}
            onChange={(e) => setSelectedProgram(e.target.value)}
            className="w-full bg-transparent text-xs font-bold text-white focus:outline-none cursor-pointer [&>option]:text-slate-900"
          >
            {programs.map((p) => (
              <option key={p.id || p.slug} value={p.slug}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-2 flex w-full min-h-[44px] items-center justify-center gap-1.5 rounded-xl bg-[#D89A3E] px-5 py-3 text-xs font-bold text-[#103B47] shadow-lg transition hover:bg-[#EBC783] sm:mt-0 sm:w-auto shrink-0 disabled:opacity-75 cursor-pointer active:scale-98"
      >
        {isSubmitting ? (
          <Loader2 className="h-4 w-4 animate-spin text-[#103B47]" />
        ) : (
          <Search className="h-4 w-4 text-[#103B47]" />
        )}
        <span>{isSubmitting ? "Searching..." : "Search"}</span>
      </button>
    </form>
  );
}
