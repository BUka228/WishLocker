import { supabase } from './supabase'
import type { User } from '@supabase/supabase-js'

export interface AuthUser extends User {
  username?: string
}

// Legacy auth utilities - use AuthContext for new code
export const auth = {
  // Sign up new user
  async signUp(email: string, password: string, username: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
        },
      },
    })
    
    if (error) throw error
    return data
  },

  // Sign in existing user
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    
    if (error) throw error
    return data
  },

  // Sign out current user
  async signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  // Get current user
  async getCurrentUser(): Promise<AuthUser | null> {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) throw error
    return user as AuthUser
  },

  // Listen to auth state changes
  onAuthStateChange(callback: (user: AuthUser | null) => void) {
    return supabase.auth.onAuthStateChange((event, session) => {
      callback(session?.user as AuthUser || null)
    })
  },

  // Validate username format
  validateUsername(username: string): { valid: boolean; error?: string } {
    if (!username || username.length < 3 || username.length > 20) {
      return { valid: false, error: 'Имя пользователя должно содержать от 3 до 20 символов' }
    }

    const usernameRegex = /^[a-zA-Z0-9_-]+$/
    if (!usernameRegex.test(username)) {
      return { valid: false, error: 'Имя пользователя может содержать только буквы, цифры, дефисы и подчеркивания' }
    }

    return { valid: true }
  },

  // Check if username is available
  async isUsernameAvailable(username: string): Promise<boolean> {
    const { data } = await supabase
      .from('users')
      .select('username')
      .eq('username', username)
      .single()

    return !data
  }
}