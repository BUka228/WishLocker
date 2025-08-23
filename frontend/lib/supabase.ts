import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          username: string
          avatar_url?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          username: string
          avatar_url?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          username?: string
          avatar_url?: string
          updated_at?: string
        }
      }
      wallets: {
        Row: {
          id: string
          user_id: string
          green_balance: number
          blue_balance: number
          red_balance: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          green_balance?: number
          blue_balance?: number
          red_balance?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          green_balance?: number
          blue_balance?: number
          red_balance?: number
          updated_at?: string
        }
      }
      wishes: {
        Row: {
          id: string
          title: string
          description: string
          type: 'green' | 'blue' | 'red'
          cost: number
          status: 'active' | 'in_progress' | 'completed' | 'rejected'
          creator_id: string
          assignee_id?: string
          deadline?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          type: 'green' | 'blue' | 'red'
          cost: number
          status?: 'active' | 'in_progress' | 'completed' | 'rejected'
          creator_id: string
          assignee_id?: string
          deadline?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          title?: string
          description?: string
          type?: 'green' | 'blue' | 'red'
          cost?: number
          status?: 'active' | 'in_progress' | 'completed' | 'rejected'
          assignee_id?: string
          deadline?: string
          updated_at?: string
        }
      }
      transactions: {
        Row: {
          id: string
          user_id: string
          type: 'earn' | 'spend' | 'convert'
          currency: 'green' | 'blue' | 'red'
          amount: number
          description: string
          related_wish_id?: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: 'earn' | 'spend' | 'convert'
          currency: 'green' | 'blue' | 'red'
          amount: number
          description: string
          related_wish_id?: string
          created_at?: string
        }
      }
    }
  }
}