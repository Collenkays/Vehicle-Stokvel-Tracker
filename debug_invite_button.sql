-- Debug script to check invitation system setup and user permissions
-- Run this in Supabase SQL Editor

-- 1. Check if invitation table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables
  WHERE table_schema = 'public'
  AND table_name = 'stokvel_invitations'
) as invitation_table_exists;

-- 2. Check if invitation functions exist
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name IN ('validate_invitation_token', 'accept_invitation', 'generate_invitation_token');

-- 3. Get the current logged-in user's ID (replace with actual user email)
SELECT id, email FROM auth.users WHERE email = 'your-email@example.com';

-- 4. Check user's role for stokvel ID: 451290e4-3108-40b6-bc1a-adfc408059ee
-- Replace the member_id with the actual user ID from step 3
SELECT
  usm.id,
  usm.role,
  usm.member_id,
  u.email,
  us.name as stokvel_name
FROM user_stokvel_members usm
JOIN auth.users u ON u.id = usm.member_id
JOIN user_stokvels us ON us.id = usm.stokvel_id
WHERE usm.stokvel_id = '451290e4-3108-40b6-bc1a-adfc408059ee'
ORDER BY usm.created_at DESC;

-- 5. Check stokvel details
SELECT
  id,
  name,
  created_by,
  is_active
FROM user_stokvels
WHERE id = '451290e4-3108-40b6-bc1a-adfc408059ee';
