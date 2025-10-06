import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { StokvelType } from '../types/multi-stokvel'

export const useStokvelTypes = () => {
  return useQuery({
    queryKey: ['stokvel-types'],
    queryFn: async (): Promise<StokvelType[]> => {
      const { data, error } = await supabase
        .from('stokvel_types')
        .select('*')
        .eq('is_active', true)
        .order('name')

      if (error) throw error
      return data || []
    },
  })
}

export const useStokvelType = (id: string) => {
  return useQuery({
    queryKey: ['stokvel-type', id],
    queryFn: async (): Promise<StokvelType | null> => {
      const { data, error } = await supabase
        .from('stokvel_types')
        .select('*')
        .eq('id', id)
        .eq('is_active', true)
        .single()

      if (error) throw error
      return data
    },
    enabled: !!id,
  })
}

export const useCreateStokvelType = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (newStokvelType: Omit<StokvelType, 'id' | 'created_at' | 'updated_at' | 'is_active'>) => {
      const { data, error } = await supabase
        .from('stokvel_types')
        .insert([newStokvelType])
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stokvel-types'] })
    },
  })
}

export const useUpdateStokvelType = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<StokvelType> }) => {
      const { data, error } = await supabase
        .from('stokvel_types')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['stokvel-types'] })
      queryClient.invalidateQueries({ queryKey: ['stokvel-type', data.id] })
    },
  })
}

export const useDeleteStokvelType = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      // Soft delete by setting is_active to false
      const { data, error } = await supabase
        .from('stokvel_types')
        .update({ is_active: false })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stokvel-types'] })
    },
  })
}