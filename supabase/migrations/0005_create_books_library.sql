-- ============================================================
-- 0005: Books library — uploaded PDFs with OCR-extracted text,
-- tagged by exam / program / specialisation
-- ============================================================

CREATE TABLE IF NOT EXISTS public.books (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    author TEXT,
    edition TEXT,
    description TEXT,
    exam_slug VARCHAR(64),              -- e.g. 'ielts', 'gre' (TEST_PREP_EXAMS slugs)
    program_slug VARCHAR(64),           -- e.g. 'ms', 'mbbs'
    specialisation_slug VARCHAR(255),   -- specialisations.slug
    subject TEXT,                       -- e.g. 'Quantitative Reasoning', 'Pharmacology'
    tags TEXT[] NOT NULL DEFAULT '{}',
    language VARCHAR(32) DEFAULT 'English',
    storage_path TEXT NOT NULL,         -- object path inside the 'books' storage bucket
    file_name TEXT NOT NULL,
    file_size_bytes BIGINT,
    page_count INTEGER,
    pages_processed INTEGER NOT NULL DEFAULT 0,
    status VARCHAR(16) NOT NULL DEFAULT 'uploaded'
        CHECK (status IN ('uploaded', 'processing', 'completed', 'failed')),
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.book_pages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    book_id UUID NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
    page_number INTEGER NOT NULL,
    content TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (book_id, page_number)
);

-- Admin-only data: no anon/authenticated policies, only the server secret key can access.
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.book_pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service Role Full Access" ON public.books
    FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service Role Full Access" ON public.book_pages
    FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_books_exam_slug ON public.books(exam_slug);
CREATE INDEX IF NOT EXISTS idx_books_program_slug ON public.books(program_slug);
CREATE INDEX IF NOT EXISTS idx_books_specialisation_slug ON public.books(specialisation_slug);
CREATE INDEX IF NOT EXISTS idx_books_created_at ON public.books(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_book_pages_book_id ON public.book_pages(book_id, page_number);

-- Full-text search over extracted page text
CREATE INDEX IF NOT EXISTS idx_book_pages_content_fts
    ON public.book_pages USING GIN (to_tsvector('english', content));

-- Private storage bucket for the original PDFs (max 100 MB each)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('books', 'books', false, 104857600, ARRAY['application/pdf'])
ON CONFLICT (id) DO NOTHING;
