-- Fix database schema issues
-- Run this to correct the current schema problems

-- 1. Fix foreign key reference in stokvel_contributions
-- The member_id should reference auth.users, not user_stokvel_members
ALTER TABLE public.stokvel_contributions 
DROP CONSTRAINT IF EXISTS stokvel_contributions_member_id_fkey;

ALTER TABLE public.stokvel_contributions 
ADD CONSTRAINT stokvel_contributions_member_id_fkey 
FOREIGN KEY (member_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 2. Fix foreign key reference in stokvel_payouts
-- Change to reference auth.users instead of user_stokvel_members
ALTER TABLE public.stokvel_payouts 
DROP CONSTRAINT IF EXISTS stokvel_payouts_member_id_fkey;

-- Rename the column to be clearer
ALTER TABLE public.stokvel_payouts 
RENAME COLUMN member_id TO recipient_member_id;

ALTER TABLE public.stokvel_payouts 
ADD CONSTRAINT stokvel_payouts_recipient_member_id_fkey 
FOREIGN KEY (recipient_member_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 3. Add missing constraints and improve data integrity
-- Add check constraint for monthly_contribution
ALTER TABLE public.user_stokvels 
ADD CONSTRAINT check_monthly_contribution_positive 
CHECK (monthly_contribution > 0);

-- Add check constraint for target_amount
ALTER TABLE public.user_stokvels 
ADD CONSTRAINT check_target_amount_positive 
CHECK (target_amount IS NULL OR target_amount > 0);

-- Add check constraint for contribution amount
ALTER TABLE public.stokvel_contributions 
ADD CONSTRAINT check_contribution_amount_positive 
CHECK (amount > 0);

-- Add check constraint for payout amount
ALTER TABLE public.stokvel_payouts 
ADD CONSTRAINT check_payout_amount_positive 
CHECK (amount_paid > 0);

-- 4. Add unique constraint to prevent duplicate contributions per member per month
ALTER TABLE public.stokvel_contributions 
ADD CONSTRAINT unique_member_month_contribution 
UNIQUE (stokvel_id, member_id, month);

-- 5. Add missing indexes for better performance
CREATE INDEX IF NOT EXISTS idx_stokvel_payouts_stokvel ON public.stokvel_payouts(stokvel_id);
CREATE INDEX IF NOT EXISTS idx_stokvel_payouts_recipient ON public.stokvel_payouts(recipient_member_id);
CREATE INDEX IF NOT EXISTS idx_stokvel_payouts_status ON public.stokvel_payouts(status);

-- 6. Update the RLS policies to match the corrected schema
-- Drop and recreate policies that reference member_id in payouts
DROP POLICY IF EXISTS "Users can view payouts of their stokvels" ON public.stokvel_payouts;
DROP POLICY IF EXISTS "Stokvel owners can manage payouts" ON public.stokvel_payouts;

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