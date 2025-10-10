import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { LotteryDrawResult } from '../services/LotterySystem'

export interface LotteryHistory {
  id: string
  lottery_method: string
  conducted_at: string
  conducted_by: string
  conductor_name: string
  total_participants: number
  excluded_members: any[]
  lottery_results: any[]
  is_active: boolean
}

export interface ActiveLottery extends LotteryHistory {
  random_seed: string | null
  weighting_config: any | null
  notes: string | null
}

/**
 * Hook to get active lottery for a stokvel
 */
export const useActiveLottery = (stokvelId: string | undefined) => {
  return useQuery({
    queryKey: ['active-lottery', stokvelId],
    queryFn: async (): Promise<ActiveLottery | null> => {
      if (!stokvelId) return null

      const { data, error } = await supabase.rpc('get_active_lottery', {
        p_stokvel_id: stokvelId,
      })

      if (error) throw error
      return data && data.length > 0 ? data[0] : null
    },
    enabled: !!stokvelId,
  })
}

/**
 * Hook to get lottery history for a stokvel
 */
export const useLotteryHistory = (stokvelId: string | undefined, limit: number = 10) => {
  return useQuery({
    queryKey: ['lottery-history', stokvelId, limit],
    queryFn: async (): Promise<LotteryHistory[]> => {
      if (!stokvelId) return []

      const { data, error } = await supabase.rpc('get_lottery_history', {
        p_stokvel_id: stokvelId,
        p_limit: limit,
      })

      if (error) throw error
      return data || []
    },
    enabled: !!stokvelId,
  })
}

/**
 * Hook to conduct and save lottery
 */
export const useConductLottery = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      lotteryResult,
      notes,
    }: {
      lotteryResult: LotteryDrawResult
      notes?: string
    }) => {
      const { data: user } = await supabase.auth.getUser()
      if (!user.user) throw new Error('Not authenticated')

      // Format lottery results for database
      const formattedResults = lotteryResult.results.map(r => ({
        memberId: r.memberId,
        memberName: r.memberName,
        rotationOrder: r.rotationOrder,
        drawTimestamp: r.drawTimestamp,
        randomSeed: r.randomSeed,
        weightScore: r.weightScore,
      }))

      // Prepare weighting config if weighted method
      const weightingConfig = lotteryResult.method === 'weighted' ? {
        tenureWeight: 0.4,
        contributionWeight: 0.6,
      } : null

      // Call the database function to conduct lottery
      const { data, error } = await supabase.rpc('conduct_lottery', {
        p_stokvel_id: lotteryResult.stokvelId,
        p_lottery_method: lotteryResult.method,
        p_conducted_by: user.user.id,
        p_lottery_results: formattedResults,
        p_random_seed: lotteryResult.results[0]?.randomSeed || null,
        p_weighting_config: weightingConfig,
        p_excluded_members: lotteryResult.excludedMembers,
        p_notes: notes || null,
      })

      if (error) throw error
      return data
    },
    onSuccess: (_data, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['active-lottery', variables.lotteryResult.stokvelId] })
      queryClient.invalidateQueries({ queryKey: ['lottery-history', variables.lotteryResult.stokvelId] })
      queryClient.invalidateQueries({ queryKey: ['stokvel-members', variables.lotteryResult.stokvelId] })
      queryClient.invalidateQueries({ queryKey: ['user-stokvel', variables.lotteryResult.stokvelId] })
    },
  })
}

/**
 * Hook to manually update rotation order (for manual adjustments)
 */
export const useUpdateRotationOrder = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      stokvelId,
      memberId,
      rotationOrder,
    }: {
      stokvelId: string
      memberId: string
      rotationOrder: number
    }) => {
      const { data, error } = await supabase
        .from('user_stokvel_members')
        .update({ rotation_order: rotationOrder })
        .eq('id', memberId)
        .eq('stokvel_id', stokvelId)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['stokvel-members', variables.stokvelId] })
    },
  })
}

/**
 * Hook to check if user can conduct lottery (admin only)
 */
export const useCanConductLottery = (stokvelId: string | undefined) => {
  return useQuery({
    queryKey: ['can-conduct-lottery', stokvelId],
    queryFn: async (): Promise<boolean> => {
      if (!stokvelId) return false

      const { data: user } = await supabase.auth.getUser()
      if (!user.user) return false

      const { data, error } = await supabase
        .from('user_stokvel_members')
        .select('role')
        .eq('stokvel_id', stokvelId)
        .eq('member_id', user.user.id)
        .eq('is_active', true)
        .single()

      if (error) return false
      return data?.role === 'admin'
    },
    enabled: !!stokvelId,
  })
}

/**
 * Hook to get stokvel rotation method
 */
export const useStokvelRotationMethod = (stokvelId: string | undefined) => {
  return useQuery({
    queryKey: ['stokvel-rotation-method', stokvelId],
    queryFn: async (): Promise<{
      rotation_method: string
      last_lottery_date: string | null
    } | null> => {
      if (!stokvelId) return null

      const { data, error } = await supabase
        .from('user_stokvels')
        .select('rotation_method, last_lottery_date')
        .eq('id', stokvelId)
        .single()

      if (error) throw error
      return data
    },
    enabled: !!stokvelId,
  })
}
