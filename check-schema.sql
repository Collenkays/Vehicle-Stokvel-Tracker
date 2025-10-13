-- Check if all tables exist
SELECT
    table_name,
    table_type
FROM information_schema.tables
WHERE table_schema = 'public'
    AND table_name IN (
        'stokvel_types',
        'user_stokvels',
        'user_stokvel_members',
        'stokvel_contributions',
        'stokvel_payouts'
    )
ORDER BY table_name;

-- Check table columns for user_stokvel_members (to see if fairness fields exist)
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
    AND table_name = 'user_stokvel_members'
ORDER BY ordinal_position;

-- Check RLS policies
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Check for storage bucket
SELECT
    id,
    name,
    public
FROM storage.buckets
WHERE name = 'proof-of-payments';

-- Check indexes
SELECT
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
