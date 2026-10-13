// Content tables managed from the admin "Site Content" tab (migration 0020).
// One config drives the generic admin API (validation + allowed columns) and
// the admin form, so adding a table here is all an admin screen needs.
// Client-safe: no server imports.

export type ContentFieldType =
  | "text"
  | "textarea"
  | "number"
  | "boolean"
  | "select"
  | "country" // countries.id, chosen from the live country list
  | "program"; // programs.id, chosen from the live program list

export interface ContentField {
  column: string; // database column
  label: string;
  type: ContentFieldType;
  required?: boolean;
  options?: { value: string; label: string }[]; // for "select"
  hint?: string;
  maxLength?: number;
}

export interface ContentTableConfig {
  table: string;
  title: string;
  description: string;
  fields: ContentField[];
  titleColumn: string; // shown as the row heading in admin
  subtitleColumn?: string;
  groupColumn?: string; // rows are filtered/grouped by this column in admin
  // Fixed values written on every row (e.g. the FAQ scope)
  fixed?: Record<string, string>;
  // Rows must match these to be listed (same keys as `fixed`)
  match?: Record<string, string>;
}

export const CONTENT_TABLES = {
  "country-highlights": {
    table: "country_highlights",
    title: "Country Highlights",
    description:
      '"Why choose" reasons and trade-offs shown on each country guide.',
    titleColumn: "title",
    subtitleColumn: "kind",
    groupColumn: "country_id",
    fields: [
      { column: "country_id", label: "Country", type: "country", required: true },
      {
        column: "kind",
        label: "Type",
        type: "select",
        required: true,
        options: [
          { value: "reason", label: "Why choose (reason)" },
          { value: "tradeoff", label: "Trade-off to know" },
        ],
      },
      { column: "title", label: "Title", type: "text", required: true, maxLength: 255 },
      { column: "description", label: "Description", type: "textarea" },
    ],
  },
  "country-program-costs": {
    table: "country_program_costs",
    title: "Country Cost Breakdown",
    description: "Per-program tuition, living and total costs on country guides.",
    titleColumn: "program_label",
    subtitleColumn: "total_annual_inr",
    groupColumn: "country_id",
    fields: [
      { column: "country_id", label: "Country", type: "country", required: true },
      {
        column: "program_label",
        label: "Program",
        type: "text",
        required: true,
        maxLength: 255,
        hint: "e.g. Master's (MS/MSc - Public)",
      },
      { column: "tuition_range_inr", label: "Tuition (INR)", type: "text", maxLength: 128 },
      { column: "living_cost_inr", label: "Living cost (INR)", type: "text", maxLength: 128 },
      { column: "total_annual_inr", label: "Total per year (INR)", type: "text", maxLength: 128 },
      { column: "notes", label: "Notes", type: "textarea" },
    ],
  },
  "country-hidden-costs": {
    table: "country_hidden_costs",
    title: "Country Hidden Costs",
    description: "Extra one-off or recurring costs listed on country guides.",
    titleColumn: "item",
    subtitleColumn: "cost_inr",
    groupColumn: "country_id",
    fields: [
      { column: "country_id", label: "Country", type: "country", required: true },
      { column: "item", label: "Cost item", type: "text", required: true, maxLength: 255 },
      { column: "cost_inr", label: "Cost (INR)", type: "text", maxLength: 128 },
      {
        column: "frequency",
        label: "Frequency",
        type: "text",
        maxLength: 64,
        hint: "e.g. One-time, Monthly, Annual",
      },
    ],
  },
  "country-faqs": {
    table: "faqs",
    title: "Country FAQs",
    description: "Frequently asked questions on each country guide.",
    titleColumn: "question",
    groupColumn: "scope_id",
    fixed: { scope: "country" },
    match: { scope: "country" },
    fields: [
      { column: "scope_id", label: "Country", type: "country", required: true },
      { column: "question", label: "Question", type: "textarea", required: true },
      { column: "answer", label: "Answer", type: "textarea", required: true },
    ],
  },
  "country-programs": {
    table: "country_programs",
    title: "Country × Program Pages",
    description:
      "Which /study-in-<country>/<program> landing pages exist, with their sitemap priority.",
    titleColumn: "program_id",
    subtitleColumn: "url_alias",
    groupColumn: "country_id",
    fields: [
      { column: "country_id", label: "Country", type: "country", required: true },
      { column: "program_id", label: "Program", type: "program", required: true },
      {
        column: "url_alias",
        label: "URL segment",
        type: "text",
        maxLength: 64,
        hint: "Optional, e.g. 'masters' for MS. Leave empty to use the program id.",
      },
      {
        column: "seo_priority",
        label: "Sitemap priority (0 - 1)",
        type: "number",
        hint: "e.g. 0.9",
      },
    ],
  },
  "test-prep-faqs": {
    table: "faqs",
    title: "Test Prep FAQs",
    description: "Questions shown on the test prep hub.",
    titleColumn: "question",
    fixed: { scope: "test_prep" },
    match: { scope: "test_prep" },
    fields: [
      { column: "question", label: "Question", type: "textarea", required: true },
      { column: "answer", label: "Answer", type: "textarea", required: true },
    ],
  },
  testimonials: {
    table: "testimonials",
    title: "Testimonials",
    description: "Student stories shown on the home page.",
    titleColumn: "student_name",
    subtitleColumn: "headline",
    fields: [
      { column: "student_name", label: "Student name", type: "text", required: true, maxLength: 128 },
      {
        column: "headline",
        label: "Headline",
        type: "text",
        maxLength: 255,
        hint: "e.g. MS in Computer Science · Admitted to TU Munich",
      },
      { column: "quote", label: "Quote", type: "textarea", required: true },
      { column: "photo_url", label: "Photo URL", type: "text" },
    ],
  },
  "trust-badges": {
    table: "trust_badges",
    title: "Trust Badges",
    description: "Credentials shown in the strip above the footer.",
    titleColumn: "title",
    subtitleColumn: "description",
    fields: [
      { column: "title", label: "Title", type: "text", required: true, maxLength: 128 },
      { column: "description", label: "Description", type: "textarea" },
    ],
  },
  "wallet-packs": {
    table: "b2b_wallet_packs",
    title: "B2B Wallet Packs",
    description: "Top-up packs offered on the partner sign-up page.",
    titleColumn: "label",
    subtitleColumn: "amount_inr",
    fields: [
      { column: "label", label: "Pack name", type: "text", required: true, maxLength: 128 },
      { column: "amount_inr", label: "Amount (INR)", type: "number", required: true },
      { column: "perk", label: "Perk", type: "text", maxLength: 255 },
    ],
  },
  "ai-questions": {
    table: "ai_suggested_questions",
    title: "AI Counsellor Questions",
    description: "Starter questions shown in the AI counsellor.",
    titleColumn: "question",
    subtitleColumn: "category",
    groupColumn: "category",
    fields: [
      { column: "category", label: "Category", type: "text", required: true, maxLength: 128 },
      { column: "question", label: "Question", type: "textarea", required: true },
    ],
  },
  "listing-plans": {
    table: "university_listing_plans",
    title: "University Listing Plans",
    description: "Paid listing plans shown in the university portal's upgrade tab.",
    titleColumn: "name",
    subtitleColumn: "price_inr",
    fields: [
      { column: "name", label: "Plan name", type: "text", required: true, maxLength: 128 },
      { column: "tagline", label: "Tagline", type: "text", maxLength: 255 },
      { column: "price_inr", label: "Price (INR)", type: "number" },
      { column: "price_usd", label: "Price (USD)", type: "number" },
      { column: "billing_period", label: "Billing period", type: "text", maxLength: 32, hint: "e.g. year" },
      { column: "features", label: "Features", type: "textarea", hint: "One feature per line." },
    ],
  },
  "site-settings": {
    table: "site_settings",
    title: "Site Settings",
    description:
      "Company and contact details, and single values such as the B2B cost per lead.",
    titleColumn: "label",
    subtitleColumn: "value",
    fields: [
      {
        column: "key",
        label: "Key",
        type: "text",
        required: true,
        maxLength: 64,
        hint: "Used by the code, e.g. contact_email. Don't change existing keys.",
      },
      { column: "label", label: "Label", type: "text", required: true, maxLength: 128 },
      { column: "value", label: "Value", type: "textarea" },
    ],
  },
} satisfies Record<string, ContentTableConfig>;

export type ContentTableKey = keyof typeof CONTENT_TABLES;

export function getContentTable(key: string): ContentTableConfig | null {
  return (CONTENT_TABLES as Record<string, ContentTableConfig>)[key] ?? null;
}

/**
 * Validates an admin form body against the table's fields and returns the
 * row to write (snake_case), or an error message.
 */
export function toContentRow(
  config: ContentTableConfig,
  body: Record<string, unknown>,
): { row: Record<string, unknown> } | { error: string } {
  const row: Record<string, unknown> = { ...(config.fixed ?? {}) };

  for (const field of config.fields) {
    const raw = body[field.column];
    let value: unknown = null;

    if (field.type === "boolean") {
      value = raw === true;
    } else if (field.type === "number") {
      if (raw !== null && raw !== undefined && String(raw).trim() !== "") {
        const num = Number(raw);
        if (Number.isNaN(num)) return { error: `${field.label} must be a number` };
        value = num;
      }
    } else if (raw !== null && raw !== undefined) {
      const text = String(raw).trim();
      if (field.maxLength && text.length > field.maxLength) {
        return { error: `${field.label} must be at most ${field.maxLength} characters` };
      }
      value = text === "" ? null : text;
      if (
        value !== null &&
        field.type === "select" &&
        !field.options?.some((o) => o.value === value)
      ) {
        return { error: `${field.label} has an invalid value` };
      }
    }

    if (field.required && (value === null || value === "")) {
      return { error: `${field.label} is required` };
    }
    row[field.column] = value;
  }

  const sortOrder = Number(body.sort_order ?? 0);
  row.sort_order = Number.isFinite(sortOrder) ? Math.trunc(sortOrder) : 0;
  row.is_active = body.is_active !== false;
  return { row };
}
