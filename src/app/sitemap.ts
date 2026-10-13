import { MetadataRoute } from "next";
import {
  fetchLiveCountries,
  fetchLivePrograms,
  fetchLiveUniversities,
  fetchTestPrepExams,
} from "@/lib/supabase/dataFetchers";
import { fetchCountryProgramPages } from "@/lib/siteContent";
import { fetchProgramsByCountry } from "@/lib/siteStats";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://abroadroute.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const [countries, programs, universities] = await Promise.all([
    fetchLiveCountries(),
    fetchLivePrograms(),
    fetchLiveUniversities(),
  ]);

  // Core Static Pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}/`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/test-prep`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/cost-calculator`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/compare/universities`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/compare/courses`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/roi-calculator`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/deadline-tracker`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/scholarships`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/eligibility-checker`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/loan-calculator`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/partner-with-us`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/university-portal/claim`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/blog`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/articles`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/contact`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/sitemap`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/privacy-policy`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${BASE_URL}/terms-of-service`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${BASE_URL}/refund-policy`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${BASE_URL}/dpdp-consent`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.4,
    },
  ];

  // Destination Country Hubs
  // Destination Country Hubs (L2)
  const countryPages: MetadataRoute.Sitemap = countries.map((c) => ({
    url: `${BASE_URL}/study-in-${c.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.9,
  }));

  // Country + Program Conversion Layer Pages (L3)
  const l3Map = new Map<string, { url: string; priority: number }>();

  // 1. Pages set up in admin (country_programs) with their SEO priority
  const countrySlugById = new Map(countries.map((c) => [c.id, c.slug]));
  for (const page of await fetchCountryProgramPages()) {
    const slug = countrySlugById.get(page.countryId);
    if (!slug) continue;
    const url = `${BASE_URL}/study-in-${slug}/${page.urlAlias ?? page.programId}`;
    l3Map.set(url, { url, priority: page.seoPriority ?? 0.8 });
  }

  // 2. All active country destination popular programs
  for (const c of countries) {
    for (const p of (await fetchProgramsByCountry()).get(c.id) ?? []) {
      const progSlug =
        p === "ms" ? "masters" : p === "emba" ? "executive-mba" : p;
      const url = `${BASE_URL}/study-in-${c.slug}/${progSlug}`;
      if (!l3Map.has(url)) {
        l3Map.set(url, { url, priority: 0.8 });
      }
    }
  }

  const l3Pages: MetadataRoute.Sitemap = Array.from(l3Map.values()).map(
    (entry) => ({
      url: entry.url,
      lastModified: now,
      changeFrequency: "weekly",
      priority: entry.priority,
    }),
  );

  // Program Disciplines
  const programPages: MetadataRoute.Sitemap = programs.map((p) => ({
    url: `${BASE_URL}/programs/${p.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.85,
  }));

  // 9 Test Prep Blueprints
  const testPrepPages: MetadataRoute.Sitemap = (await fetchTestPrepExams()).map((t) => ({
    url: `${BASE_URL}/test-prep/${t.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.85,
  }));

  // Live Universities
  const universityPages: MetadataRoute.Sitemap = universities.map((u) => ({
    url: `${BASE_URL}/universities/${u.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [
    ...staticPages,
    ...countryPages,
    ...l3Pages,
    ...programPages,
    ...testPrepPages,
    ...universityPages,
  ];
}
