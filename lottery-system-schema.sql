-- Lottery System Database Schema for Vehicle Stokvel Tracker
-- Adds support for lottery-based rotation order generation with audit trail

-- Add rotation method field to user_stokvels table
ALTER TABLE user_stokvels
ADD COLUMN IF NOT EXISTS rotation_method TEXT DEFAULT 'manual'
CHECK (rotation_method IN ('manual', 'random', 'weighted'));

ALTER TABLE user_stokvels
ADD COLUMN IF NOT EXISTS last_lottery_date TIMESTAMPTZ;

-- Create stokvel_lottery_history table for audit trail
CREATE TABLE IF NOT EXISTS stokvel_lottery_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stokvel_id UUID NOT NULL REFERENCES user_stokvels(id) ON DELETE CASCADE,
    lottery_method TEXT NOT NULL CHECK (lottery_method IN ('manual', 'random', 'weighted')),
    conducted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    conducted_by UUID NOT NULL REFERENCES auth.users(id),
    total_participants INTEGER NOT NULL,
    excluded_members JSONB DEFAULT '[]'::jsonb,
    lottery_results JSONB NOT NULL,
    random_seed TEXT,
    weighting_config JSONB,
    is_active BOOLEAN DEFAULT true,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for efficient queries
CREATE INDEX IF NOT EXISTS idx_lottery_history_stokvel
ON stokvel_lottery_history(stokvel_id, conducted_at DESC);

CREATE INDEX IF NOT EXISTS idx_lottery_history_active
ON stokvel_lottery_history(stokvel_id, is_active)
WHERE is_active = true;

-- Add comments for documentation
COMMENT ON TABLE stokvel_lottery_history IS 'Audit trail for all lottery draws conducted to determine member rotation order';
COMMENT ON COLUMN stokvel_lottery_history.lottery_method IS 'Method used: manual (admin set), random (pure lottery), weighted (tenure/contribution based)';
COMMENT ON COLUMN stokvel_lottery_history.lottery_results IS 'JSON array of lottery results with member_id, rotation_order, and metadata';
COMMENT ON COLUMN stokvel_lottery_history.random_seed IS 'Cryptographic seed used for random generation (for transparency)';
COMMENT ON COLUMN stokvel_lottery_history.weighting_config IS 'Configuration used for weighted lottery (tenure_weight, contribution_weight)';
COMMENT ON COLUMN stokvel_lottery_history.excluded_members IS 'Array of member IDs excluded from lottery (e.g., already received vehicle)';

-- Create function to update user_stokvel_members rotation_order from lottery results
CREATE OR REPLACE FUNCTION apply_lottery_results(
    p_stokvel_id UUID,
    p_lottery_results JSONB
) RETURNS void AS $$
DECLARE
    lottery_item JSONB;
BEGIN
    -- Loop through each lottery result and update member rotation order
    FOR lottery_item IN SELECT jsonb_array_elements(p_lottery_results)
    LOOP
        UPDATE user_stokvel_members
        SET rotation_order = (lottery_item->>'rotationOrder')::INTEGER,
            updated_at = NOW()
        WHERE stokvel_id = p_stokvel_id
          AND id = (lottery_item->>'memberId')::UUID;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to conduct and record lottery
CREATE OR REPLACE FUNCTION conduct_lottery(
    p_stokvel_id UUID,
    p_lottery_method TEXT,
    p_conducted_by UUID,
    p_lottery_results JSONB,
    p_random_seed TEXT DEFAULT NULL,
    p_weighting_config JSONB DEFAULT NULL,
    p_excluded_members JSONB DEFAULT '[]'::jsonb,
    p_notes TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    v_lottery_id UUID;
    v_total_participants INTEGER;
BEGIN
    -- Calculate total participants
    v_total_participants := jsonb_array_length(p_lottery_results);

    -- Deactivate previous lottery records for this stokvel
    UPDATE stokvel_lottery_history
    SET is_active = false,
        updated_at = NOW()
    WHERE stokvel_id = p_stokvel_id
      AND is_active = true;

    -- Insert new lottery record
    INSERT INTO stokvel_lottery_history (
        stokvel_id,
        lottery_method,
        conducted_by,
        total_participants,
        excluded_members,
        lottery_results,
        random_seed,
        weighting_config,
        notes
    ) VALUES (
        p_stokvel_id,
        p_lottery_method,
        p_conducted_by,
        v_total_participants,
        p_excluded_members,
        p_lottery_results,
        p_random_seed,
        p_weighting_config,
        p_notes
    ) RETURNING id INTO v_lottery_id;

    -- Apply lottery results to member rotation orders
    PERFORM apply_lottery_results(p_stokvel_id, p_lottery_results);

    -- Update stokvel with lottery metadata
    UPDATE user_stokvels
    SET rotation_method = p_lottery_method,
        last_lottery_date = NOW(),
        updated_at = NOW()
    WHERE id = p_stokvel_id;

    RETURN v_lottery_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get active lottery for a stokvel
CREATE OR REPLACE FUNCTION get_active_lottery(p_stokvel_id UUID)
RETURNS TABLE (
    id UUID,
    lottery_method TEXT,
    conducted_at TIMESTAMPTZ,
    conducted_by UUID,
    conductor_name TEXT,
    total_participants INTEGER,
    excluded_members JSONB,
    lottery_results JSONB,
    random_seed TEXT,
    weighting_config JSONB,
    notes TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        slh.id,
        slh.lottery_method,
        slh.conducted_at,
        slh.conducted_by,
        COALESCE(au.email::text, 'Unknown') as conductor_name,
        slh.total_participants,
        slh.excluded_members,
        slh.lottery_results,
        slh.random_seed,
        slh.weighting_config,
        slh.notes
    FROM stokvel_lottery_history slh
    LEFT JOIN auth.users au ON au.id = slh.conducted_by
    WHERE slh.stokvel_id = p_stokvel_id
      AND slh.is_active = true
    ORDER BY slh.conducted_at DESC
    LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get lottery history for a stokvel
CREATE OR REPLACE FUNCTION get_lottery_history(
    p_stokvel_id UUID,
    p_limit INTEGER DEFAULT 10
) RETURNS TABLE (
    id UUID,
    lottery_method TEXT,
    conducted_at TIMESTAMPTZ,
    conducted_by UUID,
    conductor_name TEXT,
    total_participants INTEGER,
    excluded_members JSONB,
    lottery_results JSONB,
    is_active BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        slh.id,
        slh.lottery_method,
        slh.conducted_at,
        slh.conducted_by,
        COALESCE(au.email::text, 'Unknown') as conductor_name,
        slh.total_participants,
        slh.excluded_members,
        slh.lottery_results,
        slh.is_active
    FROM stokvel_lottery_history slh
    LEFT JOIN auth.users au ON au.id = slh.conducted_by
    WHERE slh.stokvel_id = p_stokvel_id
    ORDER BY slh.conducted_at DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT SELECT, INSERT ON stokvel_lottery_history TO authenticated;
GRANT EXECUTE ON FUNCTION conduct_lottery TO authenticated;
GRANT EXECUTE ON FUNCTION apply_lottery_results TO authenticated;
GRANT EXECUTE ON FUNCTION get_active_lottery TO authenticated;
GRANT EXECUTE ON FUNCTION get_lottery_history TO authenticated;

-- RLS Policies for stokvel_lottery_history
ALTER TABLE stokvel_lottery_history ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view lottery history for stokvels they are members of
CREATE POLICY "Users can view lottery history for their stokvels"
ON stokvel_lottery_history
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM user_stokvel_members usm
        WHERE usm.stokvel_id = stokvel_lottery_history.stokvel_id
          AND usm.member_id = auth.uid()
          AND usm.is_active = true
    )
);

-- Policy: Only stokvel admins can conduct lottery
CREATE POLICY "Admins can insert lottery records"
ON stokvel_lottery_history
FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM user_stokvel_members usm
        WHERE usm.stokvel_id = stokvel_lottery_history.stokvel_id
          AND usm.member_id = auth.uid()
          AND usm.role = 'admin'
          AND usm.is_active = true
    )
);

-- Add trigger for updated_at timestamp
CREATE OR REPLACE FUNCTION update_lottery_history_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_lottery_history_updated_at
    BEFORE UPDATE ON stokvel_lottery_history
    FOR EACH ROW
    EXECUTE FUNCTION update_lottery_history_updated_at();
