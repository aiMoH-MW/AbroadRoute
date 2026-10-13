-- ============================================================
-- StudyAbroad Vista - Master Database Schema (Supabase PostgreSQL)
-- ============================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "vector";      -- pgvector for Gemini RAG embeddings
CREATE EXTENSION IF NOT EXISTS "pg_trgm";     -- Trigram similarity for fuzzy search

-- 2. Enumerated Types
CREATE TYPE user_role AS ENUM ('student', 'consultant_buyer', 'university_partner', 'admin');
CREATE TYPE program_category AS ENUM ('ms', 'mba', 'emba', 'mbbs', 'bachelors', 'nursing', 'phd', 'ausbildung');
CREATE TYPE lead_status AS ENUM ('raw', 'verified', 'enriched', 'matched', 'delivered', 'converted', 'disputed');
CREATE TYPE delivery_type AS ENUM ('exclusive', 'shared_3x', 'auction_bid');
CREATE TYPE transaction_type AS ENUM ('wallet_topup', 'lead_purchase', 'lead_refund', 'platform_credit');

-- 3. Core Tables

-- Countries Table (19 Destinations)
CREATE TABLE IF NOT EXISTS countries (
    id VARCHAR(32) PRIMARY KEY,
    name VARCHAR(128) NOT NULL,
    slug VARCHAR(128) UNIQUE NOT NULL,
    code CHAR(2) NOT NULL,
    tier VARCHAR(16) NOT NULL, -- 'Tier 1', 'Tier 2', 'Tier 3'
    currency CHAR(3) NOT NULL,
    currency_symbol VARCHAR(8) NOT NULL,
    exchange_rate_inr NUMERIC(10, 4) NOT NULL,
    avg_tuition_inr VARCHAR(64),
    avg_living_cost_inr VARCHAR(64),
    post_study_work_visa VARCHAR(128),
    top_intakes TEXT[],
    hero_tagline TEXT,
    overview TEXT,
    safety_rating NUMERIC(2, 1) DEFAULT 4.5,
    -- Country guide (editorial) + visa facts; NULL = not provided (migration 0020)
    is_anchor BOOLEAN NOT NULL DEFAULT FALSE,
    hero_subtitle TEXT,
    overview_heading TEXT,
    overview_body TEXT, -- paragraphs separated by a blank line
    programs_offered_notes TEXT,
    visa_type TEXT,
    visa_processing_time TEXT,
    work_hours_during_term TEXT,
    financial_proof_required TEXT,
    pr_pathway_summary TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Programs Table (8 Disciplines)
CREATE TABLE IF NOT EXISTS programs (
    id VARCHAR(32) PRIMARY KEY,
    name VARCHAR(128) NOT NULL,
    slug program_category UNIQUE NOT NULL,
    level VARCHAR(32) NOT NULL,
    duration VARCHAR(32) NOT NULL,
    key_fields TEXT[],
    summary TEXT,
    roi_score INT DEFAULT 90,
    top_destinations TEXT[],
    yearly_educational_cost INT, -- INR / year
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Program Specialisations Table (Year 1 Scope)
CREATE TABLE IF NOT EXISTS specialisations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    program_slug VARCHAR(64) NOT NULL,
    anchor_category VARCHAR(128) NOT NULL,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    description TEXT,
    focus_areas TEXT[] NOT NULL DEFAULT '{}',
    target_destinations TEXT[] NOT NULL DEFAULT '{}',
    duration_formats TEXT[] NOT NULL DEFAULT '{}',
    licensing_pathways TEXT[] NOT NULL DEFAULT '{}',
    content_investment_share VARCHAR(64),
    is_year_one_anchor BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_specialisations_program_slug ON specialisations(program_slug);
CREATE INDEX IF NOT EXISTS idx_specialisations_slug ON specialisations(slug);

-- Cities Table (city a university is located in + typical monthly living costs in INR)
CREATE TABLE IF NOT EXISTS cities (
    id VARCHAR(128) PRIMARY KEY, -- slug-style, e.g. 'melbourne'
    country_id VARCHAR(32) NOT NULL REFERENCES countries(id),
    name VARCHAR(128) NOT NULL,
    state_region VARCHAR(128),
    overview TEXT,
    avg_living_cost_inr VARCHAR(64),
    image_url TEXT,
    monthly_accommodation_cost INT,
    monthly_food_groceries_cost INT,
    monthly_public_transport_cost INT,
    miscellaneous INT,
    cost_buffer_percentage INT, -- % on top of living costs for emergencies
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cities_country_id ON cities(country_id);

-- Universities Table
CREATE TABLE IF NOT EXISTS universities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    country_id VARCHAR(32) REFERENCES countries(id) ON DELETE CASCADE,
    city_id UUID, -- not linked yet: cities.id is VARCHAR
    city VARCHAR(128) NOT NULL,
    ranking_global INT,
    ranking_national INT,
    programs_offered program_category[],
    tuition_fee_range_inr VARCHAR(64),
    ielts_min_score NUMERIC(3, 1) DEFAULT 6.0,
    gre_gmat_required BOOLEAN DEFAULT FALSE,
    intakes TEXT[],
    acceptance_rate INT,
    nmc_compliant BOOLEAN DEFAULT FALSE,
    post_study_work_months INT DEFAULT 24,
    -- Eligibility Checker requirements (NULL = not stated); see migration 0018
    min_percentage NUMERIC(4, 1) CHECK (min_percentage IS NULL OR (min_percentage >= 0 AND min_percentage <= 100)),
    ielts_min_band NUMERIC(2, 1) CHECK (ielts_min_band IS NULL OR (ielts_min_band >= 0 AND ielts_min_band <= 9)),
    toefl_min_score SMALLINT CHECK (toefl_min_score IS NULL OR (toefl_min_score >= 0 AND toefl_min_score <= 120)),
    pte_min_score SMALLINT CHECK (pte_min_score IS NULL OR (pte_min_score >= 10 AND pte_min_score <= 90)),
    duolingo_min_score SMALLINT CHECK (duolingo_min_score IS NULL OR (duolingo_min_score >= 10 AND duolingo_min_score <= 160)),
    aps_required BOOLEAN NOT NULL DEFAULT FALSE,
    four_year_degree_required BOOLEAN NOT NULL DEFAULT FALSE,
    max_backlogs SMALLINT CHECK (max_backlogs IS NULL OR max_backlogs >= 0),
    requirements_source_url TEXT,
    requirements_verified_on DATE,
    featured BOOLEAN DEFAULT FALSE,
    logo_url TEXT,
    banner_url TEXT,
    claimed_status VARCHAR(32) DEFAULT 'unclaimed', -- 'unclaimed' | 'pending' | 'verified'
    claimed_by_user_id UUID,
    official_email_domain VARCHAR(128),
    official_email_address VARCHAR(128),
    -- PostgreSQL Native Full-Text Search Generated Column
    search_vector tsvector GENERATED ALWAYS AS (
        to_tsvector('english', coalesce(name, '') || ' ' || coalesce(city, ''))
    ) STORED,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- University Profile Claims Table
-- Programs offered by each university (fee/duration NULL = program default)
CREATE TABLE IF NOT EXISTS university_programs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    university_id UUID NOT NULL REFERENCES universities(id) ON DELETE CASCADE,
    program_id VARCHAR(32) NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
    yearly_tuition_inr INT, -- INR / year at this university
    duration VARCHAR(32),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (university_id, program_id)
);

CREATE INDEX IF NOT EXISTS idx_university_programs_university_id ON university_programs(university_id);
CREATE INDEX IF NOT EXISTS idx_university_programs_program_id ON university_programs(program_id);

-- Application deadlines for the Deadline Tracker
-- (university_id NULL = whole country, program_id NULL = every program)
CREATE TABLE IF NOT EXISTS application_deadlines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    country_id VARCHAR(32) NOT NULL REFERENCES countries(id) ON DELETE CASCADE,
    university_id UUID REFERENCES universities(id) ON DELETE CASCADE,
    program_id VARCHAR(32) REFERENCES programs(id) ON DELETE CASCADE,
    intake_term VARCHAR(32) NOT NULL, -- e.g. 'Fall', 'Winter'
    intake_year SMALLINT NOT NULL,
    intake_start_date DATE,
    deadline_type VARCHAR(16) NOT NULL DEFAULT 'application', -- 'application' | 'scholarship' | 'documents' | 'deposit' | 'visa'
    round_name VARCHAR(64), -- e.g. 'Round 1', 'Priority'
    applications_open_date DATE,
    deadline_date DATE NOT NULL,
    is_rolling BOOLEAN NOT NULL DEFAULT FALSE,
    source_url TEXT,
    notes TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_application_deadlines_country_id ON application_deadlines(country_id);
CREATE INDEX IF NOT EXISTS idx_application_deadlines_university_id ON application_deadlines(university_id);
CREATE INDEX IF NOT EXISTS idx_application_deadlines_deadline_date ON application_deadlines(deadline_date);

-- Countdown milestones under a deadline (date = deadline - days_before;
-- country_id / deadline_type NULL = all; most specific matching set is used)
CREATE TABLE IF NOT EXISTS deadline_milestones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    country_id VARCHAR(32) REFERENCES countries(id) ON DELETE CASCADE,
    deadline_type VARCHAR(16), -- 'application' | 'scholarship' | 'documents' | 'deposit' | 'visa'
    days_before SMALLINT NOT NULL,
    title VARCHAR(128) NOT NULL,
    description TEXT,
    action_label VARCHAR(64),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_deadline_milestones_country_id ON deadline_milestones(country_id);

-- Scholarships shown by the Scholarship Finder
-- (country_id NULL = several countries, named in destination_label;
-- empty arrays = no restriction)
CREATE TABLE IF NOT EXISTS scholarships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    provider VARCHAR(255),
    country_id VARCHAR(32) REFERENCES countries(id) ON DELETE SET NULL,
    destination_label VARCHAR(64),
    university_id UUID REFERENCES universities(id) ON DELETE CASCADE,
    funding_type VARCHAR(16) NOT NULL DEFAULT 'scholarship', -- 'scholarship' | 'fellowship' | 'grant' | 'tuition_waiver' | 'loan_scholarship'
    coverage VARCHAR(16) NOT NULL DEFAULT 'partial', -- 'full' | 'partial' | 'tuition' | 'stipend'
    award_summary VARCHAR(255),
    award_value NUMERIC(14, 2),
    award_currency CHAR(3),
    award_period VARCHAR(8), -- 'month' | 'year' | 'total'
    study_levels VARCHAR(16)[] NOT NULL DEFAULT '{}', -- 'bachelors' | 'masters' | 'phd' | 'diploma'
    fields VARCHAR(255),
    min_work_experience_months SMALLINT,
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
    sort_order INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_scholarships_country_id ON scholarships(country_id);
CREATE INDEX IF NOT EXISTS idx_scholarships_deadline ON scholarships(deadline);

-- Education loan lenders shown on the Loan Calculator
-- (max_unsecured_inr: 0 = collateral always needed, NULL = not stated)
CREATE TABLE IF NOT EXISTS loan_lenders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(128) NOT NULL,
    lender_type VARCHAR(16) NOT NULL, -- 'public_bank' | 'private_bank' | 'nbfc' | 'international'
    currency CHAR(3) NOT NULL DEFAULT 'INR',
    rate_min NUMERIC(5, 2),
    rate_max NUMERIC(5, 2),
    rate_note VARCHAR(128),
    max_amount_inr BIGINT,
    max_unsecured_inr BIGINT,
    moratorium_note VARCHAR(128),
    processing_fee_note VARCHAR(128),
    website_url TEXT,
    last_verified_on DATE,
    notes TEXT,
    sort_order INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Site content managed from Admin → Site Content (migration 0020)
CREATE TABLE IF NOT EXISTS country_highlights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    country_id VARCHAR(32) NOT NULL REFERENCES countries(id) ON DELETE CASCADE,
    kind VARCHAR(16) NOT NULL CHECK (kind IN ('reason', 'tradeoff')),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_country_highlights_country ON country_highlights(country_id);

CREATE TABLE IF NOT EXISTS country_program_costs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    country_id VARCHAR(32) NOT NULL REFERENCES countries(id) ON DELETE CASCADE,
    program_label VARCHAR(255) NOT NULL, -- e.g. "Master's (MS/MSc - Public)"
    tuition_range_inr VARCHAR(128),
    living_cost_inr VARCHAR(128),
    total_annual_inr VARCHAR(128),
    notes TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_country_program_costs_country ON country_program_costs(country_id);

CREATE TABLE IF NOT EXISTS country_hidden_costs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    country_id VARCHAR(32) NOT NULL REFERENCES countries(id) ON DELETE CASCADE,
    item VARCHAR(255) NOT NULL,
    cost_inr VARCHAR(128),
    frequency VARCHAR(64),
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_country_hidden_costs_country ON country_hidden_costs(country_id);

-- Country x program landing pages (/study-in-<country>/<program>)
CREATE TABLE IF NOT EXISTS country_programs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    country_id VARCHAR(32) NOT NULL REFERENCES countries(id) ON DELETE CASCADE,
    program_id VARCHAR(32) NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
    url_alias VARCHAR(64), -- extra URL segment, e.g. 'masters' for 'ms'
    seo_priority NUMERIC(2, 1) CHECK (seo_priority IS NULL OR (seo_priority >= 0 AND seo_priority <= 1)),
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (country_id, program_id)
);

-- FAQs. scope: 'country' (scope_id = countries.id) | 'test_prep' | 'site'
CREATE TABLE IF NOT EXISTS faqs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scope VARCHAR(32) NOT NULL,
    scope_id VARCHAR(64),
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_faqs_scope ON faqs(scope, scope_id);

CREATE TABLE IF NOT EXISTS testimonials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_name VARCHAR(128) NOT NULL,
    headline VARCHAR(255), -- e.g. "MS in Computer Science · Admitted to TU Munich"
    quote TEXT NOT NULL,
    photo_url TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS trust_badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(128) NOT NULL,
    description TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS b2b_wallet_packs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    label VARCHAR(128) NOT NULL,
    amount_inr INTEGER NOT NULL CHECK (amount_inr > 0),
    perk VARCHAR(255),
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ai_suggested_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category VARCHAR(128) NOT NULL,
    question TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Single values (company name, contact email, cost per lead, ...)
CREATE TABLE IF NOT EXISTS site_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key VARCHAR(64) NOT NULL UNIQUE,
    label VARCHAR(128) NOT NULL, -- shown in admin
    value TEXT,                  -- NULL = not provided
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS university_claims (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    university_id TEXT NOT NULL,
    university_name VARCHAR(255) NOT NULL,
    country_id VARCHAR(64),
    user_id UUID,
    applicant_name VARCHAR(128) NOT NULL,
    official_email VARCHAR(128) NOT NULL,
    designation VARCHAR(128) DEFAULT 'Admissions Representative',
    proof_document_url TEXT,
    verification_status VARCHAR(32) DEFAULT 'pending', -- 'pending' | 'approved' | 'rejected'
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- GIN Index for Sub-10ms Full-Text Search
CREATE INDEX IF NOT EXISTS idx_universities_search ON universities USING GIN(search_vector);
CREATE INDEX IF NOT EXISTS idx_universities_name_trgm ON universities USING GIN(name gin_trgm_ops);

-- Leads Table
CREATE TABLE IF NOT EXISTS leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name VARCHAR(128) NOT NULL,
    email VARCHAR(128) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    is_phone_verified BOOLEAN DEFAULT FALSE,
    country_target VARCHAR(32) REFERENCES countries(id),
    program_target program_category NOT NULL,
    highest_education VARCHAR(64),
    budget_range_inr VARCHAR(64),
    intake_year VARCHAR(16),
    ielts_score VARCHAR(16),
    lead_score INT DEFAULT 50,
    status lead_status DEFAULT 'raw',
    utm_source VARCHAR(64),
    utm_medium VARCHAR(64),
    utm_campaign VARCHAR(64),
    -- Inquiry made from a university's page, and how that university handles it (0022)
    university_id UUID REFERENCES universities(id) ON DELETE SET NULL,
    university_status VARCHAR(16) CHECK (university_status IS NULL OR university_status IN ('new', 'reviewing', 'shortlisted', 'contacted')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_program ON leads(program_target);

-- Buyers (Admission Consultants & Agencies)
CREATE TABLE IF NOT EXISTS buyers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(128) NOT NULL,
    email VARCHAR(128) UNIQUE NOT NULL,
    phone VARCHAR(20) NOT NULL,
    target_countries VARCHAR(32)[],
    target_programs program_category[],
    is_verified BOOLEAN DEFAULT FALSE,
    webhook_url TEXT,
    -- Account link, onboarding details and targeting (migration 0022)
    user_id UUID UNIQUE,
    gstin VARCHAR(15),
    pan VARCHAR(10),
    city VARCHAR(128),
    state VARCHAR(128),
    years_in_business VARCHAR(32),
    annual_student_volume VARCHAR(32),
    min_lead_score INTEGER CHECK (min_lead_score IS NULL OR (min_lead_score BETWEEN 0 AND 100)),
    daily_lead_cap INTEGER CHECK (daily_lead_cap IS NULL OR daily_lead_cap > 0),
    auto_unlock BOOLEAN NOT NULL DEFAULT FALSE,
    operating_hours VARCHAR(64),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Buyer Prepaid Wallet
CREATE TABLE IF NOT EXISTS wallet_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    buyer_id UUID UNIQUE REFERENCES buyers(id) ON DELETE CASCADE,
    balance_inr NUMERIC(12, 2) DEFAULT 0.00 CHECK (balance_inr >= 0),
    currency CHAR(3) DEFAULT 'INR',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Wallet Transactions
CREATE TABLE IF NOT EXISTS wallet_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wallet_id UUID REFERENCES wallet_accounts(id) ON DELETE CASCADE,
    amount_inr NUMERIC(12, 2) NOT NULL,
    type transaction_type NOT NULL,
    description TEXT,
    razorpay_payment_id VARCHAR(128),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Lead Deliveries (Purchased Leads)
CREATE TABLE IF NOT EXISTS lead_deliveries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
    buyer_id UUID REFERENCES buyers(id) ON DELETE CASCADE,
    price_charged_inr NUMERIC(10, 2) NOT NULL,
    delivery_type delivery_type DEFAULT 'exclusive',
    delivered_at TIMESTAMPTZ DEFAULT NOW(),
    -- The buyer's handling of the lead (migration 0022)
    status VARCHAR(16) NOT NULL DEFAULT 'unread' CHECK (status IN ('unread', 'contacted', 'converted', 'disputed')),
    notes JSONB NOT NULL DEFAULT '[]'::jsonb,
    dispute_reason TEXT,
    dispute_status VARCHAR(16) CHECK (dispute_status IS NULL OR dispute_status IN ('under_review', 'approved', 'rejected')),
    disputed_at TIMESTAMPTZ,
    dispute_reviewed_at TIMESTAMPTZ,
    UNIQUE (lead_id, buyer_id)
);

-- Wallet top-up requests: an admin credits the wallet after payment (0022)
CREATE TABLE IF NOT EXISTS wallet_topup_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    buyer_id UUID NOT NULL REFERENCES buyers(id) ON DELETE CASCADE,
    amount_inr NUMERIC(12, 2) NOT NULL CHECK (amount_inr > 0),
    payment_reference TEXT,
    status VARCHAR(16) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    admin_note TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    reviewed_at TIMESTAMPTZ
);

-- Paid listing plans in the university portal (0022)
CREATE TABLE IF NOT EXISTS university_listing_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(128) NOT NULL,
    tagline VARCHAR(255),
    price_inr INTEGER CHECK (price_inr IS NULL OR price_inr >= 0),
    price_usd INTEGER CHECK (price_usd IS NULL OR price_usd >= 0),
    billing_period VARCHAR(32),
    features TEXT, -- one feature per line
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI Counsellor Conversations & Sessions
CREATE TABLE IF NOT EXISTS ai_conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id VARCHAR(128) NOT NULL,
    user_id UUID,
    lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
    context_page TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI Counsellor Messages
CREATE TABLE IF NOT EXISTS ai_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID REFERENCES ai_conversations(id) ON DELETE CASCADE,
    role VARCHAR(16) NOT NULL, -- 'user' | 'model' | 'system'
    content TEXT NOT NULL,
    function_call JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Supabase pgvector Knowledge Base for RAG (Gemini 768-dim Embeddings)
CREATE TABLE IF NOT EXISTS rag_embeddings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content_title VARCHAR(255) NOT NULL,
    content_chunk TEXT NOT NULL,
    source_url TEXT,
    category VARCHAR(64), -- 'university', 'visa_guide', 'scholarship', 'faq'
    embedding vector(768), -- Matches Google Gemini text-embedding-004
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- HNSW Index for Ultra-Fast Vector Cosine Similarity Search
CREATE INDEX IF NOT EXISTS idx_rag_embeddings_hnsw ON rag_embeddings 
USING hnsw (embedding vector_cosine_ops);

-- 5. Supabase RPC Function: Vector Similarity Search
CREATE OR REPLACE FUNCTION match_knowledge_base(
    query_embedding vector(768),
    match_threshold float DEFAULT 0.65,
    match_count int DEFAULT 5
)
RETURNS TABLE (
    id UUID,
    content_title VARCHAR,
    content_chunk TEXT,
    source_url TEXT,
    similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        rag_embeddings.id,
        rag_embeddings.content_title,
        rag_embeddings.content_chunk,
        rag_embeddings.source_url,
        1 - (rag_embeddings.embedding <=> query_embedding) AS similarity
    FROM rag_embeddings
    WHERE 1 - (rag_embeddings.embedding <=> query_embedding) > match_threshold
    ORDER BY similarity DESC
    LIMIT match_count;
END;
$$;

-- ============================================================
-- Row Level Security for private tables (migration 0023)
-- The public key ships in the browser, so private tables allow only the
-- service role; the app reaches them through server API routes.
-- ============================================================
DO $$
DECLARE t TEXT;
BEGIN
    FOREACH t IN ARRAY ARRAY[
        'leads', 'buyers', 'wallet_accounts', 'wallet_transactions',
        'lead_deliveries', 'wallet_topup_requests', 'university_claims',
        'ai_conversations', 'ai_messages', 'rag_embeddings'
    ] LOOP
        EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
        EXECUTE format('DROP POLICY IF EXISTS "Service Role Full Access" ON %I', t);
        EXECUTE format('CREATE POLICY "Service Role Full Access" ON %I FOR ALL TO service_role USING (true) WITH CHECK (true)', t);
    END LOOP;
END $$;
