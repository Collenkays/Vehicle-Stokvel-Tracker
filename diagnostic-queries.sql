-- DIAGNOSTIC QUERIES FOR MEMBER LINKING ISSUE
-- Run these queries one by one in Supabase SQL Editor

-- 1. Check if the RPC function exists
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name = 'get_user_id_by_email';

-- 2. Check the collenkaunda@gmail.com user in auth.users
SELECT id, email, created_at
FROM auth.users
WHERE email = 'collenkaunda@gmail.com';

-- 3. Check all members with their current member_id
SELECT
  id,
  stokvel_id,
  member_id,
  full_name,
  email,
  role,
  is_active,
  created_at
FROM public.user_stokvel_members
WHERE email = 'collenkaunda@gmail.com'
ORDER BY created_at DESC;

-- 4. Check if member_id matches auth user id
SELECT
  usm.id as membership_id,
  usm.stokvel_id,
  usm.member_id as current_member_id,
  usm.full_name,
  usm.email,
  usm.role,
  usm.is_active,
  au.id as auth_user_id,
  au.email as auth_email,
  CASE
    WHEN usm.member_id = au.id THEN '✅ LINKED CORRECTLY'
    WHEN au.id IS NULL THEN '❌ NO AUTH USER FOUND'
    ELSE '⚠️ MEMBER_ID MISMATCH'
  END as link_status
FROM public.user_stokvel_members usm
LEFT JOIN auth.users au ON usm.email = au.email
WHERE usm.email = 'collenkaunda@gmail.com';

-- 5. Check the stokvel that collenkaunda should see
SELECT
  us.id as stokvel_id,
  us.name as stokvel_name,
  us.is_active as stokvel_active,
  usm.member_id,
  usm.email,
  usm.role,
  usm.is_active as membership_active
FROM public.user_stokvels us
JOIN public.user_stokvel_members usm ON us.id = usm.stokvel_id
WHERE usm.email = 'collenkaunda@gmail.com';

-- 6. Check what the query should return (simulating the app query)
SELECT
  usm.stokvel_id,
  usm.role,
  usm.rotation_order,
  usm.is_active,
  usm.join_date,
  us.*
FROM public.user_stokvel_members usm
JOIN public.user_stokvels us ON us.id = usm.stokvel_id
WHERE usm.email = 'collenkaunda@gmail.com'
  AND usm.is_active = true
  AND us.is_active = true;

-- 7. Get the actual auth user ID we should be using
SELECT id FROM auth.users WHERE email = 'collenkaunda@gmail.com';
