export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      members: {
        Row: {
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
        Insert: {
          id?: string
          full_name: string
          email: string
          join_date: string
          contact_number: string
          vehicle_received?: boolean
          month_received?: string | null
          rotation_order: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          email?: string
          join_date?: string
          contact_number?: string
          vehicle_received?: boolean
          month_received?: string | null
          rotation_order?: number
          created_at?: string
          updated_at?: string
        }
      }
      contributions: {
        Row: {
          id: string
          member_id: string
          month: string
          amount: number
          date_paid: string
          proof_of_payment: string | null
          verified: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          member_id: string
          month: string
          amount: number
          date_paid: string
          proof_of_payment?: string | null
          verified?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          member_id?: string
          month?: string
          amount?: number
          date_paid?: string
          proof_of_payment?: string | null
          verified?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      payouts: {
        Row: {
          id: string
          member_id: string
          month_paid: string
          amount_paid: number
          rollover_balance: number
          vehicle_value: number
          status: 'pending' | 'completed'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          member_id: string
          month_paid: string
          amount_paid: number
          rollover_balance: number
          vehicle_value: number
          status?: 'pending' | 'completed'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          member_id?: string
          month_paid?: string
          amount_paid?: number
          rollover_balance?: number
          vehicle_value?: number
          status?: 'pending' | 'completed'
          created_at?: string
          updated_at?: string
        }
      }
      settings: {
        Row: {
          id: string
          stokvel_name: string
          monthly_contribution: number
          vehicle_target: number
          total_members: number
          start_date: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          stokvel_name: string
          monthly_contribution: number
          vehicle_target: number
          total_members: number
          start_date: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          stokvel_name?: string
          monthly_contribution?: number
          vehicle_target?: number
          total_members?: number
          start_date?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
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