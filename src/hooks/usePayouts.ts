import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { Payout } from '../types'
import { Database } from '../types/supabase'

type PayoutInsert = Database['public']['Tables']['payouts']['Insert']
type PayoutUpdate = Database['public']['Tables']['payouts']['Update']

const PAYOUTS_QUERY_KEY = ['payouts']

export const usePayouts = () => {
  return useQuery({
    queryKey: PAYOUTS_QUERY_KEY,
    queryFn: async (): Promise<Payout[]> => {
      const { data, error } = await supabase
        .from('payouts')
        .select(`
          *,
          member:members(*)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data as Payout[]
    },
  })
}

export const usePayout = (id: string) => {
  return useQuery({
    queryKey: ['payout', id],
    queryFn: async (): Promise<Payout> => {
      const { data, error } = await supabase
        .from('payouts')
        .select(`
          *,
          member:members(*)
        `)
        .eq('id', id)
        .single()

      if (error) throw error
      return data as Payout
    },
    enabled: !!id,
  })
}

export const useCreatePayout = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payoutData: Omit<PayoutInsert, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('payouts')
        .insert(payoutData)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PAYOUTS_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
      queryClient.invalidateQueries({ queryKey: ['members'] })
    },
  })
}

export const useUpdatePayout = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...updateData }: { id: string } & PayoutUpdate) => {
      const { data, error } = await supabase
        .from('payouts')
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
      queryClient.invalidateQueries({ queryKey: ['members'] })
    },
  })
}

export const useCompletePayout = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payoutId: string) => {
      // Start a transaction to update both payout and member
      const { data: payout, error: payoutError } = await supabase
        .from('payouts')
        .select('member_id, month_paid')
        .eq('id', payoutId)
        .single()

      if (payoutError) throw payoutError

      // Update payout status
      const { error: updatePayoutError } = await supabase
        .from('payouts')
        .update({ status: 'completed' })
        .eq('id', payoutId)

      if (updatePayoutError) throw updatePayoutError

      // Update member to mark vehicle as received
      const { error: updateMemberError } = await supabase
        .from('members')
        .update({ 
          vehicle_received: true,
          month_received: payout.month_paid
        })
        .eq('id', payout.member_id)

      if (updateMemberError) throw updateMemberError

      return { success: true }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PAYOUTS_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
      queryClient.invalidateQueries({ queryKey: ['members'] })
      queryClient.invalidateQueries({ queryKey: ['next-payout-recipient'] })
    },
  })
}

export const useDeletePayout = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('payouts')
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
    mutationFn: async () => {
      // Get total balance from verified contributions
      const { data: contributions, error: contributionsError } = await supabase
        .from('contributions')
        .select('amount')
        .eq('verified', true)

      if (contributionsError) throw contributionsError

      const totalBalance = contributions.reduce((sum, contrib) => sum + contrib.amount, 0)

      // Get completed payouts
      const { data: completedPayouts, error: payoutsError } = await supabase
        .from('payouts')
        .select('amount_paid')
        .eq('status', 'completed')

      if (payoutsError) throw payoutsError

      const totalPaidOut = completedPayouts.reduce((sum, payout) => sum + payout.amount_paid, 0)
      const availableBalance = totalBalance - totalPaidOut

      if (availableBalance < 100000) {
        throw new Error(`Insufficient balance. Available: R${availableBalance.toFixed(2)}, Required: R100,000`)
      }

      // Get next member in rotation
      const { data: nextMember, error: memberError } = await supabase
        .from('members')
        .select('*')
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
        .from('payouts')
        .insert({
          member_id: member.id,
          month_paid: new Date().toLocaleDateString('en-ZA', { year: 'numeric', month: 'long' }),
          amount_paid: payoutAmount,
          rollover_balance: rolloverBalance,
          vehicle_value: payoutAmount,
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