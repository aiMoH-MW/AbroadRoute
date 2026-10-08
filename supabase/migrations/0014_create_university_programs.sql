-- ============================================================
-- 0014: Programs offered by each university.
--
-- One row per (university, program). yearly_tuition_inr and duration are
-- optional per-university overrides; NULL means "use the program's default"
-- (programs.yearly_educational_cost / programs.duration).
--
-- universities.programs_offered is kept in sync by the admin API so existing
-- reads keep working. Rows are back-filled from that array.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.university_programs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    university_id UUID NOT NULL REFERENCES public.universities(id) ON DELETE CASCADE,
    program_id VARCHAR(32) NOT NULL REFERENCES public.programs(id) ON DELETE CASCADE,
    yearly_tuition_inr INTEGER,      -- INR / year at this university
    duration VARCHAR(32),            -- e.g. '2 Years'
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (university_id, program_id)
);

CREATE INDEX IF NOT EXISTS idx_university_programs_university_id
    ON public.university_programs(university_id);
CREATE INDEX IF NOT EXISTS idx_university_programs_program_id
    ON public.university_programs(program_id);

ALTER TABLE public.university_programs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Read Access for University Programs" ON public.university_programs;
CREATE POLICY "Public Read Access for University Programs" ON public.university_programs
    FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Service Role Full Access" ON public.university_programs;
CREATE POLICY "Service Role Full Access" ON public.university_programs
    FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Back-fill from the existing programs_offered arrays
INSERT INTO public.university_programs (university_id, program_id)
SELECT u.id, p.id
FROM public.universities u
CROSS JOIN LATERAL unnest(u.programs_offered) AS offered(slug)
JOIN public.programs p ON p.slug::text = offered.slug::text
ON CONFLICT (university_id, program_id) DO NOTHING;

NOTIFY pgrst, 'reload schema';
