-- =============================================
-- COMPLETE STORAGE SETUP FOR TRAINING PLATFORM
-- Execute this script in Supabase SQL Editor
-- =============================================

-- 1. Enable RLS on storage.objects (if not already enabled)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 2. Drop all existing policies to start fresh
DROP POLICY IF EXISTS "make_users_upload" ON storage.objects;
DROP POLICY IF EXISTS "make_users_view" ON storage.objects;
DROP POLICY IF EXISTS "make_users_update" ON storage.objects;
DROP POLICY IF EXISTS "make_users_delete" ON storage.objects;
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Give users access to own folder 1oj01fe_0" ON storage.objects;
DROP POLICY IF EXISTS "Give users access to own folder 1oj01fe_1" ON storage.objects;
DROP POLICY IF EXISTS "Give users access to own folder 1oj01fe_2" ON storage.objects;
DROP POLICY IF EXISTS "Give users access to own folder 1oj01fe_3" ON storage.objects;

-- 3. Create comprehensive upload policy for all our buckets
CREATE POLICY "make_users_upload" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id IN (
      'make-e547215c-avatars', 
      'make-e547215c-trainer-assets', 
      'make-e547215c-documents', 
      'make-e547215c-program-media',
      'make-e547215c-gallery'
    ) 
    AND (
      auth.uid()::text = split_part(name, '/', 1)
      OR auth.uid() IS NULL  -- Allow service role
    )
  );

-- 4. Create view policy for users to see their own files
CREATE POLICY "make_users_view" ON storage.objects
  FOR SELECT USING (
    bucket_id IN (
      'make-e547215c-avatars', 
      'make-e547215c-trainer-assets', 
      'make-e547215c-documents', 
      'make-e547215c-program-media',
      'make-e547215c-gallery'
    )
    AND (
      auth.uid()::text = split_part(name, '/', 1)
      OR auth.uid() IS NULL  -- Allow service role
    )
  );

-- 5. Create update policy
CREATE POLICY "make_users_update" ON storage.objects
  FOR UPDATE USING (
    bucket_id IN (
      'make-e547215c-avatars', 
      'make-e547215c-trainer-assets', 
      'make-e547215c-documents', 
      'make-e547215c-program-media',
      'make-e547215c-gallery'
    )
    AND (
      auth.uid()::text = split_part(name, '/', 1)
      OR auth.uid() IS NULL  -- Allow service role
    )
  );

-- 6. Create delete policy
CREATE POLICY "make_users_delete" ON storage.objects
  FOR DELETE USING (
    bucket_id IN (
      'make-e547215c-avatars', 
      'make-e547215c-trainer-assets', 
      'make-e547215c-documents', 
      'make-e547215c-program-media',
      'make-e547215c-gallery'
    )
    AND (
      auth.uid()::text = split_part(name, '/', 1)
      OR auth.uid() IS NULL  -- Allow service role
    )
  );

-- 7. Allow public access to public bucket if exists
CREATE POLICY "Public bucket access" ON storage.objects
  FOR SELECT USING (bucket_id = 'public');

-- 8. Verify policies were created
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  roles, 
  cmd,
  CASE 
    WHEN policyname LIKE 'make_users_%' THEN '✅ Our Policy'
    WHEN policyname = 'Public bucket access' THEN '✅ Public Policy'
    ELSE '⚠️ Other Policy'
  END as status
FROM pg_policies 
WHERE tablename = 'objects' AND schemaname = 'storage'
ORDER BY policyname;

-- 9. Check bucket configuration
SELECT 
  name,
  public,
  file_size_limit,
  allowed_mime_types,
  CASE 
    WHEN name LIKE 'make-e547215c-%' THEN '✅ Our Bucket'
    WHEN name = 'public' THEN '✅ Public Bucket'
    ELSE '⚠️ Other Bucket'
  END as status
FROM storage.buckets
ORDER BY name;

-- Success message
SELECT 'Storage RLS policies and buckets configured successfully!' as result;