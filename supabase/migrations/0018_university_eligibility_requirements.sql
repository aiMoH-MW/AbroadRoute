-- ============================================================
-- 0018: Admission requirements used by the Eligibility Checker.
--
-- NULL means "not stated"; the checker then estimates from the ranking and
-- says so. min_percentage is the minimum score in the previous
-- qualification (bachelor's for postgraduate study, Class 12 for
-- undergraduate/MBBS), as a percentage. ielts_min_band is the lowest band
-- allowed in any single IELTS section. max_backlogs NULL = no stated limit.
-- Each row records where the requirements were checked
-- (requirements_source_url) and when (requirements_verified_on).
-- ============================================================

ALTER TABLE public.universities
    ADD COLUMN IF NOT EXISTS min_percentage NUMERIC(4, 1)
        CHECK (min_percentage IS NULL OR (min_percentage >= 0 AND min_percentage <= 100)),
    ADD COLUMN IF NOT EXISTS ielts_min_band NUMERIC(2, 1)
        CHECK (ielts_min_band IS NULL OR (ielts_min_band >= 0 AND ielts_min_band <= 9)),
    ADD COLUMN IF NOT EXISTS toefl_min_score SMALLINT
        CHECK (toefl_min_score IS NULL OR (toefl_min_score >= 0 AND toefl_min_score <= 120)),
    ADD COLUMN IF NOT EXISTS pte_min_score SMALLINT
        CHECK (pte_min_score IS NULL OR (pte_min_score >= 10 AND pte_min_score <= 90)),
    ADD COLUMN IF NOT EXISTS duolingo_min_score SMALLINT
        CHECK (duolingo_min_score IS NULL OR (duolingo_min_score >= 10 AND duolingo_min_score <= 160)),
    ADD COLUMN IF NOT EXISTS aps_required BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS four_year_degree_required BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS max_backlogs SMALLINT
        CHECK (max_backlogs IS NULL OR max_backlogs >= 0),
    ADD COLUMN IF NOT EXISTS requirements_source_url TEXT,
    ADD COLUMN IF NOT EXISTS requirements_verified_on DATE;

-- Germany: APS certificate is mandatory for Indian applicants
UPDATE public.universities SET aps_required = TRUE WHERE country_id = 'germany';

-- UK: Graduate visa is 18 months for applications from 1 Jan 2027 (PhD: 3 years)
UPDATE public.universities SET post_study_work_months = 18 WHERE country_id = 'uk';

-- Australia: 485 visa, master's by coursework, incl. the extra year for
-- Indian passport holders under AI-ECTA
UPDATE public.universities SET post_study_work_months = 36 WHERE country_id = 'australia';

-- QS World University Rankings 2027 (published June 2026)
UPDATE public.universities SET ranking_global = 2   WHERE slug = 'stanford-university';
UPDATE public.universities SET ranking_global = 25  WHERE slug = 'technical-university-of-munich';
UPDATE public.universities SET ranking_global = 31  WHERE slug = 'monash-university';
UPDATE public.universities SET ranking_global = 32  WHERE slug = 'university-of-toronto';
UPDATE public.universities SET ranking_global = 40  WHERE slug = 'university-of-manchester';
UPDATE public.universities SET ranking_global = 104 WHERE slug = 'rwth-aachen-university';
UPDATE public.universities SET ranking_global = 173 WHERE slug = 'arizona-state-university';

-- Stanford: GRE not required (CS/EE); IELTS 7 or TOEFL 90 university-wide minimum
UPDATE public.universities SET
    gre_gmat_required = FALSE,
    ielts_min_score = 7.0,
    toefl_min_score = 90,
    requirements_source_url = 'https://www.cs.stanford.edu/admissions/graduate-application-checklists',
    requirements_verified_on = DATE '2026-10-09'
WHERE slug = 'stanford-university';

-- University of Toronto (SGS): IELTS 7.0 with 6.5 in each section, or TOEFL
-- iBT 93 (22 in Writing and Speaking);
-- four-year bachelor's with a mid-B final-year average
UPDATE public.universities SET
    ielts_min_score = 7.0,
    ielts_min_band = 6.5,
    toefl_min_score = 93,
    four_year_degree_required = TRUE,
    requirements_source_url = 'https://www.sgs.utoronto.ca/future-students/admission-application-requirements/english-language-proficiency-testing/',
    requirements_verified_on = DATE '2026-10-09'
WHERE slug = 'university-of-toronto';

-- TUM: non-EU tuition since WS 2024/25 (EUR 4,000-6,000 per semester for
-- most master's; a few programs remain free). Rises to EUR 4,600-6,800 per
-- semester from WS 2027/28.
UPDATE public.universities SET
    tuition_fee_range_inr = '₹8 - 13 Lakhs / yr (some programs tuition-free)',
    requirements_source_url = 'https://www.tum.de/en/studies/fees/tuition',
    requirements_verified_on = DATE '2026-10-09'
WHERE slug = 'technical-university-of-munich';

-- Tashkent Medical Academy merged into Tashkent State Medical University
-- (2025/26). Slug kept so existing links keep working.
UPDATE public.universities SET
    name = 'Tashkent State Medical University (formerly Tashkent Medical Academy)'
WHERE slug = 'tashkent-medical-academy';

NOTIFY pgrst, 'reload schema';
