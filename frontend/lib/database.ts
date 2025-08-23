import { supabase } from './supabase'
import type { Database } from './supabase'

type Tables = Database['public']['Tables']

export const db = {
  // Users
  users: {
    async getById(id: string) {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single()
      
      if (error) throw error
      return data
    },

    async updateProfile(id: string, updates: Tables['users']['Update']) {
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return data
    },
  },

  // Wallets
  wallets: {
    async getByUserId(userId: string) {
      const { data, error } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', userId)
        .single()
      
      if (error) throw error
      return data
    },

    async subscribe(userId: string, callback: (wallet: Tables['wallets']['Row']) => void) {
      return supabase
        .channel('wallet-changes')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'wallets',
            filter: `user_id=eq.${userId}`,
          },
          (payload) => callback(payload.new as Tables['wallets']['Row'])
        )
        .subscribe()
    },
  },

  // Wishes
  wishes: {
    async getAll() {
      const { data, error } = await supabase
        .from('wishes')
        .select(`
          *,
          creator:users!creator_id(*),
          assignee:users!assignee_id(*)
        `)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data
    },

    async create(wish: Tables['wishes']['Insert']) {
      const { data, error } = await supabase
        .from('wishes')
        .insert(wish)
        .select()
        .single()
      
      if (error) throw error
      return data
    },

    async updateStatus(id: string, status: Tables['wishes']['Row']['status'], assigneeId?: string) {
      const { data, error } = await supabase
        .from('wishes')
        .update({ 
          status, 
          assignee_id: assigneeId,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return data
    },
  },

  // Transactions
  transactions: {
    async getByUserId(userId: string) {
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          related_wish:wishes(*)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data
    },
  },

  // Database functions
  functions: {
    async convertCurrency(fromCurrency: string, toCurrency: string, amount: number) {
      const { data, error } = await supabase.rpc('convert_currency', {
        p_user_id: (await supabase.auth.getUser()).data.user?.id,
        p_from_currency: fromCurrency,
        p_to_currency: toCurrency,
        p_amount: amount,
      })
      
      if (error) throw error
      return data
    },

    async completeWish(wishId: string, assigneeId: string) {
      const { data, error } = await supabase.rpc('complete_wish', {
        p_wish_id: wishId,
        p_assignee_id: assigneeId,
      })
      
      if (error) throw error
      return data
    },
  },
}