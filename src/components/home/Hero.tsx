import { Sparkles, ArrowRight } from "lucide-react";
import { HeroSearchForm } from "./HeroSearchForm";
import {
  fetchSiteStats,
  fetchPreviewUniversities,
  tuitionRangeLabel,
} from "@/lib/siteStats";
import { fetchLiveDeadlines } from "@/lib/supabase/dataFetchers";
import { formatDateOnly } from "@/lib/deadlines";
import { NotProvided } from "@/components/tools/NotProvided";
import {
  LeadTriggerButton,
  AICounsellorTriggerButton,
} from "@/components/home/HomeClientContext";

export async function Hero() {
  const [stats, previewUnis, deadlines] = await Promise.all([
    fetchSiteStats(),
    fetchPreviewUniversities(),
    fetchLiveDeadlines(),
  ]);
  const tuitionRange = tuitionRangeLabel(stats);
  const today = new Date().toISOString().slice(0, 10);
  const nextDeadline = deadlines.find(
    (d) => d.deadlineType === "application" && d.deadlineDate >= today,
  );
  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-[#103B47] via-[#154654] to-[#1D5A6C] text-white py-16 sm:py-24">
      {/* Ambient Saffron & Peacock Glows */}
      <div className="pointer-events-none absolute -top-32 left-1/2 -z-0 h-[450px] w-[800px] -translate-x-1/2 rounded-full bg-gradient-to-tr from-[#D89A3E]/20 via-[#7C6BAE]/15 to-transparent hidden sm:block blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#D89A3E]/40 to-transparent" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
          {/* Left Column - Copy, Search, CTAs */}
          <div className="lg:col-span-7">
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 backdrop-blur-md shadow-inner">
              <span className="flex h-2 w-2 rounded-full bg-[#D89A3E] animate-pulse"></span>
              <span className="text-xs font-semibold tracking-wide text-[#FDFCF7]">
                The clearest route for every ambition
              </span>
            </div>

            {/* Main H1 - Fraunces Display */}
            <h1 className="mt-6 font-display text-4xl font-semibold tracking-tight text-[#FDFCF7] sm:text-5xl lg:text-6xl leading-[1.1]">
              The Clearest Route to{" "}
              <span className="text-[#D89A3E] italic font-serif">
                Your Degree Abroad.
              </span>
            </h1>

            <p className="mt-5 text-base leading-relaxed text-[#FDFCF7]/85 sm:text-lg max-w-xl font-sans">
              The authoritative discovery and admissions engine for Indian
              students. Not a consultancy, not a lead-gen funnel. Compare
              tuition in ₹ Lakhs, visa reality, and 5-year ROI before the
              counsellor calls.
            </p>

            {/* Searchbar Client Component */}
            <HeroSearchForm />

            {/* Twin CTAs */}
            <div className="mt-8 flex flex-wrap items-center gap-3.5">
              <LeadTriggerButton className="inline-flex items-center gap-2 rounded-full bg-[#D89A3E] px-6 py-3 text-xs font-bold text-[#103B47] shadow-lg transition hover:bg-[#EBC783] hover:scale-102">
                Get Free Counselling
                <ArrowRight className="h-3.5 w-3.5 text-[#103B47]" />
              </LeadTriggerButton>

              <AICounsellorTriggerButton className="inline-flex items-center gap-2 rounded-full border border-[#D89A3E] bg-[#D89A3E]/10 px-5 py-2.5 text-xs font-bold text-[#FDFCF7] backdrop-blur-sm transition hover:bg-[#D89A3E]/20">
                <Sparkles className="h-4 w-4 text-[#D89A3E]" />
                Talk to ✦ Route AI
              </AICounsellorTriggerButton>
            </div>

            {/* Micro Stats per Brand Guidelines v5.1 */}
            <div className="mt-10 grid grid-cols-3 gap-4 border-t border-white/10 pt-6 max-w-lg">
              <div>
                <p className="font-mono text-2xl font-bold text-white">
                  {stats.countries || <NotProvided />}
                </p>
                <p className="text-[11px] font-medium text-slate-300">
                  Global Destinations
                </p>
              </div>
              <div>
                <p className="font-mono text-2xl font-bold text-[#D89A3E]">
                  {stats.universities || <NotProvided />}
                </p>
                <p className="text-[11px] font-medium text-slate-300">
                  Universities
                </p>
              </div>
              <div>
                <p className="font-mono text-2xl font-bold text-[#A8CDBD]">
                  {tuitionRange ?? <NotProvided />}
                </p>
                <p className="text-[11px] font-medium text-slate-300">
                  Tuition / yr
                </p>
              </div>
            </div>
          </div>

          {/* Right Column - Live AI Chat Window */}
          <div className="lg:col-span-5">
            <div className="rounded-3xl border border-white/20 bg-white/10 p-6 shadow-2xl backdrop-blur-xl">
              {/* Chat Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-3.5">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#D89A3E] text-[#103B47] font-bold shadow-sm">
                    ✦
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white">
                      ✦ Route AI Counsellor
                    </h3>
                    <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>{" "}
                      Online & Streaming
                    </span>
                  </div>
                </div>
                <span className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-bold text-[#EBC783] flex items-center gap-1">
                  Route AI v5.1
                </span>
              </div>

              {/* Chat Dialogue Mockup per Section 16 Application */}
              <div className="mt-4 space-y-3 text-xs font-sans">
                {/* User Bubble */}
                <div className="flex justify-end">
                  <div className="max-w-[88%] rounded-2xl rounded-tr-none bg-[#1D5A6C] border border-[#A8CDBD]/30 px-3.5 py-2 text-white font-medium shadow-sm">
                    Which universities should I shortlist?
                  </div>
                </div>

                {/* AI Bubble 1 */}
                <div className="flex justify-start">
                  <div className="max-w-[95%] rounded-2xl rounded-tl-none bg-[#0D2F39]/90 border border-[#1D5A6C]/50 p-3.5 text-[#FDFCF7]">
                    {previewUnis.length > 0 ? (
                      <>
                        <p className="font-semibold text-[#EBC783] mb-1.5">
                          Top-ranked options to start with:
                        </p>
                        <ul className="space-y-1 font-mono text-[11px] text-slate-200">
                          {previewUnis.map((u) => (
                            <li key={u.id}>
                              • <strong>{u.name}</strong> ·{" "}
                              {u.tuitionFeeRangeINR}
                              {u.postStudyWorkMonths !== null &&
                                ` (${u.postStudyWorkMonths}mo PSW)`}
                            </li>
                          ))}
                        </ul>
                      </>
                    ) : (
                      <p className="text-[11px] text-slate-300">
                        Tell me your course, budget and destination and
                        I&apos;ll build your shortlist.
                      </p>
                    )}
                    <p className="mt-2 text-[11px] text-slate-300 italic">
                      Which one should I open first?
                    </p>
                  </div>
                </div>

                {/* Next real application deadline from the tracker */}
                {nextDeadline && (
                  <div className="flex justify-start pl-2">
                    <span className="rounded-full bg-[#D89A3E]/20 border border-[#D89A3E]/50 px-3 py-1 text-[11px] font-bold text-[#EBC783]">
                      ✦ Next deadline:{" "}
                      {nextDeadline.universityName ??
                        nextDeadline.countryName ??
                        nextDeadline.countryId}{" "}
                      · {nextDeadline.intakeTerm} {nextDeadline.intakeYear}{" "}
                      {nextDeadline.isRolling
                        ? "(rolling)"
                        : `closes ${formatDateOnly(nextDeadline.deadlineDate)}`}
                    </span>
                  </div>
                )}
              </div>

              {/* Trust Pills under chat */}
              <div className="mt-4 flex flex-wrap gap-2 text-[11px] font-medium text-slate-300">
                <span className="rounded-full bg-white/10 px-2.5 py-1">
                  24/7 guidance
                </span>
                <span className="rounded-full bg-white/10 px-2.5 py-1">
                  Context-aware
                </span>
                <span className="rounded-full bg-white/10 px-2.5 py-1">
                  DPDP 2023 Compliant
                </span>
              </div>

              {/* Trigger Input Bar */}
              <AICounsellorTriggerButton className="mt-5 flex w-full items-center justify-between rounded-xl border border-white/25 bg-white/10 px-4 py-3 text-left text-xs text-slate-200 hover:bg-white/15 transition group">
                <span className="text-slate-300 group-hover:text-white flex items-center gap-1.5">
                  Ask ✦ Route AI any question...
                </span>
                <ArrowRight className="h-4 w-4 text-[#D89A3E] group-hover:translate-x-0.5 transition" />
              </AICounsellorTriggerButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
