-- Add RLS policy to allow members to view stokvels they're part of

-- First, check existing policies on user_stokvels
SELECT
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies
WHERE tablename = 'user_stokvels'
ORDER BY policyname;

-- Add policy to allow members to view stokvels they belong to
CREATE POLICY "Members can view stokvels they belong to"
ON public.user_stokvels
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_stokvel_members
    WHERE user_stokvel_members.stokvel_id = user_stokvels.id
    AND user_stokvel_members.member_id = auth.uid()
    AND user_stokvel_members.is_active = true
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
WHERE tablename = 'user_stokvels'
ORDER BY policyname;

-- Test the query
SELECT set_config('request.jwt.claims', json_build_object('sub', 'a4c14e21-c607-412e-9742-f95748209f73')::text, true);

SELECT id, name, owner_id, is_active
FROM public.user_stokvels
WHERE id = '1b159f00-dd81-4130-876d-2bdeb8b7c0e1';
