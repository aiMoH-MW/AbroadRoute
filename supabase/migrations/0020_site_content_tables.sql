-- ============================================================
-- 0020: Site content that used to be hardcoded in the app.
--
-- Everything the site shows must come from the database ("Not provided"
-- when missing). This adds:
--   * editorial columns on countries (hero subtitle, overview, visa facts,
--     the "anchor" flag that used to be a slug list in code)
--   * country_highlights      "why choose" reasons and trade-offs
--   * country_program_costs   per-program cost table on country pages
--   * country_hidden_costs    one-off / recurring extra costs
--   * country_programs        country x program landing pages (+ SEO priority)
--   * faqs                    FAQs for country pages, the test-prep hub, ...
--   * testimonials            student stories on the home page
--   * trust_badges            footer trust strip
--   * b2b_wallet_packs        wallet top-up packs on the partner page
--   * ai_suggested_questions  starter questions in the AI counsellor
--   * site_settings           company / contact details and single values
--     such as the B2B cost per lead
-- Content is seeded from the old hardcoded values in 0021.
-- ============================================================

-- Countries: editorial + visa columns (NULL = not provided)
ALTER TABLE public.countries
    ADD COLUMN IF NOT EXISTS is_anchor BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS hero_subtitle TEXT,
    ADD COLUMN IF NOT EXISTS overview_heading TEXT,
    ADD COLUMN IF NOT EXISTS overview_body TEXT, -- paragraphs separated by a blank line
    ADD COLUMN IF NOT EXISTS programs_offered_notes TEXT,
    ADD COLUMN IF NOT EXISTS visa_type TEXT,
    ADD COLUMN IF NOT EXISTS visa_processing_time TEXT,
    ADD COLUMN IF NOT EXISTS work_hours_during_term TEXT,
    ADD COLUMN IF NOT EXISTS financial_proof_required TEXT,
    ADD COLUMN IF NOT EXISTS pr_pathway_summary TEXT;

-- Shared trigger-free pattern: every content table has sort_order + is_active
CREATE TABLE IF NOT EXISTS public.country_highlights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    country_id VARCHAR(32) NOT NULL REFERENCES public.countries(id) ON DELETE CASCADE,
    kind VARCHAR(16) NOT NULL CHECK (kind IN ('reason', 'tradeoff')),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_country_highlights_country ON public.country_highlights(country_id);

CREATE TABLE IF NOT EXISTS public.country_program_costs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    country_id VARCHAR(32) NOT NULL REFERENCES public.countries(id) ON DELETE CASCADE,
    program_label VARCHAR(255) NOT NULL, -- e.g. "Master's (MS/MSc - Public)"
    tuition_range_inr VARCHAR(128),
    living_cost_inr VARCHAR(128),
    total_annual_inr VARCHAR(128),
    notes TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_country_program_costs_country ON public.country_program_costs(country_id);

CREATE TABLE IF NOT EXISTS public.country_hidden_costs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    country_id VARCHAR(32) NOT NULL REFERENCES public.countries(id) ON DELETE CASCADE,
    item VARCHAR(255) NOT NULL,
    cost_inr VARCHAR(128),
    frequency VARCHAR(64),
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_country_hidden_costs_country ON public.country_hidden_costs(country_id);

-- Country x program landing pages (/study-in-<country>/<program>)
CREATE TABLE IF NOT EXISTS public.country_programs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    country_id VARCHAR(32) NOT NULL REFERENCES public.countries(id) ON DELETE CASCADE,
    program_id VARCHAR(32) NOT NULL REFERENCES public.programs(id) ON DELETE CASCADE,
    url_alias VARCHAR(64), -- extra URL segment, e.g. 'masters' for 'ms'
    seo_priority NUMERIC(2, 1) CHECK (seo_priority IS NULL OR (seo_priority >= 0 AND seo_priority <= 1)),
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (country_id, program_id)
);

-- FAQs. scope: 'country' (scope_id = countries.id) | 'test_prep' | 'site'
CREATE TABLE IF NOT EXISTS public.faqs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scope VARCHAR(32) NOT NULL,
    scope_id VARCHAR(64),
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_faqs_scope ON public.faqs(scope, scope_id);

CREATE TABLE IF NOT EXISTS public.testimonials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_name VARCHAR(128) NOT NULL,
    headline VARCHAR(255), -- e.g. "MS in Computer Science · Admitted to TU Munich"
    quote TEXT NOT NULL,
    photo_url TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.trust_badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(128) NOT NULL,
    description TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.b2b_wallet_packs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    label VARCHAR(128) NOT NULL,
    amount_inr INTEGER NOT NULL CHECK (amount_inr > 0),
    perk VARCHAR(255),
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.ai_suggested_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category VARCHAR(128) NOT NULL,
    question TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Single values (company name, contact email, cost per lead, ...)
CREATE TABLE IF NOT EXISTS public.site_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key VARCHAR(64) NOT NULL UNIQUE,
    label VARCHAR(128) NOT NULL, -- shown in admin
    value TEXT,                  -- NULL = not provided
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Read access for active rows; writes go through the service role (admin API)
DO $$
DECLARE
    t TEXT;
BEGIN
    FOREACH t IN ARRAY ARRAY[
        'country_highlights', 'country_program_costs', 'country_hidden_costs',
        'country_programs', 'faqs', 'testimonials', 'trust_badges',
        'b2b_wallet_packs', 'ai_suggested_questions', 'site_settings'
    ] LOOP
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
        EXECUTE format('DROP POLICY IF EXISTS "Public read active" ON public.%I', t);
        EXECUTE format(
            'CREATE POLICY "Public read active" ON public.%I FOR SELECT TO public USING (is_active)', t);
        EXECUTE format('DROP POLICY IF EXISTS "Service Role Full Access" ON public.%I', t);
        EXECUTE format(
            'CREATE POLICY "Service Role Full Access" ON public.%I FOR ALL TO service_role USING (true) WITH CHECK (true)', t);
    END LOOP;
END $$;

NOTIFY pgrst, 'reload schema';
