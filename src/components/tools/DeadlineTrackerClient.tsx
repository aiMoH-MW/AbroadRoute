"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Calendar,
  Clock,
  Bell,
  CheckCircle2,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { useHomeModals } from "@/components/home/HomeClientContext";
import {
  ApplicationDeadline,
  Country,
  DeadlineMilestone,
  Program,
} from "@/types";
import {
  fetchLiveCountries,
  fetchLiveDeadlines,
  fetchLiveMilestones,
  fetchLivePrograms,
} from "@/lib/supabase/dataFetchers";
import {
  DEADLINE_TYPES,
  daysUntil,
  deadlineTypeLabel,
  formatDateOnly,
  milestoneOffsetLabel,
  milestonesFor,
  shiftDateOnly,
} from "@/lib/deadlines";

// Deadlines come only from application_deadlines and the countdown steps only
// from deadline_milestones; each step is dated back from the selected deadline.

const NOT_SET = "Not added yet";

const deadlineTitle = (d: ApplicationDeadline) =>
  d.universityName ?? `All universities in ${d.countryName ?? d.countryId}`;

const daysLeftLabel = (days: number) =>
  days === 0 ? "Closes today" : days === 1 ? "1 day left" : `${days} days left`;

export function DeadlineTrackerClient() {
  const homeModals = useHomeModals();
  // null while loading
  const [deadlines, setDeadlines] = useState<ApplicationDeadline[] | null>(
    null,
  );
  const [countries, setCountries] = useState<Country[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [milestones, setMilestones] = useState<DeadlineMilestone[]>([]);
  const [countryFilter, setCountryFilter] = useState("");
  const [programFilter, setProgramFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [reminderEmail, setReminderEmail] = useState("");
  const [reminderPhone, setReminderPhone] = useState("");
  const [reminderScheduled, setReminderScheduled] = useState(false);

  useEffect(() => {
    fetchLiveDeadlines().then(setDeadlines);
    fetchLiveCountries().then(setCountries);
    fetchLivePrograms().then(setPrograms);
    fetchLiveMilestones().then(setMilestones);
  }, []);

  // Open deadlines matching the filters, soonest first. A deadline with no
  // program applies to every program.
  const openDeadlines = useMemo(
    () =>
      (deadlines ?? []).filter(
        (d) =>
          daysUntil(d.deadlineDate) >= 0 &&
          (!countryFilter || d.countryId === countryFilter) &&
          (!programFilter || !d.programId || d.programId === programFilter) &&
          (!typeFilter || d.deadlineType === typeFilter),
      ),
    [deadlines, countryFilter, programFilter, typeFilter],
  );
  // Only countries and programs that have deadlines
  const countryOptions = countries.filter((c) =>
    (deadlines ?? []).some((d) => d.countryId === c.id),
  );
  const programOptions = programs.filter((p) =>
    (deadlines ?? []).some((d) => d.programId === p.id),
  );

  const active =
    openDeadlines.find((d) => d.id === selectedId) ?? openDeadlines[0];
  const activeLabel = active
    ? `${deadlineTitle(active)} – ${active.intakeTerm} ${active.intakeYear}${active.roundName ? ` (${active.roundName})` : ""}`
    : "";
  const activeMilestones = active ? milestonesFor(milestones, active) : [];

  const handleScheduleReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (active && (reminderEmail || reminderPhone)) {
      setReminderScheduled(true);
      // Trigger context-aware lead tracking
      homeModals.openLeadModal(
        `Deadline Tracker Alert: ${activeLabel} (Deadline: ${active.deadlineDate})`,
      );
    }
  };

  const filterClass =
    "min-h-[44px] w-full min-w-0 rounded-xl border border-[#D9CFB8] bg-[#FDFCF7] px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-[#1A1A1A] focus:border-[#1D5A6C] focus:outline-none cursor-pointer";

  return (
    <div className="min-h-screen bg-[#FDFCF7] pb-20 pt-8 sm:pt-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header Breadcrumb & Hero */}
        <div className="mb-8 text-center sm:text-left">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#D9CFB8] bg-[#F5EFE0] px-3.5 py-1 text-xs font-semibold text-[#1D5A6C]">
            <Clock className="h-3.5 w-3.5 text-[#D89A3E]" />
            <span>Intake Milestones & Reminders</span>
          </div>
          <h1 className="font-serif text-3xl font-black text-[#103B47] sm:text-4xl lg:text-5xl">
            Study Abroad Intake Deadline Tracker
          </h1>
          <p className="mt-3 max-w-3xl text-xs sm:text-sm md:text-base leading-relaxed text-[#6B6B6B]">
            Track application, scholarship and document deadlines by country,
            university and program, with a countdown plan for each one.
          </p>
        </div>

        {/* Filters + Deadline Selector */}
        <div className="mb-8 rounded-2xl border border-[#D9CFB8] bg-white p-6 sm:p-8 shadow-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5 [&>*]:min-w-0">
            <select
              aria-label="Country"
              value={countryFilter}
              onChange={(e) => setCountryFilter(e.target.value)}
              className={filterClass}
            >
              <option value="">All countries</option>
              {countryOptions.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <select
              aria-label="Program"
              value={programFilter}
              onChange={(e) => setProgramFilter(e.target.value)}
              className={filterClass}
            >
              <option value="">All programs</option>
              {programOptions.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <select
              aria-label="Deadline type"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className={filterClass}
            >
              <option value="">All deadline types</option>
              {DEADLINE_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#103B47] mb-3">
            Select Target Deadline
          </label>
          {deadlines === null ? (
            <div className="flex items-center justify-center gap-2 py-10 text-xs text-[#6B6B6B]">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading deadlines…
            </div>
          ) : openDeadlines.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[#D9CFB8] bg-[#FDFCF7] py-10 text-center text-xs sm:text-sm font-mono text-[#6B6B6B]">
              {deadlines.length === 0
                ? "Deadlines not added yet"
                : "No upcoming deadlines match these filters"}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {openDeadlines.map((d) => {
                const isSelected = d.id === active?.id;
                const days = daysUntil(d.deadlineDate);
                return (
                  <button
                    key={d.id}
                    onClick={() => {
                      setSelectedId(d.id);
                      setReminderScheduled(false);
                    }}
                    className={`min-h-[44px] min-w-0 p-4 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? "border-[#D89A3E] bg-[#F5EFE0] shadow-xs ring-1 ring-[#D89A3E]"
                        : "border-[#D9CFB8] bg-[#FDFCF7] hover:bg-[#F5EFE0]/50"
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate text-[10px] font-mono font-semibold uppercase tracking-wider text-[#6B6B6B]">
                          {d.countryName ?? d.countryId} • {d.intakeTerm}{" "}
                          {d.intakeYear}
                        </span>
                        <span className="shrink-0 rounded-md bg-white border border-[#D9CFB8] px-1.5 py-0.5 text-[10px] font-mono font-semibold text-[#1D5A6C]">
                          {deadlineTypeLabel(d.deadlineType)}
                        </span>
                      </div>
                      <h3 className="text-xs sm:text-sm font-bold text-[#103B47] mt-1 leading-snug">
                        {deadlineTitle(d)}
                      </h3>
                      <p className="text-[11px] text-[#6B6B6B] mt-0.5">
                        {d.programName ?? "All programs"}
                        {d.roundName ? ` · ${d.roundName}` : ""}
                        {d.isRolling ? " · Rolling" : ""}
                      </p>
                    </div>
                    <div className="mt-3 pt-2 border-t border-[#D9CFB8]/60 flex items-center justify-between gap-2 text-xs font-mono">
                      <span className="font-bold text-[#1D5A6C]">
                        {formatDateOnly(d.deadlineDate)}
                      </span>
                      <span
                        className={
                          days <= 30
                            ? "font-bold text-[#B5452F]"
                            : "text-[#6B6B6B]"
                        }
                      >
                        {daysLeftLabel(days)}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* 2-Column: Timeline Milestones + Reminder Form */}
        {active && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left: 90-60-30-15-7-1 Day Timeline Milestones */}
            <div className="lg:col-span-8 min-w-0 rounded-2xl border border-[#D9CFB8] bg-white p-6 sm:p-8 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-4">
                <div className="min-w-0">
                  <h2 className="text-lg font-serif font-bold text-[#103B47]">
                    Application Milestones Countdown Schedule
                  </h2>
                  <p className="text-xs text-[#6B6B6B] mt-0.5">
                    Critical checkpoints for {activeLabel}
                  </p>
                </div>
                <span className="rounded-full bg-[#F5EFE0] border border-[#D9CFB8] px-3.5 py-1 text-xs font-mono font-bold text-[#103B47] self-start shrink-0">
                  Deadline: {formatDateOnly(active.deadlineDate)}
                </span>
              </div>

              {/* Deadline details */}
              <dl className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                {[
                  {
                    label: "Applications Open",
                    value: active.applicationsOpenDate
                      ? formatDateOnly(active.applicationsOpenDate)
                      : null,
                  },
                  {
                    label: "Classes Start",
                    value: active.intakeStartDate
                      ? formatDateOnly(active.intakeStartDate)
                      : null,
                  },
                  {
                    label: "Program",
                    value: active.programName ?? "All programs",
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-xl border border-[#D9CFB8]/70 bg-[#FDFCF7] p-3"
                  >
                    <dt className="text-[10px] font-mono font-semibold uppercase tracking-wider text-[#6B6B6B]">
                      {item.label}
                    </dt>
                    <dd
                      className={`mt-0.5 ${item.value ? "font-bold text-[#103B47]" : "font-mono text-[#6B6B6B]"}`}
                    >
                      {item.value ?? NOT_SET}
                    </dd>
                  </div>
                ))}
              </dl>
              {(active.notes || active.sourceUrl || active.isRolling) && (
                <div className="mb-6 rounded-xl border border-[#D9CFB8]/70 bg-[#F5EFE0]/50 p-3 text-xs text-[#103B47] space-y-1">
                  {active.isRolling && (
                    <p>
                      Rolling admission: applications are reviewed as they
                      arrive, so seats can fill before this date.
                    </p>
                  )}
                  {active.notes && <p>{active.notes}</p>}
                  {active.sourceUrl && (
                    <a
                      href={active.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 font-semibold text-[#1D5A6C] hover:underline"
                    >
                      Official source <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              )}

              {activeMilestones.length === 0 ? (
                <div className="rounded-xl border border-dashed border-[#D9CFB8] bg-[#FDFCF7] py-8 text-center text-xs font-mono text-[#6B6B6B]">
                  Milestones not added yet
                </div>
              ) : (
                <div className="space-y-6 relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#D9CFB8]">
                  {activeMilestones.map((m, idx) => {
                    const date = shiftDateOnly(
                      active.deadlineDate,
                      -m.daysBefore,
                    );
                    const passed = daysUntil(date) < 0;
                    return (
                      <div key={m.id} className="relative pl-10">
                        <div
                          className={`absolute left-2 top-0 -translate-x-1/2 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-mono font-bold shadow-xs ${
                            passed
                              ? "bg-[#D9CFB8] text-[#103B47]"
                              : "bg-[#103B47] text-[#FDFCF7]"
                          }`}
                        >
                          {passed ? (
                            <CheckCircle2 className="h-3 w-3" />
                          ) : (
                            idx + 1
                          )}
                        </div>
                        <div
                          className={`rounded-xl border border-[#D9CFB8]/70 bg-[#FDFCF7] p-4 hover:bg-[#F5EFE0]/40 transition ${passed ? "opacity-60" : ""}`}
                        >
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <h4 className="text-xs sm:text-sm font-bold text-[#103B47]">
                              {milestoneOffsetLabel(m.daysBefore)}: {m.title}
                            </h4>
                            <span className="inline-flex items-center gap-1 rounded-md bg-[#F5EFE0] border border-[#D9CFB8] px-2 py-0.5 text-[10px] font-mono font-semibold text-[#1D5A6C]">
                              <Calendar className="h-3 w-3" />
                              {formatDateOnly(date)}
                              {passed ? " · passed" : ""}
                            </span>
                          </div>
                          {m.description && (
                            <p className="text-xs sm:text-[13px] text-[#6B6B6B] mt-1.5 leading-relaxed">
                              {m.description}
                            </p>
                          )}
                          {m.actionLabel && (
                            <span className="mt-2 inline-block text-[10px] font-mono font-semibold uppercase tracking-wider text-[#1D5A6C]">
                              {m.actionLabel}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right: Reminder Subscription Box */}
            <div className="lg:col-span-4 rounded-2xl border border-[#1D5A6C] bg-gradient-to-br from-[#103B47] via-[#103B47] to-[#0B2830] p-6 sm:p-8 text-[#FDFCF7] shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-[#EBC783] mb-4">
                  <Bell className="h-5 w-5 text-[#D89A3E]" />
                </div>
                <h3 className="text-base font-serif font-bold text-white">
                  Set Automated Deadline Reminders
                </h3>
                <p className="text-xs text-[#A8CDBD] mt-1.5 leading-relaxed">
                  Receive proactive alert notifications via WhatsApp and Email
                  at 90, 60, 30, 15, 7, and 1 days before {activeLabel} closes.
                </p>

                {reminderScheduled ? (
                  <div className="mt-6 rounded-xl bg-[#A8CDBD]/20 p-4 border border-[#A8CDBD]/40 text-[#FDFCF7] text-xs">
                    <div className="flex items-center gap-2 font-bold text-[#EBC783]">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-[#EBC783]" />
                      <span>Reminder Alerts Active!</span>
                    </div>
                    <p className="mt-1 text-[11px] text-[#A8CDBD]">
                      You are subscribed to timeline updates for {activeLabel}.
                      We will notify you before each critical milestone.
                    </p>
                  </div>
                ) : (
                  <form
                    onSubmit={handleScheduleReminder}
                    className="mt-6 space-y-3.5"
                  >
                    <div>
                      <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-[#A8CDBD] mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        required
                        value={reminderEmail}
                        onChange={(e) => setReminderEmail(e.target.value)}
                        placeholder="student@gmail.com"
                        className="min-h-[44px] w-full rounded-xl border border-[#1D5A6C] bg-[#0B2830]/80 px-3.5 py-2.5 text-xs text-white placeholder-[#A8CDBD]/60 focus:border-[#D89A3E] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-[#A8CDBD] mb-1">
                        WhatsApp Mobile Number
                      </label>
                      <input
                        type="tel"
                        value={reminderPhone}
                        onChange={(e) => setReminderPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="min-h-[44px] w-full rounded-xl border border-[#1D5A6C] bg-[#0B2830]/80 px-3.5 py-2.5 text-xs text-white placeholder-[#A8CDBD]/60 focus:border-[#D89A3E] focus:outline-none"
                      />
                    </div>

                    <button
                      type="submit"
                      className="min-h-[44px] w-full flex items-center justify-center gap-2 rounded-xl bg-[#D89A3E] py-3 text-xs sm:text-sm font-bold text-[#103B47] shadow-lg transition hover:bg-[#c4872d] active:scale-98 cursor-pointer mt-2"
                    >
                      <Bell className="h-4 w-4" />
                      <span>Activate 6-Stage Deadline Alerts →</span>
                    </button>
                  </form>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-[#1D5A6C]/60 text-center">
                <button
                  onClick={() =>
                    homeModals.openLeadModal(
                      `Application Guidance: ${activeLabel}`,
                    )
                  }
                  className="text-xs font-bold text-[#EBC783] hover:underline"
                >
                  Need human admissions help? Book 1-on-1 counselor call
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
