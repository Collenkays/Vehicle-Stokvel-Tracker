import { StokvelRulesTemplate } from '../types/multi-stokvel'
import { Users, CreditCard, Car, TrendingUp, Gift, ShoppingCart, Heart, Briefcase, GraduationCap } from 'lucide-react'

export interface CardContent {
  pendingMembersLabel: string
  pendingMembersDescription: string
  completedPayoutsLabel: string
  completedPayoutsDescription: string
  pendingMembersIcon: any
  completedPayoutsIcon: any
  nextPayoutDescription: string
  distributionUnit: string
}

export const getStokvelCardContent = (rules: StokvelRulesTemplate | undefined): CardContent => {
  if (!rules) {
    // Default fallback
    return {
      pendingMembersLabel: 'Pending Members',
      pendingMembersDescription: 'Awaiting payout',
      completedPayoutsLabel: 'Completed Payouts',
      completedPayoutsDescription: 'Payouts distributed',
      pendingMembersIcon: Users,
      completedPayoutsIcon: TrendingUp,
      nextPayoutDescription: 'Next payout recipient',
      distributionUnit: 'payout'
    }
  }

  switch (rules.distribution_type) {
    case 'vehicle':
      return {
        pendingMembersLabel: 'Members Without Vehicle',
        pendingMembersDescription: 'Awaiting payout',
        completedPayoutsLabel: 'Completed Payouts',
        completedPayoutsDescription: 'Vehicles distributed',
        pendingMembersIcon: Users,
        completedPayoutsIcon: Car,
        nextPayoutDescription: 'Next vehicle recipient',
        distributionUnit: 'vehicle'
      }

    case 'cash':
      if (rules.payout_trigger === 'monthly_rotation') {
        return {
          pendingMembersLabel: 'Members Pending Payout',
          pendingMembersDescription: 'Awaiting rotation',
          completedPayoutsLabel: 'Completed Payouts',
          completedPayoutsDescription: 'Cash distributed',
          pendingMembersIcon: Users,
          completedPayoutsIcon: CreditCard,
          nextPayoutDescription: 'Next rotation recipient',
          distributionUnit: 'cash payout'
        }
      } else if (rules.emergency_fund) {
        // Burial Society
        return {
          pendingMembersLabel: 'Active Members',
          pendingMembersDescription: 'Fund contributors',
          completedPayoutsLabel: 'Emergency Payouts',
          completedPayoutsDescription: 'Claims processed',
          pendingMembersIcon: Heart,
          completedPayoutsIcon: CreditCard,
          nextPayoutDescription: 'Emergency fund available',
          distributionUnit: 'emergency payout'
        }
      } else {
        return {
          pendingMembersLabel: 'Members Pending Payout',
          pendingMembersDescription: 'Awaiting payout',
          completedPayoutsLabel: 'Completed Payouts',
          completedPayoutsDescription: 'Cash distributed',
          pendingMembersIcon: Users,
          completedPayoutsIcon: CreditCard,
          nextPayoutDescription: 'Next payout recipient',
          distributionUnit: 'cash payout'
        }
      }

    case 'goods':
      return {
        pendingMembersLabel: 'Members Pending Goods',
        pendingMembersDescription: 'Awaiting distribution',
        completedPayoutsLabel: 'Completed Distributions',
        completedPayoutsDescription: 'Goods distributed',
        pendingMembersIcon: Users,
        completedPayoutsIcon: ShoppingCart,
        nextPayoutDescription: 'Next distribution',
        distributionUnit: 'goods distribution'
      }

    case 'profit_share':
      return {
        pendingMembersLabel: 'Members Pending Share',
        pendingMembersDescription: 'Awaiting profit share',
        completedPayoutsLabel: 'Profit Distributions',
        completedPayoutsDescription: 'Profits shared',
        pendingMembersIcon: Users,
        completedPayoutsIcon: Briefcase,
        nextPayoutDescription: 'Next profit distribution',
        distributionUnit: 'profit share'
      }

    case 'educational_support':
      return {
        pendingMembersLabel: 'Members Pending Support',
        pendingMembersDescription: 'Awaiting educational fund',
        completedPayoutsLabel: 'Educational Grants',
        completedPayoutsDescription: 'Support provided',
        pendingMembersIcon: Users,
        completedPayoutsIcon: GraduationCap,
        nextPayoutDescription: 'Next educational grant',
        distributionUnit: 'educational support'
      }

    default:
      return {
        pendingMembersLabel: 'Members Pending Payout',
        pendingMembersDescription: 'Awaiting payout',
        completedPayoutsLabel: 'Completed Payouts',
        completedPayoutsDescription: 'Payouts distributed',
        pendingMembersIcon: Users,
        completedPayoutsIcon: Gift,
        nextPayoutDescription: 'Next payout recipient',
        distributionUnit: 'payout'
      }
  }
}

export const getStokvelTypeDisplayName = (rules: StokvelRulesTemplate | undefined): string => {
  if (!rules) return 'Stokvel'

  switch (rules.distribution_type) {
    case 'vehicle':
      return 'Vehicle Stokvel'
    case 'cash':
      if (rules.emergency_fund) return 'Burial Society'
      if (rules.payout_trigger === 'monthly_rotation') return 'Savings Stokvel'
      return 'Cash Stokvel'
    case 'goods':
      return 'Grocery Stokvel'
    case 'profit_share':
      return 'Investment Stokvel'
    case 'educational_support':
      return 'Education Stokvel'
    default:
      return 'Stokvel'
  }
}