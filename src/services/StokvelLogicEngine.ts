import { StokvelRulesTemplate, StokvelContribution, StokvelMember, UserStokvel } from '../types/multi-stokvel'

export interface PayoutTriggerResult {
  shouldTrigger: boolean
  reason: string
  nextPayoutDate?: Date
  eligibleMember?: StokvelMember
  payoutAmount?: number
}

export interface PayoutCalculation {
  amount: number
  type: string
  distribution_method: 'equal' | 'rotation' | 'merit_based' | 'event_based'
  rollover_balance: number
  notes: string
}

export interface FairnessCalculationResult {
  member_id: string
  member_name: string
  total_paid: number
  month_received: number
  net_position: number
  adjustment: number
}

export interface FairnessSummary {
  total_pool_collected: number
  total_vehicles_distributed: number
  average_net_position: number
  leftover_pot: number
  member_calculations: FairnessCalculationResult[]
  cycle_complete: boolean
}

export class StokvelLogicEngine {
  /**
   * Determines if a payout should be triggered based on stokvel rules
   */
  static shouldTriggerPayout(
    stokvel: UserStokvel,
    currentBalance: number,
    contributions: StokvelContribution[],
    members: StokvelMember[]
  ): PayoutTriggerResult {
    const rules = stokvel.rules

    switch (rules.payout_trigger) {
      case 'on_threshold_reached':
        return this.checkThresholdTrigger(stokvel, currentBalance)
      
      case 'monthly_rotation':
        return this.checkMonthlyRotationTrigger(stokvel, members, contributions)
      
      case 'once_per_year':
        return this.checkYearlyTrigger(stokvel)
      
      case 'seasonal':
        return this.checkSeasonalTrigger(stokvel)
      
      case 'on_event':
        return this.checkEventTrigger(stokvel, currentBalance)
      
      case 'on_profit_distribution':
        return this.checkProfitDistributionTrigger(stokvel, currentBalance)
      
      case 'on_application':
        return this.checkApplicationTrigger(stokvel, members)
      
      default:
        return {
          shouldTrigger: false,
          reason: 'Unknown payout trigger type'
        }
    }
  }

  /**
   * Calculates payout amount and distribution method
   */
  static calculatePayout(
    stokvel: UserStokvel,
    currentBalance: number,
    members: StokvelMember[],
    targetMember?: StokvelMember
  ): PayoutCalculation {
    const rules = stokvel.rules

    switch (rules.distribution_type) {
      case 'cash':
        return this.calculateCashPayout(stokvel, currentBalance, members, targetMember)
      
      case 'vehicle':
        return this.calculateVehiclePayout(stokvel, currentBalance, targetMember)
      
      case 'goods':
        return this.calculateGoodsPayout(stokvel, currentBalance, members)
      
      case 'profit_share':
        return this.calculateProfitSharePayout(stokvel, currentBalance, members)
      
      case 'educational_support':
        return this.calculateEducationalPayout(stokvel, currentBalance, targetMember)
      
      default:
        return {
          amount: 0,
          type: 'unknown',
          distribution_method: 'equal',
          rollover_balance: currentBalance,
          notes: 'Unknown distribution type'
        }
    }
  }

  /**
   * Gets the next eligible member for rotation-based payouts
   */
  static getNextEligibleMember(
    members: StokvelMember[],
    rules: StokvelRulesTemplate
  ): StokvelMember | null {
    if (!rules.rotation_based) return null

    // Filter active members who haven't received payout yet
    const eligibleMembers = members
      .filter(member => member.is_active && !member.vehicle_received)
      .sort((a, b) => (a.rotation_order || 0) - (b.rotation_order || 0))

    return eligibleMembers[0] || null
  }

  /**
   * Determines contribution requirements based on rules
   */
  static getContributionRequirements(
    stokvel: UserStokvel,
    currentMonth: string
  ): {
    isRequired: boolean
    amount: number
    deadline?: Date
    notes: string
  } {
    const rules = stokvel.rules

    switch (rules.frequency) {
      case 'monthly':
        return {
          isRequired: true,
          amount: stokvel.monthly_contribution,
          deadline: this.getMonthEndDate(currentMonth),
          notes: `Monthly contribution of ${stokvel.currency} ${stokvel.monthly_contribution.toLocaleString()}`
        }
      
      case 'quarterly':
        const isQuarterlyMonth = this.isQuarterlyContributionMonth(currentMonth)
        return {
          isRequired: isQuarterlyMonth,
          amount: isQuarterlyMonth ? stokvel.monthly_contribution * 3 : 0,
          deadline: isQuarterlyMonth ? this.getQuarterEndDate(currentMonth) : undefined,
          notes: isQuarterlyMonth ? 'Quarterly contribution due' : 'No contribution required this month'
        }
      
      case 'yearly':
        const isYearlyMonth = this.isYearlyContributionMonth(currentMonth, rules)
        return {
          isRequired: isYearlyMonth,
          amount: isYearlyMonth ? stokvel.monthly_contribution * 12 : 0,
          deadline: isYearlyMonth ? this.getYearEndDate(currentMonth) : undefined,
          notes: isYearlyMonth ? 'Annual contribution due' : 'No contribution required this month'
        }
      
      case 'as_needed':
        return {
          isRequired: false,
          amount: 0,
          notes: 'Contributions are made as needed based on events or applications'
        }
      
      default:
        return {
          isRequired: false,
          amount: 0,
          notes: 'Unknown contribution frequency'
        }
    }
  }

  // Private helper methods for trigger checks
  private static checkThresholdTrigger(
    stokvel: UserStokvel,
    currentBalance: number
  ): PayoutTriggerResult {
    const targetAmount = stokvel.target_amount || 0
    
    if (currentBalance >= targetAmount) {
      return {
        shouldTrigger: true,
        reason: `Balance (${stokvel.currency} ${currentBalance.toLocaleString()}) has reached target (${stokvel.currency} ${targetAmount.toLocaleString()})`,
        payoutAmount: targetAmount
      }
    }

    return {
      shouldTrigger: false,
      reason: `Balance (${stokvel.currency} ${currentBalance.toLocaleString()}) has not yet reached target (${stokvel.currency} ${targetAmount.toLocaleString()})`
    }
  }

  private static checkMonthlyRotationTrigger(
    stokvel: UserStokvel,
    members: StokvelMember[],
    contributions: StokvelContribution[]
  ): PayoutTriggerResult {
    const currentMonth = new Date().toISOString().slice(0, 7) // YYYY-MM format
    const activeMembers = members.filter(m => m.is_active)
    
    // Check if all active members have contributed this month
    const thisMonthContributions = contributions.filter(c => 
      c.month === currentMonth && c.verified
    )
    
    const contributingMemberIds = new Set(
      thisMonthContributions.map(c => c.member_id)
    )
    
    const allMembersContributed = activeMembers.every(member => 
      contributingMemberIds.has(member.id)
    )

    if (allMembersContributed) {
      const nextMember = this.getNextEligibleMember(members, stokvel.rules)
      
      if (nextMember) {
        return {
          shouldTrigger: true,
          reason: 'All members have contributed this month',
          eligibleMember: nextMember,
          payoutAmount: stokvel.monthly_contribution * activeMembers.length
        }
      } else {
        return {
          shouldTrigger: false,
          reason: 'All members have already received their rotation payout'
        }
      }
    }

    return {
      shouldTrigger: false,
      reason: `Only ${thisMonthContributions.length} of ${activeMembers.length} members have contributed this month`
    }
  }

  private static checkYearlyTrigger(stokvel: UserStokvel): PayoutTriggerResult {
    const currentDate = new Date()
    const payoutMonth = stokvel.rules.payout_month || 'December'
    const currentMonth = currentDate.toLocaleString('default', { month: 'long' })
    
    if (currentMonth === payoutMonth) {
      return {
        shouldTrigger: true,
        reason: `Annual payout month (${payoutMonth}) has arrived`,
        nextPayoutDate: new Date(currentDate.getFullYear() + 1, 11, 31) // Next December
      }
    }

    return {
      shouldTrigger: false,
      reason: `Waiting for payout month (${payoutMonth}). Current month: ${currentMonth}`
    }
  }

  private static checkSeasonalTrigger(stokvel: UserStokvel): PayoutTriggerResult {
    // Similar to yearly but could be customized for different seasons
    return this.checkYearlyTrigger(stokvel)
  }

  private static checkEventTrigger(
    stokvel: UserStokvel,
    currentBalance: number
  ): PayoutTriggerResult {
    // This would typically be triggered manually by an admin
    // For now, we'll check if there's sufficient balance for emergency payouts
    const minimumEmergencyAmount = stokvel.monthly_contribution * 3

    if (currentBalance >= minimumEmergencyAmount) {
      return {
        shouldTrigger: false, // Requires manual trigger
        reason: `Emergency funds available (${stokvel.currency} ${currentBalance.toLocaleString()}). Awaiting event or manual trigger.`
      }
    }

    return {
      shouldTrigger: false,
      reason: `Insufficient funds for emergency payout. Need at least ${stokvel.currency} ${minimumEmergencyAmount.toLocaleString()}`
    }
  }

  private static checkProfitDistributionTrigger(
    stokvel: UserStokvel,
    currentBalance: number
  ): PayoutTriggerResult {
    // This would be based on investment returns
    // For now, check if balance has grown beyond contributions
    const expectedContributions = stokvel.monthly_contribution * 12 // Assume 12 months of contributions
    
    if (currentBalance > expectedContributions * 1.1) { // 10% profit threshold
      return {
        shouldTrigger: true,
        reason: 'Investment profits are available for distribution',
        payoutAmount: currentBalance - expectedContributions
      }
    }

    return {
      shouldTrigger: false,
      reason: 'No significant profits available for distribution yet'
    }
  }

  private static checkApplicationTrigger(
    stokvel: UserStokvel,
    members: StokvelMember[]
  ): PayoutTriggerResult {
    // This requires manual application process
    const nextMember = this.getNextEligibleMember(members, stokvel.rules)
    
    if (nextMember) {
      return {
        shouldTrigger: false, // Requires application
        reason: 'Awaiting application from eligible member',
        eligibleMember: nextMember
      }
    }

    return {
      shouldTrigger: false,
      reason: 'No eligible members for application-based payout'
    }
  }

  // Payout calculation methods
  private static calculateCashPayout(
    _stokvel: UserStokvel,
    currentBalance: number,
    members: StokvelMember[],
    targetMember?: StokvelMember
  ): PayoutCalculation {
    const activeMembers = members.filter(m => m.is_active)
    
    if (_stokvel.rules.rotation_based && targetMember) {
      const payoutAmount = _stokvel.target_amount || (_stokvel.monthly_contribution * activeMembers.length)
      return {
        amount: Math.min(payoutAmount, currentBalance),
        type: 'cash',
        distribution_method: 'rotation',
        rollover_balance: Math.max(0, currentBalance - payoutAmount),
        notes: `Rotation payout to ${targetMember.full_name}`
      }
    } else {
      const perMemberAmount = Math.floor(currentBalance / activeMembers.length)
      return {
        amount: currentBalance,
        type: 'cash',
        distribution_method: 'equal',
        rollover_balance: currentBalance - (perMemberAmount * activeMembers.length),
        notes: `Equal distribution per member`
      }
    }
  }

  private static calculateVehiclePayout(
    stokvel: UserStokvel,
    currentBalance: number,
    targetMember?: StokvelMember
  ): PayoutCalculation {
    const vehicleAmount = stokvel.target_amount || 100000
    
    return {
      amount: Math.min(vehicleAmount, currentBalance),
      type: 'vehicle',
      distribution_method: 'rotation',
      rollover_balance: Math.max(0, currentBalance - vehicleAmount),
      notes: targetMember 
        ? `Vehicle payout to ${targetMember.full_name}` 
        : 'Vehicle payout to next eligible member'
    }
  }

  private static calculateGoodsPayout(
    _stokvel: UserStokvel,
    currentBalance: number,
    members: StokvelMember[]
  ): PayoutCalculation {
    const activeMembers = members.filter(m => m.is_active)
    
    return {
      amount: currentBalance,
      type: 'goods',
      distribution_method: 'equal',
      rollover_balance: 0,
      notes: `Bulk purchase for ${activeMembers.length} members`
    }
  }

  private static calculateProfitSharePayout(
    stokvel: UserStokvel,
    currentBalance: number,
    members: StokvelMember[]
  ): PayoutCalculation {
    const activeMembers = members.filter(m => m.is_active)
    const expectedContributions = stokvel.monthly_contribution * 12 * activeMembers.length
    const profits = Math.max(0, currentBalance - expectedContributions)
    const profitPerMember = Math.floor(profits / activeMembers.length)
    
    return {
      amount: profits,
      type: 'profit_share',
      distribution_method: 'equal',
      rollover_balance: expectedContributions + (profits - (profitPerMember * activeMembers.length)),
      notes: `Profit distribution of ${stokvel.currency} ${profitPerMember.toLocaleString()} per member`
    }
  }

  private static calculateEducationalPayout(
    stokvel: UserStokvel,
    currentBalance: number,
    targetMember?: StokvelMember
  ): PayoutCalculation {
    // Educational support could be a fixed amount or percentage of balance
    const maxEducationalSupport = stokvel.monthly_contribution * 6 // 6 months worth
    const payoutAmount = Math.min(maxEducationalSupport, currentBalance * 0.3) // Max 30% of balance
    
    return {
      amount: payoutAmount,
      type: 'educational_support',
      distribution_method: 'merit_based',
      rollover_balance: currentBalance - payoutAmount,
      notes: targetMember 
        ? `Educational support for ${targetMember.full_name}` 
        : 'Educational support payout'
    }
  }

  // Date utility methods
  private static getMonthEndDate(month: string): Date {
    const [year, monthNum] = month.split('-').map(Number)
    return new Date(year, monthNum, 0) // Last day of the month
  }

  private static getQuarterEndDate(month: string): Date {
    const [year, monthNum] = month.split('-').map(Number)
    const quarterEndMonth = Math.ceil(monthNum / 3) * 3
    return new Date(year, quarterEndMonth, 0)
  }

  private static getYearEndDate(month: string): Date {
    const [year] = month.split('-').map(Number)
    return new Date(year, 11, 31) // December 31st
  }

  private static isQuarterlyContributionMonth(month: string): boolean {
    const [, monthNum] = month.split('-').map(Number)
    return [3, 6, 9, 12].includes(monthNum)
  }

  private static isYearlyContributionMonth(month: string, rules: StokvelRulesTemplate): boolean {
    const [, monthNum] = month.split('-').map(Number)
    const payoutMonth = rules.payout_month || 'December'
    const payoutMonthNum = new Date(`${payoutMonth} 1, 2000`).getMonth() + 1
    return monthNum === payoutMonthNum
  }

  /**
   * Calculates fairness adjustments for all members after cycle completion
   * Formula: adjustment = average_net_position - member_net_position
   * Where net_position = 100,000 - total_paid
   */
  static calculateFairness(
    members: StokvelMember[],
    contributions: StokvelContribution[],
    vehicleAmount: number = 100000
  ): FairnessSummary {
    const memberCalculations: FairnessCalculationResult[] = []
    let totalPaidSum = 0

    // Calculate total paid for each member
    members.forEach(member => {
      const memberContributions = contributions.filter(
        c => c.member_id === member.id && c.verified
      )
      const totalPaid = memberContributions.reduce((sum, c) => sum + c.amount, 0)

      // Extract month number from month_received (format: "YYYY-MM" or just number)
      const monthReceived = member.month_received
        ? (typeof member.month_received === 'string' && member.month_received.includes('-')
          ? parseInt(member.month_received.split('-')[1])
          : parseInt(member.month_received))
        : 0

      const netPosition = vehicleAmount - totalPaid

      totalPaidSum += totalPaid

      memberCalculations.push({
        member_id: member.id,
        member_name: member.full_name,
        total_paid: totalPaid,
        month_received: monthReceived,
        net_position: netPosition,
        adjustment: 0 // Will be calculated after we have average
      })
    })

    // Calculate average net position
    const averageNetPosition = memberCalculations.length > 0
      ? memberCalculations.reduce((sum, m) => sum + m.net_position, 0) / memberCalculations.length
      : 0

    // Calculate adjustment for each member
    memberCalculations.forEach(calc => {
      calc.adjustment = averageNetPosition - calc.net_position
    })

    // Calculate leftover pot (total contributions - total vehicles distributed)
    const totalVehiclesDistributed = members.filter(m => m.vehicle_received).length
    const totalDistributed = totalVehiclesDistributed * vehicleAmount
    const leftoverPot = totalPaidSum - totalDistributed

    return {
      total_pool_collected: totalPaidSum,
      total_vehicles_distributed: totalVehiclesDistributed,
      average_net_position: averageNetPosition,
      leftover_pot: leftoverPot,
      member_calculations: memberCalculations,
      cycle_complete: members.every(m => m.vehicle_received)
    }
  }

  /**
   * Checks if fairness calculation should be triggered
   * Triggers when all members have received their vehicles
   */
  static shouldTriggerFairnessCalculation(
    members: StokvelMember[]
  ): boolean {
    const activeMembers = members.filter(m => m.is_active)
    if (activeMembers.length === 0) return false

    return activeMembers.every(member => member.vehicle_received)
  }

  /**
   * Gets contribution amount based on member's vehicle receipt status
   * Before receiving vehicle: initial_monthly_contribution
   * After receiving vehicle: post_receipt_contribution
   */
  static getContributionAmount(
    member: StokvelMember,
    baseAmount: number,
    postReceiptAmount: number = 8000
  ): number {
    if (member.vehicle_received) {
      return postReceiptAmount
    }
    return baseAmount
  }

  /**
   * Calculates expected contribution for a member in a given month
   * Accounts for joining fee in first month and vehicle receipt status
   */
  static calculateExpectedContribution(
    member: StokvelMember,
    currentMonth: string,
    stokvelStartDate: string,
    monthlyContribution: number,
    joiningFee: number = 1500,
    postReceiptContribution: number = 8000
  ): number {
    // Check if this is the first month
    const startDate = new Date(stokvelStartDate)
    const currentDate = new Date(currentMonth + '-01')
    const memberJoinDate = new Date(member.join_date)

    const isFirstMonth =
      currentDate.getFullYear() === startDate.getFullYear() &&
      currentDate.getMonth() === startDate.getMonth() &&
      memberJoinDate.getFullYear() === startDate.getFullYear() &&
      memberJoinDate.getMonth() === startDate.getMonth()

    // Calculate base amount
    let expectedAmount = member.vehicle_received ? postReceiptContribution : monthlyContribution

    // Add joining fee if first month
    if (isFirstMonth) {
      expectedAmount += joiningFee
    }

    return expectedAmount
  }
}