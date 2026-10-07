"use client";

import Link from "next/link";
import { Building2, GraduationCap } from "lucide-react";

interface CompareNavHeaderProps {
  activeTab: "universities" | "courses";
}

export function CompareNavHeader({ activeTab }: CompareNavHeaderProps) {
  return (
    <div className="bg-[#103B47] border-b border-[#D9CFB8]/30 py-4 text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#D89A3E] font-mono">
            Multi-Item Comparison Engine • Template T-09
          </span>
          <h2 className="text-xl font-display font-bold text-white mt-0.5">
            Side-by-Side Comparison Matrix
          </h2>
        </div>

        <div className="inline-flex rounded-2xl bg-[#0A242C]/60 p-1.5 border border-white/10 shrink-0 self-start sm:self-auto">
          <Link
            href="/compare/universities"
            className={`flex min-h-[40px] items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition cursor-pointer ${
              activeTab === "universities"
                ? "bg-[#D89A3E] text-slate-950 shadow-md font-extrabold"
                : "text-slate-300 hover:text-white"
            }`}
          >
            <Building2 className="h-4 w-4" />
            <span>Compare Universities</span>
          </Link>

          <Link
            href="/compare/courses"
            className={`flex min-h-[40px] items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition cursor-pointer ${
              activeTab === "courses"
                ? "bg-[#D89A3E] text-slate-950 shadow-md font-extrabold"
                : "text-slate-300 hover:text-white"
            }`}
          >
            <GraduationCap className="h-4 w-4" />
            <span>Compare Courses & Degrees</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
