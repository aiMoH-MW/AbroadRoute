-- ============================================================
-- 0022: Real data for the B2B buyer portal and the university portal.
--
--  * buyers: linked to their auth user, onboarding details and targeting
--  * lead_deliveries: each buyer's handling of a purchased lead
--    (status, notes, disputes)
--  * wallet_topup_requests: buyers request credit; an admin confirms the
--    payment and approves (there is no payment gateway)
--  * leads.university_id: inquiries made from a university's page, so the
--    university portal can show that university its own inquiries
--  * purchase_lead / credit_wallet: atomic wallet operations
-- ============================================================

-- Buyers ------------------------------------------------------
ALTER TABLE public.buyers
    ADD COLUMN IF NOT EXISTS user_id UUID UNIQUE,
    ADD COLUMN IF NOT EXISTS gstin VARCHAR(15),
    ADD COLUMN IF NOT EXISTS pan VARCHAR(10),
    ADD COLUMN IF NOT EXISTS city VARCHAR(128),
    ADD COLUMN IF NOT EXISTS state VARCHAR(128),
    ADD COLUMN IF NOT EXISTS years_in_business VARCHAR(32),
    ADD COLUMN IF NOT EXISTS annual_student_volume VARCHAR(32),
    ADD COLUMN IF NOT EXISTS min_lead_score INTEGER CHECK (min_lead_score IS NULL OR (min_lead_score BETWEEN 0 AND 100)),
    ADD COLUMN IF NOT EXISTS daily_lead_cap INTEGER CHECK (daily_lead_cap IS NULL OR daily_lead_cap > 0),
    ADD COLUMN IF NOT EXISTS auto_unlock BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS operating_hours VARCHAR(64),
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Purchased leads: the buyer's own pipeline -------------------
ALTER TABLE public.lead_deliveries
    ADD COLUMN IF NOT EXISTS status VARCHAR(16) NOT NULL DEFAULT 'unread'
        CHECK (status IN ('unread', 'contacted', 'converted', 'disputed')),
    ADD COLUMN IF NOT EXISTS notes JSONB NOT NULL DEFAULT '[]'::jsonb, -- [{text, author, at}]
    ADD COLUMN IF NOT EXISTS dispute_reason TEXT,
    ADD COLUMN IF NOT EXISTS dispute_status VARCHAR(16)
        CHECK (dispute_status IS NULL OR dispute_status IN ('under_review', 'approved', 'rejected')),
    ADD COLUMN IF NOT EXISTS disputed_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS dispute_reviewed_at TIMESTAMPTZ;

CREATE UNIQUE INDEX IF NOT EXISTS idx_lead_deliveries_lead_buyer
    ON public.lead_deliveries(lead_id, buyer_id);
CREATE INDEX IF NOT EXISTS idx_lead_deliveries_buyer ON public.lead_deliveries(buyer_id);

-- Wallet top-up requests --------------------------------------
CREATE TABLE IF NOT EXISTS public.wallet_topup_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    buyer_id UUID NOT NULL REFERENCES public.buyers(id) ON DELETE CASCADE,
    amount_inr NUMERIC(12, 2) NOT NULL CHECK (amount_inr > 0),
    payment_reference TEXT, -- bank transfer / UPI reference given by the buyer
    status VARCHAR(16) NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'approved', 'rejected')),
    admin_note TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    reviewed_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_wallet_topup_requests_buyer ON public.wallet_topup_requests(buyer_id);

ALTER TABLE public.wallet_topup_requests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service Role Full Access" ON public.wallet_topup_requests;
CREATE POLICY "Service Role Full Access" ON public.wallet_topup_requests
    FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Leads made from a university page --------------------------
ALTER TABLE public.leads
    ADD COLUMN IF NOT EXISTS university_id UUID REFERENCES public.universities(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_leads_university ON public.leads(university_id);

-- How the university is handling an inquiry made from its page
ALTER TABLE public.leads
    ADD COLUMN IF NOT EXISTS university_status VARCHAR(16)
        CHECK (university_status IS NULL OR university_status IN ('new', 'reviewing', 'shortlisted', 'contacted'));

-- University listing plans (upgrade tab of the university portal) -----
CREATE TABLE IF NOT EXISTS public.university_listing_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(128) NOT NULL,
    tagline VARCHAR(255),
    price_inr INTEGER CHECK (price_inr IS NULL OR price_inr >= 0),
    price_usd INTEGER CHECK (price_usd IS NULL OR price_usd >= 0),
    billing_period VARCHAR(32), -- e.g. 'year'
    features TEXT,              -- one feature per line
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.university_listing_plans ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read active" ON public.university_listing_plans;
CREATE POLICY "Public read active" ON public.university_listing_plans
    FOR SELECT TO public USING (is_active);
DROP POLICY IF EXISTS "Service Role Full Access" ON public.university_listing_plans;
CREATE POLICY "Service Role Full Access" ON public.university_listing_plans
    FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Seeded from the prices that were hardcoded in the portal (REVIEW in admin)
INSERT INTO public.university_listing_plans (name, tagline, price_inr, price_usd, billing_period, features, sort_order)
SELECT v.name, v.tagline, v.price_inr, v.price_usd, 'year', v.features, v.sort_order
FROM (VALUES
    ('Silver Partner', 'Priority search badge & direct applicant inquiries.', 25000, 299,
     E'Verified Institution Blue Badge
Up to 10 published programs
Direct Indian student inquiries', 0),
    ('Gold Partner', 'Top 3 Destination Spotlight and 2x inquiry velocity.', 60000, 699,
     E'Top 3 Destination Spotlight
Unlimited program listings
Competitor benchmark analytics
1-Click student WhatsApp/Email', 1),
    ('Platinum Spotlight', '#1 Homepage & Destination Hub Spotlight with dedicated webinars.', 120000, 1399,
     E'#1 Hub Banner Placement
Dedicated India Webinar (50k+ reach)
Dedicated Account Manager
0% commission on direct apps', 2)
) AS v(name, tagline, price_inr, price_usd, features, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM public.university_listing_plans p WHERE p.name = v.name);

-- Atomic wallet operations ------------------------------------

-- Buys a lead for a buyer: checks the lead is still available (at most
-- p_max_buyers buyers per lead), debits the wallet and records the
-- delivery and the transaction. Raises an exception on any failure.
CREATE OR REPLACE FUNCTION public.purchase_lead(
    p_buyer_id UUID,
    p_lead_id UUID,
    p_price_inr NUMERIC,
    p_max_buyers INTEGER
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_wallet wallet_accounts%ROWTYPE;
    v_delivery_id UUID;
    v_taken INTEGER;
BEGIN
    IF p_price_inr IS NULL OR p_price_inr <= 0 THEN
        RAISE EXCEPTION 'Lead price is not set';
    END IF;

    SELECT * INTO v_wallet FROM wallet_accounts WHERE buyer_id = p_buyer_id FOR UPDATE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Wallet not found';
    END IF;
    IF v_wallet.balance_inr < p_price_inr THEN
        RAISE EXCEPTION 'Insufficient wallet balance';
    END IF;

    PERFORM 1 FROM leads WHERE id = p_lead_id FOR UPDATE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Lead not found';
    END IF;
    IF EXISTS (SELECT 1 FROM lead_deliveries WHERE lead_id = p_lead_id AND buyer_id = p_buyer_id) THEN
        RAISE EXCEPTION 'Lead already purchased';
    END IF;
    SELECT COUNT(*) INTO v_taken FROM lead_deliveries WHERE lead_id = p_lead_id;
    IF p_max_buyers IS NOT NULL AND v_taken >= p_max_buyers THEN
        RAISE EXCEPTION 'Lead is no longer available';
    END IF;

    UPDATE wallet_accounts
       SET balance_inr = balance_inr - p_price_inr, updated_at = NOW()
     WHERE id = v_wallet.id;

    INSERT INTO lead_deliveries (lead_id, buyer_id, price_charged_inr, delivery_type)
    VALUES (
        p_lead_id, p_buyer_id, p_price_inr,
        CASE WHEN p_max_buyers = 1 THEN 'exclusive'::delivery_type ELSE 'shared_3x'::delivery_type END
    )
    RETURNING id INTO v_delivery_id;

    INSERT INTO wallet_transactions (wallet_id, amount_inr, type, description)
    VALUES (v_wallet.id, p_price_inr, 'lead_purchase', 'Lead purchase ' || p_lead_id::text);

    UPDATE leads SET status = 'delivered', updated_at = NOW() WHERE id = p_lead_id;

    RETURN v_delivery_id;
END;
$$;

-- Credits a buyer's wallet (approved top-up or dispute refund) and records it.
CREATE OR REPLACE FUNCTION public.credit_wallet(
    p_buyer_id UUID,
    p_amount_inr NUMERIC,
    p_type transaction_type,
    p_description TEXT,
    p_reference TEXT DEFAULT NULL
) RETURNS NUMERIC
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_wallet_id UUID;
    v_balance NUMERIC;
BEGIN
    IF p_amount_inr IS NULL OR p_amount_inr <= 0 THEN
        RAISE EXCEPTION 'Amount must be positive';
    END IF;

    INSERT INTO wallet_accounts (buyer_id, balance_inr)
    VALUES (p_buyer_id, 0)
    ON CONFLICT (buyer_id) DO NOTHING;

    UPDATE wallet_accounts
       SET balance_inr = balance_inr + p_amount_inr, updated_at = NOW()
     WHERE buyer_id = p_buyer_id
    RETURNING id, balance_inr INTO v_wallet_id, v_balance;

    INSERT INTO wallet_transactions (wallet_id, amount_inr, type, description, razorpay_payment_id)
    VALUES (v_wallet_id, p_amount_inr, p_type, p_description, p_reference);

    RETURN v_balance;
END;
$$;

REVOKE ALL ON FUNCTION public.purchase_lead(UUID, UUID, NUMERIC, INTEGER) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.credit_wallet(UUID, NUMERIC, transaction_type, TEXT, TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.purchase_lead(UUID, UUID, NUMERIC, INTEGER) TO service_role;
GRANT EXECUTE ON FUNCTION public.credit_wallet(UUID, NUMERIC, transaction_type, TEXT, TEXT) TO service_role;

-- Business rule used by purchase_lead (was hardcoded in the portal copy)
INSERT INTO public.site_settings (key, label, value, sort_order)
VALUES ('b2b_max_buyers_per_lead', 'B2B: max buyers per shared lead', '3', 20)
ON CONFLICT (key) DO NOTHING;

NOTIFY pgrst, 'reload schema';
