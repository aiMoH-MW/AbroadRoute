"use client";

import { CheckCircle2, XCircle } from "lucide-react";
import type { TestResult } from "@/lib/testPrep/types";

interface Props {
  examShortName: string;
  candidateName: string;
  result: TestResult;
}

export function OnlineTestResult({ examShortName, candidateName, result }: Props) {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="rounded-3xl border border-[#D9CFB8]/80 bg-white p-6 sm:p-8 text-center shadow-sm">
        <p className="text-[11px] font-bold uppercase tracking-wider text-[#D89A3E]">
          {examShortName} Mock Test Result
        </p>
        <h1 className="mt-2 font-serif text-2xl font-bold text-[#103B47]">
          Well done, {candidateName.split(" ")[0]}!
        </h1>
        <p className="mt-4 text-5xl font-bold text-[#103B47] tabular-nums">
          {result.percentage}%
        </p>
        <p className="mt-1 text-sm text-slate-500">
          {result.correct} of {result.total} correct
        </p>

        <ul className="mt-6 grid gap-3 sm:grid-cols-2 text-left">
          {result.sections.map((s) => (
            <li key={s.section} className="rounded-2xl border border-[#D9CFB8]/70 bg-[#FDFCF7] p-4">
              <p className="text-xs font-bold text-slate-700">{s.section}</p>
              <p className="mt-1 text-sm font-semibold text-[#103B47]">
                {s.correct} / {s.total}
              </p>
            </li>
          ))}
        </ul>
      </div>

      {result.review && (
      <div className="rounded-3xl border border-[#D9CFB8]/80 bg-white p-6 sm:p-8 shadow-sm">
        <h2 className="text-sm font-bold uppercase tracking-wider text-[#103B47]">
          Answer Review
        </h2>
        <ol className="mt-4 space-y-4">
          {result.review.map((r, idx) => (
            <li key={r.id} className="rounded-2xl border border-[#D9CFB8]/70 p-4">
              <div className="flex items-start gap-2">
                {r.isCorrect ? (
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                ) : (
                  <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                )}
                <p className="whitespace-pre-line text-sm font-bold text-slate-900">
                  {idx + 1}. {r.prompt}
                </p>
              </div>
              <p className="mt-2 text-xs text-slate-600">
                Your answer:{" "}
                <span className={r.isCorrect ? "font-semibold text-emerald-700" : "font-semibold text-red-600"}>
                  {r.selectedIndex === null ? "Not answered" : r.options[r.selectedIndex]}
                </span>
              </p>
              {!r.isCorrect && (
                <p className="mt-1 text-xs text-slate-600">
                  Correct answer:{" "}
                  <span className="font-semibold text-emerald-700">{r.options[r.answerIndex]}</span>
                </p>
              )}
              <p className="mt-2 text-xs leading-relaxed text-slate-500">{r.explanation}</p>
            </li>
          ))}
        </ol>
      </div>
      )}
    </div>
  );
}
