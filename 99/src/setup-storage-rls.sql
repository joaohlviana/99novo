-- =============================================
-- RLS POLICIES SETUP FOR STORAGE
-- Execute this script in Supabase SQL Editor
-- =============================================

-- Enable RLS on storage.objects (if not already enabled)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies (if they exist)
DROP POLICY IF EXISTS "make_users_upload" ON storage.objects;
DROP POLICY IF EXISTS "make_users_view" ON storage.objects;
DROP POLICY IF EXISTS "make_users_update" ON storage.objects;
DROP POLICY IF EXISTS "make_users_delete" ON storage.objects;

-- Create upload policy: Users can upload files to their own folder
CREATE POLICY "make_users_upload" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id IN ('make-e547215c-avatars', 'make-e547215c-trainer-assets', 'make-e547215c-documents', 'make-e547215c-program-media') 
    AND auth.uid()::text = split_part(name, '/', 1)
  );

-- Create view policy: Users can view their own files
CREATE POLICY "make_users_view" ON storage.objects
  FOR SELECT USING (
    bucket_id IN ('make-e547215c-avatars', 'make-e547215c-trainer-assets', 'make-e547215c-documents', 'make-e547215c-program-media')
    AND auth.uid()::text = split_part(name, '/', 1)
  );

-- Create update policy: Users can update their own files
CREATE POLICY "make_users_update" ON storage.objects
  FOR UPDATE USING (
    bucket_id IN ('make-e547215c-avatars', 'make-e547215c-trainer-assets', 'make-e547215c-documents', 'make-e547215c-program-media')
    AND auth.uid()::text = split_part(name, '/', 1)
  );

-- Create delete policy: Users can delete their own files
CREATE POLICY "make_users_delete" ON storage.objects
  FOR DELETE USING (
    bucket_id IN ('make-e547215c-avatars', 'make-e547215c-trainer-assets', 'make-e547215c-documents', 'make-e547215c-program-media')
    AND auth.uid()::text = split_part(name, '/', 1)
  );

-- Verification: Check if policies were created
SELECT schemaname, tablename, policyname, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'objects' AND schemaname = 'storage'
AND policyname LIKE 'make_users_%';

-- Success message
SELECT 'RLS policies created successfully!' as status;