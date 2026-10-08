"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Building2,
  Search,
  Filter,
  Pencil,
  ExternalLink,
  RefreshCw,
  Award,
  MapPin,
  Coins,
  GraduationCap,
  CheckCircle2,
} from "lucide-react";
import { University, Country } from "@/types";
import { CountryFlag } from "@/components/ui/CountryFlag";

interface AdminUniversitiesTabProps {
  universitiesList: University[];
  countriesList: Country[];
  onEditUniversity: (uni: University) => void;
  onRefreshUniversities?: () => Promise<void>;
}

export function AdminUniversitiesTab({
  universitiesList,
  countriesList,
  onEditUniversity,
  onRefreshUniversities,
}: AdminUniversitiesTabProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<string>("all");
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  const filteredUniversities = useMemo(() => {
    return universitiesList.filter((u) => {
      const matchesCountry =
        selectedCountry === "all" ||
        (u.countrySlug &&
          u.countrySlug.toLowerCase() === selectedCountry.toLowerCase()) ||
        (u.country &&
          u.country.toLowerCase() === selectedCountry.toLowerCase());

      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        u.name.toLowerCase().includes(q) ||
        u.city.toLowerCase().includes(q) ||
        (u.country && u.country.toLowerCase().includes(q));

      return matchesCountry && matchesSearch;
    });
  }, [universitiesList, selectedCountry, searchQuery]);

  // Re-reads the list from the database
  const handleSyncUniversities = async () => {
    if (!onRefreshUniversities) return;
    setIsSyncing(true);
    setSyncStatus(null);
    try {
      await onRefreshUniversities();
      setSyncStatus("Reloaded from the database.");
    } catch {
      setSyncStatus("Reload failed. Try again.");
    } finally {
      setIsSyncing(false);
      setTimeout(() => setSyncStatus(null), 3000);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header & Controls */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-[#102C57]">
                <Building2 className="h-5 w-5 text-[#102C57]" />
              </div>
              <div>
                <h2 className="text-lg font-black text-[#102C57]">
                  Master Universities Directory
                </h2>
                <p className="text-xs text-slate-500">
                  Manage live criteria, QS ranking, tuition fees, minimum IELTS,
                  and post-study work periods.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSyncUniversities}
              disabled={isSyncing}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 text-[#EA5C2B] ${isSyncing ? "animate-spin" : ""}`}
              />
              <span>{isSyncing ? "Reloading..." : "Reload"}</span>
            </button>
            <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-[#102C57]">
              {universitiesList.length} Universities
            </span>
          </div>
        </div>

        {syncStatus && (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-xs font-bold text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span>{syncStatus}</span>
          </div>
        )}

        {/* Filter & Search Bar */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative sm:col-span-2">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by university name, city, or destination..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-[#102C57] focus:bg-white outline-none"
            />
          </div>

          <div>
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs font-semibold text-slate-800 focus:border-[#102C57] focus:bg-white outline-none cursor-pointer"
            >
              <option value="all">
                All Destinations ({countriesList.length})
              </option>
              {countriesList.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.flagEmoji} {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Universities Table / Cards */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
              <tr>
                <th className="px-5 py-3.5">University & Location</th>
                <th className="px-4 py-3.5">QS Global Rank</th>
                <th className="px-4 py-3.5">Tuition Range (INR)</th>
                <th className="px-4 py-3.5">Min IELTS</th>
                <th className="px-4 py-3.5">Acceptance Rate</th>
                <th className="px-4 py-3.5">PSW Visa</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUniversities.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-12 text-center text-slate-500"
                  >
                    No universities match your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredUniversities.map((uni) => (
                  <tr
                    key={uni.slug}
                    className="hover:bg-slate-50/80 transition"
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <CountryFlag
                          code={uni.countrySlug || uni.country}
                          name={uni.country}
                          size="sm"
                        />
                        <div>
                          <p className="font-bold text-[#102C57]">{uni.name}</p>
                          <p className="text-[11px] text-slate-500">
                            {uni.city}, {uni.country}
                          </p>
                          {/* Assigned programs (university_programs) */}
                          {(uni.programs?.length ?? 0) > 0 && (
                            <div className="mt-1 flex flex-wrap gap-1">
                              {uni.programs!.map((p) => (
                                <span
                                  key={p.programId}
                                  className="rounded bg-indigo-50 px-1.5 py-0.5 text-[9px] font-bold uppercase text-[#102C57]"
                                >
                                  {p.programId}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      {uni.rankingGlobal ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 font-bold text-slate-700">
                          <Award className="h-3 w-3 text-amber-500" />#
                          {uni.rankingGlobal}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="font-semibold text-emerald-800">
                        {uni.tuitionFeeRangeINR || "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-slate-700">
                      {uni.ieltsMinScore ? `${uni.ieltsMinScore} Band` : "—"}
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-slate-700">
                      {uni.acceptanceRate ? `${uni.acceptanceRate}%` : "—"}
                    </td>
                    <td className="px-4 py-3.5">
                      {uni.postStudyWorkMonths ? (
                        <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700">
                          {uni.postStudyWorkMonths} Mos
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/universities/${uni.slug}`}
                          target="_blank"
                          className="rounded-lg border border-slate-200 p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition"
                          title="View Live Public Profile"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Link>
                        <button
                          onClick={() => onEditUniversity(uni)}
                          className="flex items-center gap-1 rounded-lg bg-[#102C57] px-2.5 py-1.5 font-bold text-white hover:bg-[#0c2242] transition cursor-pointer"
                        >
                          <Pencil className="h-3 w-3 text-[#EA5C2B]" />
                          <span>Edit</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
