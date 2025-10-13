import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { DashboardStats } from '../types'

export const useDashboardStats = (stokvelId?: string) => {
  return useQuery({
    queryKey: ['dashboard-stats', stokvelId],
    queryFn: async (): Promise<DashboardStats> => {
      // If no stokvelId is provided, fall back to legacy behavior
      if (!stokvelId) {
        // Get all verified contributions (legacy)
        const { data: contributions, error: contributionsError } = await supabase
          .from('contributions')
          .select('amount, verified, month')
          .eq('verified', true)

        if (contributionsError) throw contributionsError

        // Get completed payouts (legacy)
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

        // Get next payout recipient (legacy)
        const { data: nextRecipient, error: memberError } = await supabase
          .from('members')
          .select('*')
          .eq('vehicle_received', false)
          .order('rotation_order', { ascending: true })
          .limit(1)

        if (memberError) throw memberError

        // Get members without vehicle (legacy)
        const { data: allMembers, error: allMembersError } = await supabase
          .from('members')
          .select('vehicle_received')

        if (allMembersError) throw allMembersError

        const membersWithoutVehicle = allMembers.filter(member => !member.vehicle_received).length

        // Get pending contributions count (legacy)
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
      }

      // Multi-stokvel implementation
      // Get all verified contributions for this stokvel
      const { data: contributions, error: contributionsError } = await supabase
        .from('stokvel_contributions')
        .select('amount, verified, month')
        .eq('stokvel_id', stokvelId)
        .eq('verified', true)

      if (contributionsError) throw contributionsError

      // Get completed payouts for this stokvel
      const { data: completedPayouts, error: payoutsError } = await supabase
        .from('stokvel_payouts')
        .select('amount_paid')
        .eq('stokvel_id', stokvelId)
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

      // Get next payout recipient for this stokvel
      const { data: nextRecipient, error: memberError } = await supabase
        .from('user_stokvel_members')
        .select('*')
        .eq('stokvel_id', stokvelId)
        .eq('vehicle_received', false)
        .order('rotation_order', { ascending: true })
        .limit(1)

      if (memberError) throw memberError

      // Get members without vehicle for this stokvel
      const { data: allMembers, error: allMembersError } = await supabase
        .from('user_stokvel_members')
        .select('vehicle_received')
        .eq('stokvel_id', stokvelId)

      if (allMembersError) throw allMembersError

      const membersWithoutVehicle = allMembers.filter(member => !member.vehicle_received).length

      // Get pending contributions count for this stokvel
      const { data: allContributions, error: allContribError } = await supabase
        .from('stokvel_contributions')
        .select('verified')
        .eq('stokvel_id', stokvelId)

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

export const useMonthlyContributionTrends = (stokvelId?: string) => {
  return useQuery({
    queryKey: ['monthly-contribution-trends', stokvelId],
    queryFn: async () => {
      // If no stokvelId is provided, fall back to legacy behavior
      if (!stokvelId) {
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
      }

      // Multi-stokvel implementation
      const { data, error } = await supabase
        .from('stokvel_contributions')
        .select('month, amount, verified')
        .eq('stokvel_id', stokvelId)
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

export const usePayoutHistory = (stokvelId?: string) => {
  return useQuery({
    queryKey: ['payout-history', stokvelId],
    queryFn: async () => {
      // If no stokvelId is provided, fall back to legacy behavior
      if (!stokvelId) {
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
      }

      // Multi-stokvel implementation
      // First get payouts
      const { data: payoutsData, error: payoutsError } = await supabase
        .from('stokvel_payouts')
        .select('*')
        .eq('stokvel_id', stokvelId)
        .eq('status', 'completed')
        .order('created_at', { ascending: true })

      if (payoutsError) throw payoutsError

      // If no payouts, return empty array
      if (!payoutsData || payoutsData.length === 0) {
        return []
      }

      // Then get member names
      const recipientMemberIds = payoutsData.map(p => p.recipient_member_id)
      const { data: membersData, error: membersError } = await supabase
        .from('user_stokvel_members')
        .select('member_id, full_name')
        .in('member_id', recipientMemberIds)

      if (membersError) throw membersError

      // Create a map of member IDs to names
      const memberMap = new Map(membersData?.map(m => [m.member_id, m.full_name]) || [])

      return payoutsData.map(payout => ({
        month: payout.month_paid,
        memberName: memberMap.get(payout.recipient_member_id) || 'Unknown',
        amount: payout.amount_paid,
        vehicleValue: payout.amount_paid, // stokvel_payouts doesn't have vehicle_value, use amount_paid
        rolloverBalance: payout.rollover_balance,
        date: payout.created_at,
      }))
    },
  })
}