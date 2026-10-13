"use client";

import { useState } from "react";
import Link from "next/link";
import {
  TrendingUp,
  DollarSign,
  Briefcase,
  Award,
  ArrowRight,
  Sparkles,
  Calculator,
  CheckCircle2,
  Calendar,
  HelpCircle,
  Clock,
  Layers,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useHomeModals } from "@/components/home/HomeClientContext";

export function ROICalculatorClient() {
  const homeModals = useHomeModals();

  // Inputs
  const [currentSalaryINR, setCurrentSalaryINR] = useState(2500000); // ₹25 Lakhs / yr
  const [targetSalaryINR, setTargetSalaryINR] = useState(6500000); // ₹65 Lakhs / yr
  const [programCostINR, setProgramCostINR] = useState(3800000); // ₹38 Lakhs tuition + books
  const [formatType, setFormatType] = useState<
    "executive_modular" | "full_time"
  >("executive_modular");
  const [annualHikePercent, setAnnualHikePercent] = useState(8); // Standard 8% annual increment

  // Opportunity cost (salary loss if full time, 0 if executive weekend/modular)
  const opportunityCostINR =
    formatType === "full_time" ? currentSalaryINR * 1.5 : 0;
  const totalInvestmentINR = programCostINR + opportunityCostINR;

  // Annual salary delta (post-EMBA vs pre-EMBA)
  const initialSalaryDelta = Math.max(1, targetSalaryINR - currentSalaryINR);

  // Break-even years (Payback Period)
  const breakEvenYears = +(totalInvestmentINR / initialSalaryDelta).toFixed(1);

  // 10-Year Cumulative Gain Projection
  // Year-by-year baseline (without EMBA) vs with EMBA
  let cumulativeWithoutEMBA = 0;
  let cumulativeWithEMBA = -totalInvestmentINR;

  let simSalaryNoEMBA = currentSalaryINR;
  let simSalaryWithEMBA = targetSalaryINR;

  const yearlyTrajectory: {
    year: number;
    withoutEMBA: number;
    withEMBA: number;
    netBenefit: number;
  }[] = [];

  for (let y = 1; y <= 10; y++) {
    cumulativeWithoutEMBA += simSalaryNoEMBA;
    cumulativeWithEMBA += simSalaryWithEMBA;

    yearlyTrajectory.push({
      year: y,
      withoutEMBA: Math.round(cumulativeWithoutEMBA),
      withEMBA: Math.round(cumulativeWithEMBA),
      netBenefit: Math.round(cumulativeWithEMBA - cumulativeWithoutEMBA),
    });

    simSalaryNoEMBA *= 1 + (annualHikePercent / 100) * 0.7; // Lower growth trajectory
    simSalaryWithEMBA *= 1 + annualHikePercent / 100; // Accelerated leadership growth trajectory
  }

  const tenYearCumulativeGainINR = Math.max(
    0,
    yearlyTrajectory[9].withEMBA - yearlyTrajectory[9].withoutEMBA,
  );

  return (
    <div className="min-h-screen bg-[#FDFCF7] pb-20 pt-8 sm:pt-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header Breadcrumb & Hero */}
        <div className="mb-8 text-center sm:text-left">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#D9CFB8] bg-[#F5EFE0] px-3.5 py-1 text-xs font-semibold text-[#1D5A6C]">
            <Sparkles className="h-3.5 w-3.5 text-[#D89A3E]" />
            <span>Executive Career Analytics</span>
          </div>
          <h1 className="font-serif text-3xl font-black text-[#103B47] sm:text-4xl lg:text-5xl">
            Executive MBA (EMBA) ROI & Career Gain Calculator
          </h1>
          <p className="mt-3 max-w-3xl text-xs sm:text-sm md:text-base leading-relaxed text-[#6B6B6B]">
            Quantify your post-EMBA salary leap, calculate exact break-even
            payback timelines in years, and evaluate 10-year cumulative wealth
            trajectory in{" "}
            <span className="font-mono text-[#103B47] font-semibold">
              ₹ Lakhs
            </span>{" "}
            across global business schools.
          </p>
        </div>

        {/* Main 2-Column Calculator Layout */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Left Column: Interactive Inputs */}
          <div className="rounded-2xl border border-[#D9CFB8] bg-white p-6 sm:p-8 shadow-xs lg:col-span-6 space-y-6">
            <h2 className="text-base font-serif font-bold text-[#103B47] flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-[#D89A3E]" />
              <span>1. Your Current & Target Executive Profile</span>
            </h2>

            {/* Current Salary Slider */}
            <div>
              <div className="flex justify-between items-center text-xs font-semibold mb-2">
                <span className="text-[#103B47]">
                  Current Annual Total CTC (INR)
                </span>
                <span className="text-[#103B47] text-sm font-mono font-bold bg-[#F5EFE0] border border-[#D9CFB8]/70 px-2.5 py-1 rounded-md">
                  {formatCurrency(currentSalaryINR)}
                </span>
              </div>
              <input
                type="range"
                min={1000000}
                max={10000000}
                step={250000}
                value={currentSalaryINR}
                onChange={(e) => setCurrentSalaryINR(Number(e.target.value))}
                className="w-full accent-[#D89A3E] cursor-pointer h-2 bg-[#F5EFE0] rounded-lg"
              />
              <div className="flex justify-between text-[11px] font-mono text-[#6B6B6B] mt-1">
                <span>₹10 Lakhs</span>
                <span>₹50 Lakhs</span>
                <span>₹1.0 Crore</span>
              </div>
            </div>

            {/* Target Post-EMBA Salary Slider */}
            <div>
              <div className="flex justify-between items-center text-xs font-semibold mb-2">
                <span className="text-[#103B47]">
                  Target Post-EMBA Leadership CTC
                </span>
                <span className="text-[#103B47] text-sm font-mono font-bold bg-[#A8CDBD]/20 border border-[#A8CDBD] px-2.5 py-1 rounded-md">
                  {formatCurrency(targetSalaryINR)}
                </span>
              </div>
              <input
                type="range"
                min={2500000}
                max={25000000}
                step={500000}
                value={targetSalaryINR}
                onChange={(e) => setTargetSalaryINR(Number(e.target.value))}
                className="w-full accent-[#1D5A6C] cursor-pointer h-2 bg-[#F5EFE0] rounded-lg"
              />
              <div className="flex justify-between text-[11px] font-mono text-[#6B6B6B] mt-1">
                <span>₹25 Lakhs</span>
                <span>₹1.25 Crores</span>
                <span>₹2.5 Crores</span>
              </div>
            </div>

            {/* Program Cost Slider */}
            <div className="border-t border-[#D9CFB8]/60 pt-5">
              <h2 className="text-base font-serif font-bold text-[#103B47] flex items-center gap-2 mb-4">
                <Award className="h-4 w-4 text-[#D89A3E]" />
                <span>2. EMBA Program Investment & Format</span>
              </h2>

              <div className="flex justify-between items-center text-xs font-semibold mb-2">
                <span className="text-[#103B47]">
                  Total Program Tuition & Global Immersions
                </span>
                <span className="text-[#103B47] text-sm font-mono font-bold bg-[#F5EFE0] border border-[#D9CFB8]/70 px-2.5 py-1 rounded-md">
                  {formatCurrency(programCostINR)}
                </span>
              </div>
              <input
                type="range"
                min={1500000}
                max={12000000}
                step={250000}
                value={programCostINR}
                onChange={(e) => setProgramCostINR(Number(e.target.value))}
                className="w-full accent-[#1D5A6C] cursor-pointer h-2 bg-[#F5EFE0] rounded-lg"
              />
              <div className="flex justify-between text-[11px] font-mono text-[#6B6B6B] mt-1">
                <span>{formatCurrency(1500000)}</span>
                <span>{formatCurrency(6750000)}</span>
                <span>{formatCurrency(12000000)}</span>
              </div>
            </div>

            {/* Program Format Type */}
            <div>
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#103B47] mb-2">
                Delivery Format & Opportunity Cost
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs font-medium">
                <button
                  type="button"
                  onClick={() => setFormatType("executive_modular")}
                  className={`min-h-[44px] p-3 rounded-xl border text-left transition cursor-pointer ${
                    formatType === "executive_modular"
                      ? "border-[#D89A3E] bg-[#F5EFE0] text-[#103B47] ring-1 ring-[#D89A3E]"
                      : "border-[#D9CFB8] bg-[#FDFCF7] text-[#6B6B6B] hover:bg-[#F5EFE0]"
                  }`}
                >
                  <p className="font-bold text-[#103B47]">Modular / Weekend</p>
                  <p className="text-[11px] text-[#6B6B6B] font-mono mt-0.5">
                    Keep working • ₹0 Opportunity Cost
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setFormatType("full_time")}
                  className={`min-h-[44px] p-3 rounded-xl border text-left transition cursor-pointer ${
                    formatType === "full_time"
                      ? "border-[#D89A3E] bg-[#F5EFE0] text-[#103B47] ring-1 ring-[#D89A3E]"
                      : "border-[#D9CFB8] bg-[#FDFCF7] text-[#6B6B6B] hover:bg-[#F5EFE0]"
                  }`}
                >
                  <p className="font-bold text-[#103B47]">
                    Full-Time Sabbatical
                  </p>
                  <p className="text-[11px] text-[#6B6B6B] font-mono mt-0.5">
                    18 Months Salary Loss (+
                    {formatCurrency(currentSalaryINR * 1.5)})
                  </p>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: ROI Results & 10-Year Horizon */}
          <div className="space-y-6 lg:col-span-6">
            {/* Top Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Payback Period */}
              <div className="rounded-2xl border border-[#D9CFB8] bg-white p-6 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#6B6B6B]">
                    Break-Even Timeline
                  </span>
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#F5EFE0] text-[#D89A3E]">
                    <Clock className="h-4 w-4" />
                  </span>
                </div>
                <div className="mt-3 flex items-baseline gap-1.5">
                  <span className="text-3xl sm:text-4xl font-mono font-bold text-[#103B47]">
                    {breakEvenYears}
                  </span>
                  <span className="text-sm font-mono font-bold text-[#6B6B6B]">
                    Years
                  </span>
                </div>
                <p className="text-xs text-[#6B6B6B] mt-1.5">
                  Full investment recovered in approx.{" "}
                  <strong className="text-[#103B47] font-mono">
                    {Math.round(breakEvenYears * 12)} months
                  </strong>{" "}
                  post graduation.
                </p>
              </div>

              {/* 10-Year Cumulative Gain */}
              <div className="rounded-2xl border border-[#1D5A6C] bg-gradient-to-br from-[#103B47] via-[#103B47] to-[#0B2830] p-6 text-[#FDFCF7] shadow-xl">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#A8CDBD]">
                    10-Yr Net Cumulative Gain
                  </span>
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10 text-[#EBC783]">
                    <TrendingUp className="h-4 w-4" />
                  </span>
                </div>
                <div className="mt-3 text-3xl sm:text-4xl font-mono font-bold text-[#EBC783]">
                  {formatCurrency(tenYearCumulativeGainINR)}
                </div>
                <p className="text-xs text-[#A8CDBD] mt-1.5">
                  Net earnings gain over standard non-EMBA career path.
                </p>
              </div>
            </div>

            {/* Trajectory Breakdown Table */}
            <div className="rounded-2xl border border-[#D9CFB8] bg-white p-6 sm:p-8 shadow-xs overflow-hidden">
              <h3 className="text-base font-serif font-bold text-[#103B47] mb-4 flex items-center justify-between">
                <span>10-Year Earnings Trajectory Comparison</span>
                <span className="text-xs font-mono text-[#6B6B6B] font-normal">
                  INR Lakhs
                </span>
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#D9CFB8]/60 text-[10px] font-mono font-bold uppercase tracking-wider text-[#6B6B6B] bg-[#F5EFE0]/70">
                      <th className="py-2.5 px-3">Horizon</th>
                      <th className="py-2.5 px-3">Without EMBA</th>
                      <th className="py-2.5 px-3 text-[#103B47]">
                        With EMBA (Net)
                      </th>
                      <th className="py-2.5 px-3 text-[#1D5A6C] font-bold">
                        Net Wealth Delta
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#D9CFB8]/40 font-mono">
                    {[
                      yearlyTrajectory[0],
                      yearlyTrajectory[2],
                      yearlyTrajectory[4],
                      yearlyTrajectory[9],
                    ].map((row) => (
                      <tr
                        key={row.year}
                        className="hover:bg-[#F5EFE0]/40 transition"
                      >
                        <td className="py-3 px-3 font-bold text-[#103B47]">
                          Year {row.year}
                        </td>
                        <td className="py-3 px-3 text-[#6B6B6B]">
                          {formatCurrency(row.withoutEMBA)}
                        </td>
                        <td className="py-3 px-3 font-bold text-[#103B47]">
                          {formatCurrency(row.withEMBA)}
                        </td>
                        <td className="py-3 px-3 font-bold text-[#1D5A6C]">
                          +{formatCurrency(row.netBenefit)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Context-Aware Lead Capture */}
              <div className="mt-6 pt-4 border-t border-[#D9CFB8]/60">
                <button
                  onClick={() =>
                    homeModals.openLeadModal(
                      `EMBA ROI Report - BreakEven: ${breakEvenYears} Yrs, 10Y Gain: ${formatCurrency(tenYearCumulativeGainINR)}`,
                    )
                  }
                  className="min-h-[44px] w-full flex items-center justify-center gap-2 rounded-xl bg-[#D89A3E] py-3.5 px-6 text-xs sm:text-sm font-bold text-[#103B47] shadow-md hover:bg-[#c4872d] transition cursor-pointer"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>
                    Download Detailed Executive B-School ROI Dossier →
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
