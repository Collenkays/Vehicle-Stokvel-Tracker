-- Find and restore the member with rotation order 13
-- This script will help you find the deleted/inactive member and restore them

-- ============================================================================
-- STEP 1: Find ALL members including inactive ones with rotation order 13
-- ============================================================================
SELECT
    id,
    stokvel_id,
    member_id,
    full_name,
    email,
    contact_number,
    rotation_order,
    is_active,
    join_date,
    vehicle_received,
    month_received,
    created_at,
    updated_at
FROM public.user_stokvel_members
WHERE stokvel_id = '451290e4-3108-40b6-bc1a-adfc408059ee'
  AND rotation_order = 13
ORDER BY created_at DESC;

-- ============================================================================
-- STEP 2: Show ALL members and their rotation orders (active and inactive)
-- ============================================================================
SELECT
    rotation_order,
    full_name,
    email,
    is_active,
    vehicle_received,
    created_at
FROM public.user_stokvel_members
WHERE stokvel_id = '451290e4-3108-40b6-bc1a-adfc408059ee'
ORDER BY rotation_order;

-- ============================================================================
-- STEP 3: Find gaps in rotation order sequence
-- ============================================================================
WITH all_rotations AS (
    SELECT DISTINCT rotation_order
    FROM public.user_stokvel_members
    WHERE stokvel_id = '451290e4-3108-40b6-bc1a-adfc408059ee'
),
expected_sequence AS (
    SELECT generate_series(1, (SELECT MAX(rotation_order) FROM all_rotations)) as rotation_order
)
SELECT
    es.rotation_order as missing_rotation_order
FROM expected_sequence es
LEFT JOIN all_rotations ar ON es.rotation_order = ar.rotation_order
WHERE ar.rotation_order IS NULL
ORDER BY es.rotation_order;

-- ============================================================================
-- STEP 4: Restore the member with rotation order 13 (if they're inactive)
-- Run this ONLY if you found an inactive member in STEP 1
-- Replace 'MEMBER_ID_HERE' with the actual ID from STEP 1
-- ============================================================================
-- UPDATE public.user_stokvel_members
-- SET is_active = true
-- WHERE id = 'MEMBER_ID_HERE'
--   AND stokvel_id = '451290e4-3108-40b6-bc1a-adfc408059ee'
-- RETURNING *;

-- ============================================================================
-- STEP 5: Alternative - Delete the conflicting member to free up rotation 13
-- WARNING: This will permanently delete the member record
-- Only use this if the member at rotation 13 was added by mistake
-- Replace 'MEMBER_ID_HERE' with the actual ID from STEP 1
-- ============================================================================
-- DELETE FROM public.user_stokvel_members
-- WHERE id = 'MEMBER_ID_HERE'
--   AND stokvel_id = '451290e4-3108-40b6-bc1a-adfc408059ee'
-- RETURNING *;

-- ============================================================================
-- STEP 6: Alternative - Change rotation order of conflicting member
-- This moves the conflicting member to a different rotation slot
-- Replace 'MEMBER_ID_HERE' with the ID and NEW_ROTATION with available number
-- ============================================================================
-- UPDATE public.user_stokvel_members
-- SET rotation_order = NEW_ROTATION
-- WHERE id = 'MEMBER_ID_HERE'
--   AND stokvel_id = '451290e4-3108-40b6-bc1a-adfc408059ee'
-- RETURNING *;

-- ============================================================================
-- STEP 7: Find the maximum rotation order currently in use
-- ============================================================================
SELECT
    MAX(rotation_order) as max_rotation_order,
    COUNT(*) as total_members,
    COUNT(*) FILTER (WHERE is_active = true) as active_members,
    COUNT(*) FILTER (WHERE is_active = false) as inactive_members
FROM public.user_stokvel_members
WHERE stokvel_id = '451290e4-3108-40b6-bc1a-adfc408059ee';

-- ============================================================================
-- STEP 8: Show all pending invitations with rotation orders
-- ============================================================================
SELECT
    id,
    full_name,
    email,
    rotation_order,
    status,
    expires_at,
    created_at
FROM public.stokvel_invitations
WHERE stokvel_id = '451290e4-3108-40b6-bc1a-adfc408059ee'
  AND status = 'pending'
  AND expires_at > NOW()
ORDER BY rotation_order;
