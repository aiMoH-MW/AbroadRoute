import { NextResponse } from "next/server";
import {
  fetchLiveUniversities,
  fetchLiveCourses,
  fetchLivePrograms,
  fetchLiveCountries,
  fetchTestPrepExams,
} from "@/lib/supabase/dataFetchers";
import { getAllArticles } from "@/lib/sanity/fetchers";

export const dynamic = "force-dynamic";

export interface SearchResultItem {
  id: string;
  title: string;
  subtitle: string;
  category:
    | "universities"
    | "courses"
    | "programs"
    | "destinations"
    | "guides"
    | "tools"
    | "test_prep";
  categoryLabel: string;
  badge?: string;
  url: string;
  iconType:
    | "university"
    | "course"
    | "program"
    | "country"
    | "guide"
    | "tool"
    | "test_prep";
  countryCode?: string;
  countrySlug?: string;
  flagEmoji?: string;
  score: number;
}

const SITE_TOOLS = [
  {
    id: "tool-cost-calculator",
    title: "Cost of Living & Study Calculator",
    subtitle:
      "Calculate tuition, accommodation, food, and blocked account across 19 countries in INR & EUR",
    badge: "Interactive Tool",
    url: "/cost-calculator",
    keywords: [
      "calculator",
      "cost",
      "living",
      "budget",
      "expenses",
      "tuition",
      "blocked account",
      "forex",
      "money",
      "estimate",
      "fees",
    ],
  },
  {
    id: "tool-uni-compare",
    title: "University Comparison Matrix",
    subtitle:
      "Compare universities side-by-side across rankings, fees, acceptance rates, and campus stats",
    badge: "Comparison Tool",
    url: "/compare/universities",
    keywords: [
      "compare",
      "comparison",
      "universities",
      "rankings",
      "matrix",
      "side by side",
      "selector",
      "criteria",
    ],
  },
  {
    id: "tool-course-compare",
    title: "Course & Degree Comparison Engine",
    subtitle:
      "Compare courses across duration, modules, IELTS criteria, and post-study work visa rights",
    badge: "Comparison Tool",
    url: "/compare/courses",
    keywords: [
      "compare",
      "courses",
      "degrees",
      "masters",
      "bachelors",
      "curriculum",
      "ielts",
      "duration",
    ],
  },
  {
    id: "tool-ai-counsellor",
    title: "AI Admissions Counsellor",
    subtitle:
      "24/7 intelligent admissions guidance, eligibility scoring, and university shortlisting",
    badge: "AI Tool",
    url: "/#ai-counsellor",
    keywords: [
      "ai",
      "counsellor",
      "counseling",
      "bot",
      "assistant",
      "admissions",
      "shortlisting",
      "chat",
      "advisor",
      "guidance",
    ],
  },
  {
    id: "tool-test-prep",
    title: "Test Prep & Exam Finder",
    subtitle:
      "Explore IELTS, TOEFL, GRE, GMAT, PTE, NCLEX, and SAT syllabus, fees, and validity",
    badge: "Exams Hub",
    url: "/test-prep",
    keywords: [
      "test prep",
      "exams",
      "ielts",
      "toefl",
      "gre",
      "gmat",
      "pte",
      "nclex",
      "sat",
      "scores",
      "exam prep",
    ],
  },
  {
    id: "tool-roi-calculator",
    title: "EMBA ROI & Payback Calculator",
    subtitle:
      "Calculate payback years and 10-year career wealth gain for Executive MBA",
    badge: "ROI Calculator",
    url: "/roi-calculator",
    keywords: [
      "roi",
      "emba",
      "executive mba",
      "payback",
      "salary hike",
      "wealth",
      "ctc",
      "career growth",
      "calculator",
    ],
  },
  {
    id: "tool-deadline-tracker",
    title: "Intake Deadline Tracker & Alerts",
    subtitle:
      "Track Fall/Spring 2027 university application deadlines with 90-day countdown alerts",
    badge: "Milestones",
    url: "/deadline-tracker",
    keywords: [
      "deadlines",
      "tracker",
      "intake",
      "fall 2027",
      "spring",
      "application timeline",
      "countdown",
      "reminders",
    ],
  },
  {
    id: "tool-scholarships",
    title: "Scholarship & Grant Finder",
    subtitle:
      "Search DAAD, Chevening, Fulbright, Erasmus & Women in STEM scholarships",
    badge: "Scholarships",
    url: "/scholarships",
    keywords: [
      "scholarships",
      "grants",
      "daad",
      "chevening",
      "fulbright",
      "erasmus",
      "stem",
      "financial aid",
      "funding",
    ],
  },
  {
    id: "tool-eligibility-checker",
    title: "Admission Eligibility Checker",
    subtitle:
      "Check Safe, Target & Reach university admission probability with GPA and IELTS score",
    badge: "Evaluation",
    url: "/eligibility-checker",
    keywords: [
      "eligibility",
      "admissions",
      "chance",
      "probability",
      "safe",
      "target",
      "reach",
      "profile evaluation",
    ],
  },
  {
    id: "tool-loan-calculator",
    title: "Education Loan & EMI Calculator",
    subtitle:
      "Calculate monthly EMI and compare partner bank rates from SBI, HDFC Credila & Prodigy",
    badge: "Finance",
    url: "/loan-calculator",
    keywords: [
      "loan",
      "emi",
      "education loan",
      "sbi",
      "hdfc",
      "prodigy",
      "avanse",
      "interest rate",
      "collateral",
      "finance",
    ],
  },
  {
    id: "tool-sitemap",
    title: "Sitemap & Country Directory",
    subtitle:
      "Directory of all 19 study destinations, study levels, and academic pathways",
    badge: "Directory",
    url: "/sitemap",
    keywords: [
      "sitemap",
      "directory",
      "all countries",
      "index",
      "navigation",
      "destinations",
      "table of contents",
    ],
  },
];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const rawQuery = searchParams.get("q") || searchParams.get("query") || "";
    const categoryFilter = searchParams.get("category") || "all";
    const limit = parseInt(searchParams.get("limit") || "30", 10);

    const query = rawQuery.trim().toLowerCase();

    // Fetch live data from Supabase, Sanity CMS & Static caches in parallel
    const [universities, courses, programs, countries, articles] =
      await Promise.all([
        fetchLiveUniversities(),
        fetchLiveCourses(),
        fetchLivePrograms(),
        fetchLiveCountries(),
        getAllArticles(),
      ]);

    const results: SearchResultItem[] = [];

    // [FR-SEARCH-002] Multi-tier relevance scoring:
    // 1. Slug matches (1.5x)
    // 2. Title / H1 matches (1.3x)
    // 3. Subtitle / Meta description matches (0.8x)
    // 4. Body content / keywords matches (0.5x)
    // 5. Utility / tool pages matches (0.4x)
    const computeRelevance = (
      slugText: string,
      titleText: string,
      metaText: string,
      bodyText?: string,
    ): number => {
      if (!query) return 10;
      let score = 0;

      const slug = (slugText || "").toLowerCase();
      const title = (titleText || "").toLowerCase();
      const meta = (metaText || "").toLowerCase();
      const body = (bodyText || "").toLowerCase();

      // (1) Slug matching
      if (slug === query) score = Math.max(score, 100 * 1.5);
      else if (slug.startsWith(query)) score = Math.max(score, 85 * 1.5);
      else if (slug.includes(query)) score = Math.max(score, 60 * 1.5);

      // (2) Title / H1 matching
      if (title === query) score = Math.max(score, 100 * 1.3);
      else if (title.startsWith(query)) score = Math.max(score, 85 * 1.3);
      else {
        const words = title.split(/[\s,–—\-_/()]+/);
        if (words.some((w) => w.startsWith(query)))
          score = Math.max(score, 70 * 1.3);
        else if (title.includes(query)) score = Math.max(score, 50 * 1.3);
      }

      // (3) Meta / Subtitle matching
      if (meta.includes(query)) score = Math.max(score, 45 * 0.8);

      // (4) Body / Keywords matching
      if (body.includes(query)) score = Math.max(score, 35 * 0.5);

      return score;
    };

    // 1. Search Universities
    if (categoryFilter === "all" || categoryFilter === "universities") {
      universities.forEach((u) => {
        const bodyContent = Array.isArray(u.programsOffered)
          ? u.programsOffered.join(" ")
          : "";
        const score = computeRelevance(
          u.slug || "",
          u.name || "",
          `${u.city || ""} ${u.country || ""}`,
          bodyContent,
        );

        if (score > 0) {
          results.push({
            id: `uni-${u.id || u.slug}`,
            title: u.name,
            subtitle: `${u.city ? `${u.city}, ` : ""}${u.country} • Global Rank #${u.rankingGlobal || "N/A"}`,
            category: "universities",
            categoryLabel: "University",
            badge:
              u.tuitionFeeRangeINR || (u.featured ? "Featured" : undefined),
            url: `/universities/${u.slug}`,
            iconType: "university",
            countryCode:
              u.countrySlug ||
              (u.country ? u.country.toLowerCase() : undefined),
            countrySlug: u.countrySlug,
            score,
          });
        }
      });
    }

    // 2. Search Courses
    if (categoryFilter === "all" || categoryFilter === "courses") {
      courses.forEach((c) => {
        const bodyContent = Array.isArray(c.coreModules)
          ? c.coreModules.join(" ")
          : "";
        const score = computeRelevance(
          c.slug || "",
          c.name || "",
          `${c.universityName || ""} ${c.country || ""} ${c.level || ""}`,
          bodyContent,
        );

        if (score > 0) {
          results.push({
            id: `course-${c.id || c.slug}`,
            title: c.name,
            subtitle: `${c.universityName} • ${c.country} (${c.duration})`,
            category: "courses",
            categoryLabel: "Course & Degree",
            badge: c.tuitionFeeINR || `IELTS ${c.ieltsMinScore}+`,
            url: `/compare/courses?search=${encodeURIComponent(c.name)}`,
            iconType: "course",
            countryCode: c.country ? c.country.toLowerCase() : undefined,
            flagEmoji: c.flagEmoji,
            score,
          });
        }
      });
    }

    // 3. Search Programs / Disciplines
    if (categoryFilter === "all" || categoryFilter === "programs") {
      programs.forEach((p) => {
        const bodyContent = `${p.summary || ""} ${Array.isArray(p.keyFields) ? p.keyFields.join(" ") : ""}`;
        const score = computeRelevance(
          p.slug || "",
          p.name || "",
          `${p.level || ""} ${p.duration || ""}`,
          bodyContent,
        );

        if (score > 0) {
          results.push({
            id: `prog-${p.id || p.slug}`,
            title: p.name,
            subtitle: `${p.level} • Duration: ${p.duration} • Top: ${p.topDestinations?.slice(0, 3).join(", ") || "Global"}`,
            category: "programs",
            categoryLabel: "Program / Discipline",
            badge: `ROI ${p.roiScore || 90}/100`,
            url: `/programs/${p.slug}`,
            iconType: "program",
            score,
          });
        }
      });
    }

    // 4. Search Destinations / Countries
    if (categoryFilter === "all" || categoryFilter === "destinations") {
      countries.forEach((c) => {
        const bodyContent = `${c.overview || ""} ${c.heroTagline || ""} ${c.postStudyWorkVisa || ""}`;
        const score = computeRelevance(
          c.slug || "",
          `Study in ${c.name}`,
          `${c.tier || ""} ${c.avgLivingCostINR || ""}`,
          bodyContent,
        );

        if (score > 0) {
          results.push({
            id: `country-${c.id || c.slug}`,
            title: `Study in ${c.name}`,
            subtitle: `${c.tier} • Visa: ${c.postStudyWorkVisa} • Avg Living: ${c.avgLivingCostINR}`,
            category: "destinations",
            categoryLabel: "Country Destination",
            badge: c.avgTuitionINR,
            url: `/study-in-${c.slug}`,
            iconType: "country",
            countryCode: c.code || c.slug,
            countrySlug: c.slug,
            flagEmoji: c.flagEmoji,
            score,
          });
        }
      });
    }

    // 5. Search Guides & Blog Articles
    if (categoryFilter === "all" || categoryFilter === "guides") {
      articles.forEach((a) => {
        const bodyContent = `${a.tag || ""} ${a.country || ""} ${a.programCategory || ""}`;
        const score = computeRelevance(
          a.slug || "",
          a.title || "",
          a.excerpt || "",
          bodyContent,
        );

        if (score > 0) {
          results.push({
            id: `guide-${a._id || a.slug}`,
            title: a.title,
            subtitle: `${a.tag || "Guide"} • ${a.readTime || "5 min read"}`,
            category: "guides",
            categoryLabel: "Guide / Blog Article",
            badge: a.date || "Updated",
            url: `/articles/${a.slug}`,
            iconType: "guide",
            score,
          });
        }
      });
    }

    // 6. Search Tools & Calculators
    if (categoryFilter === "all" || categoryFilter === "tools") {
      SITE_TOOLS.forEach((tool) => {
        const bodyContent = tool.keywords.join(" ");
        const score = computeRelevance(
          tool.url.replace("/", ""),
          tool.title,
          tool.subtitle,
          bodyContent,
        );

        if (score > 0) {
          results.push({
            id: tool.id,
            title: tool.title,
            subtitle: tool.subtitle,
            category: "tools",
            categoryLabel: "Interactive Tool",
            badge: tool.badge,
            url: tool.url,
            iconType: "tool",
            score: score * 0.9, // Slightly lower than exact university matches
          });
        }
      });
    }

    // 7. Search Test Prep & Exams
    if (categoryFilter === "all" || categoryFilter === "test_prep") {
      (await fetchTestPrepExams()).forEach((t) => {
        const sectionsText = t.sections
          ? t.sections.map((s) => `${s.name} ${s.skillsTested}`).join(" ")
          : "";
        const bodyContent = `${t.fullName || ""} ${t.category || ""} ${t.overview || ""} ${sectionsText}`;
        const score = computeRelevance(
          t.slug || "",
          `${t.name} (${t.shortName})`,
          `${t.category} • Fee: ${t.feeINR}`,
          bodyContent,
        );

        if (score > 0) {
          results.push({
            id: `exam-${t.id || t.slug}`,
            title: t.name,
            subtitle: `${t.fullName} (${t.category}) • Fee: ${t.feeINR}`,
            category: "test_prep",
            categoryLabel: "Test Prep Exam",
            badge: t.validityYears
              ? `${t.validityYears} Years Validity`
              : "Standard Validity",
            url: `/test-prep/${t.slug}`,
            iconType: "test_prep",
            score,
          });
        }
      });
    }

    // Sort by highest score first, then alphabetically
    results.sort((a, b) => b.score - a.score || a.title.localeCompare(b.title));

    const totalMatches = results.length;
    const paginatedResults = results.slice(0, limit);

    // Calculate category breakdown counts
    const counts = {
      all: totalMatches,
      universities: results.filter((r) => r.category === "universities").length,
      courses: results.filter((r) => r.category === "courses").length,
      programs: results.filter((r) => r.category === "programs").length,
      destinations: results.filter((r) => r.category === "destinations").length,
      guides: results.filter((r) => r.category === "guides").length,
      tools: results.filter((r) => r.category === "tools").length,
      test_prep: results.filter((r) => r.category === "test_prep").length,
    };

    return NextResponse.json({
      success: true,
      query: rawQuery,
      total: totalMatches,
      counts,
      results: paginatedResults,
    });
  } catch (error: any) {
    console.error("API /api/search error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to perform database search",
      },
      { status: 500 },
    );
  }
}
