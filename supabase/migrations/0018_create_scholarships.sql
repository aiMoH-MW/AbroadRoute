-- ============================================================
-- 0018: Scholarships shown by the Scholarship Finder.
--
-- country_id NULL = several countries; destination_label then names them
-- (e.g. 'European Union'). university_id set = offered by one university.
-- Empty arrays = no restriction (every study level / social category).
-- deadline NULL = no single date; deadline_note explains (e.g. 'Varies by
-- programme'). award_value + award_currency + award_period let the finder
-- show the award in INR.
--
-- Seeded with the six scholarships the finder showed before this table,
-- as hidden drafts (is_active = false, last_verified_on NULL): check each
-- against its official page, then publish it from the admin panel.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.scholarships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    provider VARCHAR(255),
    country_id VARCHAR(32) REFERENCES public.countries(id) ON DELETE SET NULL,
    destination_label VARCHAR(64),
    university_id UUID REFERENCES public.universities(id) ON DELETE CASCADE,
    funding_type VARCHAR(16) NOT NULL DEFAULT 'scholarship'
        CHECK (funding_type IN ('scholarship', 'fellowship', 'grant', 'tuition_waiver', 'loan_scholarship')),
    coverage VARCHAR(16) NOT NULL DEFAULT 'partial'
        CHECK (coverage IN ('full', 'partial', 'tuition', 'stipend')),
    award_summary VARCHAR(255),              -- e.g. '€934/month + health insurance'
    award_value NUMERIC(14, 2) CHECK (award_value >= 0),
    award_currency CHAR(3),
    award_period VARCHAR(8) CHECK (award_period IN ('month', 'year', 'total')),
    study_levels VARCHAR(16)[] NOT NULL DEFAULT '{}',      -- 'bachelors' | 'masters' | 'phd' | 'diploma'
    fields VARCHAR(255),                     -- e.g. 'STEM, Public Policy'
    min_work_experience_months SMALLINT CHECK (min_work_experience_months >= 0),
    women_only BOOLEAN NOT NULL DEFAULT FALSE,
    social_categories VARCHAR(16)[] NOT NULL DEFAULT '{}', -- 'sc' | 'st' | 'obc' | 'ews' | 'minority'
    need_based BOOLEAN NOT NULL DEFAULT FALSE,
    eligibility_note TEXT,
    overview TEXT,
    opens_on DATE,
    deadline DATE,
    deadline_note VARCHAR(128),
    website_url TEXT,
    last_verified_on DATE,
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CHECK (opens_on IS NULL OR deadline IS NULL OR opens_on <= deadline)
);

CREATE INDEX IF NOT EXISTS idx_scholarships_country_id
    ON public.scholarships(country_id);
CREATE INDEX IF NOT EXISTS idx_scholarships_deadline
    ON public.scholarships(deadline);

ALTER TABLE public.scholarships ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Read Access for Scholarships" ON public.scholarships;
CREATE POLICY "Public Read Access for Scholarships" ON public.scholarships
    FOR SELECT TO public USING (is_active);

DROP POLICY IF EXISTS "Service Role Full Access" ON public.scholarships;
CREATE POLICY "Service Role Full Access" ON public.scholarships
    FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Hidden drafts (only when the table is empty, so re-running is safe).
-- country_id is set only where that country exists in public.countries.
INSERT INTO public.scholarships (
    name, provider, country_id, destination_label, funding_type, coverage,
    award_summary, award_value, award_currency, award_period,
    study_levels, fields, min_work_experience_months, women_only, need_based,
    eligibility_note, overview, deadline_note, sort_order, is_active
)
SELECT v.name, v.provider,
       (SELECT c.id FROM public.countries c WHERE c.id = v.country_id),
       v.destination_label, v.funding_type, v.coverage,
       v.award_summary, v.award_value, v.award_currency, v.award_period,
       v.study_levels, v.fields, v.min_work_experience_months, v.women_only,
       v.need_based, v.eligibility_note, v.overview, v.deadline_note,
       v.sort_order, FALSE
FROM (VALUES
    ('DAAD Study Scholarships for Foreign Graduates',
        'German Academic Exchange Service (DAAD)', 'germany', NULL::VARCHAR,
        'scholarship', 'full', '€934/month + health insurance + travel allowance',
        934::NUMERIC, 'EUR', 'month', ARRAY['masters']::VARCHAR[], 'STEM, Architecture',
        NULL::SMALLINT, FALSE, FALSE,
        'High academic achievement; some development-focused programmes need work experience.',
        'Monthly stipend, insurance and travel allowance for international postgraduate students in Germany. Some development-focused programmes pay €992/month.',
        'Varies by programme', 10),
    ('Chevening UK Government Scholarships',
        'UK Foreign, Commonwealth & Development Office (FCDO)', 'uk', NULL,
        'scholarship', 'full', '100% tuition + living stipend + return flights',
        NULL, NULL, NULL, ARRAY['masters']::VARCHAR[], 'Any (1-year master''s)',
        24, FALSE, FALSE,
        'At least 2,800 hours (about 2 years) of work experience after your degree; must return to India for 2 years after the award.',
        'Fully funded 1-year master''s at any UK university.',
        'Check official page for the next round', 20),
    ('Fulbright-Nehru Master''s Fellowships',
        'US-India Educational Foundation (USIEF)', 'usa', NULL,
        'fellowship', 'full', 'Tuition + living costs + airfare + J-1 visa + health cover',
        NULL, NULL, NULL, ARRAY['masters']::VARCHAR[], 'Restricted list of fields',
        36, FALSE, FALSE,
        'At least 3 years of full-time paid work experience after your bachelor''s.',
        'For Indian professionals pursuing a master''s degree in the United States.',
        'Check official page for the next round', 30),
    ('Erasmus Mundus Joint Masters Scholarship',
        'European Commission', NULL, 'European Union',
        'scholarship', 'full', '€1,000–1,400/month + full tuition + travel',
        1400, 'EUR', 'month', ARRAY['masters']::VARCHAR[], 'Varies by programme',
        NULL, FALSE, FALSE, NULL,
        'Study in at least two European countries with tuition, travel and a monthly allowance paid. The allowance and deadline depend on the programme.',
        'Varies by programme', 40),
    ('British Council Scholarships for Women in STEM',
        'British Council', 'uk', NULL,
        'scholarship', 'full', 'Full tuition + £1,236–1,731/month stipend + flights + visa fees',
        NULL, NULL, NULL, ARRAY['masters']::VARCHAR[], 'STEM',
        NULL, TRUE, FALSE,
        'Women STEM graduates who are permanent residents of India.',
        'Fully funded master''s at UK universities.',
        'Check official page for the next round', 50),
    ('Italy Regional DSU Need-Based Grant',
        'Italian Regional Governments', 'italy', NULL,
        'grant', 'stipend', 'Up to €6,806/year + free housing + tuition waiver',
        6806, 'EUR', 'year', ARRAY['bachelors', 'masters']::VARCHAR[], 'Any',
        NULL, FALSE, TRUE,
        'Family income (ISEE) under roughly €26,900–27,900 depending on the region; families outside Italy need an ISEE parificato.',
        'Need-based regional grant at Italian public universities.',
        'Varies by region', 60)
) AS v(name, provider, country_id, destination_label, funding_type, coverage,
       award_summary, award_value, award_currency, award_period,
       study_levels, fields, min_work_experience_months, women_only, need_based,
       eligibility_note, overview, deadline_note, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM public.scholarships);

NOTIFY pgrst, 'reload schema';
