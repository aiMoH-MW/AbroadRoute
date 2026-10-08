"use client";

import { useState, useMemo } from "react";
import { formatINRRate } from "@/lib/exchangeRates";
import Link from "next/link";
import {
  Globe2,
  Search,
  ExternalLink,
  IndianRupee,
  MapPin,
  Building2,
  ShieldCheck,
} from "lucide-react";
import { Country, University } from "@/types";
import { CountryFlag } from "@/components/ui/CountryFlag";

interface AdminCountriesTabProps {
  countriesList: Country[];
  universitiesList: University[];
}

export function AdminCountriesTab({
  countriesList,
  universitiesList,
}: AdminCountriesTabProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [tierFilter, setTierFilter] = useState<string>("all");

  const countryUniCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    universitiesList.forEach((u) => {
      const c = (u.countrySlug || u.country || "").toLowerCase();
      counts[c] = (counts[c] || 0) + 1;
    });
    return counts;
  }, [universitiesList]);

  const filteredCountries = useMemo(() => {
    return countriesList.filter((c) => {
      const matchesTier =
        tierFilter === "all" ||
        (c.tier && c.tier.toLowerCase().includes(tierFilter.toLowerCase()));
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        c.name.toLowerCase().includes(q) ||
        c.currency.toLowerCase().includes(q) ||
        (c.postStudyWorkVisa &&
          c.postStudyWorkVisa.toLowerCase().includes(q)) ||
        (c.heroTagline && c.heroTagline.toLowerCase().includes(q));

      return matchesTier && matchesSearch;
    });
  }, [countriesList, tierFilter, searchQuery]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50 text-[#EA5C2B]">
                <Globe2 className="h-5 w-5 text-[#EA5C2B]" />
              </div>
              <div>
                <h2 className="text-lg font-black text-[#102C57]">
                  Global Destinations & Currency Engine
                </h2>
                <p className="text-xs text-slate-500">
                  Study abroad destinations with their currency exchange rate
                  to INR.
                </p>
              </div>
            </div>
          </div>

          <span className="rounded-full bg-emerald-50 px-3.5 py-1 text-xs font-bold text-emerald-800 self-start sm:self-auto">
            {countriesList.length} Destinations
          </span>
        </div>

        {/* Filter & Search Bar */}
        <div className="mt-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search destination, visa rules, or currency..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-[#102C57] focus:bg-white outline-none"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setTierFilter("all")}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                tierFilter === "all"
                  ? "bg-[#102C57] text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              All Tiers ({countriesList.length})
            </button>
            <button
              onClick={() => setTierFilter("tier 1")}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                tierFilter === "tier 1"
                  ? "bg-[#EA5C2B] text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Tier 1 Core
            </button>
            <button
              onClick={() => setTierFilter("tier 2")}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                tierFilter === "tier 2"
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Tier 2 Europe & Asia
            </button>
          </div>
        </div>
      </div>

      {/* Grid of Countries */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredCountries.map((c) => {
          const uniCount =
            countryUniCounts[c.slug.toLowerCase()] ||
            countryUniCounts[c.id.toLowerCase()] ||
            0;
          return (
            <div
              key={c.id}
              className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:border-slate-300 hover:shadow-md transition"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <CountryFlag
                      code={c.code || c.id}
                      name={c.name}
                      size="md"
                    />
                    <div>
                      <h3 className="font-extrabold text-[#102C57] text-sm">
                        {c.name}
                      </h3>
                      {c.tier && (
                        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                          {c.tier}
                        </span>
                      )}
                    </div>
                  </div>
                  <Link
                    href={`/countries/${c.slug}`}
                    target="_blank"
                    className="rounded-lg border border-slate-100 p-1.5 text-slate-400 hover:bg-slate-50 hover:text-[#102C57] transition"
                    title="View Destination Hub"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Link>
                </div>

                <div className="mt-4 space-y-2 text-xs">
                  <div className="flex items-center justify-between rounded-xl bg-slate-50 p-2.5">
                    <span className="text-slate-500 font-medium">
                      Currency Base
                    </span>
                    <span className="font-black text-[#102C57]">
                      1 {c.currency} ≈ ₹{formatINRRate(c.exchangeRateToINR)}
                      {c.exchangeRateUpdatedAt ? " (live)" : " (stored)"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between px-1">
                    <span className="text-slate-500">Post-Study Visa</span>
                    <span className="font-semibold text-slate-800">
                      {c.postStudyWorkVisa || "—"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between px-1">
                    <span className="text-slate-500">Universities</span>
                    <span className="font-bold text-indigo-700">
                      {uniCount} Institutions
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end text-[11px]">
                <Link
                  href={`/countries/${c.slug}`}
                  className="font-bold text-[#EA5C2B] hover:underline"
                >
                  Explore Catalog →
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
