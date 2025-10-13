-- Check if stokvel_invitations table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'stokvel_invitations'
) as table_exists;

-- Check if functions exist
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('validate_invitation_token', 'accept_invitation', 'generate_invitation_token');
