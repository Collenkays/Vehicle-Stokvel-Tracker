import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { Member } from '../types'
import { Database } from '../types/supabase'

type MemberInsert = Database['public']['Tables']['members']['Insert']
type MemberUpdate = Database['public']['Tables']['members']['Update']

const MEMBERS_QUERY_KEY = ['members']

export const useMembers = () => {
  return useQuery({
    queryKey: MEMBERS_QUERY_KEY,
    queryFn: async (): Promise<Member[]> => {
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .order('rotation_order', { ascending: true })

      if (error) throw error
      return data
    },
  })
}

export const useMember = (id: string) => {
  return useQuery({
    queryKey: ['member', id],
    queryFn: async (): Promise<Member> => {
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      return data
    },
    enabled: !!id,
  })
}

export const useCreateMember = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (memberData: Omit<MemberInsert, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('members')
        .insert(memberData)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MEMBERS_QUERY_KEY })
    },
  })
}

export const useUpdateMember = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...updateData }: { id: string } & MemberUpdate) => {
      const { data, error } = await supabase
        .from('members')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MEMBERS_QUERY_KEY })
    },
  })
}

export const useDeleteMember = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('members')
        .delete()
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MEMBERS_QUERY_KEY })
    },
  })
}

export const useNextPayoutRecipient = () => {
  return useQuery({
    queryKey: ['next-payout-recipient'],
    queryFn: async (): Promise<Member | null> => {
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .eq('vehicle_received', false)
        .order('rotation_order', { ascending: true })
        .limit(1)

      if (error) throw error
      return data.length > 0 ? data[0] : null
    },
  })
}

// Hooks for managing stokvel members (user_stokvel_members table)
export const useStokvelMembers = (stokvelId: string | undefined) => {
  return useQuery({
    queryKey: ['stokvel-members', stokvelId],
    queryFn: async () => {
      if (!stokvelId) return []

      const { data, error } = await supabase
        .from('user_stokvel_members')
        .select('*')
        .eq('stokvel_id', stokvelId)
        .eq('is_active', true)  // Only show active members
        .order('rotation_order', { ascending: true })

      if (error) {
        console.error('Error fetching stokvel members:', error)
        throw error
      }

      console.log(`Fetched ${data?.length || 0} active members for stokvel ${stokvelId}`)
      return data
    },
    enabled: !!stokvelId,
  })
}

export const useAddStokvelMember = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (memberData: {
      stokvel_id: string
      full_name: string
      email: string
      contact_number?: string
      role?: 'admin' | 'member'
      rotation_order?: number
    }) => {
      // Try to find if this email belongs to an existing user
      // Generate a valid UUID for temporary members
      const generateTempUUID = () => {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
          const r = Math.random() * 16 | 0
          const v = c === 'x' ? r : (r & 0x3 | 0x8)
          return v.toString(16)
        })
      }

      let member_id = generateTempUUID()

      // Try to use the RPC function first
      try {
        const { data: authUserId, error: rpcError } = await supabase.rpc('get_user_id_by_email', {
          user_email: memberData.email
        })

        if (!rpcError && authUserId) {
          member_id = authUserId
          console.log('Found user via RPC:', member_id, 'for email:', memberData.email)
        }
      } catch (err) {
        console.log('RPC function not available, will use temp UUID')
      }

      console.log('Adding member with ID:', member_id, 'for email:', memberData.email)

      const { data, error } = await supabase
        .from('user_stokvel_members')
        .insert({
          stokvel_id: memberData.stokvel_id,
          member_id: member_id,
          full_name: memberData.full_name,
          email: memberData.email,
          contact_number: memberData.contact_number || '',
          role: memberData.role || 'member',
          rotation_order: memberData.rotation_order || 1,
          is_active: true,
        })
        .select()
        .single()

      if (error) {
        console.error('Database error adding member:', error)
        throw error
      }
      console.log('Member added successfully:', data)
      return data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['stokvel-members', data.stokvel_id] })
      queryClient.invalidateQueries({ queryKey: ['stokvel-summaries'] })
      queryClient.invalidateQueries({ queryKey: ['user-stokvel-memberships'] })
    },
  })
}

export const useUpdateStokvelMember = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      stokvel_id,
      updates
    }: {
      id: string
      stokvel_id: string
      updates: {
        full_name?: string
        email?: string
        contact_number?: string
        role?: 'admin' | 'member'
        rotation_order?: number
        is_active?: boolean
      }
    }) => {
      const { data, error } = await supabase
        .from('user_stokvel_members')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return { data, stokvel_id }
    },
    onSuccess: ({ stokvel_id }) => {
      queryClient.invalidateQueries({ queryKey: ['stokvel-members', stokvel_id] })
      queryClient.invalidateQueries({ queryKey: ['stokvel-summaries'] })
    },
  })
}

export const useDeleteStokvelMember = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, stokvel_id }: { id: string; stokvel_id: string }) => {
      // Soft delete by setting is_active to false
      const { data, error } = await supabase
        .from('user_stokvel_members')
        .update({ is_active: false })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return { data, stokvel_id }
    },
    onSuccess: ({ stokvel_id }) => {
      queryClient.invalidateQueries({ queryKey: ['stokvel-members', stokvel_id] })
      queryClient.invalidateQueries({ queryKey: ['stokvel-summaries'] })
    },
  })
}