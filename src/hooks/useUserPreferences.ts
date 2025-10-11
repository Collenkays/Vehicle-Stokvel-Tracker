import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

export interface UserPreferences {
  id: string
  user_id: string
  // Notification settings
  notification_email: boolean
  notification_push: boolean
  notification_frequency: 'immediate' | 'daily' | 'weekly'
  // Display settings
  date_format: 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD'
  currency_display: string
  language: string
  theme: 'light' | 'dark' | 'system'
  dashboard_default_view: 'overview' | 'contributions' | 'members'
  // Profile settings
  phone_number: string | null
  profile_picture_url: string | null
  created_at: string
  updated_at: string
}

export interface UpdateUserPreferencesData {
  notification_email?: boolean
  notification_push?: boolean
  notification_frequency?: 'immediate' | 'daily' | 'weekly'
  date_format?: 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD'
  currency_display?: string
  language?: string
  theme?: 'light' | 'dark' | 'system'
  dashboard_default_view?: 'overview' | 'contributions' | 'members'
  phone_number?: string | null
  profile_picture_url?: string | null
}

/**
 * Hook to fetch current user's preferences
 * Creates default preferences if they don't exist
 */
export const useUserPreferences = () => {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['userPreferences', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated')

      // Try to fetch existing preferences
      const { data: existing, error: fetchError } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (fetchError && fetchError.code !== 'PGRST116') {
        // PGRST116 = no rows returned
        throw fetchError
      }

      // If preferences exist, return them
      if (existing) {
        return existing as UserPreferences
      }

      // Otherwise, create default preferences
      const { data: newPreferences, error: createError } = await supabase
        .from('user_preferences')
        .insert({
          user_id: user.id,
        })
        .select()
        .single()

      if (createError) throw createError

      return newPreferences as UserPreferences
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  })
}

/**
 * Hook to update user preferences
 */
export const useUpdateUserPreferences = () => {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async (updates: UpdateUserPreferencesData) => {
      if (!user) throw new Error('User not authenticated')

      const { data, error } = await supabase
        .from('user_preferences')
        .update(updates)
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) throw error
      return data as UserPreferences
    },
    onSuccess: (data) => {
      // Update the cache with new data
      queryClient.setQueryData(['userPreferences', user?.id], data)
      queryClient.invalidateQueries({ queryKey: ['userPreferences', user?.id] })
    },
    onError: (error) => {
      console.error('Error updating user preferences:', error)
    },
  })
}

/**
 * Hook to update user profile information in auth.users
 */
export const useUpdateUserProfile = () => {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async (updates: { email?: string; password?: string }) => {
      if (!user) throw new Error('User not authenticated')

      // Update auth user
      const { data, error } = await supabase.auth.updateUser(updates)

      if (error) throw error
      return data
    },
    onSuccess: () => {
      // Invalidate preferences query to refresh user data
      queryClient.invalidateQueries({ queryKey: ['userPreferences', user?.id] })
    },
    onError: (error) => {
      console.error('Error updating user profile:', error)
    },
  })
}
