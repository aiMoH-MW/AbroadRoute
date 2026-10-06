"use client";

import { FormEvent, useCallback, useState } from "react";
import { ArrowRight, CheckCircle2, Loader2, Mail, Phone, RotateCcw, User } from "lucide-react";
import type { GeneratedPaper, TestResult } from "@/lib/testPrep/types";
import { OnlineTestPaper, PaperAnswers } from "./OnlineTestPaper";
import { OnlineTestResult } from "./OnlineTestResult";

export interface OnlineTestExam {
  slug: string;
  name: string;
  shortName: string;
  fullName: string;
  targetCountry?: string;
  sections: string[];
  durationMinutes: number;
  questionCount: number;
  instructions: string | null;
}

export interface OnlineTestCandidate {
  fullName: string;
  phone: string;
  email: string;
}

interface Props {
  exam: OnlineTestExam;
}

type Stage = "register" | "generating" | "test" | "result";

const PHONE_REGEX = /^[6-9]\d{9}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(candidate: OnlineTestCandidate): string | null {
  if (candidate.fullName.trim().length < 2) {
    return "Please enter your full name.";
  }
  if (!PHONE_REGEX.test(candidate.phone)) {
    return "Please enter a valid 10-digit Indian mobile number.";
  }
  if (!EMAIL_REGEX.test(candidate.email.trim())) {
    return "Please enter a valid email address.";
  }
  return null;
}

export function OnlineTestRegistration({ exam }: Props) {
  const [stage, setStage] = useState<Stage>("register");
  const [candidate, setCandidate] = useState<OnlineTestCandidate>({
    fullName: "",
    phone: "",
    email: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [paper, setPaper] = useState<GeneratedPaper | null>(null);
  const [result, setResult] = useState<TestResult | null>(null);

  const generatePaper = async () => {
    setStage("generating");
    setError(null);
    try {
      const res = await fetch("/api/test-prep/paper", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ examSlug: exam.slug }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Could not generate your paper. Please try again.");
      }
      setPaper(data as GeneratedPaper);
      setStage("test");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not generate your paper. Please try again.");
    }
  };

  const submitTest = useCallback(
    async (answers: PaperAnswers) => {
      if (!paper) return;
      setSubmitting(true);
      setError(null);
      try {
        const res = await fetch("/api/test-prep/grade", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            examSlug: exam.slug,
            candidate: {
              fullName: candidate.fullName.trim(),
              phone: candidate.phone,
              email: candidate.email.trim(),
            },
            answers: paper.questions.map((q) => ({
              questionId: q.id,
              selectedIndex: answers[q.id] ?? null,
            })),
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Could not submit your test. Please try again.");
        }
        setResult(data as TestResult);
        setStage("result");
        window.scrollTo({ top: 0 });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not submit your test. Please try again.");
      } finally {
        setSubmitting(false);
      }
    },
    [paper, exam.slug, candidate],
  );

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const validationError = validate(candidate);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/leads/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: candidate.fullName.trim(),
          phone: candidate.phone,
          email: candidate.email.trim(),
          countryTarget: exam.targetCountry,
          programTarget: `${exam.shortName} Online Test`,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Registration failed. Please try again.");
      }

      try {
        sessionStorage.setItem(
          `online-test:${exam.slug}:candidate`,
          JSON.stringify(candidate),
        );
      } catch {
        // Storage can be unavailable (private mode); the in-memory state is enough.
      }

      setSubmitting(false);
      await generatePaper();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed. Please try again.");
      setSubmitting(false);
    }
  };

  if (stage === "result" && result) {
    return (
      <OnlineTestResult
        examShortName={exam.shortName}
        candidateName={candidate.fullName}
        result={result}
      />
    );
  }

  if (stage === "test" && paper) {
    return (
      <OnlineTestPaper
        examShortName={exam.shortName}
        paper={paper}
        submitting={submitting}
        error={error}
        onSubmit={submitTest}
      />
    );
  }

  if (stage === "generating") {
    return (
      <div className="mx-auto max-w-xl rounded-3xl border border-[#D9CFB8]/80 bg-white p-8 text-center shadow-sm">
        {error ? (
          <>
            <p role="alert" className="text-sm font-semibold text-red-600">
              {error}
            </p>
            <button
              type="button"
              onClick={generatePaper}
              className="mt-4 min-h-[44px] rounded-xl bg-[#D89A3E] px-5 py-2 text-sm font-bold text-slate-950 inline-flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Try Again
            </button>
          </>
        ) : (
          <>
            <Loader2 className="mx-auto h-10 w-10 animate-spin text-[#D89A3E]" />
            <h1 className="mt-4 font-serif text-xl font-bold text-[#103B47]">
              Generating your {exam.shortName} paper…
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Thanks, {candidate.fullName.split(" ")[0]}. Your test will begin in a moment.
            </p>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl rounded-3xl border border-[#D9CFB8]/80 bg-white p-6 sm:p-8 shadow-sm">
      <span className="text-[11px] font-bold uppercase tracking-wider text-[#D89A3E]">
        Free Online Mock Test
      </span>
      <h1 className="mt-2 font-serif text-2xl font-bold text-[#103B47]">
        {exam.name} Online Test
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-slate-500">
        {exam.questionCount} questions · {exam.durationMinutes} minutes. Fill in
        your details to start. Your paper is generated as soon as you submit.
      </p>

      {exam.instructions && (
        <div className="mt-4 whitespace-pre-line rounded-2xl border border-[#D9CFB8]/70 bg-[#FDFCF7] p-4 text-xs leading-relaxed text-slate-600">
          {exam.instructions}
        </div>
      )}

      {exam.sections.length > 0 && (
        <ul className="mt-4 flex flex-wrap gap-2">
          {exam.sections.map((section) => (
            <li
              key={section}
              className="rounded-full border border-[#D9CFB8]/70 bg-[#FDFCF7] px-3 py-1 text-[11px] font-semibold text-slate-600"
            >
              {section}
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
        <div>
          <label htmlFor="ot-name" className="text-xs font-bold text-slate-700">
            Full Name
          </label>
          <div className="relative mt-1">
            <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              id="ot-name"
              type="text"
              autoComplete="name"
              required
              value={candidate.fullName}
              onChange={(e) => setCandidate({ ...candidate, fullName: e.target.value })}
              placeholder="e.g. Priya Sharma"
              className="w-full min-h-[44px] rounded-xl border border-[#D9CFB8] bg-[#FDFCF7] py-2.5 pl-10 pr-3 text-sm text-slate-900 outline-none focus:border-[#D89A3E] focus:ring-2 focus:ring-[#D89A3E]/20"
            />
          </div>
        </div>

        <div>
          <label htmlFor="ot-phone" className="text-xs font-bold text-slate-700">
            Mobile Number
          </label>
          <div className="relative mt-1">
            <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              id="ot-phone"
              type="tel"
              inputMode="numeric"
              autoComplete="tel-national"
              required
              maxLength={10}
              value={candidate.phone}
              onChange={(e) =>
                setCandidate({ ...candidate, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })
              }
              placeholder="10-digit mobile number"
              className="w-full min-h-[44px] rounded-xl border border-[#D9CFB8] bg-[#FDFCF7] py-2.5 pl-10 pr-3 text-sm text-slate-900 outline-none focus:border-[#D89A3E] focus:ring-2 focus:ring-[#D89A3E]/20"
            />
          </div>
        </div>

        <div>
          <label htmlFor="ot-email" className="text-xs font-bold text-slate-700">
            Email ID
          </label>
          <div className="relative mt-1">
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              id="ot-email"
              type="email"
              autoComplete="email"
              required
              value={candidate.email}
              onChange={(e) => setCandidate({ ...candidate, email: e.target.value })}
              placeholder="you@example.com"
              className="w-full min-h-[44px] rounded-xl border border-[#D9CFB8] bg-[#FDFCF7] py-2.5 pl-10 pr-3 text-sm text-slate-900 outline-none focus:border-[#D89A3E] focus:ring-2 focus:ring-[#D89A3E]/20"
            />
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            We&apos;ll email your test results to this address.
          </p>
        </div>

        {error && (
          <p role="alert" className="rounded-xl bg-red-50 px-3 py-2 text-xs font-semibold text-red-600">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full min-h-[44px] rounded-xl bg-[#D89A3E] py-3 text-sm font-bold text-slate-950 shadow-md hover:bg-[#c4872f] transition flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed disabled:opacity-70"
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Submitting…</span>
            </>
          ) : (
            <>
              <span>Start My {exam.shortName} Test</span>
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>

        <div className="flex items-center gap-2 text-[11px] text-slate-400">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
          <span>Your details are kept private and DPDP Act 2023 compliant.</span>
        </div>
      </form>
    </div>
  );
}
