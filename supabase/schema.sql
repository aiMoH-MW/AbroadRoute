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
    created_at TIMESTAMPTZ DEFAULT NOW()
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
    delivered_at TIMESTAMPTZ DEFAULT NOW()
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
