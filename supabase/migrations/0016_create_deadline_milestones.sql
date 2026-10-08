-- ============================================================
-- 0016: Countdown milestones shown under a deadline in the
-- Deadline Tracker (e.g. "T-90 Days: Finalize Shortlist").
--
-- A milestone's date is the deadline minus days_before.
-- country_id / deadline_type NULL = applies to every country / type.
-- For a given deadline the most specific matching set is used:
-- country + type, then country, then type, then the general set.
--
-- Seeded with the general plan the tracker showed before this table.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.deadline_milestones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    country_id VARCHAR(32) REFERENCES public.countries(id) ON DELETE CASCADE,
    deadline_type VARCHAR(16)
        CHECK (deadline_type IN ('application', 'scholarship', 'documents', 'deposit', 'visa')),
    days_before SMALLINT NOT NULL CHECK (days_before BETWEEN 0 AND 730),
    title VARCHAR(128) NOT NULL,        -- e.g. 'Finalize Shortlist & Standardized Exams'
    description TEXT,
    action_label VARCHAR(64),           -- e.g. 'University Shortlisting'
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_deadline_milestones_country_id
    ON public.deadline_milestones(country_id);

ALTER TABLE public.deadline_milestones ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Read Access for Deadline Milestones" ON public.deadline_milestones;
CREATE POLICY "Public Read Access for Deadline Milestones" ON public.deadline_milestones
    FOR SELECT TO public USING (is_active);

DROP POLICY IF EXISTS "Service Role Full Access" ON public.deadline_milestones;
CREATE POLICY "Service Role Full Access" ON public.deadline_milestones
    FOR ALL TO service_role USING (true) WITH CHECK (true);

-- General plan (only when the table is empty, so re-running is safe)
INSERT INTO public.deadline_milestones (days_before, title, description, action_label)
SELECT v.days_before, v.title, v.description, v.action_label
FROM (VALUES
    (90, 'Finalize Shortlist & Standardized Exams',
        'Lock down your 5 target universities (Safe, Target, Reach). Take IELTS/TOEFL and GRE/GMAT if needed.',
        'University Shortlisting'),
    (60, 'SOP, LORs & Official Transcripts',
        'Draft customized Statement of Purpose (SOP), collect 2–3 Academic/Work Recommendation letters, and request sealed university transcripts.',
        'Document Packaging'),
    (30, 'Application Submission & Scholarship Portals',
        'Submit main portal applications (Uni-Assist, Common App, UCAS) and apply for university early-bird scholarships.',
        'Portal Submission'),
    (15, 'Document Verification & Referee Verification',
        'Ensure all referees have submitted digital LORs. Check portal checklist for missing documents or APS certificates.',
        'Portal Audit'),
    (7, 'Final Submission Check & Fee Payment',
        'Final review of application fee receipt and admission confirmation notice.',
        'Final Dispatch'),
    (1, 'Portal Closing Deadline',
        'Portal strictly closes at 23:59 target university time zone.',
        'Deadline Closed')
) AS v(days_before, title, description, action_label)
WHERE NOT EXISTS (SELECT 1 FROM public.deadline_milestones);

NOTIFY pgrst, 'reload schema';
