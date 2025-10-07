-- Migration: Add fairness calculation fields to user_stokvel_members table
-- Description: Adds total_paid, net_position, and adjustment fields for actuarial fairness calculations

-- Add fairness calculation fields
ALTER TABLE user_stokvel_members
ADD COLUMN IF NOT EXISTS total_paid NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS net_position NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS adjustment NUMERIC DEFAULT 0;

-- Add comments for documentation
COMMENT ON COLUMN user_stokvel_members.total_paid IS 'Total amount contributed by the member across all months';
COMMENT ON COLUMN user_stokvel_members.net_position IS 'Vehicle value minus total paid (100,000 - total_paid)';
COMMENT ON COLUMN user_stokvel_members.adjustment IS 'Fairness adjustment: average_net_position - member_net_position. Positive = receive, Negative = pay';

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_user_stokvel_members_fairness
ON user_stokvel_members(stokvel_id, vehicle_received, total_paid);

-- Update existing records to have default values
UPDATE user_stokvel_members
SET
  total_paid = 0,
  net_position = 0,
  adjustment = 0
WHERE total_paid IS NULL;
