import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { UserStokvel, StokvelWithType, CreateStokvelData, StokvelSummary } from '../types/multi-stokvel'

export const useUserStokvels = () => {
  return useQuery({
    queryKey: ['user-stokvels'],
    queryFn: async (): Promise<StokvelWithType[]> => {
      const { data, error } = await supabase
        .from('user_stokvels')
        .select(`
          *,
          stokvel_type:stokvel_types(*)
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    },
  })
}

export const useUserStokvel = (id: string) => {
  return useQuery({
    queryKey: ['user-stokvel', id],
    queryFn: async (): Promise<StokvelWithType | null> => {
      const { data, error } = await supabase
        .from('user_stokvels')
        .select(`
          *,
          stokvel_type:stokvel_types(*)
        `)
        .eq('id', id)
        .eq('is_active', true)
        .single()

      if (error) throw error
      return data
    },
    enabled: !!id,
  })
}

export const useStokvelSummaries = () => {
  return useQuery({
    queryKey: ['stokvel-summaries'],
    queryFn: async (): Promise<StokvelSummary[]> => {
      const { data, error } = await supabase
        .rpc('get_user_stokvel_summaries')

      if (error) throw error
      return data || []
    },
  })
}

export const useCreateStokvel = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (stokvelData: CreateStokvelData) => {
      const { data: user } = await supabase.auth.getUser()
      if (!user.user) throw new Error('Not authenticated')

      // Create the stokvel
      const { data: stokvel, error: stokvelError } = await supabase
        .from('user_stokvels')
        .insert([{
          owner_id: user.user.id,
          stokvel_type_id: stokvelData.stokvel_type_id,
          name: stokvelData.name,
          description: stokvelData.description,
          monthly_contribution: stokvelData.monthly_contribution,
          target_amount: stokvelData.target_amount,
          currency: stokvelData.currency,
          start_date: stokvelData.start_date,
          rules: stokvelData.rules,
        }])
        .select()
        .single()

      if (stokvelError) throw stokvelError

      // Add the stokvel owner as the first member
      const ownerMember = {
        stokvel_id: stokvel.id,
        member_id: user.user.id,
        full_name: user.user.user_metadata?.full_name || user.user.email || 'Owner',
        email: user.user.email!,
        contact_number: user.user.user_metadata?.phone || '',
        role: 'admin' as const,
        rotation_order: 1,
        is_active: true,
        vehicle_received: false,
      }

      const { error: ownerMemberError } = await supabase
        .from('user_stokvel_members')
        .insert([ownerMember])

      if (ownerMemberError) {
        // Rollback stokvel creation if owner member insertion fails
        await supabase.from('user_stokvels').delete().eq('id', stokvel.id)
        throw ownerMemberError
      }

      // Note: initial_members will be handled separately through invitations
      // when that feature is implemented. For now, they're just stored as contact info.

      return stokvel
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-stokvels'] })
      queryClient.invalidateQueries({ queryKey: ['stokvel-summaries'] })
    },
  })
}

export const useUpdateStokvel = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<UserStokvel> }) => {
      const { data, error } = await supabase
        .from('user_stokvels')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['user-stokvels'] })
      queryClient.invalidateQueries({ queryKey: ['user-stokvel', data.id] })
      queryClient.invalidateQueries({ queryKey: ['stokvel-summaries'] })
    },
  })
}

export const useDeleteStokvel = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      // Soft delete by setting is_active to false
      const { data, error } = await supabase
        .from('user_stokvels')
        .update({ is_active: false })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-stokvels'] })
      queryClient.invalidateQueries({ queryKey: ['stokvel-summaries'] })
    },
  })
}

// Hook to get stokvels where current user is a member
export const useUserStokvelMemberships = () => {
  return useQuery({
    queryKey: ['user-stokvel-memberships'],
    queryFn: async (): Promise<StokvelWithType[]> => {
      const { data: user } = await supabase.auth.getUser()
      if (!user.user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('user_stokvel_members')
        .select(`
          stokvel_id,
          role,
          rotation_order,
          is_active,
          join_date,
          user_stokvels!inner(
            *,
            stokvel_type:stokvel_types(*)
          )
        `)
        .eq('member_id', user.user.id)
        .eq('is_active', true)
        .eq('user_stokvels.is_active', true)
        .order('join_date', { ascending: false })

      if (error) throw error
      
      // Transform the data to match StokvelWithType structure
      return data?.map(membership => ({
        ...membership.user_stokvels,
        membership_role: membership.role,
        membership_rotation_order: membership.rotation_order,
        membership_join_date: membership.join_date
      })) || []
    },
  })
}

export const useStokvelBalance = (stokvelId: string) => {
  return useQuery({
    queryKey: ['stokvel-balance', stokvelId],
    queryFn: async () => {
      // Get total verified contributions
      const { data: contributions, error: contribError } = await supabase
        .from('stokvel_contributions')
        .select('amount, verified')
        .eq('stokvel_id', stokvelId)

      if (contribError) throw contribError

      // Get total completed payouts
      const { data: payouts, error: payoutError } = await supabase
        .from('stokvel_payouts')
        .select('amount_paid')
        .eq('stokvel_id', stokvelId)
        .eq('status', 'completed')

      if (payoutError) throw payoutError

      const totalVerifiedContributions = contributions
        ?.filter(c => c.verified)
        .reduce((sum, c) => sum + c.amount, 0) || 0

      const totalPendingContributions = contributions
        ?.filter(c => !c.verified)
        .reduce((sum, c) => sum + c.amount, 0) || 0

      const totalPayouts = payouts?.reduce((sum, p) => sum + p.amount_paid, 0) || 0

      return {
        total_contributions: totalVerifiedContributions,
        total_payouts: totalPayouts,
        current_balance: totalVerifiedContributions - totalPayouts,
        pending_contributions: totalPendingContributions,
      }
    },
    enabled: !!stokvelId,
  })
}