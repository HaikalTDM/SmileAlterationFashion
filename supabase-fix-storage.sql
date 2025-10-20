-- FIX: Storage Bucket RLS Policies for Image Uploads
-- Run this in Supabase SQL Editor

-- Step 1: Create the storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('order-images', 'order-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Step 2: Drop all existing policies on order-images bucket
DROP POLICY IF EXISTS "Allow public uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public reads" ON storage.objects;
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Allow all uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow all reads" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload order images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can read order images" ON storage.objects;

-- Step 3: Create new policies for order-images bucket

-- Allow ANYONE to upload (INSERT) to order-images bucket
CREATE POLICY "Allow anyone to upload order images"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'order-images');

-- Allow ANYONE to read (SELECT) from order-images bucket
CREATE POLICY "Allow anyone to read order images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'order-images');

-- Allow ANYONE to update files in order-images bucket
CREATE POLICY "Allow anyone to update order images"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'order-images');

-- Allow ANYONE to delete files in order-images bucket
CREATE POLICY "Allow anyone to delete order images"
ON storage.objects
FOR DELETE
USING (bucket_id = 'order-images');

-- Step 4: Verify the bucket exists and is public
SELECT 
  id as bucket_name,
  public,
  created_at
FROM storage.buckets
WHERE id = 'order-images';

-- Step 5: Verify the policies were created
SELECT 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'objects'
AND policyname LIKE '%order image%';

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Storage bucket policies fixed!';
  RAISE NOTICE '✅ Bucket "order-images" is now public';
  RAISE NOTICE '✅ Anyone can upload, read, update, and delete images';
  RAISE NOTICE '✅ Try uploading images now!';
END $$;

