-- Simple storage policies for proof-of-payments bucket
-- Run this in Supabase SQL Editor

-- Policy 1: Allow authenticated users to INSERT (upload) files
CREATE POLICY "Authenticated users can upload files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'proof-of-payments');

-- Policy 2: Allow public SELECT (view) access since bucket is public
CREATE POLICY "Public can view files"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'proof-of-payments');

-- Policy 3: Allow authenticated users to UPDATE their files
CREATE POLICY "Authenticated users can update files"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'proof-of-payments');

-- Policy 4: Allow authenticated users to DELETE their files
CREATE POLICY "Authenticated users can delete files"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'proof-of-payments');
