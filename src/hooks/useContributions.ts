import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { Contribution } from '../types'
import { Database } from '../types/supabase'

type ContributionInsert = Database['public']['Tables']['contributions']['Insert']
type ContributionUpdate = Database['public']['Tables']['contributions']['Update']

const CONTRIBUTIONS_QUERY_KEY = ['contributions']

export const useContributions = (month?: string) => {
  return useQuery({
    queryKey: month ? [...CONTRIBUTIONS_QUERY_KEY, month] : CONTRIBUTIONS_QUERY_KEY,
    queryFn: async (): Promise<Contribution[]> => {
      let query = supabase
        .from('contributions')
        .select(`
          *,
          member:members(*)
        `)
        .order('date_paid', { ascending: false })

      if (month) {
        query = query.eq('month', month)
      }

      const { data, error } = await query

      if (error) throw error
      return data as Contribution[]
    },
  })
}

export const useContribution = (id: string) => {
  return useQuery({
    queryKey: ['contribution', id],
    queryFn: async (): Promise<Contribution> => {
      const { data, error } = await supabase
        .from('contributions')
        .select(`
          *,
          member:members(*)
        `)
        .eq('id', id)
        .single()

      if (error) throw error
      return data as Contribution
    },
    enabled: !!id,
  })
}

export const useCreateContribution = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (contributionData: Omit<ContributionInsert, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('contributions')
        .insert(contributionData)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONTRIBUTIONS_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
    },
  })
}

export const useUpdateContribution = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...updateData }: { id: string } & ContributionUpdate) => {
      const { data, error } = await supabase
        .from('contributions')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONTRIBUTIONS_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
    },
  })
}

export const useDeleteContribution = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('contributions')
        .delete()
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONTRIBUTIONS_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
    },
  })
}

export const useContributionSummary = (month?: string) => {
  return useQuery({
    queryKey: ['contribution-summary', month],
    queryFn: async () => {
      let query = supabase
        .from('contributions')
        .select('amount, verified')

      if (month) {
        query = query.eq('month', month)
      }

      const { data, error } = await query

      if (error) throw error

      const totalAmount = data.reduce((sum, contrib) => sum + contrib.amount, 0)
      const verifiedAmount = data
        .filter(contrib => contrib.verified)
        .reduce((sum, contrib) => sum + contrib.amount, 0)
      const pendingAmount = totalAmount - verifiedAmount

      return {
        totalAmount,
        verifiedAmount,
        pendingAmount,
        totalContributions: data.length,
        verifiedContributions: data.filter(contrib => contrib.verified).length,
        pendingContributions: data.filter(contrib => !contrib.verified).length,
      }
    },
  })
}