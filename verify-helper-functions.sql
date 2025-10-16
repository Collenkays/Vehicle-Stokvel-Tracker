-- Verify the helper functions are correct
-- This shows the actual function definitions

SELECT
    p.proname as function_name,
    pg_get_functiondef(p.oid) as definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
  AND p.proname IN ('is_stokvel_owner', 'is_stokvel_member', 'is_stokvel_admin')
ORDER BY p.proname;
