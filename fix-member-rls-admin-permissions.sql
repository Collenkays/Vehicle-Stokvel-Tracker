-- Fix RLS policies to allow both stokvel owners AND admins to manage members

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own memberships" ON public.user_stokvel_members;
DROP POLICY IF EXISTS "Stokvel owners can view members" ON public.user_stokvel_members;
DROP POLICY IF EXISTS "Stokvel owners can add members" ON public.user_stokvel_members;
DROP POLICY IF EXISTS "Stokvel owners can update members" ON public.user_stokvel_members;
DROP POLICY IF EXISTS "Stokvel owners can delete members" ON public.user_stokvel_members;

-- SELECT policies
-- Policy 1: Users can view their own membership records
CREATE POLICY "Users can view their own memberships"
ON public.user_stokvel_members
FOR SELECT
USING (
  auth.uid() = member_id
  OR LOWER(email) = LOWER(auth.email())
);

-- Policy 2: Stokvel owners and admins can view all members
CREATE POLICY "Stokvel owners and admins can view members"
ON public.user_stokvel_members
FOR SELECT
USING (
  -- Owner of the stokvel
  EXISTS (
    SELECT 1 FROM public.user_stokvels
    WHERE user_stokvels.id = user_stokvel_members.stokvel_id
    AND user_stokvels.owner_id = auth.uid()
  )
  OR
  -- Admin member of the stokvel
  EXISTS (
    SELECT 1 FROM public.user_stokvel_members AS admin_check
    WHERE admin_check.stokvel_id = user_stokvel_members.stokvel_id
    AND admin_check.member_id = auth.uid()
    AND admin_check.role = 'admin'
    AND admin_check.is_active = true
  )
);

-- INSERT policy
-- Stokvel owners and admins can add members
CREATE POLICY "Stokvel owners and admins can add members"
ON public.user_stokvel_members
FOR INSERT
WITH CHECK (
  -- Owner of the stokvel
  EXISTS (
    SELECT 1 FROM public.user_stokvels
    WHERE user_stokvels.id = stokvel_id
    AND user_stokvels.owner_id = auth.uid()
  )
  OR
  -- Admin member of the stokvel
  EXISTS (
    SELECT 1 FROM public.user_stokvel_members AS admin_check
    WHERE admin_check.stokvel_id = user_stokvel_members.stokvel_id
    AND admin_check.member_id = auth.uid()
    AND admin_check.role = 'admin'
    AND admin_check.is_active = true
  )
);

-- UPDATE policy
-- Stokvel owners and admins can update members
CREATE POLICY "Stokvel owners and admins can update members"
ON public.user_stokvel_members
FOR UPDATE
USING (
  -- Owner of the stokvel
  EXISTS (
    SELECT 1 FROM public.user_stokvels
    WHERE user_stokvels.id = stokvel_id
    AND user_stokvels.owner_id = auth.uid()
  )
  OR
  -- Admin member of the stokvel
  EXISTS (
    SELECT 1 FROM public.user_stokvel_members AS admin_check
    WHERE admin_check.stokvel_id = user_stokvel_members.stokvel_id
    AND admin_check.member_id = auth.uid()
    AND admin_check.role = 'admin'
    AND admin_check.is_active = true
  )
);

-- DELETE policy
-- Stokvel owners and admins can delete (soft-delete) members
CREATE POLICY "Stokvel owners and admins can delete members"
ON public.user_stokvel_members
FOR DELETE
USING (
  -- Owner of the stokvel
  EXISTS (
    SELECT 1 FROM public.user_stokvels
    WHERE user_stokvels.id = stokvel_id
    AND user_stokvels.owner_id = auth.uid()
  )
  OR
  -- Admin member of the stokvel
  EXISTS (
    SELECT 1 FROM public.user_stokvel_members AS admin_check
    WHERE admin_check.stokvel_id = user_stokvel_members.stokvel_id
    AND admin_check.member_id = auth.uid()
    AND admin_check.role = 'admin'
    AND admin_check.is_active = true
  )
);

-- Verify the policies
SELECT
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'user_stokvel_members'
ORDER BY cmd, policyname;

-- Test query to check if current user can add members to a specific stokvel
-- Replace 'STOKVEL_ID_HERE' with actual stokvel ID
/*
SELECT
    'Can add members: ' || CASE
        WHEN EXISTS (
            SELECT 1 FROM public.user_stokvels
            WHERE id = 'STOKVEL_ID_HERE'
            AND owner_id = auth.uid()
        ) THEN 'YES (Owner)'
        WHEN EXISTS (
            SELECT 1 FROM public.user_stokvel_members
            WHERE stokvel_id = 'STOKVEL_ID_HERE'
            AND member_id = auth.uid()
            AND role = 'admin'
            AND is_active = true
        ) THEN 'YES (Admin)'
        ELSE 'NO'
    END AS permission_check;
*/
