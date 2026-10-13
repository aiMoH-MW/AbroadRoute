-- ============================================================
-- 0023: Lock private tables to the server.
--
-- The public (anon / publishable) key ships in every browser, and with it
-- anyone could read leads (student names, emails, phones), buyers, wallets,
-- university claims, shortlists and AI data, because these tables had row
-- level security off or policies open to anon.
--
-- The app reads and writes all of these only through server API routes
-- that use the service role (which bypasses RLS) and check the signed-in
-- user. So: enable RLS, drop every existing policy on these tables, and
-- allow only the service role. Public catalog tables (countries,
-- universities, programs, cities, ...) are not touched.
-- ============================================================

DO $$
DECLARE
    t TEXT;
    p RECORD;
BEGIN
    FOREACH t IN ARRAY ARRAY[
        'leads', 'buyers', 'wallet_accounts', 'wallet_transactions',
        'lead_deliveries', 'wallet_topup_requests', 'university_claims',
        'counsellor_conversations', 'student_shortlists',
        'ai_conversations', 'ai_messages', 'rag_embeddings',
        'ai_counsellor_kb', 'search_logs', 'test_settings',
        'study_materials', 'study_questions', 'question_extraction_runs'
    ] LOOP
        -- Skip tables that don't exist in this project
        IF to_regclass('public.' || t) IS NULL THEN
            CONTINUE;
        END IF;

        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);

        FOR p IN
            SELECT policyname FROM pg_policies
            WHERE schemaname = 'public' AND tablename = t
        LOOP
            EXECUTE format('DROP POLICY %I ON public.%I', p.policyname, t);
        END LOOP;

        EXECUTE format(
            'CREATE POLICY "Service Role Full Access" ON public.%I FOR ALL TO service_role USING (true) WITH CHECK (true)',
            t
        );
    END LOOP;
END $$;

NOTIFY pgrst, 'reload schema';
