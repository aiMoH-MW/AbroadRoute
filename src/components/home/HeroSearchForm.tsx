"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, GraduationCap, Loader2 } from "lucide-react";
import {
  fetchLiveCountries,
  fetchLivePrograms,
} from "@/lib/supabase/dataFetchers";
import { Country, Program, TierCategory } from "@/types";
import { CountryFlag } from "@/components/ui/CountryFlag";

// Destinations grouped by their tier in the database
const TIER_GROUPS: { tier: TierCategory; label: string }[] = [
  { tier: "Tier 1", label: "Tier 1" },
  { tier: "Tier 2", label: "Tier 2" },
  { tier: "Tier 3", label: "Tier 3" },
];

export function HeroSearchForm() {
  const router = useRouter();
  const [countries, setCountries] = useState<Country[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedProgram, setSelectedProgram] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchLiveCountries().then((c) => setCountries(c ?? []));
    fetchLivePrograms().then((p) => setPrograms(p ?? []));
  }, []);

  const groupedCountries = TIER_GROUPS.map((g) => ({
    ...g,
    countries: countries.filter((c) => c.tier === g.tier),
  }));
  const ungroupedCountries = countries.filter(
    (c) => !TIER_GROUPS.some((g) => g.tier === c.tier),
  );

  const currentCountry = countries.find((c) => c.slug === selectedCountry);

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
          code={currentCountry?.code}
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
            <option value="">
              {countries.length > 0
                ? "Any destination"
                : "Loading destinations..."}
            </option>
            {groupedCountries.map(
              (g) =>
                g.countries.length > 0 && (
                  <optgroup key={g.tier} label={g.label}>
                    {g.countries.map((c) => (
                      <option key={c.id || c.slug} value={c.slug}>
                        {c.name}
                      </option>
                    ))}
                  </optgroup>
                ),
            )}
            {ungroupedCountries.map((c) => (
              <option key={c.id || c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
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
            <option value="">
              {programs.length > 0 ? "Any program" : "Loading programs..."}
            </option>
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
