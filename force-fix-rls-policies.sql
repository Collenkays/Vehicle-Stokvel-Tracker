-- Force remove ALL existing policies on user_stokvel_members
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'user_stokvel_members') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.user_stokvel_members';
    END LOOP;
END $$;

-- Verify all policies are gone
SELECT policyname FROM pg_policies WHERE tablename = 'user_stokvel_members';

-- Create the simple, working policy: Allow users to view their own membership records
CREATE POLICY "Users can view their own memberships"
ON public.user_stokvel_members
FOR SELECT
USING (auth.uid() = member_id);

-- Allow stokvel owners to view all members of their stokvels
CREATE POLICY "Stokvel owners can view members"
ON public.user_stokvel_members
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_stokvels
    WHERE user_stokvels.id = user_stokvel_members.stokvel_id
    AND user_stokvels.owner_id = auth.uid()
  )
);

-- Allow stokvel owners to insert members
CREATE POLICY "Stokvel owners can add members"
ON public.user_stokvel_members
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_stokvels
    WHERE user_stokvels.id = stokvel_id
    AND user_stokvels.owner_id = auth.uid()
  )
);

-- Allow stokvel owners to update members
CREATE POLICY "Stokvel owners can update members"
ON public.user_stokvel_members
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.user_stokvels
    WHERE user_stokvels.id = stokvel_id
    AND user_stokvels.owner_id = auth.uid()
  )
);

-- Allow stokvel owners to soft-delete members
CREATE POLICY "Stokvel owners can delete members"
ON public.user_stokvel_members
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.user_stokvels
    WHERE user_stokvels.id = stokvel_id
    AND user_stokvels.owner_id = auth.uid()
  )
);

-- Verify the new policies
SELECT
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies
WHERE tablename = 'user_stokvel_members'
ORDER BY policyname;

-- Test as the actual user
SELECT set_config('request.jwt.claims', json_build_object('sub', 'a4c14e21-c607-412e-9742-f95748209f73')::text, true);

SELECT
  usm.stokvel_id,
  usm.member_id,
  usm.email,
  usm.role,
  usm.is_active
FROM public.user_stokvel_members usm
WHERE usm.member_id = 'a4c14e21-c607-412e-9742-f95748209f73'
  AND usm.is_active = true;
