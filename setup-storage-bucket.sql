-- Create storage bucket for proof of payment files
INSERT INTO storage.buckets (id, name, public)
VALUES ('proof-of-payments', 'proof-of-payments', true)
ON CONFLICT (id) DO NOTHING;

-- Note: RLS is already enabled on storage.objects by default in Supabase
-- We only need to create the policies

-- Policy: Allow authenticated users to upload files to their own stokvel
CREATE POLICY "Users can upload proof of payments"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'proof-of-payments' AND
  (storage.foldername(name))[1] = 'stokvels' AND
  -- Verify user is a member or owner of the stokvel
  EXISTS (
    SELECT 1 FROM user_stokvels us
    WHERE us.id = (storage.foldername(name))[2]::uuid
    AND (
      us.owner_id = auth.uid() OR
      EXISTS (
        SELECT 1 FROM user_stokvel_members usm
        WHERE usm.stokvel_id = us.id
        AND (usm.user_id = auth.uid() OR usm.auth_user_id = auth.uid())
      )
    )
  )
);

-- Policy: Allow users to view proof of payments from their stokvels
CREATE POLICY "Users can view stokvel proof of payments"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'proof-of-payments' AND
  (storage.foldername(name))[1] = 'stokvels' AND
  -- Verify user is a member or owner of the stokvel
  EXISTS (
    SELECT 1 FROM user_stokvels us
    WHERE us.id = (storage.foldername(name))[2]::uuid
    AND (
      us.owner_id = auth.uid() OR
      EXISTS (
        SELECT 1 FROM user_stokvel_members usm
        WHERE usm.stokvel_id = us.id
        AND (usm.user_id = auth.uid() OR usm.auth_user_id = auth.uid())
      )
    )
  )
);

-- Policy: Allow users to delete their own uploaded files
CREATE POLICY "Users can delete their uploaded proof of payments"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'proof-of-payments' AND
  (storage.foldername(name))[1] = 'stokvels' AND
  -- Verify user is a member or owner of the stokvel
  EXISTS (
    SELECT 1 FROM user_stokvels us
    WHERE us.id = (storage.foldername(name))[2]::uuid
    AND (
      us.owner_id = auth.uid() OR
      EXISTS (
        SELECT 1 FROM user_stokvel_members usm
        WHERE usm.stokvel_id = us.id
        AND (usm.user_id = auth.uid() OR usm.auth_user_id = auth.uid())
      )
    )
  )
);

-- Policy: Allow users to update their own uploaded files
CREATE POLICY "Users can update their uploaded proof of payments"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'proof-of-payments' AND
  (storage.foldername(name))[1] = 'stokvels' AND
  -- Verify user is a member or owner of the stokvel
  EXISTS (
    SELECT 1 FROM user_stokvels us
    WHERE us.id = (storage.foldername(name))[2]::uuid
    AND (
      us.owner_id = auth.uid() OR
      EXISTS (
        SELECT 1 FROM user_stokvel_members usm
        WHERE usm.stokvel_id = us.id
        AND (usm.user_id = auth.uid() OR usm.auth_user_id = auth.uid())
      )
    )
  )
);
