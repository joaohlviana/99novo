-- Simplified Avatar Buckets Setup for 99coach Platform
-- Execute este script quando você NÃO tem permissões de owner
-- Execute como Service Role ou no Supabase Dashboard

-- =============================================
-- 1. CREATE STORAGE BUCKETS ONLY
-- =============================================

-- Avatar bucket (private, secure)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'make-e547215c-avatars',
  'make-e547215c-avatars',
  false,
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
) ON CONFLICT (id) DO UPDATE SET
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Trainer assets bucket (for galleries, videos)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'make-e547215c-trainer-assets',
  'make-e547215c-trainer-assets',
  false,
  52428800, -- 50MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/quicktime']
) ON CONFLICT (id) DO UPDATE SET
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Documents bucket (certificates, PDFs)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'make-e547215c-documents',
  'make-e547215c-documents',
  false,
  10485760, -- 10MB
  ARRAY['application/pdf', 'image/jpeg', 'image/png']
) ON CONFLICT (id) DO UPDATE SET
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- =============================================
-- 2. VERIFICATION
-- =============================================

-- Check if buckets were created successfully
SELECT 
  name,
  public,
  file_size_limit,
  allowed_mime_types,
  created_at
FROM storage.buckets 
WHERE name LIKE 'make-e547215c-%'
ORDER BY name;

-- =============================================
-- COMPLETION MESSAGE
-- =============================================

DO $$
BEGIN
  RAISE NOTICE '✅ Buckets created successfully!';
  RAISE NOTICE '⚠️  Storage policies need to be configured manually in Supabase Dashboard';
  RAISE NOTICE '📖 Go to Storage > Policies in your Supabase Dashboard to add RLS policies';
  RAISE NOTICE '';
  RAISE NOTICE '🚀 Buckets are ready! Configure policies via Dashboard UI.';
END $$;