"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Clock, Loader2, Send } from "lucide-react";
import type { GeneratedPaper } from "@/lib/testPrep/types";

export type PaperAnswers = Record<string, number>;

interface Props {
  examShortName: string;
  paper: GeneratedPaper;
  submitting: boolean;
  error: string | null;
  onSubmit: (answers: PaperAnswers) => void;
}

function formatTime(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function OnlineTestPaper({ examShortName, paper, submitting, error, onSubmit }: Props) {
  const [answers, setAnswers] = useState<PaperAnswers>({});
  const [current, setCurrent] = useState(0);
  const [endsAt] = useState(() => Date.now() + paper.durationMinutes * 60_000);
  const [secondsLeft, setSecondsLeft] = useState(paper.durationMinutes * 60);
  const submittedRef = useRef(false);
  const answersRef = useRef(answers);
  answersRef.current = answers;

  const submit = useCallback(() => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    onSubmit(answersRef.current);
  }, [onSubmit]);

  // Let the student retry if the grading request failed.
  useEffect(() => {
    if (error) submittedRef.current = false;
  }, [error]);

  useEffect(() => {
    const timer = setInterval(() => {
      const left = Math.max(0, Math.round((endsAt - Date.now()) / 1000));
      setSecondsLeft(left);
      if (left === 0) {
        clearInterval(timer);
        submit();
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [endsAt, submit]);

  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => {
      if (!submittedRef.current) e.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, []);

  const question = paper.questions[current];
  const total = paper.questions.length;
  const answeredCount = Object.keys(answers).length;
  const isLast = current === total - 1;
  const lowTime = secondsLeft <= 60;

  const handleFinish = () => {
    const unanswered = total - answeredCount;
    if (
      unanswered > 0 &&
      !window.confirm(`You have ${unanswered} unanswered question${unanswered > 1 ? "s" : ""}. Submit anyway?`)
    ) {
      return;
    }
    submit();
  };

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div className="sticky top-0 z-10 flex items-center justify-between rounded-2xl border border-[#D9CFB8]/80 bg-white px-4 py-3 shadow-sm">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#D89A3E]">
            {examShortName} Mock Test
          </p>
          <p className="text-xs font-semibold text-slate-500">
            {answeredCount} of {total} answered
          </p>
        </div>
        <div
          className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm font-bold tabular-nums ${
            lowTime ? "bg-red-50 text-red-600" : "bg-[#103B47]/5 text-[#103B47]"
          }`}
          aria-live={lowTime ? "polite" : "off"}
        >
          <Clock className="h-4 w-4" />
          {formatTime(secondsLeft)}
        </div>
      </div>

      <div className="rounded-3xl border border-[#D9CFB8]/80 bg-white p-6 sm:p-8 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs font-bold text-slate-400">
            Question {current + 1} / {total}
          </span>
          <span className="rounded-full bg-[#FDFCF7] border border-[#D9CFB8]/70 px-3 py-1 text-[11px] font-semibold text-slate-600">
            {question.section}
          </span>
        </div>

        {question.passage && (
          <blockquote className="mt-4 rounded-2xl border-l-4 border-[#D89A3E] bg-[#FDFCF7] p-4 text-sm leading-relaxed text-slate-700">
            {question.passage}
          </blockquote>
        )}

        <h2 className="mt-4 whitespace-pre-line text-base font-bold text-slate-900">
          {question.prompt}
        </h2>

        <fieldset className="mt-4 space-y-2">
          <legend className="sr-only">Answer options</legend>
          {question.options.map((option, idx) => {
            const selected = answers[question.id] === idx;
            return (
              <label
                key={idx}
                className={`flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-3 text-sm transition ${
                  selected
                    ? "border-[#D89A3E] bg-[#D89A3E]/10 text-slate-900"
                    : "border-[#D9CFB8] bg-white text-slate-700 hover:bg-[#FDFCF7]"
                }`}
              >
                <input
                  type="radio"
                  name={question.id}
                  checked={selected}
                  onChange={() => setAnswers({ ...answers, [question.id]: idx })}
                  className="mt-0.5 accent-[#D89A3E]"
                />
                <span>{option}</span>
              </label>
            );
          })}
        </fieldset>

        {error && (
          <p role="alert" className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-xs font-semibold text-red-600">
            {error}
          </p>
        )}

        <div className="mt-6 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setCurrent(current - 1)}
            disabled={current === 0 || submitting}
            className="min-h-[44px] rounded-xl border border-[#D9CFB8] bg-[#FDFCF7] px-4 py-2 text-sm font-bold text-[#103B47] inline-flex items-center gap-2 disabled:opacity-40"
          >
            <ArrowLeft className="h-4 w-4" />
            Previous
          </button>

          {isLast ? (
            <button
              type="button"
              onClick={handleFinish}
              disabled={submitting}
              className="min-h-[44px] rounded-xl bg-[#D89A3E] px-5 py-2 text-sm font-bold text-slate-950 shadow-md hover:bg-[#c4872f] inline-flex items-center gap-2 disabled:opacity-70"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              {submitting ? "Submitting…" : "Submit Test"}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setCurrent(current + 1)}
              disabled={submitting}
              className="min-h-[44px] rounded-xl bg-[#103B47] px-5 py-2 text-sm font-bold text-white hover:bg-[#0c2e38] inline-flex items-center gap-2"
            >
              Next
              <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <nav aria-label="Question navigator" className="flex flex-wrap gap-2">
        {paper.questions.map((q, idx) => (
          <button
            key={q.id}
            type="button"
            onClick={() => setCurrent(idx)}
            aria-current={idx === current ? "step" : undefined}
            className={`h-9 w-9 rounded-lg text-xs font-bold transition ${
              idx === current
                ? "bg-[#103B47] text-white"
                : answers[q.id] !== undefined
                  ? "bg-[#D89A3E]/20 text-[#103B47]"
                  : "border border-[#D9CFB8] bg-white text-slate-500"
            }`}
          >
            {idx + 1}
          </button>
        ))}
      </nav>
    </div>
  );
}
