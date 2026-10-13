import "server-only";
import { cache } from "react";
import { supabaseAdmin } from "@/lib/supabase/server";

// Read side of the site content tables (migration 0020). Every fetcher
// returns an empty list / null when the table is empty or not migrated yet,
// so pages render "Not provided" instead of failing.

export interface CountryHighlight {
  id: string;
  kind: "reason" | "tradeoff";
  title: string;
  description: string | null;
}

export interface CountryProgramCost {
  id: string;
  programLabel: string;
  tuitionRangeINR: string | null;
  livingCostINR: string | null;
  totalAnnualINR: string | null;
  notes: string | null;
}

export interface CountryHiddenCost {
  id: string;
  item: string;
  costINR: string | null;
  frequency: string | null;
}

export interface Faq {
  id: string;
  question: string;
  answer: string;
}

export interface Testimonial {
  id: string;
  studentName: string;
  headline: string | null;
  quote: string;
  photoUrl: string | null;
}

export interface TrustBadge {
  id: string;
  title: string;
  description: string | null;
}

export interface WalletPack {
  id: string;
  label: string;
  amountINR: number;
  perk: string | null;
}

export interface AiSuggestedQuestion {
  id: string;
  category: string;
  question: string;
}

export interface CountryProgramPage {
  countryId: string;
  programId: string;
  urlAlias: string | null;
  seoPriority: number | null;
}

/** Active rows of a content table in display order; [] on any error. */
async function activeRows(
  table: string,
  filters: Record<string, string> = {},
): Promise<any[]> {
  try {
    let query = supabaseAdmin.from(table).select("*").eq("is_active", true);
    for (const [column, value] of Object.entries(filters)) {
      query = query.eq(column, value);
    }
    const { data, error } = await query
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });
    if (error) {
      console.warn(`Site content: ${table} fetch error:`, error.message);
      return [];
    }
    return data ?? [];
  } catch (err) {
    console.warn(`Site content: ${table} fetch error:`, err);
    return [];
  }
}

export const fetchCountryGuide = cache(async (countryId: string) => {
  const [highlights, costs, hidden, faqs] = await Promise.all([
    activeRows("country_highlights", { country_id: countryId }),
    activeRows("country_program_costs", { country_id: countryId }),
    activeRows("country_hidden_costs", { country_id: countryId }),
    fetchFaqs("country", countryId),
  ]);
  return {
    highlights: highlights.map(
      (r): CountryHighlight => ({
        id: r.id,
        kind: r.kind,
        title: r.title,
        description: r.description ?? null,
      }),
    ),
    programCosts: costs.map(
      (r): CountryProgramCost => ({
        id: r.id,
        programLabel: r.program_label,
        tuitionRangeINR: r.tuition_range_inr ?? null,
        livingCostINR: r.living_cost_inr ?? null,
        totalAnnualINR: r.total_annual_inr ?? null,
        notes: r.notes ?? null,
      }),
    ),
    hiddenCosts: hidden.map(
      (r): CountryHiddenCost => ({
        id: r.id,
        item: r.item,
        costINR: r.cost_inr ?? null,
        frequency: r.frequency ?? null,
      }),
    ),
    faqs,
  };
});

export const fetchFaqs = cache(
  async (scope: string, scopeId?: string): Promise<Faq[]> => {
    const rows = await activeRows(
      "faqs",
      scopeId ? { scope, scope_id: scopeId } : { scope },
    );
    return rows.map((r) => ({
      id: r.id,
      question: r.question,
      answer: r.answer,
    }));
  },
);

export const fetchTestimonials = cache(async (): Promise<Testimonial[]> =>
  (await activeRows("testimonials")).map((r) => ({
    id: r.id,
    studentName: r.student_name,
    headline: r.headline ?? null,
    quote: r.quote,
    photoUrl: r.photo_url ?? null,
  })),
);

export const fetchTrustBadges = cache(async (): Promise<TrustBadge[]> =>
  (await activeRows("trust_badges")).map((r) => ({
    id: r.id,
    title: r.title,
    description: r.description ?? null,
  })),
);

export const fetchWalletPacks = cache(async (): Promise<WalletPack[]> =>
  (await activeRows("b2b_wallet_packs")).map((r) => ({
    id: r.id,
    label: r.label,
    amountINR: Number(r.amount_inr),
    perk: r.perk ?? null,
  })),
);

export const fetchAiSuggestedQuestions = cache(
  async (): Promise<AiSuggestedQuestion[]> =>
    (await activeRows("ai_suggested_questions")).map((r) => ({
      id: r.id,
      category: r.category,
      question: r.question,
    })),
);

export const fetchCountryProgramPages = cache(
  async (): Promise<CountryProgramPage[]> =>
    (await activeRows("country_programs")).map((r) => ({
      countryId: r.country_id,
      programId: r.program_id,
      urlAlias: r.url_alias ?? null,
      seoPriority:
        r.seo_priority === null || r.seo_priority === undefined
          ? null
          : Number(r.seo_priority),
    })),
);

/** site_settings as { key: value }; missing keys are simply absent. */
export const fetchSiteSettings = cache(
  async (): Promise<Record<string, string | null>> => {
    const rows = await activeRows("site_settings");
    return Object.fromEntries(rows.map((r) => [r.key, r.value ?? null]));
  },
);
