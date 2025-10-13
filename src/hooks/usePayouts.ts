import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { Payout } from '../types'
import { Database } from '../types/supabase'

type PayoutInsert = Database['public']['Tables']['stokvel_payouts']['Insert']
type PayoutUpdate = Database['public']['Tables']['stokvel_payouts']['Update']

const PAYOUTS_QUERY_KEY = ['payouts']

export const usePayouts = (stokvelId?: string) => {
  return useQuery({
    queryKey: stokvelId ? [...PAYOUTS_QUERY_KEY, stokvelId] : PAYOUTS_QUERY_KEY,
    queryFn: async (): Promise<Payout[]> => {
      if (!stokvelId) return []

      // First get the payouts
      const { data: payoutsData, error: payoutsError } = await supabase
        .from('stokvel_payouts')
        .select('*')
        .eq('stokvel_id', stokvelId)
        .order('created_at', { ascending: false })

      if (payoutsError) throw payoutsError
      if (!payoutsData || payoutsData.length === 0) return []

      // Then get the member details for each payout
      const recipientMemberIds = payoutsData.map(p => p.recipient_member_id)
      const { data: membersData, error: membersError } = await supabase
        .from('user_stokvel_members')
        .select('member_id, full_name, email, contact_number, rotation_order')
        .in('member_id', recipientMemberIds)
        .eq('stokvel_id', stokvelId)

      if (membersError) throw membersError

      // Create a map of member IDs to member data
      const memberMap = new Map(membersData?.map(m => [m.member_id, m]) || [])

      // Combine the data
      return payoutsData.map(payout => ({
        ...payout,
        member: memberMap.get(payout.recipient_member_id) || null
      })) as Payout[]
    },
    enabled: !!stokvelId,
  })
}

export const usePayout = (id: string) => {
  return useQuery({
    queryKey: ['payout', id],
    queryFn: async (): Promise<Payout> => {
      // First get the payout
      const { data: payoutData, error: payoutError } = await supabase
        .from('stokvel_payouts')
        .select('*')
        .eq('id', id)
        .single()

      if (payoutError) throw payoutError

      // Then get the member details
      const { data: memberData, error: memberError } = await supabase
        .from('user_stokvel_members')
        .select('member_id, full_name, email, contact_number, rotation_order')
        .eq('member_id', payoutData.recipient_member_id)
        .eq('stokvel_id', payoutData.stokvel_id)
        .single()

      if (memberError) throw memberError

      return {
        ...payoutData,
        member: memberData
      } as Payout
    },
    enabled: !!id,
  })
}

export const useCreatePayout = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payoutData: Omit<PayoutInsert, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('stokvel_payouts')
        .insert(payoutData)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PAYOUTS_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
      queryClient.invalidateQueries({ queryKey: ['stokvel-members'] })
    },
  })
}

export const useUpdatePayout = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...updateData }: { id: string } & PayoutUpdate) => {
      const { data, error } = await supabase
        .from('stokvel_payouts')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PAYOUTS_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
      queryClient.invalidateQueries({ queryKey: ['stokvel-members'] })
    },
  })
}

export const useCompletePayout = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payoutId: string) => {
      // Start a transaction to update both payout and member
      const { data: payout, error: payoutError } = await supabase
        .from('stokvel_payouts')
        .select('recipient_member_id, month_paid, stokvel_id')
        .eq('id', payoutId)
        .single()

      if (payoutError) throw payoutError

      // Update payout status
      const { error: updatePayoutError } = await supabase
        .from('stokvel_payouts')
        .update({ status: 'completed' })
        .eq('id', payoutId)

      if (updatePayoutError) throw updatePayoutError

      // Update member to mark vehicle as received
      const { error: updateMemberError } = await supabase
        .from('user_stokvel_members')
        .update({
          vehicle_received: true,
          month_received: payout.month_paid
        })
        .eq('member_id', payout.recipient_member_id)

      if (updateMemberError) throw updateMemberError

      return { success: true, stokvel_id: payout.stokvel_id }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: PAYOUTS_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
      queryClient.invalidateQueries({ queryKey: ['stokvel-members', data.stokvel_id] })
      queryClient.invalidateQueries({ queryKey: ['next-payout-recipient'] })
    },
  })
}

export const useDeletePayout = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('stokvel_payouts')
        .delete()
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PAYOUTS_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
    },
  })
}

export const useGeneratePayout = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (stokvelId: string) => {
      // Get total balance from verified contributions for this stokvel
      const { data: contributions, error: contributionsError } = await supabase
        .from('stokvel_contributions')
        .select('amount')
        .eq('stokvel_id', stokvelId)
        .eq('verified', true)

      if (contributionsError) throw contributionsError

      const totalBalance = contributions.reduce((sum, contrib) => sum + contrib.amount, 0)

      // Get completed payouts for this stokvel
      const { data: completedPayouts, error: payoutsError } = await supabase
        .from('stokvel_payouts')
        .select('amount_paid')
        .eq('stokvel_id', stokvelId)
        .eq('status', 'completed')

      if (payoutsError) throw payoutsError

      const totalPaidOut = completedPayouts.reduce((sum, payout) => sum + payout.amount_paid, 0)
      const availableBalance = totalBalance - totalPaidOut

      if (availableBalance < 100000) {
        throw new Error(`Insufficient balance. Available: R${availableBalance.toFixed(2)}, Required: R100,000`)
      }

      // Get next member in rotation for this stokvel
      const { data: nextMember, error: memberError } = await supabase
        .from('user_stokvel_members')
        .select('*')
        .eq('stokvel_id', stokvelId)
        .eq('vehicle_received', false)
        .order('rotation_order', { ascending: true })
        .limit(1)

      if (memberError) throw memberError
      if (!nextMember || nextMember.length === 0) {
        throw new Error('No eligible members found for payout')
      }

      const member = nextMember[0]
      const payoutAmount = 100000
      const rolloverBalance = availableBalance - payoutAmount

      // Create payout record
      const { data: payout, error: createError } = await supabase
        .from('stokvel_payouts')
        .insert({
          stokvel_id: stokvelId,
          recipient_member_id: member.member_id,
          month_paid: new Date().toLocaleDateString('en-ZA', { year: 'numeric', month: 'long' }),
          amount_paid: payoutAmount,
          rollover_balance: rolloverBalance,
          status: 'pending'
        })
        .select()
        .single()

      if (createError) throw createError

      return payout
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PAYOUTS_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
    },
  })
}