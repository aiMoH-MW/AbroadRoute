import { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { HorizonMark, PeacockEye } from "@/components/ui/BrandSignatures";
import {
  ShieldCheck,
  Award,
  Globe2,
  CheckCircle2,
  Compass,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { fetchSiteStats, withCount } from "@/lib/siteStats";
import { fetchSiteSettings } from "@/lib/siteContent";


export const metadata: Metadata = {
  title: "About Us · Brand Essence & Mandate | Abroadroute",
  description:
    "The clearest route for every ambition. Abroadroute is the authoritative discovery and admissions engine for Indian students pursuing degrees abroad.",
};

export default async function AboutPage() {
  const [stats, settings] = await Promise.all([
    fetchSiteStats(),
    fetchSiteSettings(),
  ]);
  return (
    <div className="min-h-screen bg-[#FDFCF7] flex flex-col justify-between selection:bg-[#D89A3E]/20 text-[#1A1A1A]">
      <Header />
      <main className="flex-1">
        {/* Editorial Hero */}
        <section className="bg-gradient-to-b from-[#103B47] via-[#154654] to-[#1D5A6C] text-white py-20 sm:py-28 relative overflow-hidden">
          <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-96 w-[700px] rounded-full bg-[#D89A3E]/15 blur-3xl" />
          <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8 relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#D89A3E]/40 bg-[#D89A3E]/15 px-4 py-1.5 text-xs font-bold text-[#EBC783]">
              <span>Brand Essence</span>
            </div>
            <h1 className="mt-6 font-display text-4xl font-semibold sm:text-5xl lg:text-6xl text-[#FDFCF7] leading-[1.15]">
              The clearest route for <br />
              <span className="italic font-serif text-[#D89A3E]">
                every ambition.
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-base text-[#FDFCF7]/85 sm:text-lg leading-relaxed font-sans">
              Abroadroute is the authoritative discovery and admissions engine
              for Indian students pursuing degrees abroad. Not a consultancy,
              not a lead-gen funnel. A trusted place to see every route abroad
              clearly, compare honestly, and decide well.
            </p>
          </div>
        </section>

        {/* Brand Narrative & Pune Student Rationale */}
        <section className="py-16 sm:py-24">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-16">
            {/* The Rationale Card */}
            <div className="rounded-3xl border border-[#D9CFB8] bg-[#F5EFE0] p-8 sm:p-12 shadow-sm">
              <div className="flex items-center gap-3 text-xs font-mono font-bold uppercase tracking-widest text-[#1D5A6C]">
                <PeacockEye size={16} />
                <span>The Abroadroute Promise</span>
              </div>

              <blockquote className="mt-6 font-display text-2xl sm:text-3xl text-[#103B47] leading-snug">
                “A student in Pune weighing MBBS in Georgia against MS in Berlin
                should be able to see every route ahead clearly: tuition in
                rupees, visa reality, ROI over five years, family safety, career
                pathway.”
              </blockquote>

              <p className="mt-6 text-sm sm:text-base text-slate-700 leading-relaxed font-sans">
                Abroadroute exists so those routes come into focus{" "}
                <strong>before the counsellor calls</strong>. The word{" "}
                <em>route</em> carries the promise in a single syllable: a path,
                a direction, a way through. The identity system, colour palette,
                typography, voice, and product design all serve that clarity of
                direction.
              </p>

              <HorizonMark className="my-8" />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold text-[#103B47]">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#1D5A6C]" />
                  <span>Tuition Clarity in ₹ Lakhs</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#1D5A6C]" />
                  <span>5-Year Realistic ROI Timelines</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#1D5A6C]" />
                  <span>Official Post-Study Work Visas</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#1D5A6C]" />
                  <span>NMC & WHO Verified Medical Catalog</span>
                </div>
              </div>
            </div>

            {/* 3 Pillars of Authority */}
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
              <div className="rounded-2xl border border-[#D9CFB8] bg-white p-6 shadow-xs">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#103B47]/10 text-[#103B47]">
                  <Globe2 className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-display text-lg font-bold text-[#103B47]">
                  {withCount(stats.countries, "Global Destinations")}
                </h3>
                <p className="mt-2 text-xs text-slate-600 leading-relaxed font-sans">
                  Comprehensive, verified admissions intelligence spanning the
                  Anchor Six destinations through accredited European and Asian
                  hubs.
                </p>
              </div>

              <div className="rounded-2xl border border-[#D9CFB8] bg-white p-6 shadow-xs">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#D89A3E]/15 text-[#D89A3E]">
                  <ShieldCheck className="h-5 w-5 text-[#103B47]" />
                </div>
                <h3 className="mt-4 font-display text-lg font-bold text-[#103B47]">
                  Zero Sales Distortion
                </h3>
                <p className="mt-2 text-xs text-slate-600 leading-relaxed font-sans">
                  Rankings based on QS/THE scores, actual living expenses, and
                  verified post-study work rights — never commercial commission
                  tiers.
                </p>
              </div>

              <div className="rounded-2xl border border-[#D9CFB8] bg-white p-6 shadow-xs">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#1D5A6C]/10 text-[#1D5A6C]">
                  <Award className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-display text-lg font-bold text-[#103B47]">
                  ✦ Route AI Intelligence
                </h3>
                <p className="mt-2 text-xs text-slate-600 leading-relaxed font-sans">
                  Trained on verified visa circulars, NMC licensing regulations,
                  and official university cutoffs to give student-first
                  guidance.
                </p>
              </div>
            </div>

            {/* 02 · Audiences: Four Audiences, One Honest Voice */}
            <div className="space-y-8">
              <div className="text-center max-w-2xl mx-auto">
                <div className="inline-flex items-center gap-2 rounded-full border border-[#D89A3E]/40 bg-[#D89A3E]/10 px-3.5 py-1 text-xs font-bold text-[#103B47]">
                  <span>Audiences</span>
                </div>
                <h2 className="mt-3 font-display text-3xl font-bold text-[#103B47]">
                  Four Audiences, One Honest Voice
                </h2>
                <p className="mt-2 text-xs sm:text-sm text-slate-600 font-sans">
                  Abroadroute serves four distinct stakeholders. Every page,
                  every product decision, and every tool lands credibly across
                  all of them without pandering to any.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Audience 1: Aspiring Students */}
                <div className="rounded-2xl border border-[#D9CFB8] bg-white p-7 shadow-xs hover:border-[#1D5A6C] transition">
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-[#1D5A6C]/10 px-3 py-1 text-[11px] font-bold text-[#1D5A6C] uppercase tracking-wider">
                      Primary · Ages 17 to 25
                    </span>
                    <span className="font-mono text-xs font-bold text-[#D89A3E]">
                      01
                    </span>
                  </div>
                  <h3 className="mt-4 font-display text-xl font-bold text-[#103B47]">
                    Aspiring Students
                  </h3>
                  <p className="mt-2 text-xs text-slate-600 leading-relaxed font-sans">
                    Class 12 pass-outs eyeing MBBS abroad, engineering graduates
                    targeting MS, and arts/commerce graduates exploring
                    master&apos;s degrees and EMBAs.
                  </p>
                  <div className="mt-4 pt-3 border-t border-[#D9CFB8]/50">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#103B47] block">
                      Cares About:
                    </span>
                    <p className="text-xs text-[#1D5A6C] font-semibold mt-0.5">
                      Honest ROI, real fees in ₹ Lakhs, campus life, visa
                      reality, career pathway after graduation.
                    </p>
                  </div>
                </div>

                {/* Audience 2: Parents & Families */}
                <div className="rounded-2xl border border-[#D9CFB8] bg-white p-7 shadow-xs hover:border-[#1D5A6C] transition">
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-[#D89A3E]/15 px-3 py-1 text-[11px] font-bold text-[#103B47] uppercase tracking-wider">
                      Decision Maker · Gatekeepers
                    </span>
                    <span className="font-mono text-xs font-bold text-[#D89A3E]">
                      02
                    </span>
                  </div>
                  <h3 className="mt-4 font-display text-xl font-bold text-[#103B47]">
                    Parents and Families
                  </h3>
                  <p className="mt-2 text-xs text-slate-600 leading-relaxed font-sans">
                    The primary financiers and emotional guardians. They
                    evaluate institutional safety, net education cost,
                    accreditation standards, and career safety nets.
                  </p>
                  <div className="mt-4 pt-3 border-t border-[#D9CFB8]/50">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#103B47] block">
                      Cares About:
                    </span>
                    <p className="text-xs text-[#1D5A6C] font-semibold mt-0.5">
                      NMC recognition, campus safety, education loan burden,
                      safe return-home and PR pathways.
                    </p>
                  </div>
                </div>

                {/* Audience 3: Counselors & Consultants */}
                <div className="rounded-2xl border border-[#D9CFB8] bg-white p-7 shadow-xs hover:border-[#1D5A6C] transition">
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-[#103B47]/10 px-3 py-1 text-[11px] font-bold text-[#103B47] uppercase tracking-wider">
                      Partner · B2B Ecosystem
                    </span>
                    <span className="font-mono text-xs font-bold text-[#D89A3E]">
                      03
                    </span>
                  </div>
                  <h3 className="mt-4 font-display text-xl font-bold text-[#103B47]">
                    Counselors & Consultants
                  </h3>
                  <p className="mt-2 text-xs text-slate-600 leading-relaxed font-sans">
                    Independent educational advisors and school career guidance
                    cells using Abroadroute as a verified reference catalog and
                    high-intent lead engine.
                  </p>
                  <div className="mt-4 pt-3 border-t border-[#D9CFB8]/50">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#103B47] block">
                      Cares About:
                    </span>
                    <p className="text-xs text-[#1D5A6C] font-semibold mt-0.5">
                      Data accuracy, verified student intent, SLA dispute
                      resolution, co-brandable advisory reports.
                    </p>
                  </div>
                </div>

                {/* Audience 4: University Partners */}
                <div className="rounded-2xl border border-[#D9CFB8] bg-white p-7 shadow-xs hover:border-[#1D5A6C] transition">
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-[#7C6BAE]/15 px-3 py-1 text-[11px] font-bold text-[#7C6BAE] uppercase tracking-wider">
                      Partner · Global Institutions
                    </span>
                    <span className="font-mono text-xs font-bold text-[#D89A3E]">
                      04
                    </span>
                  </div>
                  <h3 className="mt-4 font-display text-xl font-bold text-[#103B47]">
                    University Partners
                  </h3>
                  <p className="mt-2 text-xs text-slate-600 leading-relaxed font-sans">
                    Platinum, Gold, and Silver tier institutions listing
                    verified degrees on Abroadroute to attract serious,
                    academically qualified Indian applicants.
                  </p>
                  <div className="mt-4 pt-3 border-t border-[#D9CFB8]/50">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#103B47] block">
                      Cares About:
                    </span>
                    <p className="text-xs text-[#1D5A6C] font-semibold mt-0.5">
                      Qualified applicant pipeline, verified domain claims,
                      institutional brand fit, tier positioning.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 03 · Personality: Six Traits That Shape Everything */}
            <div className="space-y-8">
              <div className="text-center max-w-2xl mx-auto">
                <div className="inline-flex items-center gap-2 rounded-full border border-[#D89A3E]/40 bg-[#D89A3E]/10 px-3.5 py-1 text-xs font-bold text-[#103B47]">
                  <span>Personality</span>
                </div>
                <h2 className="mt-3 font-display text-3xl font-bold text-[#103B47]">
                  Six Traits That Shape Everything
                </h2>
                <p className="mt-2 text-xs sm:text-sm text-slate-600 font-sans">
                  The personality is our north star for every design decision,
                  every headline, and every product interaction. If a choice
                  does not carry these traits, it does not belong.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Trait 1: Authoritative */}
                <div className="rounded-2xl border border-[#D9CFB8] bg-white p-6 shadow-xs flex flex-col justify-between">
                  <div>
                    <span className="font-mono text-xs font-bold text-[#D89A3E] uppercase tracking-wider block">
                      i · Pillar
                    </span>
                    <h3 className="mt-2 font-display text-lg font-bold text-[#103B47]">
                      Authoritative
                    </h3>
                    <p className="mt-2 text-xs text-slate-600 leading-relaxed font-sans">
                      Verified data, cited sources, no invented rankings.
                      Abroadroute is a trusted reference, not a rumour.
                    </p>
                  </div>
                </div>

                {/* Trait 2: Transparent */}
                <div className="rounded-2xl border border-[#D9CFB8] bg-white p-6 shadow-xs flex flex-col justify-between">
                  <div>
                    <span className="font-mono text-xs font-bold text-[#D89A3E] uppercase tracking-wider block">
                      ii · Pillar
                    </span>
                    <h3 className="mt-2 font-display text-lg font-bold text-[#103B47]">
                      Transparent
                    </h3>
                    <p className="mt-2 text-xs text-slate-600 leading-relaxed font-sans">
                      Real fees, real visa timelines, zero hidden charges. No
                      paywalled truth or secret consultancy commissions.
                    </p>
                  </div>
                </div>

                {/* Trait 3: Knowledgeable */}
                <div className="rounded-2xl border border-[#D9CFB8] bg-white p-6 shadow-xs flex flex-col justify-between">
                  <div>
                    <span className="font-mono text-xs font-bold text-[#D89A3E] uppercase tracking-wider block">
                      iii · Pillar
                    </span>
                    <h3 className="mt-2 font-display text-lg font-bold text-[#103B47]">
                      Knowledgeable
                    </h3>
                    <p className="mt-2 text-xs text-slate-600 leading-relaxed font-sans">
                      Depth of program data, admission rules, visa realities,
                      and statutory regulations. Expertise worn lightly.
                    </p>
                  </div>
                </div>

                {/* Trait 4: Approachable */}
                <div className="rounded-2xl border border-[#D9CFB8] bg-white p-6 shadow-xs flex flex-col justify-between">
                  <div>
                    <span className="font-mono text-xs font-bold text-[#D89A3E] uppercase tracking-wider block">
                      iv · Pillar
                    </span>
                    <h3 className="mt-2 font-display text-lg font-bold text-[#103B47]">
                      Approachable
                    </h3>
                    <p className="mt-2 text-xs text-slate-600 leading-relaxed font-sans">
                      Complex journeys translated into simple, student-first
                      next steps. ✦ Route AI Counsellor makes this literal.
                    </p>
                  </div>
                </div>

                {/* Trait 5: Globally Rooted */}
                <div className="rounded-2xl border border-[#D9CFB8] bg-white p-6 shadow-xs flex flex-col justify-between">
                  <div>
                    <span className="font-mono text-xs font-bold text-[#D89A3E] uppercase tracking-wider block">
                      v · Pillar
                    </span>
                    <h3 className="mt-2 font-display text-lg font-bold text-[#103B47]">
                      Globally Rooted
                    </h3>
                    <p className="mt-2 text-xs text-slate-600 leading-relaxed font-sans">
                      Comfortable across cultures, while deeply respectful of
                      the Indian family context that shapes every education
                      decision.
                    </p>
                  </div>
                </div>

                {/* Trait 6: Elegant */}
                <div className="rounded-2xl border border-[#D9CFB8] bg-white p-6 shadow-xs flex flex-col justify-between">
                  <div>
                    <span className="font-mono text-xs font-bold text-[#D89A3E] uppercase tracking-wider block">
                      vi · Pillar
                    </span>
                    <h3 className="mt-2 font-display text-lg font-bold text-[#103B47]">
                      Elegant
                    </h3>
                    <p className="mt-2 text-xs text-slate-600 leading-relaxed font-sans">
                      Editorial in look, unhurried in tone. A premium feel that
                      signals the uncompromising quality of guidance.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 13 · Message Pillars: Four Things Abroadroute Always Says */}
            <div className="space-y-8">
              <div className="text-center max-w-2xl mx-auto">
                <div className="inline-flex items-center gap-2 rounded-full border border-[#D89A3E]/40 bg-[#D89A3E]/10 px-3.5 py-1 text-xs font-bold text-[#103B47]">
                  <span>Message Pillars</span>
                </div>
                <h2 className="mt-3 font-display text-3xl font-bold text-[#103B47]">
                  Four Things Abroadroute Always Says
                </h2>
                <p className="mt-2 text-xs sm:text-sm text-slate-600 font-sans">
                  Every campaign, page, and publication leans on one of these
                  four pillars. Together they cover the emotional and rational
                  spectrum of the study abroad decision.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Pillar 01 */}
                <div className="rounded-2xl border border-[#D9CFB8] bg-white p-7 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-[#D89A3E]">
                        01
                      </span>
                      <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                        Rational
                      </span>
                    </div>
                    <h3 className="mt-3 font-display text-xl font-bold text-[#103B47]">
                      Clarity Over Cleverness
                    </h3>
                    <p className="mt-2 text-xs text-slate-600 leading-relaxed font-sans">
                      Complex admission rules, visa timelines, and cost
                      comparisons made legible. Abroadroute wins by being the
                      clearest source, not the loudest.
                    </p>
                  </div>
                  <blockquote className="mt-5 pt-4 border-t border-[#D9CFB8]/50 font-serif italic text-sm text-[#1D5A6C]">
                    “Every program, every fee, every deadline, in one honest
                    place.”
                  </blockquote>
                </div>

                {/* Pillar 02 */}
                <div className="rounded-2xl border border-[#D9CFB8] bg-white p-7 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-[#D89A3E]">
                        02
                      </span>
                      <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                        Emotional
                      </span>
                    </div>
                    <h3 className="mt-3 font-display text-xl font-bold text-[#103B47]">
                      The Family in the Room
                    </h3>
                    <p className="mt-2 text-xs text-slate-600 leading-relaxed font-sans">
                      Abroadroute never speaks to students as if their parents
                      were not part of the conversation. Content addresses both,
                      sometimes together, sometimes apart.
                    </p>
                  </div>
                  <blockquote className="mt-5 pt-4 border-t border-[#D9CFB8]/50 font-serif italic text-sm text-[#1D5A6C]">
                    “Built for the student who is going. Written for the family
                    staying behind.”
                  </blockquote>
                </div>

                {/* Pillar 03 */}
                <div className="rounded-2xl border border-[#D9CFB8] bg-white p-7 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-[#D89A3E]">
                        03
                      </span>
                      <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                        Cultural
                      </span>
                    </div>
                    <h3 className="mt-3 font-display text-xl font-bold text-[#103B47]">
                      Rooted, Then Global
                    </h3>
                    <p className="mt-2 text-xs text-slate-600 leading-relaxed font-sans">
                      Abroadroute starts with the Indian context: NEET scores,
                      CBSE streams, budget in rupees, family location. Then it
                      opens the world.
                    </p>
                  </div>
                  <blockquote className="mt-5 pt-4 border-t border-[#D9CFB8]/50 font-serif italic text-sm text-[#1D5A6C]">
                    “Your journey starts where you are, not where the brochure
                    begins.”
                  </blockquote>
                </div>

                {/* Pillar 04 */}
                <div className="rounded-2xl border border-[#D9CFB8] bg-white p-7 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-[#D89A3E]">
                        04
                      </span>
                      <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                        Ethical
                      </span>
                    </div>
                    <h3 className="mt-3 font-display text-xl font-bold text-[#103B47]">
                      Zero Bias, Zero Gatekeeping
                    </h3>
                    <p className="mt-2 text-xs text-slate-600 leading-relaxed font-sans">
                      Information is free, tools are open, AI counsel is
                      available 24/7. Abroadroute does not hide the good stuff
                      behind a lead form.
                    </p>
                  </div>
                  <blockquote className="mt-5 pt-4 border-t border-[#D9CFB8]/50 font-serif italic text-sm text-[#1D5A6C]">
                    “The portal is open. Ask anything, compare everything,
                    decide with us or without us.”
                  </blockquote>
                </div>
              </div>
            </div>

            {/* Corporate Mandate & DPDP 2023 */}
            <div className="rounded-3xl border border-[#D9CFB8] bg-white p-8 sm:p-10 shadow-sm">
              <h2 className="font-display text-2xl font-bold text-[#103B47]">
                Corporate Mandate & Governance
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-slate-600 font-sans">
                {settings.company_name && (
                  <>
                    Abroadroute is wholly owned and operated by{" "}
                    <strong>{settings.company_name}</strong>
                    {settings.founder_name && (
                      <>
                        {" "}
                        (Founder Director: <strong>{settings.founder_name}</strong>)
                      </>
                    )}
                    {settings.office_locations &&
                      `, headquartered in ${settings.office_locations}`}
                    .{" "}
                  </>
                )}
                Our mission is to protect Indian students
                and their families from misleading claims, unaccredited
                universities, and undisclosed middleman fees.
              </p>
              <div className="mt-6 flex flex-wrap gap-4 pt-4 border-t border-[#D9CFB8]/60">
                <Link
                  href="/dpdp-consent"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#103B47] hover:text-[#D89A3E] transition"
                >
                  DPDP Act 2023 Student Privacy Notice{" "}
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#103B47] hover:text-[#D89A3E] transition"
                >
                  Contact Admissions Desk <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
