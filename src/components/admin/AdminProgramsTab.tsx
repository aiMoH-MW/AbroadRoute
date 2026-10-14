"use client";

import { useState, useMemo } from "react";
import {
  BookOpen,
  Search,
  Globe,
  Sparkles,
} from "lucide-react";
import { Program } from "@/types";
import { NotProvided, show } from "@/components/tools/NotProvided";

interface AdminProgramsTabProps {
  programsList: Program[];
}

export function AdminProgramsTab({ programsList }: AdminProgramsTabProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [levelFilter, setLevelFilter] = useState<string>("all");

  const filteredPrograms = useMemo(() => {
    return programsList.filter((p) => {
      const matchesLevel =
        levelFilter === "all" ||
        (p.level && p.level.toLowerCase().includes(levelFilter.toLowerCase()));

      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        p.name.toLowerCase().includes(q) ||
        (p.summary && p.summary.toLowerCase().includes(q)) ||
        (p.keyFields &&
          p.keyFields.some((kf: string) => kf.toLowerCase().includes(q))) ||
        (p.topDestinations &&
          p.topDestinations.some((td: string) => td.toLowerCase().includes(q)));

      return matchesLevel && matchesSearch;
    });
  }, [programsList, levelFilter, searchQuery]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-purple-700">
                <BookOpen className="h-5 w-5 text-purple-700" />
              </div>
              <div>
                <h2 className="text-lg font-black text-[#102C57]">
                  Program Streams & Disciplines
                </h2>
                <p className="text-xs text-slate-500">
                  Global academic disciplines catalog with ROI metrics, study
                  duration, and high-demand specializations.
                </p>
              </div>
            </div>
          </div>

          <span className="rounded-full bg-purple-50 px-3.5 py-1 text-xs font-bold text-purple-800 self-start sm:self-auto">
            {programsList.length} Programs
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
              placeholder="Search program stream, key specialization, or destination..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-[#102C57] focus:bg-white outline-none"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setLevelFilter("all")}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                levelFilter === "all"
                  ? "bg-[#102C57] text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              All Programs ({programsList.length})
            </button>
            <button
              onClick={() => setLevelFilter("postgraduate")}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                levelFilter === "postgraduate"
                  ? "bg-purple-700 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Postgraduate / Master
            </button>
            <button
              onClick={() => setLevelFilter("undergraduate")}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                levelFilter === "undergraduate"
                  ? "bg-[#EA5C2B] text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Undergraduate / Bachelor
            </button>
          </div>
        </div>
      </div>

      {/* Programs Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filteredPrograms.map((p) => (
          <div
            key={p.id}
            className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:border-slate-300 hover:shadow-md transition"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <div>
                  {p.level && (
                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                      {show(p.level)}
                    </span>
                  )}
                  <h3 className="mt-2 font-black text-[#102C57] text-sm leading-snug">
                    {p.name}
                  </h3>
                </div>
              </div>

              <p className="mt-3 text-xs text-slate-600 line-clamp-2">
                {show(p.summary)}
              </p>

              <div className="mt-4 space-y-2 text-xs">
                <div className="flex items-center justify-between rounded-xl bg-slate-50 p-2.5">
                  <span className="text-slate-500 font-medium">
                    Standard Duration
                  </span>
                  <span className="font-bold text-slate-800">
                    {p.duration || "—"}
                  </span>
                </div>

                {p.keyFields && p.keyFields.length > 0 && (
                  <div className="pt-2">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1">
                      <Sparkles className="h-3 w-3 text-purple-600" />
                      Key Disciplines:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {p.keyFields
                        .slice(0, 4)
                        .map((kf: string, idx: number) => (
                          <span
                            key={idx}
                            className="rounded-lg bg-indigo-50/70 border border-indigo-100 px-2 py-0.5 text-[10px] font-semibold text-indigo-800"
                          >
                            {kf}
                          </span>
                        ))}
                    </div>
                  </div>
                )}

                {p.topDestinations && p.topDestinations.length > 0 && (
                  <div className="pt-1 flex items-center justify-between text-[11px] text-slate-500">
                    <span className="flex items-center gap-1 text-slate-400">
                      <Globe className="h-3 w-3" /> Top Hubs:
                    </span>
                    <span className="font-semibold text-slate-700">
                      {p.topDestinations.slice(0, 3).join(", ")}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 text-[11px]">
              <span className="text-slate-500 font-medium">Slug: {p.slug}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
