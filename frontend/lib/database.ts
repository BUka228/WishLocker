import { supabase } from './supabase'
import { Database } from '../../shared/supabase-types'

// Type aliases for convenience
export type User = Database['public']['Tables']['users']['Row']
export type Wallet = Database['public']['Tables']['wallets']['Row']
export type Wish = Database['public']['Tables']['wishes']['Row']
export type Transaction = Database['public']['Tables']['transactions']['Row']
export type Achievement = Database['public']['Tables']['achievements']['Row']
export type Friendship = Database['public']['Tables']['friendships']['Row']

// Database utility functions
export const db = {
  // Test connection
  async testConnection() {
    try {
      const { data, error } = await supabase.from('users').select('count').limit(1)
      if (error) throw error
      return { success: true, message: 'Database connection successful' }
    } catch (error) {
      return { success: false, message: `Database connection failed: ${error}` }
    }
  },

  // User operations
  users: {
    async getById(id: string) {
      return await supabase.from('users').select('*').eq('id', id).single()
    },
    
    async getByUsername(username: string) {
      return await supabase.from('users').select('*').eq('username', username).single()
    }
  },

  // Wallet operations
  wallets: {
    async getByUserId(userId: string) {
      return await supabase.from('wallets').select('*').eq('user_id', userId).single()
    }
  },

  // Wish operations
  wishes: {
    async getAll() {
      return await supabase.from('wishes').select(`
        *,
        creator:creator_id(username),
        assignee:assignee_id(username)
      `)
    },
    
    async getByCreator(creatorId: string) {
      return await supabase.from('wishes').select('*').eq('creator_id', creatorId)
    }
  }
}