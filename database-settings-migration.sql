-- =============================================
-- Settings Feature Database Migration
-- =============================================
-- This migration adds comprehensive settings support for:
-- 1. User preferences (global account settings)
-- 2. Stokvel notification settings
-- 3. Enhanced stokvel rule configurations
-- =============================================

-- =============================================
-- 1. CREATE user_preferences TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL UNIQUE,

  -- Notification settings
  notification_email BOOLEAN DEFAULT true,
  notification_push BOOLEAN DEFAULT true,
  notification_frequency VARCHAR(20) DEFAULT 'immediate', -- immediate, daily, weekly

  -- Display settings
  date_format VARCHAR(20) DEFAULT 'DD/MM/YYYY', -- DD/MM/YYYY, MM/DD/YYYY, YYYY-MM-DD
  currency_display VARCHAR(10) DEFAULT 'ZAR',
  language VARCHAR(10) DEFAULT 'en',
  theme VARCHAR(20) DEFAULT 'light', -- light, dark, system
  dashboard_default_view VARCHAR(50) DEFAULT 'overview', -- overview, contributions, members

  -- Profile settings
  phone_number VARCHAR(20),
  profile_picture_url TEXT,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);

-- =============================================
-- 2. ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================

ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can insert own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can update own preferences" ON user_preferences;

-- Allow users to view their own preferences
CREATE POLICY "Users can view own preferences"
  ON user_preferences FOR SELECT
  USING (auth.uid() = user_id);

-- Allow users to insert their own preferences
CREATE POLICY "Users can insert own preferences"
  ON user_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own preferences
CREATE POLICY "Users can update own preferences"
  ON user_preferences FOR UPDATE
  USING (auth.uid() = user_id);

-- =============================================
-- 3. EXTEND user_stokvels TABLE
-- =============================================

-- Add notification settings (JSONB for flexibility)
ALTER TABLE user_stokvels
ADD COLUMN IF NOT EXISTS notification_settings JSONB DEFAULT '{
  "contribution_reminders": true,
  "payout_notifications": true,
  "member_activity_alerts": true,
  "payment_verification_alerts": true,
  "reminder_frequency": "weekly"
}'::jsonb;

-- Add contribution rule settings
ALTER TABLE user_stokvels
ADD COLUMN IF NOT EXISTS late_payment_penalty_rate NUMERIC(5,2) DEFAULT 0 CHECK (late_payment_penalty_rate >= 0 AND late_payment_penalty_rate <= 100);

ALTER TABLE user_stokvels
ADD COLUMN IF NOT EXISTS grace_period_days INTEGER DEFAULT 5 CHECK (grace_period_days >= 0);

ALTER TABLE user_stokvels
ADD COLUMN IF NOT EXISTS joining_fee NUMERIC(10,2) DEFAULT 0 CHECK (joining_fee >= 0);

ALTER TABLE user_stokvels
ADD COLUMN IF NOT EXISTS require_payment_verification BOOLEAN DEFAULT true;

-- Add payout rule settings
ALTER TABLE user_stokvels
ADD COLUMN IF NOT EXISTS allow_emergency_withdrawals BOOLEAN DEFAULT false;

ALTER TABLE user_stokvels
ADD COLUMN IF NOT EXISTS emergency_withdrawal_limit NUMERIC(10,2) DEFAULT 0 CHECK (emergency_withdrawal_limit >= 0);

ALTER TABLE user_stokvels
ADD COLUMN IF NOT EXISTS minimum_rollover_balance NUMERIC(10,2) DEFAULT 0 CHECK (minimum_rollover_balance >= 0);

-- =============================================
-- 4. CREATE UPDATED_AT TRIGGER FUNCTION
-- =============================================

-- Create or replace trigger function for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS update_user_preferences_updated_at ON user_preferences;

-- Create trigger for user_preferences
CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- 5. SEED DEFAULT PREFERENCES FOR EXISTING USERS
-- =============================================

-- Create default preferences for all existing users who don't have them
INSERT INTO user_preferences (user_id)
SELECT id FROM auth.users
WHERE NOT EXISTS (
  SELECT 1 FROM user_preferences WHERE user_preferences.user_id = auth.users.id
)
ON CONFLICT (user_id) DO NOTHING;

-- =============================================
-- 6. ADD COMMENTS FOR DOCUMENTATION
-- =============================================

COMMENT ON TABLE user_preferences IS 'Stores global user account preferences and settings';
COMMENT ON COLUMN user_preferences.notification_email IS 'Enable/disable email notifications';
COMMENT ON COLUMN user_preferences.notification_push IS 'Enable/disable push notifications (PWA)';
COMMENT ON COLUMN user_preferences.notification_frequency IS 'Notification frequency: immediate, daily, weekly';
COMMENT ON COLUMN user_preferences.date_format IS 'Preferred date format for display';
COMMENT ON COLUMN user_preferences.theme IS 'UI theme preference: light, dark, system';
COMMENT ON COLUMN user_preferences.dashboard_default_view IS 'Default view when opening dashboard';

COMMENT ON COLUMN user_stokvels.notification_settings IS 'JSONB object containing stokvel-specific notification preferences';
COMMENT ON COLUMN user_stokvels.late_payment_penalty_rate IS 'Percentage penalty for late contributions (0-100)';
COMMENT ON COLUMN user_stokvels.grace_period_days IS 'Number of days grace period before penalties apply';
COMMENT ON COLUMN user_stokvels.joining_fee IS 'One-time fee charged when joining the stokvel';
COMMENT ON COLUMN user_stokvels.require_payment_verification IS 'Whether contributions require proof of payment verification';
COMMENT ON COLUMN user_stokvels.allow_emergency_withdrawals IS 'Whether members can request emergency withdrawals';
COMMENT ON COLUMN user_stokvels.emergency_withdrawal_limit IS 'Maximum amount allowed for emergency withdrawals';
COMMENT ON COLUMN user_stokvels.minimum_rollover_balance IS 'Minimum balance to maintain after payouts';

-- =============================================
-- 7. GRANT PERMISSIONS
-- =============================================

-- Grant necessary permissions (adjust based on your setup)
GRANT SELECT, INSERT, UPDATE ON user_preferences TO authenticated;
GRANT USAGE ON SEQUENCE user_preferences_id_seq TO authenticated;

-- =============================================
-- 8. CREATE HELPER FUNCTIONS (OPTIONAL)
-- =============================================

-- Function to get or create user preferences
CREATE OR REPLACE FUNCTION get_or_create_user_preferences(p_user_id UUID)
RETURNS user_preferences AS $$
DECLARE
  v_preferences user_preferences;
BEGIN
  -- Try to get existing preferences
  SELECT * INTO v_preferences FROM user_preferences WHERE user_id = p_user_id;

  -- If not found, create default preferences
  IF NOT FOUND THEN
    INSERT INTO user_preferences (user_id)
    VALUES (p_user_id)
    RETURNING * INTO v_preferences;
  END IF;

  RETURN v_preferences;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- MIGRATION COMPLETE
-- =============================================

-- Verify migration
DO $$
BEGIN
  RAISE NOTICE 'Settings migration completed successfully!';
  RAISE NOTICE 'Tables created/updated: user_preferences, user_stokvels';
  RAISE NOTICE 'RLS policies applied: user_preferences';
  RAISE NOTICE 'Triggers created: update_user_preferences_updated_at';
END $$;
