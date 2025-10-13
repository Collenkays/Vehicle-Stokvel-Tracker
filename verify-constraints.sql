-- Constraint Verification Script
-- Run this in Supabase SQL Editor to verify all constraints exist

-- 1. Check UNIQUE constraints
SELECT
    tc.table_name,
    tc.constraint_name,
    tc.constraint_type,
    STRING_AGG(kcu.column_name, ', ' ORDER BY kcu.ordinal_position) AS columns
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
WHERE tc.table_schema = 'public'
    AND tc.table_name IN (
        'user_stokvel_members',
        'stokvel_contributions'
    )
    AND tc.constraint_type = 'UNIQUE'
GROUP BY tc.table_name, tc.constraint_name, tc.constraint_type
ORDER BY tc.table_name, tc.constraint_name;

-- Expected results:
-- user_stokvel_members: UNIQUE(stokvel_id, member_id)
-- user_stokvel_members: UNIQUE(stokvel_id, rotation_order)
-- stokvel_contributions: UNIQUE(stokvel_id, member_id, month)

-- 2. Check FOREIGN KEY constraints
SELECT
    tc.table_name,
    tc.constraint_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_schema = 'public'
    AND tc.table_name IN (
        'user_stokvels',
        'user_stokvel_members',
        'stokvel_contributions',
        'stokvel_payouts'
    )
ORDER BY tc.table_name, tc.constraint_name;

-- Expected foreign keys:
-- user_stokvels.owner_id → auth.users.id
-- user_stokvels.stokvel_type_id → stokvel_types.id
-- user_stokvel_members.stokvel_id → user_stokvels.id
-- user_stokvel_members.member_id → auth.users.id
-- stokvel_contributions.stokvel_id → user_stokvels.id
-- stokvel_contributions.member_id → user_stokvel_members.id
-- stokvel_payouts.stokvel_id → user_stokvels.id
-- stokvel_payouts.recipient_member_id → auth.users.id

-- 3. Check CHECK constraints
SELECT
    tc.table_name,
    tc.constraint_name,
    cc.check_clause
FROM information_schema.table_constraints tc
JOIN information_schema.check_constraints cc
    ON tc.constraint_name = cc.constraint_name
WHERE tc.table_schema = 'public'
    AND tc.table_name IN (
        'user_stokvels',
        'user_stokvel_members',
        'stokvel_contributions',
        'stokvel_payouts'
    )
ORDER BY tc.table_name, tc.constraint_name;

-- Expected CHECK constraints:
-- user_stokvel_members.role IN ('admin', 'member')
-- stokvel_payouts.status IN ('pending', 'completed', 'cancelled')

-- 4. Check indexes
SELECT
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
    AND tablename IN (
        'stokvel_types',
        'user_stokvels',
        'user_stokvel_members',
        'stokvel_contributions',
        'stokvel_payouts'
    )
ORDER BY tablename, indexname;

-- 5. Add missing constraints if they don't exist
-- Run these only if the above queries show they're missing:

-- Missing UNIQUE constraint on stokvel_contributions
-- ALTER TABLE public.stokvel_contributions
-- ADD CONSTRAINT unique_member_month_contribution
-- UNIQUE (stokvel_id, member_id, month);

-- Missing CHECK constraints
-- ALTER TABLE public.user_stokvels
-- ADD CONSTRAINT check_monthly_contribution_positive
-- CHECK (monthly_contribution > 0);

-- ALTER TABLE public.user_stokvels
-- ADD CONSTRAINT check_target_amount_positive
-- CHECK (target_amount IS NULL OR target_amount > 0);

-- ALTER TABLE public.stokvel_contributions
-- ADD CONSTRAINT check_contribution_amount_positive
-- CHECK (amount > 0);

-- ALTER TABLE public.stokvel_payouts
-- ADD CONSTRAINT check_payout_amount_positive
-- CHECK (amount_paid > 0);
