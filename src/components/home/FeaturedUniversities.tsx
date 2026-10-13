import { Suspense } from "react";
import { Building2 } from "lucide-react";
import { LeadTriggerButton } from "@/components/home/HomeClientContext";
import { UniversityCardsSkeleton } from "./HomeSkeletons";
import { SectionError } from "@/components/ui/SectionError";
import { SectionEmpty } from "@/components/ui/SectionEmpty";
import { fetchUniversitiesFromBackend } from "@/lib/data/liveContent";
import { NotProvided } from "@/components/tools/NotProvided";

async function UniversityCards() {
  let universities;
  try {
    universities = await fetchUniversitiesFromBackend();
  } catch (err) {
    console.error("FeaturedUniversities backend fetch failed:", err);
    return (
      <div className="mt-8">
        <SectionError
          title="Couldn't load universities"
          message="We couldn't reach the server to fetch partner universities."
        />
      </div>
    );
  }

  const featured = universities.filter((u) => u.featured);

  if (featured.length === 0) {
    return (
      <div className="mt-8">
        <SectionEmpty
          title="No partner universities yet"
          message="No featured partner institutions are published right now. Please check back soon."
        />
      </div>
    );
  }

  return (
    <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {featured.map((uni, idx) => {
        // Partner tier only when one is set; never inferred from ranking
        const badgeText = uni.tierBadge;
        const badgeClass =
          badgeText === "Platinum Partner"
            ? "tier-badge platinum"
            : badgeText === "Gold Partner"
              ? "tier-badge gold"
              : "tier-badge silver";

        return (
          <div
            key={`${uni.id}-${idx}`}
            className="rounded-2xl border border-[#D9CFB8]/60 bg-white p-6 transition hover:border-[#1D5A6C]/40 hover:shadow-lg"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FDFCF7] text-[#1D5A6C] shadow-xs border border-[#D9CFB8]/40">
                  <Building2 className="h-5 w-5 text-[#D89A3E]" />
                </div>
                {badgeText && <span className={badgeClass}>{badgeText}</span>}
              </div>
              <span className="font-mono rounded-full bg-[#D9CFB8]/30 px-2 py-0.5 text-[10px] font-bold text-[#103B47]">
                Global{" "}
                {uni.rankingGlobal !== null ? (
                  `#${uni.rankingGlobal}`
                ) : (
                  <NotProvided />
                )}
              </span>
            </div>

            <h3 className="mt-4 font-display text-base font-bold text-[#1D5A6C]">
              {uni.name}
            </h3>
            <p className="text-xs text-slate-500">
              {[uni.city, uni.country].filter(Boolean).join(", ") || (
                <NotProvided />
              )}
            </p>

            <div className="mt-4 space-y-1.5 border-t border-[#D9CFB8]/40 pt-3 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Tuition:</span>
                <span className="font-mono font-bold text-[#1D5A6C]">
                  {uni.tuitionFeeRangeINR ?? <NotProvided />}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">IELTS Min:</span>
                <span className="font-mono font-semibold text-slate-700">
                  {uni.ieltsMinScore !== null ? (
                    `${uni.ieltsMinScore} Bands`
                  ) : (
                    <NotProvided />
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Work Visa:</span>
                <span className="font-mono font-semibold text-emerald-700">
                  {uni.postStudyWorkMonths !== null ? (
                    `${uni.postStudyWorkMonths} Months`
                  ) : (
                    <NotProvided />
                  )}
                </span>
              </div>
            </div>

            <LeadTriggerButton
              country={uni.country ?? undefined}
              className="mt-5 w-full rounded-full bg-[#1D5A6C]/5 py-2 text-center text-xs font-bold text-[#1D5A6C] border border-[#1D5A6C]/20 hover:bg-[#1D5A6C] hover:text-white transition"
            >
              Check Admission Cutoffs
            </LeadTriggerButton>
          </div>
        );
      })}
    </div>
  );
}

export function FeaturedUniversities() {
  return (
    <section className="cv-auto border-t border-[#D9CFB8]/40 bg-[#FDFCF7] py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#D89A3E]">
              ✦ Global Accreditation & Tier Partners
            </span>
            <h2 className="mt-1 font-display text-3xl font-bold text-[#103B47] sm:text-4xl">
              Featured Partner Universities
            </h2>
            <p className="mt-1 text-xs text-slate-600">
              Platinum, Gold, and Silver partner institutions with verified
              curriculum, transparent tuition in ₹ Lakhs, and high post-study
              work visa allowances.
            </p>
          </div>
          <LeadTriggerButton className="rounded-full border border-[#1D5A6C]/30 px-5 py-2 text-xs font-bold text-[#1D5A6C] hover:bg-[#1D5A6C] hover:text-white transition">
            Request Custom University Shortlist
          </LeadTriggerButton>
        </div>

        <Suspense fallback={<UniversityCardsSkeleton />}>
          <UniversityCards />
        </Suspense>
      </div>
    </section>
  );
}
