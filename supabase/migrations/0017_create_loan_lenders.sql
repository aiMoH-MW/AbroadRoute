-- ============================================================
-- 0017: Education loan lenders shown on the Loan Calculator.
--
-- Figures change often, so each row records the official page it was
-- checked against (website_url) and when (last_verified_on).
-- max_unsecured_inr: largest loan without collateral (0 = collateral always
-- needed, NULL = not stated). Amounts are INR; currency is the currency the
-- loan itself is given in (e.g. 'USD' for international lenders).
-- ============================================================

CREATE TABLE IF NOT EXISTS public.loan_lenders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(128) NOT NULL,
    lender_type VARCHAR(16) NOT NULL
        CHECK (lender_type IN ('public_bank', 'private_bank', 'nbfc', 'international')),
    currency CHAR(3) NOT NULL DEFAULT 'INR',
    rate_min NUMERIC(5, 2) CHECK (rate_min >= 0),   -- % p.a.
    rate_max NUMERIC(5, 2) CHECK (rate_max >= 0),
    rate_note VARCHAR(128),                         -- e.g. 'Variable, SOFR-linked'
    max_amount_inr BIGINT CHECK (max_amount_inr >= 0),
    max_unsecured_inr BIGINT CHECK (max_unsecured_inr >= 0),
    moratorium_note VARCHAR(128),                   -- e.g. 'Course + 6 months'
    processing_fee_note VARCHAR(128),
    website_url TEXT,
    last_verified_on DATE,
    notes TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CHECK (rate_min IS NULL OR rate_max IS NULL OR rate_min <= rate_max)
);

ALTER TABLE public.loan_lenders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Read Access for Loan Lenders" ON public.loan_lenders;
CREATE POLICY "Public Read Access for Loan Lenders" ON public.loan_lenders
    FOR SELECT TO public USING (is_active);

DROP POLICY IF EXISTS "Service Role Full Access" ON public.loan_lenders;
CREATE POLICY "Service Role Full Access" ON public.loan_lenders
    FOR ALL TO service_role USING (true) WITH CHECK (true);

NOTIFY pgrst, 'reload schema';
