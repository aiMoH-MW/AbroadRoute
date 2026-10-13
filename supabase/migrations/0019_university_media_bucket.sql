-- ============================================================
-- 0019: Public storage bucket for university logos and banner images.
--
-- Files are uploaded through /api/universities/media (signed upload URLs)
-- and their public URLs saved to universities.logo_url / banner_url.
-- Path: <university id>/<logo|banner>-<timestamp>.<ext>
-- SVG is not allowed: it can carry scripts.
-- ============================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'university-media',
    'university-media',
    true,
    5242880, -- 5 MB
    ARRAY['image/png', 'image/jpeg', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;
