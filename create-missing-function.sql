-- Create the missing get_user_stokvel_summaries function
-- This function is needed for the MyStokvels page to work properly

-- Create a security-definer function to get stokvel summaries with proper RLS
CREATE OR REPLACE FUNCTION public.get_user_stokvel_summaries()
RETURNS TABLE (
    id UUID,
    name TEXT,
    description TEXT,
    type_name TEXT,
    icon TEXT,
    monthly_contribution NUMERIC,
    target_amount NUMERIC,
    currency TEXT,
    start_date DATE,
    is_active BOOLEAN,
    member_count BIGINT,
    total_verified_contributions NUMERIC,
    total_pending_contributions NUMERIC,
    total_payouts NUMERIC,
    owner_id UUID
)
LANGUAGE sql
SECURITY DEFINER
AS $$
    SELECT 
        us.id,
        us.name,
        us.description,
        st.name as type_name,
        st.icon,
        us.monthly_contribution,
        us.target_amount,
        us.currency,
        us.start_date,
        us.is_active,
        COUNT(DISTINCT usm.id) as member_count,
        COALESCE(SUM(CASE WHEN sc.verified = true THEN sc.amount ELSE 0 END), 0) as total_verified_contributions,
        COALESCE(SUM(CASE WHEN sc.verified = false THEN sc.amount ELSE 0 END), 0) as total_pending_contributions,
        COALESCE(SUM(sp.amount_paid), 0) as total_payouts,
        us.owner_id
    FROM public.user_stokvels us
    LEFT JOIN public.stokvel_types st ON us.stokvel_type_id = st.id
    LEFT JOIN public.user_stokvel_members usm ON us.id = usm.stokvel_id AND usm.is_active = true
    LEFT JOIN public.stokvel_contributions sc ON us.id = sc.stokvel_id
    LEFT JOIN public.stokvel_payouts sp ON us.id = sp.stokvel_id AND sp.status = 'completed'
    WHERE us.is_active = true 
    AND (
        us.owner_id = auth.uid() OR 
        EXISTS (
            SELECT 1 FROM public.user_stokvel_members usm2
            WHERE usm2.stokvel_id = us.id AND usm2.member_id = auth.uid() AND usm2.is_active = true
        )
    )
    GROUP BY us.id, st.name, st.icon;
$$;