-- ============================================================
-- 0015: Application deadlines shown by the Deadline Tracker.
--
-- One row per deadline. university_id NULL = applies to every university in
-- the country (e.g. UCAS, uni-assist); program_id NULL = every program.
-- deadline_type separates application rounds from scholarship, document,
-- deposit and visa cutoffs. is_rolling marks rolling admissions, where
-- deadline_date is the final date but earlier is better.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.application_deadlines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    country_id VARCHAR(32) NOT NULL REFERENCES public.countries(id) ON DELETE CASCADE,
    university_id UUID REFERENCES public.universities(id) ON DELETE CASCADE,
    program_id VARCHAR(32) REFERENCES public.programs(id) ON DELETE CASCADE,
    intake_term VARCHAR(32) NOT NULL,        -- e.g. 'Fall', 'Spring', 'Winter', 'February'
    intake_year SMALLINT NOT NULL,           -- e.g. 2027
    intake_start_date DATE,                  -- classes begin
    deadline_type VARCHAR(16) NOT NULL DEFAULT 'application'
        CHECK (deadline_type IN ('application', 'scholarship', 'documents', 'deposit', 'visa')),
    round_name VARCHAR(64),                  -- e.g. 'Round 1', 'Priority', 'Early Decision'
    applications_open_date DATE,
    deadline_date DATE NOT NULL,
    is_rolling BOOLEAN NOT NULL DEFAULT FALSE,
    source_url TEXT,                         -- official page the date was taken from
    notes TEXT,                              -- e.g. '18:00 UK time'
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_application_deadlines_country_id
    ON public.application_deadlines(country_id);
CREATE INDEX IF NOT EXISTS idx_application_deadlines_university_id
    ON public.application_deadlines(university_id);
CREATE INDEX IF NOT EXISTS idx_application_deadlines_deadline_date
    ON public.application_deadlines(deadline_date);

ALTER TABLE public.application_deadlines ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Read Access for Application Deadlines" ON public.application_deadlines;
CREATE POLICY "Public Read Access for Application Deadlines" ON public.application_deadlines
    FOR SELECT TO public USING (is_active);

DROP POLICY IF EXISTS "Service Role Full Access" ON public.application_deadlines;
CREATE POLICY "Service Role Full Access" ON public.application_deadlines
    FOR ALL TO service_role USING (true) WITH CHECK (true);

NOTIFY pgrst, 'reload schema';
