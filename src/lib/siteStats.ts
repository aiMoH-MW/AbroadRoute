import { cache } from "react";
import {
  fetchLiveCountries,
  fetchLivePrograms,
  fetchLiveUniversities,
  fetchTestPrepExams,
} from "@/lib/supabase/dataFetchers";
import type { SiteStats } from "@/lib/siteStatsFormat";
import type { University } from "@/types";

export * from "@/lib/siteStatsFormat";

export const fetchSiteStats = cache(async (): Promise<SiteStats> => {
  const [countries, programs, universities, exams] = await Promise.all([
    fetchLiveCountries(),
    fetchLivePrograms(),
    fetchLiveUniversities(),
    fetchTestPrepExams(),
  ]);

  const programCost = new Map(
    programs.map((p) => [p.id, p.yearlyEducationalCost ?? null]),
  );
  // A university's fee for a program, else the program's default fee
  const fees = universities.flatMap((u) =>
    (u.programs ?? [])
      .map((p) => p.yearlyTuitionINR ?? programCost.get(p.programId) ?? null)
      .filter((fee): fee is number => fee !== null),
  );

  return {
    countries: countries.length,
    programs: programs.length,
    universities: universities.length,
    exams: exams.length,
    tuitionMinINR: fees.length > 0 ? Math.min(...fees) : null,
    tuitionMaxINR: fees.length > 0 ? Math.max(...fees) : null,
  };
});

/**
 * Top-ranked universities that have a published tuition range, for the
 * AI counsellor previews on the home page. Optionally limited to a country.
 */
export const fetchPreviewUniversities = cache(
  async (countrySlug?: string, limit = 3): Promise<University[]> => {
    const universities = await fetchLiveUniversities();
    return universities
      .filter((u) => !countrySlug || u.countrySlug === countrySlug)
      .filter((u) => u.tuitionFeeRangeINR)
      .sort(
        (a, b) =>
          (a.rankingGlobal ?? Infinity) - (b.rankingGlobal ?? Infinity) ||
          a.name.localeCompare(b.name),
      )
      .slice(0, limit);
  },
);

/** The country with the most universities listed, or null when none are. */
export const fetchTopUniversityCountry = cache(
  async (): Promise<{ slug: string; name: string } | null> => {
    const universities = await fetchLiveUniversities();
    const counts = new Map<string, { slug: string; name: string; n: number }>();
    universities.forEach((u) => {
      if (!u.countrySlug) return;
      const entry = counts.get(u.countrySlug) ?? {
        slug: u.countrySlug,
        name: u.country ?? u.countrySlug,
        n: 0,
      };
      entry.n += 1;
      counts.set(u.countrySlug, entry);
    });
    const top = Array.from(counts.values()).sort((a, b) => b.n - a.n)[0];
    return top ? { slug: top.slug, name: top.name } : null;
  },
);

/**
 * Programs offered in each country, from the universities listed there
 * (plus the country's own popular_programs if set): country id → program ids.
 */
export const fetchProgramsByCountry = cache(
  async (): Promise<Map<string, Set<string>>> => {
    const [universities, countries] = await Promise.all([
      fetchLiveUniversities(),
      fetchLiveCountries(),
    ]);
    const byCountry = new Map<string, Set<string>>();
    const add = (countryId: string, programId: string) => {
      if (!byCountry.has(countryId)) byCountry.set(countryId, new Set());
      byCountry.get(countryId)!.add(programId);
    };
    countries.forEach((c) => c.popularPrograms.forEach((p) => add(c.id, p)));
    universities.forEach((u) => {
      if (u.countrySlug) u.programsOffered.forEach((p) => add(u.countrySlug!, p));
    });
    return byCountry;
  },
);
