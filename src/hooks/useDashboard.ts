import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { DashboardStats, Member } from '../types'

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async (): Promise<DashboardStats> => {
      // Get all verified contributions
      const { data: contributions, error: contributionsError } = await supabase
        .from('contributions')
        .select('amount, verified, month')
        .eq('verified', true)

      if (contributionsError) throw contributionsError

      // Get completed payouts
      const { data: completedPayouts, error: payoutsError } = await supabase
        .from('payouts')
        .select('amount_paid')
        .eq('status', 'completed')

      if (payoutsError) throw payoutsError

      // Get current month contributions
      const currentMonth = new Date().toLocaleDateString('en-ZA', { 
        year: 'numeric', 
        month: 'long' 
      })

      const currentMonthContributions = contributions
        .filter(contrib => contrib.month === currentMonth)
        .reduce((sum, contrib) => sum + contrib.amount, 0)

      // Calculate total balance
      const totalContributions = contributions.reduce((sum, contrib) => sum + contrib.amount, 0)
      const totalPaidOut = completedPayouts.reduce((sum, payout) => sum + payout.amount_paid, 0)
      const totalBalance = totalContributions - totalPaidOut

      // Get next payout recipient
      const { data: nextRecipient, error: memberError } = await supabase
        .from('members')
        .select('*')
        .eq('vehicle_received', false)
        .order('rotation_order', { ascending: true })
        .limit(1)

      if (memberError) throw memberError

      // Get members without vehicle
      const { data: allMembers, error: allMembersError } = await supabase
        .from('members')
        .select('vehicle_received')

      if (allMembersError) throw allMembersError

      const membersWithoutVehicle = allMembers.filter(member => !member.vehicle_received).length

      // Get pending contributions count
      const { data: allContributions, error: allContribError } = await supabase
        .from('contributions')
        .select('verified')

      if (allContribError) throw allContribError

      const pendingContributions = allContributions.filter(contrib => !contrib.verified).length

      return {
        totalBalance,
        currentMonthContributions,
        nextPayoutRecipient: nextRecipient.length > 0 ? nextRecipient[0] : null,
        membersWithoutVehicle,
        completedPayouts: completedPayouts.length,
        pendingContributions,
      }
    },
  })
}

export const useMonthlyContributionTrends = () => {
  return useQuery({
    queryKey: ['monthly-contribution-trends'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contributions')
        .select('month, amount, verified')
        .eq('verified', true)
        .order('month', { ascending: true })

      if (error) throw error

      // Group by month and sum amounts
      const monthlyTotals = data.reduce((acc, contrib) => {
        const month = contrib.month
        if (!acc[month]) {
          acc[month] = 0
        }
        acc[month] += contrib.amount
        return acc
      }, {} as Record<string, number>)

      // Convert to array format for charts
      return Object.entries(monthlyTotals).map(([month, amount]) => ({
        month,
        amount,
      }))
    },
  })
}

export const usePayoutHistory = () => {
  return useQuery({
    queryKey: ['payout-history'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payouts')
        .select(`
          *,
          member:members(full_name)
        `)
        .eq('status', 'completed')
        .order('created_at', { ascending: true })

      if (error) throw error

      return data.map(payout => ({
        month: payout.month_paid,
        memberName: payout.member?.full_name || 'Unknown',
        amount: payout.amount_paid,
        vehicleValue: payout.vehicle_value,
        rolloverBalance: payout.rollover_balance,
        date: payout.created_at,
      }))
    },
  })
}