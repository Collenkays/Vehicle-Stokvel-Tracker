-- Fix contribution constraint issue
-- This adds a proper unique constraint to prevent duplicate contributions
-- for the same member in the same month

-- Option 1: Drop the constraint if you want to allow multiple contributions per month
-- ALTER TABLE public.stokvel_contributions
-- DROP CONSTRAINT IF EXISTS stokvel_contributions_stokvel_id_member_id_month_key;

-- Option 2: Keep the constraint but update existing schema documentation
-- Add this constraint to database-schema-multi-stokvel.sql after line 68:
-- UNIQUE(stokvel_id, member_id, month)

-- Option 3: Check if constraint exists and what it's called
SELECT
    con.conname AS constraint_name,
    pg_get_constraintdef(con.oid) AS constraint_definition
FROM pg_constraint con
JOIN pg_class rel ON rel.oid = con.conrelid
JOIN pg_namespace nsp ON nsp.oid = connamespace
WHERE rel.relname = 'stokvel_contributions'
AND con.contype = 'u';  -- u = unique constraint
