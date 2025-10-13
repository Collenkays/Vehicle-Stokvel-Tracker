-- Multi-Stokvel Type Creator Database Schema
-- This schema supports multiple types of stokvels with dynamic rules and configurations

-- Enable RLS
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create stokvel_types table (predefined templates)
CREATE TABLE IF NOT EXISTS public.stokvel_types (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    description TEXT NOT NULL,
    rules_template JSONB NOT NULL,
    icon TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create user_stokvels table (user-created stokvels)
CREATE TABLE IF NOT EXISTS public.user_stokvels (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    stokvel_type_id UUID REFERENCES public.stokvel_types(id) ON DELETE RESTRICT,
    name TEXT NOT NULL,
    description TEXT,
    monthly_contribution NUMERIC NOT NULL,
    target_amount NUMERIC,
    currency TEXT DEFAULT 'ZAR',
    start_date DATE NOT NULL,
    rules JSONB NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create user_stokvel_members table (members per stokvel)
CREATE TABLE IF NOT EXISTS public.user_stokvel_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    stokvel_id UUID REFERENCES public.user_stokvels(id) ON DELETE CASCADE,
    member_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT CHECK (role IN ('admin', 'member')) DEFAULT 'member',
    rotation_order INTEGER,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    contact_number TEXT,
    vehicle_received BOOLEAN DEFAULT FALSE,
    month_received TEXT,
    join_date DATE DEFAULT CURRENT_DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(stokvel_id, member_id),
    UNIQUE(stokvel_id, rotation_order)
);

-- Create stokvel_contributions table (contributions per stokvel)
-- Note: member_id references user_stokvel_members.id (the member record for this stokvel)
CREATE TABLE IF NOT EXISTS public.stokvel_contributions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    stokvel_id UUID REFERENCES public.user_stokvels(id) ON DELETE CASCADE,
    member_id UUID REFERENCES public.user_stokvel_members(id) ON DELETE CASCADE,
    month TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    date_paid DATE NOT NULL,
    proof_of_payment TEXT,
    verified BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(stokvel_id, member_id, month) -- Prevent duplicate contributions per member per month
);

-- Create stokvel_payouts table (payouts per stokvel)
CREATE TABLE IF NOT EXISTS public.stokvel_payouts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    stokvel_id UUID REFERENCES public.user_stokvels(id) ON DELETE CASCADE,
    recipient_member_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    month_paid TEXT NOT NULL,
    amount_paid NUMERIC NOT NULL,
    rollover_balance NUMERIC DEFAULT 0,
    payout_type TEXT DEFAULT 'cash', -- cash, goods, investment, etc.
    status TEXT CHECK (status IN ('pending', 'completed', 'cancelled')) DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for better performance
CREATE INDEX idx_stokvel_types_name ON public.stokvel_types(name);
CREATE INDEX idx_stokvel_types_active ON public.stokvel_types(is_active);

CREATE INDEX idx_user_stokvels_owner ON public.user_stokvels(owner_id);
CREATE INDEX idx_user_stokvels_type ON public.user_stokvels(stokvel_type_id);
CREATE INDEX idx_user_stokvels_active ON public.user_stokvels(is_active);

CREATE INDEX idx_stokvel_members_stokvel ON public.user_stokvel_members(stokvel_id);
CREATE INDEX idx_stokvel_members_rotation ON public.user_stokvel_members(stokvel_id, rotation_order);
CREATE INDEX idx_stokvel_members_received ON public.user_stokvel_members(vehicle_received);

CREATE INDEX idx_stokvel_contributions_stokvel ON public.stokvel_contributions(stokvel_id);
CREATE INDEX idx_stokvel_contributions_member ON public.stokvel_contributions(member_id);
CREATE INDEX idx_stokvel_contributions_month ON public.stokvel_contributions(month);
CREATE INDEX idx_stokvel_contributions_verified ON public.stokvel_contributions(verified);

CREATE INDEX idx_stokvel_payouts_stokvel ON public.stokvel_payouts(stokvel_id);
CREATE INDEX idx_stokvel_payouts_member ON public.stokvel_payouts(member_id);
CREATE INDEX idx_stokvel_payouts_status ON public.stokvel_payouts(status);

-- Enable Row Level Security (RLS)
ALTER TABLE public.stokvel_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_stokvels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_stokvel_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stokvel_contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stokvel_payouts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for stokvel_types (public read)
CREATE POLICY "Enable read access for all authenticated users" ON public.stokvel_types
    FOR SELECT USING (auth.role() = 'authenticated' AND is_active = true);

-- RLS Policies for user_stokvels (users can only access their own stokvels)
CREATE POLICY "Users can view their own stokvels" ON public.user_stokvels
    FOR SELECT USING (
        auth.uid() = owner_id
    );

CREATE POLICY "Users can create stokvels" ON public.user_stokvels
    FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can update their stokvels" ON public.user_stokvels
    FOR UPDATE USING (auth.uid() = owner_id);

-- RLS Policies for user_stokvel_members
CREATE POLICY "Users can view members of their stokvels" ON public.user_stokvel_members
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_stokvels 
            WHERE id = stokvel_id AND owner_id = auth.uid()
        ) OR 
        member_id = auth.uid()
    );

CREATE POLICY "Stokvel owners can manage members" ON public.user_stokvel_members
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_stokvels 
            WHERE id = stokvel_id AND owner_id = auth.uid()
        )
    );

-- RLS Policies for stokvel_contributions
CREATE POLICY "Users can view contributions of their stokvels" ON public.stokvel_contributions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_stokvels 
            WHERE id = stokvel_id AND owner_id = auth.uid()
        ) OR
        member_id = auth.uid()
    );

CREATE POLICY "Stokvel owners and members can manage contributions" ON public.stokvel_contributions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_stokvels 
            WHERE id = stokvel_id AND owner_id = auth.uid()
        ) OR
        member_id = auth.uid()
    );

-- RLS Policies for stokvel_payouts
CREATE POLICY "Users can view payouts of their stokvels" ON public.stokvel_payouts
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_stokvels 
            WHERE id = stokvel_id AND owner_id = auth.uid()
        ) OR
        recipient_member_id = auth.uid()
    );

CREATE POLICY "Stokvel owners can manage payouts" ON public.stokvel_payouts
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_stokvels 
            WHERE id = stokvel_id AND owner_id = auth.uid()
        )
    );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.stokvel_types
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.user_stokvels
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.user_stokvel_members
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.stokvel_contributions
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.stokvel_payouts
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Insert predefined stokvel types
INSERT INTO public.stokvel_types (name, description, rules_template, icon) VALUES
(
    'Vehicle Stokvel',
    'Members pool funds to buy vehicles on rotation.',
    '{
        "payout_trigger": "on_threshold_reached",
        "target_amount": 100000,
        "allow_rollover": true,
        "distribution_type": "vehicle",
        "rotation_based": true,
        "frequency": "monthly"
    }',
    '🚗'
),
(
    'Savings Stokvel',
    'Rotational cash payout between members each month.',
    '{
        "payout_trigger": "monthly_rotation",
        "target_amount": null,
        "allow_rollover": true,
        "distribution_type": "cash",
        "rotation_based": true,
        "frequency": "monthly"
    }',
    '💰'
),
(
    'Grocery Stokvel',
    'Members contribute to bulk grocery purchases at year-end.',
    '{
        "payout_trigger": "once_per_year",
        "target_amount": null,
        "distribution_type": "goods",
        "rotation_based": false,
        "frequency": "yearly",
        "payout_month": "December"
    }',
    '🛒'
),
(
    'Burial Society',
    'Funds to support funeral expenses for members or their families.',
    '{
        "payout_trigger": "on_event",
        "allow_emergency_withdrawals": true,
        "distribution_type": "cash",
        "rotation_based": false,
        "frequency": "as_needed",
        "emergency_fund": true
    }',
    '🕊️'
),
(
    'Investment Stokvel',
    'Funds are pooled to invest in property, shares, or businesses.',
    '{
        "payout_trigger": "on_profit_distribution",
        "investment_type": "property|shares|business",
        "distribution_type": "profit_share",
        "rotation_based": false,
        "frequency": "quarterly",
        "reinvestment_option": true
    }',
    '📈'
),
(
    'Education Stokvel',
    'Support members with education and training expenses.',
    '{
        "payout_trigger": "on_application",
        "target_amount": null,
        "distribution_type": "educational_support",
        "rotation_based": true,
        "frequency": "as_needed",
        "application_required": true
    }',
    '🎓'
),
(
    'Holiday Stokvel',
    'Save for holiday and travel expenses throughout the year.',
    '{
        "payout_trigger": "seasonal",
        "target_amount": null,
        "distribution_type": "cash",
        "rotation_based": false,
        "frequency": "yearly",
        "payout_month": "November"
    }',
    '✈️'
)
ON CONFLICT (name) DO NOTHING;

-- Create views for easier data access
-- Note: Views inherit RLS policies from their underlying tables
CREATE OR REPLACE VIEW public.stokvel_summary AS
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
GROUP BY us.id, st.name, st.icon;

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