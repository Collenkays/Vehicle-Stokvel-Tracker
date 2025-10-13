-- Stokvel Invitations Migration
-- Enables token-based member invitations with email/phone verification

-- Create stokvel_invitations table
CREATE TABLE IF NOT EXISTS public.stokvel_invitations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    stokvel_id UUID REFERENCES public.user_stokvels(id) ON DELETE CASCADE NOT NULL,
    invited_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

    -- Invitee information (pre-populated by admin)
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    contact_number TEXT,

    -- Invitation details
    token TEXT UNIQUE NOT NULL,
    role TEXT CHECK (role IN ('admin', 'member')) DEFAULT 'member' NOT NULL,
    rotation_order INTEGER,

    -- Single-use token control
    max_uses INTEGER DEFAULT 1 NOT NULL,
    current_uses INTEGER DEFAULT 0 NOT NULL,

    -- Status tracking
    status TEXT CHECK (status IN ('pending', 'accepted', 'expired', 'revoked')) DEFAULT 'pending' NOT NULL,

    -- Timestamps
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    accepted_at TIMESTAMP WITH TIME ZONE,
    accepted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,

    -- Constraints
    CHECK (current_uses <= max_uses),
    CHECK (expires_at > created_at)
);

-- Create indexes for better performance
CREATE INDEX idx_stokvel_invitations_stokvel ON public.stokvel_invitations(stokvel_id);
CREATE INDEX idx_stokvel_invitations_token ON public.stokvel_invitations(token);
CREATE INDEX idx_stokvel_invitations_email ON public.stokvel_invitations(email);
CREATE INDEX idx_stokvel_invitations_status ON public.stokvel_invitations(status);
CREATE INDEX idx_stokvel_invitations_expires ON public.stokvel_invitations(expires_at);

-- Enable Row Level Security
ALTER TABLE public.stokvel_invitations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for stokvel_invitations

-- Admins can view invitations for their stokvels
CREATE POLICY "Admins can view invitations for their stokvels" ON public.stokvel_invitations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_stokvel_members usm
            WHERE usm.stokvel_id = stokvel_invitations.stokvel_id
            AND usm.member_id = auth.uid()
            AND usm.role = 'admin'
            AND usm.is_active = true
        )
    );

-- Admins can create invitations for their stokvels
CREATE POLICY "Admins can create invitations" ON public.stokvel_invitations
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_stokvel_members usm
            WHERE usm.stokvel_id = stokvel_id
            AND usm.member_id = auth.uid()
            AND usm.role = 'admin'
            AND usm.is_active = true
        )
    );

-- Admins can update invitations for their stokvels (for revoking, etc.)
CREATE POLICY "Admins can update invitations" ON public.stokvel_invitations
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.user_stokvel_members usm
            WHERE usm.stokvel_id = stokvel_invitations.stokvel_id
            AND usm.member_id = auth.uid()
            AND usm.role = 'admin'
            AND usm.is_active = true
        )
    );

-- Anyone with the token can view their invitation (for accepting)
CREATE POLICY "Token holders can view invitation" ON public.stokvel_invitations
    FOR SELECT USING (
        status = 'pending'
        AND expires_at > timezone('utc'::text, now())
        AND current_uses < max_uses
    );

-- Create trigger for updated_at
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.stokvel_invitations
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Function to validate invitation token and get invitation details
CREATE OR REPLACE FUNCTION public.validate_invitation_token(
    invitation_token TEXT
)
RETURNS TABLE (
    id UUID,
    stokvel_id UUID,
    stokvel_name TEXT,
    full_name TEXT,
    email TEXT,
    contact_number TEXT,
    role TEXT,
    rotation_order INTEGER,
    expires_at TIMESTAMP WITH TIME ZONE,
    is_valid BOOLEAN
)
LANGUAGE sql
SECURITY DEFINER
AS $$
    SELECT
        i.id,
        i.stokvel_id,
        s.name as stokvel_name,
        i.full_name,
        i.email,
        i.contact_number,
        i.role,
        i.rotation_order,
        i.expires_at,
        (
            i.status = 'pending'
            AND i.expires_at > timezone('utc'::text, now())
            AND i.current_uses < i.max_uses
        ) as is_valid
    FROM public.stokvel_invitations i
    LEFT JOIN public.user_stokvels s ON i.stokvel_id = s.id
    WHERE i.token = invitation_token;
$$;

-- Function to accept invitation and create member record
CREATE OR REPLACE FUNCTION public.accept_invitation(
    invitation_token TEXT,
    user_email TEXT,
    user_phone TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_invitation RECORD;
    v_user_id UUID;
    v_member_id UUID;
    v_result JSONB;
BEGIN
    -- Get current user
    v_user_id := auth.uid();

    IF v_user_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
    END IF;

    -- Get and validate invitation
    SELECT * INTO v_invitation
    FROM public.stokvel_invitations
    WHERE token = invitation_token
    AND status = 'pending'
    AND expires_at > timezone('utc'::text, now())
    AND current_uses < max_uses;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Invalid or expired invitation');
    END IF;

    -- Verify email/phone matches invitation
    IF LOWER(user_email) != LOWER(v_invitation.email) THEN
        IF user_phone IS NULL OR user_phone != v_invitation.contact_number THEN
            RETURN jsonb_build_object(
                'success', false,
                'error', 'Email or phone number does not match invitation'
            );
        END IF;
    END IF;

    -- Check if user is already a member
    IF EXISTS (
        SELECT 1 FROM public.user_stokvel_members
        WHERE stokvel_id = v_invitation.stokvel_id
        AND member_id = v_user_id
        AND is_active = true
    ) THEN
        RETURN jsonb_build_object('success', false, 'error', 'Already a member of this stokvel');
    END IF;

    -- Create member record
    INSERT INTO public.user_stokvel_members (
        stokvel_id,
        member_id,
        full_name,
        email,
        contact_number,
        role,
        rotation_order,
        is_active
    ) VALUES (
        v_invitation.stokvel_id,
        v_user_id,
        v_invitation.full_name,
        v_invitation.email,
        v_invitation.contact_number,
        v_invitation.role,
        v_invitation.rotation_order,
        true
    ) RETURNING id INTO v_member_id;

    -- Update invitation status
    UPDATE public.stokvel_invitations
    SET
        status = 'accepted',
        current_uses = current_uses + 1,
        accepted_at = timezone('utc'::text, now()),
        accepted_by = v_user_id
    WHERE id = v_invitation.id;

    -- Return success
    RETURN jsonb_build_object(
        'success', true,
        'stokvel_id', v_invitation.stokvel_id,
        'member_id', v_member_id
    );
END;
$$;

-- Function to generate a unique token
CREATE OR REPLACE FUNCTION public.generate_invitation_token()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    v_token TEXT;
    v_exists BOOLEAN;
BEGIN
    LOOP
        -- Generate random token (URL-safe)
        v_token := encode(gen_random_bytes(24), 'base64');
        v_token := replace(v_token, '/', '_');
        v_token := replace(v_token, '+', '-');
        v_token := replace(v_token, '=', '');

        -- Check if token already exists
        SELECT EXISTS(SELECT 1 FROM public.stokvel_invitations WHERE token = v_token) INTO v_exists;

        EXIT WHEN NOT v_exists;
    END LOOP;

    RETURN v_token;
END;
$$;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION public.validate_invitation_token(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.accept_invitation(TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.generate_invitation_token() TO authenticated;
