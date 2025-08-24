'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from './AuthContext'

interface NotificationPreferences {
  id: string
  user_id: string
  email_notifications: boolean
  push_notifications: boolean
  friend_requests: boolean
  wish_updates: boolean
  achievements: boolean
  currency_gifts: boolean
  created_at: string
  updated_at: string
}

interface NotificationPreferencesContextType {
  preferences: NotificationPreferences | null
  loading: boolean
  updatePreferences: (updates: Partial<NotificationPreferences>) => Promise<boolean>
  refreshPreferences: () => Promise<void>
}

const NotificationPreferencesContext = createContext<NotificationPreferencesContextType | undefined>(undefined)

export function NotificationPreferencesProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null)
  const [loading, setLoading] = useState(false)

  const loadPreferences = useCallback(async () => {
    if (!user) return

    setLoading(true)
    try {
      const { data, error } = await supabase
        .rpc('get_notification_preferences', { p_user_id: user.id })

      if (error) throw error

      setPreferences(data)
    } catch (error) {
      console.error('Error loading notification preferences:', error)
    } finally {
      setLoading(false)
    }
  }, [user])

  const updatePreferences = async (updates: Partial<NotificationPreferences>): Promise<boolean> => {
    if (!user) return false

    try {
      const { data, error } = await supabase
        .rpc('update_notification_preferences', {
          p_user_id: user.id,
          p_email_notifications: updates.email_notifications,
          p_push_notifications: updates.push_notifications,
          p_friend_requests: updates.friend_requests,
          p_wish_updates: updates.wish_updates,
          p_achievements: updates.achievements,
          p_currency_gifts: updates.currency_gifts
        })

      if (error) throw error

      setPreferences(data)
      return true
    } catch (error) {
      console.error('Error updating notification preferences:', error)
      return false
    }
  }

  const refreshPreferences = async () => {
    await loadPreferences()
  }

  useEffect(() => {
    if (user) {
      loadPreferences()
    } else {
      setPreferences(null)
    }
  }, [user, loadPreferences])

  const value = {
    preferences,
    loading,
    updatePreferences,
    refreshPreferences,
  }

  return (
    <NotificationPreferencesContext.Provider value={value}>
      {children}
    </NotificationPreferencesContext.Provider>
  )
}

export function useNotificationPreferences() {
  const context = useContext(NotificationPreferencesContext)
  if (context === undefined) {
    throw new Error('useNotificationPreferences must be used within a NotificationPreferencesProvider')
  }
  return context
}