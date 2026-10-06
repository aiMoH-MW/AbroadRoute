-- ============================================================
-- 0012: Paper format (blueprint) per exam for the online test module.
--
-- paper_blueprint is an ordered JSON array of question groups:
-- [{
--   "id": "…",                       -- client id
--   "title": "Answer the following",
--   "instructions": "Attempt any 4" | null,
--   "sectionId": "<test_prep_sections.id>" | null,   -- null = any section
--   "questionType": "mcq" | "true_false" | "fill_blank" | "short_answer" | "long_answer",
--   "items": [{ "marks": 2, "difficulty": "easy" | "medium" | "hard" | "any" }, …]  -- sub-questions
-- }]
-- An empty array keeps the old behaviour (random questions_per_paper questions).
-- ============================================================

ALTER TABLE public.test_module_settings
    ADD COLUMN IF NOT EXISTS paper_blueprint JSONB NOT NULL DEFAULT '[]'::jsonb;

NOTIFY pgrst, 'reload schema';
