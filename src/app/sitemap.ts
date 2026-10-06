import { MetadataRoute } from "next";
import {
  fetchLiveCountries,
  fetchLivePrograms,
  fetchLiveUniversities,
  fetchTestPrepExams,
} from "@/lib/supabase/dataFetchers";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://abroadroute.com";

const PHASE_1_L3_COMBINATIONS: {
  slug: string;
  program: string;
  priority: number;
}[] = [
  { slug: "uk", program: "masters", priority: 0.9 },
  { slug: "uk", program: "mba", priority: 0.85 },
  { slug: "uk", program: "executive-mba", priority: 0.8 },
  { slug: "uk", program: "nursing", priority: 0.85 },
  { slug: "usa", program: "masters", priority: 0.9 },
  { slug: "usa", program: "mba", priority: 0.85 },
  { slug: "usa", program: "executive-mba", priority: 0.8 },
  { slug: "germany", program: "masters", priority: 0.9 },
  { slug: "germany", program: "ausbildung", priority: 0.85 },
  { slug: "canada", program: "masters", priority: 0.85 },
  { slug: "russia", program: "mbbs", priority: 0.9 },
  { slug: "georgia", program: "mbbs", priority: 0.9 },
];

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

  // Country + Program Conversion Layer Pages (L3 - Canonical 76 Combinations)
  const l3Map = new Map<string, { url: string; priority: number }>();

  // 1. Phase 1 Launch Combinations with designated SEO priority
  for (const item of PHASE_1_L3_COMBINATIONS) {
    const url = `${BASE_URL}/study-in-${item.slug}/${item.program}`;
    l3Map.set(url, { url, priority: item.priority });
  }

  // 2. All active country destination popular programs
  for (const c of countries) {
    for (const p of c.popularPrograms || []) {
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
