export interface Member {
  id: string
  full_name: string
  email: string
  join_date: string
  contact_number: string
  vehicle_received: boolean
  month_received: string | null
  rotation_order: number
  created_at: string
  updated_at: string
}

export interface Contribution {
  id: string
  member_id: string
  month: string
  amount: number
  date_paid: string
  proof_of_payment: string | null
  verified: boolean
  created_at: string
  updated_at: string
  member?: Member
}

export interface Payout {
  id: string
  member_id: string
  month_paid: string
  amount_paid: number
  rollover_balance: number
  vehicle_value: number
  status: 'pending' | 'completed'
  created_at: string
  updated_at: string
  member?: Member
}

export interface StokveilSettings {
  id: string
  stokvel_name: string
  monthly_contribution: number
  vehicle_target: number
  total_members: number
  start_date: string
  created_at: string
  updated_at: string
}

export interface DashboardStats {
  totalBalance: number
  currentMonthContributions: number
  nextPayoutRecipient: Member | null
  membersWithoutVehicle: number
  completedPayouts: number
  pendingContributions: number
}