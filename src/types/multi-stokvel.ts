export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// Stokvel Type Rules Templates
export interface StokvelRulesTemplate {
  payout_trigger: 'monthly_rotation' | 'on_threshold_reached' | 'once_per_year' | 'on_event' | 'on_profit_distribution' | 'on_application' | 'seasonal'
  target_amount?: number | null
  allow_rollover?: boolean
  distribution_type: 'cash' | 'goods' | 'vehicle' | 'profit_share' | 'educational_support'
  rotation_based: boolean
  frequency: 'monthly' | 'quarterly' | 'yearly' | 'as_needed'
  payout_month?: string
  allow_emergency_withdrawals?: boolean
  investment_type?: 'property' | 'shares' | 'business'
  emergency_fund?: boolean
  reinvestment_option?: boolean
  application_required?: boolean
}

export interface Database {
  public: {
    Tables: {
      stokvel_types: {
        Row: {
          id: string
          name: string
          description: string
          rules_template: StokvelRulesTemplate
          icon: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          rules_template: StokvelRulesTemplate
          icon?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          rules_template?: StokvelRulesTemplate
          icon?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      user_stokvels: {
        Row: {
          id: string
          owner_id: string
          stokvel_type_id: string
          name: string
          description: string | null
          monthly_contribution: number
          target_amount: number | null
          currency: string
          start_date: string
          rules: StokvelRulesTemplate
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          stokvel_type_id: string
          name: string
          description?: string | null
          monthly_contribution: number
          target_amount?: number | null
          currency?: string
          start_date: string
          rules: StokvelRulesTemplate
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          owner_id?: string
          stokvel_type_id?: string
          name?: string
          description?: string | null
          monthly_contribution?: number
          target_amount?: number | null
          currency?: string
          start_date?: string
          rules?: StokvelRulesTemplate
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      user_stokvel_members: {
        Row: {
          id: string
          stokvel_id: string
          member_id: string
          role: 'admin' | 'member'
          rotation_order: number | null
          full_name: string
          email: string
          contact_number: string | null
          vehicle_received: boolean
          month_received: string | null
          total_paid: number
          net_position: number
          adjustment: number
          join_date: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          stokvel_id: string
          member_id: string
          role?: 'admin' | 'member'
          rotation_order?: number | null
          full_name: string
          email: string
          contact_number?: string | null
          vehicle_received?: boolean
          month_received?: string | null
          total_paid?: number
          net_position?: number
          adjustment?: number
          join_date?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          stokvel_id?: string
          member_id?: string
          role?: 'admin' | 'member'
          rotation_order?: number | null
          full_name?: string
          email?: string
          contact_number?: string | null
          vehicle_received?: boolean
          month_received?: string | null
          total_paid?: number
          net_position?: number
          adjustment?: number
          join_date?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      stokvel_contributions: {
        Row: {
          id: string
          stokvel_id: string
          member_id: string
          month: string
          amount: number
          date_paid: string
          proof_of_payment: string | null
          verified: boolean
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          stokvel_id: string
          member_id: string
          month: string
          amount: number
          date_paid: string
          proof_of_payment?: string | null
          verified?: boolean
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          stokvel_id?: string
          member_id?: string
          month?: string
          amount?: number
          date_paid?: string
          proof_of_payment?: string | null
          verified?: boolean
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      stokvel_payouts: {
        Row: {
          id: string
          stokvel_id: string
          member_id: string
          month_paid: string
          amount_paid: number
          rollover_balance: number
          payout_type: string
          status: 'pending' | 'completed' | 'cancelled'
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          stokvel_id: string
          member_id: string
          month_paid: string
          amount_paid: number
          rollover_balance?: number
          payout_type?: string
          status?: 'pending' | 'completed' | 'cancelled'
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          stokvel_id?: string
          member_id?: string
          month_paid?: string
          amount_paid?: number
          rollover_balance?: number
          payout_type?: string
          status?: 'pending' | 'completed' | 'cancelled'
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      stokvel_summary: {
        Row: {
          id: string
          name: string
          description: string | null
          type_name: string
          icon: string | null
          monthly_contribution: number
          target_amount: number | null
          currency: string
          start_date: string
          is_active: boolean
          member_count: number
          total_verified_contributions: number
          total_pending_contributions: number
          total_payouts: number
          owner_id: string
        }
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Extended types for the application
export type StokvelType = Database['public']['Tables']['stokvel_types']['Row']
export type UserStokvel = Database['public']['Tables']['user_stokvels']['Row']
export type StokvelMember = Database['public']['Tables']['user_stokvel_members']['Row']
export type StokvelContribution = Database['public']['Tables']['stokvel_contributions']['Row']
export type StokvelPayout = Database['public']['Tables']['stokvel_payouts']['Row']
export type StokvelSummary = Database['public']['Views']['stokvel_summary']['Row']

// Extended stokvel with type information
export type StokvelWithType = UserStokvel & {
  stokvel_type: StokvelType
  summary?: StokvelSummary
  membership_role?: 'admin' | 'member'
  membership_rotation_order?: number
  membership_join_date?: string
}

// Member with contribution and payout information
export type MemberWithStats = StokvelMember & {
  contributions?: StokvelContribution[]
  payouts?: StokvelPayout[]
  total_contributions?: number
  pending_contributions?: number
}

// Contribution with member information
export type ContributionWithMember = StokvelContribution & {
  member: StokvelMember
}

// Payout with member information
export type PayoutWithMember = StokvelPayout & {
  member: StokvelMember
}

// Dashboard data types
export interface StokvelDashboardData {
  stokvel: StokvelWithType
  members: MemberWithStats[]
  recentContributions: ContributionWithMember[]
  recentPayouts: PayoutWithMember[]
  monthlyStats: {
    month: string
    contributions: number
    members_contributed: number
  }[]
  balance: {
    total_contributions: number
    total_payouts: number
    current_balance: number
    pending_contributions: number
  }
}

// Create stokvel wizard types
export interface CreateStokvelData {
  stokvel_type_id: string
  name: string
  description?: string
  monthly_contribution: number
  target_amount?: number
  currency: string
  start_date: string
  rules: StokvelRulesTemplate
  initial_members?: {
    full_name: string
    email: string
    contact_number?: string
    role: 'admin' | 'member'
  }[]
}