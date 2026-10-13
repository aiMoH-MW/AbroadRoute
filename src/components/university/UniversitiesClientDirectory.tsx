"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Building2,
  MapPin,
  Award,
  Search,
  ArrowRight,
  Sparkles,
  Filter,
} from "lucide-react";
import { University, Country } from "@/types";
import { CountryFlag } from "@/components/ui/CountryFlag";
import { NotProvided } from "@/components/tools/NotProvided";

interface UniversitiesClientDirectoryProps {
  initialUniversities: University[];
  countries: Country[];
}

export function UniversitiesClientDirectory({
  initialUniversities,
  countries,
}: UniversitiesClientDirectoryProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"rank" | "name">("rank");

  const filteredUniversities = useMemo(() => {
    return initialUniversities
      .filter((uni) => {
        const q = searchQuery.toLowerCase();
        const matchesSearch = [uni.name, uni.city, uni.country].some((v) =>
          v?.toLowerCase().includes(q),
        );

        const matchesCountry =
          selectedCountry === "all" || uni.countrySlug === selectedCountry;

        return matchesSearch && matchesCountry;
      })
      .sort((a, b) => {
        if (sortBy === "rank") {
          // Unranked universities go last
          return (
            (a.rankingGlobal ?? Infinity) - (b.rankingGlobal ?? Infinity) ||
            a.name.localeCompare(b.name)
          );
        }
        return a.name.localeCompare(b.name);
      });
  }, [initialUniversities, searchQuery, selectedCountry, sortBy]);

  // Countries that have universities, most universities first
  const uniqueCountries = useMemo(() => {
    const counts = new Map<
      string,
      { slug: string; name: string; count: number }
    >();
    initialUniversities.forEach((u) => {
      if (!u.countrySlug) return;
      const entry = counts.get(u.countrySlug) ?? {
        slug: u.countrySlug,
        name: u.country ?? u.countrySlug,
        count: 0,
      };
      entry.count += 1;
      counts.set(u.countrySlug, entry);
    });
    return Array.from(counts.values()).sort(
      (a, b) => b.count - a.count || a.name.localeCompare(b.name),
    );
  }, [initialUniversities]);
  const popularCountries = uniqueCountries.slice(0, 6);

  return (
    <div className="space-y-8">
      {/* Search & Filter Bar */}
      <div className="rounded-2xl border border-[#D9CFB8]/80 bg-white p-4 sm:p-6 shadow-2xs">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {/* Search Input */}
          <div className="relative md:col-span-1">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by university name, city..."
              className="w-full min-h-[44px] rounded-xl border border-[#D9CFB8] bg-[#FDFCF7]/50 py-2.5 pl-10 pr-4 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#103B47] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#103B47]/10 transition"
            />
          </div>

          {/* Country Filter */}
          <div className="relative">
            <Filter className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="w-full min-h-[44px] appearance-none rounded-xl border border-[#D9CFB8] bg-[#FDFCF7]/50 py-2.5 pl-10 pr-8 text-xs sm:text-sm text-slate-900 focus:border-[#103B47] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#103B47]/10 transition cursor-pointer"
            >
              <option value="all">
                All Countries ({initialUniversities.length})
              </option>
              {[...uniqueCountries]
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.name} ({c.count})
                  </option>
                ))}
            </select>
          </div>

          {/* Sort By */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "rank" | "name")}
              className="w-full min-h-[44px] rounded-xl border border-[#D9CFB8] bg-[#FDFCF7]/50 py-2.5 px-3.5 text-xs sm:text-sm text-slate-900 focus:border-[#103B47] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#103B47]/10 transition cursor-pointer"
            >
              <option value="rank">Sort by QS World Ranking (Top First)</option>
              <option value="name">Sort Alphabetically (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Quick Filter Pill Chips */}
        <div className="mt-4 flex flex-wrap items-center gap-2 pt-3 border-t border-[#D9CFB8]/40">
          <span className="text-xs font-bold text-slate-500 mr-1">
            Popular Destinations:
          </span>
          {popularCountries.map(
            ({ slug: cSlug, name: cName }) => {
              const isSelected = selectedCountry === cSlug;
              return (
                <button
                  key={cSlug}
                  type="button"
                  onClick={() => setSelectedCountry(isSelected ? "all" : cSlug)}
                  className={`min-h-[36px] rounded-full px-4 py-1.5 text-xs font-bold transition cursor-pointer ${
                    isSelected
                      ? "bg-[#103B47] text-white shadow-2xs"
                      : "border border-[#D9CFB8] bg-[#FDFCF7] text-slate-700 hover:bg-white hover:border-slate-300"
                  }`}
                >
                  {cName}
                </button>
              );
            },
          )}
          {selectedCountry !== "all" && (
            <button
              type="button"
              onClick={() => setSelectedCountry("all")}
              className="text-xs font-bold text-rose-600 hover:underline ml-auto"
            >
              Clear Filter ✕
            </button>
          )}
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-600">
          Showing{" "}
          <span className="font-extrabold text-[#103B47] font-mono">
            {filteredUniversities.length}
          </span>{" "}
          institutions
        </p>
        <p className="text-xs text-slate-500">
          Verified for Indian Aspirants 2026-2027
        </p>
      </div>

      {/* University Grid */}
      {filteredUniversities.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#D9CFB8] bg-white p-12 text-center">
          <Building2 className="mx-auto h-12 w-12 text-slate-300" />
          <h3 className="mt-4 text-base font-serif font-bold text-[#103B47]">
            No universities found
          </h3>
          <p className="mt-1 text-xs text-slate-500">
            Try adjusting your search keywords or destination filter.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setSelectedCountry("all");
            }}
            className="mt-4 min-h-[44px] rounded-xl bg-[#103B47] px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#1D5A6C] transition cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredUniversities.map((uni) => {
            const countryObj = countries.find(
              (c) => c.id === uni.countrySlug || c.slug === uni.countrySlug,
            );

            return (
              <div
                key={uni.id || uni.slug}
                className="group relative flex flex-col justify-between rounded-2xl border border-[#D9CFB8]/80 bg-white p-5 shadow-2xs hover:shadow-md hover:border-[#103B47]/30 transition-all duration-200"
              >
                <div>
                  {/* Top Badge: Rank & Country */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#D89A3E]/10 px-2.5 py-1 text-xs font-bold text-[#D89A3E] border border-[#D89A3E]/30 font-mono">
                      <Award className="h-3.5 w-3.5 text-[#D89A3E]" />
                      {uni.rankingGlobal !== null ? (
                        `#${uni.rankingGlobal} QS Global`
                      ) : (
                        <>
                          QS Global: <NotProvided />
                        </>
                      )}
                    </span>
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                      {countryObj && (
                        <CountryFlag
                          code={countryObj.code}
                          name={uni.country ?? undefined}
                          size="sm"
                        />
                      )}
                      <span>{uni.country ?? <NotProvided />}</span>
                    </div>
                  </div>

                  {/* University Name */}
                  <h3 className="text-base font-serif font-bold text-[#103B47] group-hover:text-[#1D5A6C] transition leading-snug">
                    <Link
                      href={`/universities/${uni.slug}`}
                      className="hover:underline"
                    >
                      {uni.name}
                    </Link>
                  </h3>

                  {/* Location */}
                  <div className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                    <MapPin className="h-3.5 w-3.5 text-[#D89A3E] shrink-0" />
                    <span>
                      {[uni.city, uni.country].filter(Boolean).join(", ") || (
                        <NotProvided />
                      )}
                    </span>
                  </div>

                  {/* Key Metrics Grid */}
                  <div className="mt-4 grid grid-cols-2 gap-2 rounded-xl bg-[#FDFCF7] p-3 border border-[#D9CFB8]/60 text-xs">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider">
                        Annual Tuition
                      </span>
                      <span className="font-bold text-[#103B47] font-mono">
                        {uni.tuitionFeeRangeINR ?? <NotProvided />}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider">
                        Acceptance Rate
                      </span>
                      <span className="font-bold text-[#103B47] font-mono">
                        {uni.acceptanceRate !== null ? (
                          `${uni.acceptanceRate}%`
                        ) : (
                          <NotProvided />
                        )}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider">
                        IELTS Cutoff
                      </span>
                      <span className="font-bold text-slate-700 font-mono">
                        {uni.ieltsMinScore !== null ? (
                          `${uni.ieltsMinScore} Overall`
                        ) : (
                          <NotProvided />
                        )}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider">
                        PSW Visa
                      </span>
                      {uni.postStudyWorkMonths !== null ? (
                        <span className="font-bold text-[#D89A3E] flex items-center gap-1 font-mono">
                          <Sparkles className="h-3 w-3" />{" "}
                          {uni.postStudyWorkMonths} Months
                        </span>
                      ) : (
                        <NotProvided />
                      )}
                    </div>
                  </div>
                </div>

                {/* Bottom Card Actions */}
                <div className="mt-5 pt-4 border-t border-[#D9CFB8]/40 flex items-center justify-between">
                  <Link
                    href={`/compare/universities?u1=${uni.slug}`}
                    className="text-xs font-semibold text-slate-500 hover:text-[#103B47] transition min-h-[44px] flex items-center"
                  >
                    + Compare
                  </Link>
                  <Link
                    href={`/universities/${uni.slug}`}
                    className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl bg-[#103B47] px-4 py-2 text-xs font-bold text-white shadow-2xs hover:bg-[#1D5A6C] transition active:scale-98"
                  >
                    <span>View Profile</span>
                    <ArrowRight className="h-3.5 w-3.5 text-[#D89A3E]" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
