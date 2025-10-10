import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export interface StokvelNotificationSettings {
  contribution_reminders: boolean
  payout_notifications: boolean
  member_activity_alerts: boolean
  payment_verification_alerts: boolean
  reminder_frequency: 'daily' | 'weekly' | 'monthly'
}

export interface StokvelRuleSettings {
  late_payment_penalty_rate: number
  grace_period_days: number
  joining_fee: number
  require_payment_verification: boolean
  allow_emergency_withdrawals: boolean
  emergency_withdrawal_limit: number
  minimum_rollover_balance: number
}

export interface UpdateStokvelNotificationSettingsParams {
  stokvelId: string
  settings: Partial<StokvelNotificationSettings>
}

export interface UpdateStokvelRuleSettingsParams {
  stokvelId: string
  settings: Partial<StokvelRuleSettings>
}

/**
 * Hook to update stokvel notification settings (stored as JSONB)
 */
export const useUpdateStokvelNotificationSettings = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ stokvelId, settings }: UpdateStokvelNotificationSettingsParams) => {
      // Fetch current notification settings
      const { data: currentStokvel, error: fetchError } = await supabase
        .from('user_stokvels')
        .select('notification_settings')
        .eq('id', stokvelId)
        .single()

      if (fetchError) throw fetchError

      // Merge new settings with existing ones
      const updatedSettings = {
        ...(currentStokvel.notification_settings as StokvelNotificationSettings),
        ...settings,
      }

      // Update the stokvel with merged settings
      const { data, error } = await supabase
        .from('user_stokvels')
        .update({ notification_settings: updatedSettings })
        .eq('id', stokvelId)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: (_, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['stokvel', variables.stokvelId] })
      queryClient.invalidateQueries({ queryKey: ['userStokvels'] })
    },
    onError: (error) => {
      console.error('Error updating stokvel notification settings:', error)
    },
  })
}

/**
 * Hook to update stokvel rule settings (contribution and payout rules)
 */
export const useUpdateStokvelRuleSettings = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ stokvelId, settings }: UpdateStokvelRuleSettingsParams) => {
      const { data, error } = await supabase
        .from('user_stokvels')
        .update(settings)
        .eq('id', stokvelId)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: (_, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['stokvel', variables.stokvelId] })
      queryClient.invalidateQueries({ queryKey: ['userStokvels'] })
    },
    onError: (error) => {
      console.error('Error updating stokvel rule settings:', error)
    },
  })
}

/**
 * Helper function to extract notification settings from stokvel data
 */
export const getStokvelNotificationSettings = (
  stokvel: any
): StokvelNotificationSettings => {
  const defaultSettings: StokvelNotificationSettings = {
    contribution_reminders: true,
    payout_notifications: true,
    member_activity_alerts: true,
    payment_verification_alerts: true,
    reminder_frequency: 'weekly',
  }

  if (!stokvel?.notification_settings) {
    return defaultSettings
  }

  return {
    ...defaultSettings,
    ...stokvel.notification_settings,
  }
}

/**
 * Helper function to extract rule settings from stokvel data
 */
export const getStokvelRuleSettings = (stokvel: any): StokvelRuleSettings => {
  return {
    late_payment_penalty_rate: stokvel?.late_payment_penalty_rate ?? 0,
    grace_period_days: stokvel?.grace_period_days ?? 5,
    joining_fee: stokvel?.joining_fee ?? 0,
    require_payment_verification: stokvel?.require_payment_verification ?? true,
    allow_emergency_withdrawals: stokvel?.allow_emergency_withdrawals ?? false,
    emergency_withdrawal_limit: stokvel?.emergency_withdrawal_limit ?? 0,
    minimum_rollover_balance: stokvel?.minimum_rollover_balance ?? 0,
  }
}
