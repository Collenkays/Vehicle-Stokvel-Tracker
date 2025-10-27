-- Check all rotation orders for the stokvel to find conflicts
-- Replace YOUR_STOKVEL_ID with: 451290e4-3108-40b6-bc1a-adfc408059ee

-- Check active members and their rotation orders
SELECT
    'active_member' as source,
    id,
    full_name,
    email,
    rotation_order,
    is_active,
    created_at
FROM public.user_stokvel_members
WHERE stokvel_id = '451290e4-3108-40b6-bc1a-adfc408059ee'
  AND is_active = true
ORDER BY rotation_order;

-- Check ALL members (including inactive) to see if rotation 13 exists
SELECT
    'all_members' as source,
    id,
    full_name,
    email,
    rotation_order,
    is_active,
    created_at
FROM public.user_stokvel_members
WHERE stokvel_id = '451290e4-3108-40b6-bc1a-adfc408059ee'
ORDER BY rotation_order;

-- Check pending invitations
SELECT
    'pending_invitation' as source,
    id,
    full_name,
    email,
    rotation_order,
    status,
    expires_at
FROM public.stokvel_invitations
WHERE stokvel_id = '451290e4-3108-40b6-bc1a-adfc408059ee'
  AND status = 'pending'
  AND expires_at > NOW()
ORDER BY rotation_order;

-- Find gaps in rotation order sequence
WITH rotation_sequence AS (
    SELECT rotation_order
    FROM public.user_stokvel_members
    WHERE stokvel_id = '451290e4-3108-40b6-bc1a-adfc408059ee'
    UNION
    SELECT rotation_order
    FROM public.stokvel_invitations
    WHERE stokvel_id = '451290e4-3108-40b6-bc1a-adfc408059ee'
      AND status = 'pending'
      AND expires_at > NOW()
)
SELECT
    'gap_analysis' as info,
    MIN(rotation_order) as min_rotation,
    MAX(rotation_order) as max_rotation,
    COUNT(*) as total_slots_used,
    MAX(rotation_order) + 1 as next_available
FROM rotation_sequence;
