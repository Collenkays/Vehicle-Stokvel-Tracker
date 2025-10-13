import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import {
  StokvelInvitation,
  CreateInvitationData,
  ValidatedInvitation,
  AcceptInvitationResult,
} from '../types/multi-stokvel'

// Get all invitations for a stokvel (admin only)
export const useStokvelInvitations = (stokvelId: string | undefined) => {
  return useQuery({
    queryKey: ['stokvel-invitations', stokvelId],
    queryFn: async (): Promise<StokvelInvitation[]> => {
      if (!stokvelId) return []

      const { data, error } = await supabase
        .from('stokvel_invitations')
        .select('*')
        .eq('stokvel_id', stokvelId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching invitations:', error)
        throw error
      }

      return data || []
    },
    enabled: !!stokvelId,
  })
}

// Get pending invitations only
export const usePendingInvitations = (stokvelId: string | undefined) => {
  return useQuery({
    queryKey: ['pending-invitations', stokvelId],
    queryFn: async (): Promise<StokvelInvitation[]> => {
      if (!stokvelId) return []

      const { data, error } = await supabase
        .from('stokvel_invitations')
        .select('*')
        .eq('stokvel_id', stokvelId)
        .eq('status', 'pending')
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching pending invitations:', error)
        throw error
      }

      return data || []
    },
    enabled: !!stokvelId,
  })
}

// Create a new invitation
export const useCreateInvitation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (invitationData: CreateInvitationData) => {
      const { data: user } = await supabase.auth.getUser()
      if (!user.user) throw new Error('Not authenticated')

      // Generate token using the database function
      const { data: tokenData, error: tokenError } = await supabase.rpc(
        'generate_invitation_token'
      )

      if (tokenError) {
        console.error('Error generating token:', tokenError)
        throw tokenError
      }

      const token = tokenData as string

      // Calculate expiration date (7 days from now)
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + 7)

      // Create the invitation
      const { data, error } = await supabase
        .from('stokvel_invitations')
        .insert({
          stokvel_id: invitationData.stokvel_id,
          invited_by: user.user.id,
          full_name: invitationData.full_name,
          email: invitationData.email,
          contact_number: invitationData.contact_number || null,
          token: token,
          role: invitationData.role || 'member',
          rotation_order: invitationData.rotation_order || null,
          max_uses: 1, // Single-use
          expires_at: expiresAt.toISOString(),
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating invitation:', error)
        throw error
      }

      return data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ['stokvel-invitations', data.stokvel_id],
      })
      queryClient.invalidateQueries({
        queryKey: ['pending-invitations', data.stokvel_id],
      })
    },
  })
}

// Validate an invitation token (without authentication)
export const useValidateInvitation = (token: string | undefined) => {
  return useQuery({
    queryKey: ['validate-invitation', token],
    queryFn: async (): Promise<ValidatedInvitation | null> => {
      if (!token) return null

      const { data, error } = await supabase.rpc('validate_invitation_token', {
        invitation_token: token,
      })

      if (error) {
        console.error('Error validating invitation:', error)
        throw error
      }

      if (!data || data.length === 0) return null

      return data[0] as ValidatedInvitation
    },
    enabled: !!token,
    retry: false,
  })
}

// Accept an invitation
export const useAcceptInvitation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      token,
      userEmail,
      userPhone,
    }: {
      token: string
      userEmail: string
      userPhone?: string
    }) => {
      const { data, error } = await supabase.rpc('accept_invitation', {
        invitation_token: token,
        user_email: userEmail,
        user_phone: userPhone || null,
      })

      if (error) {
        console.error('Error accepting invitation:', error)
        throw error
      }

      return data as AcceptInvitationResult
    },
    onSuccess: (data) => {
      if (data.success && data.stokvel_id) {
        // Invalidate relevant queries
        queryClient.invalidateQueries({
          queryKey: ['stokvel-members', data.stokvel_id],
        })
        queryClient.invalidateQueries({
          queryKey: ['user-stokvel-memberships'],
        })
        queryClient.invalidateQueries({ queryKey: ['stokvel-summaries'] })
      }
    },
  })
}

// Revoke an invitation (admin only)
export const useRevokeInvitation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      invitationId,
      stokvelId,
    }: {
      invitationId: string
      stokvelId: string
    }) => {
      const { data, error } = await supabase
        .from('stokvel_invitations')
        .update({ status: 'revoked' })
        .eq('id', invitationId)
        .select()
        .single()

      if (error) {
        console.error('Error revoking invitation:', error)
        throw error
      }

      return { data, stokvelId }
    },
    onSuccess: ({ stokvelId }) => {
      queryClient.invalidateQueries({
        queryKey: ['stokvel-invitations', stokvelId],
      })
      queryClient.invalidateQueries({
        queryKey: ['pending-invitations', stokvelId],
      })
    },
  })
}

// Delete an invitation (admin only)
export const useDeleteInvitation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      invitationId,
      stokvelId,
    }: {
      invitationId: string
      stokvelId: string
    }) => {
      const { error } = await supabase
        .from('stokvel_invitations')
        .delete()
        .eq('id', invitationId)

      if (error) {
        console.error('Error deleting invitation:', error)
        throw error
      }

      return { stokvelId }
    },
    onSuccess: ({ stokvelId }) => {
      queryClient.invalidateQueries({
        queryKey: ['stokvel-invitations', stokvelId],
      })
      queryClient.invalidateQueries({
        queryKey: ['pending-invitations', stokvelId],
      })
    },
  })
}

// Helper to generate invitation URL
export const getInvitationUrl = (token: string): string => {
  const baseUrl = window.location.origin
  return `${baseUrl}/invite/${token}`
}

// Helper to copy invitation URL to clipboard
export const copyInvitationUrl = async (token: string): Promise<boolean> => {
  try {
    const url = getInvitationUrl(token)
    await navigator.clipboard.writeText(url)
    return true
  } catch (error) {
    console.error('Error copying to clipboard:', error)
    return false
  }
}

// Helper to generate WhatsApp share link
export const getWhatsAppShareUrl = (
  token: string,
  stokvelName: string
): string => {
  const inviteUrl = getInvitationUrl(token)
  const message = `You've been invited to join ${stokvelName}! Click the link to accept: ${inviteUrl}`
  return `https://wa.me/?text=${encodeURIComponent(message)}`
}
