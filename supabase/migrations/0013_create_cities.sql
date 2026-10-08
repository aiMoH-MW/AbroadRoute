-- ============================================================
-- 0013: Cities (the city a university is located in, with typical
-- monthly student living costs) and a yearly education cost per program.
-- Both are used by the cost calculator.
--
-- Mirrors the tables as created in Supabase. All costs are in INR; NULL
-- means "not set" and the calculator falls back to built-in estimates.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.cities (
    id VARCHAR(128) PRIMARY KEY,                -- slug-style, e.g. 'melbourne'
    country_id VARCHAR(32) NOT NULL REFERENCES public.countries(id),
    name VARCHAR(128) NOT NULL,
    state_region VARCHAR(128),
    overview TEXT,
    avg_living_cost_inr VARCHAR(64),
    image_url TEXT,
    monthly_accommodation_cost INTEGER,         -- INR / month
    monthly_food_groceries_cost INTEGER,        -- INR / month
    monthly_public_transport_cost INTEGER,      -- INR / month
    miscellaneous INTEGER,                      -- INR / month
    cost_buffer_percentage INTEGER,             -- % on top of living costs for emergencies
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cities_country_id ON public.cities(country_id);

ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Read Access for Cities" ON public.cities;
CREATE POLICY "Public Read Access for Cities" ON public.cities
    FOR SELECT TO public USING (true);

-- Yearly education cost per program (INR / year)
ALTER TABLE public.programs
    ADD COLUMN IF NOT EXISTS yearly_educational_cost INTEGER;

NOTIFY pgrst, 'reload schema';
