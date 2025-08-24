'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from './AuthContext'
import { Achievement, AchievementProgress, AchievementType } from '@/lib/types'

interface AchievementContextType {
  achievements: Achievement[]
  achievementProgress: AchievementProgress[]
  loading: boolean
  error: string | null
  refreshAchievements: () => Promise<void>
  getAchievementProgress: () => Promise<void>
  hasAchievement: (type: AchievementType) => boolean
  getAchievementByType: (type: AchievementType) => Achievement | null
}

const AchievementContext = createContext<AchievementContextType | undefined>(undefined)

export function AchievementProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [achievementProgress, setAchievementProgress] = useState<AchievementProgress[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refreshAchievements = async () => {
    if (!user) return

    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('achievements')
        .select('*')
        .eq('user_id', user.id)
        .order('earned_at', { ascending: false })

      if (fetchError) throw fetchError

      setAchievements(data || [])
    } catch (err) {
      console.error('Error fetching achievements:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch achievements')
    } finally {
      setLoading(false)
    }
  }

  const getAchievementProgress = async () => {
    if (!user) return

    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .rpc('get_achievement_progress', { p_user_id: user.id })

      if (fetchError) throw fetchError

      setAchievementProgress(data || [])
    } catch (err) {
      console.error('Error fetching achievement progress:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch achievement progress')
    } finally {
      setLoading(false)
    }
  }

  const hasAchievement = (type: AchievementType): boolean => {
    return achievements.some(achievement => 
      achievement.achievement_type === type || achievement.achievement_type_enum === type
    )
  }

  const getAchievementByType = (type: AchievementType): Achievement | null => {
    return achievements.find(achievement => 
      achievement.achievement_type === type || achievement.achievement_type_enum === type
    ) || null
  }

  // Load achievements when user changes
  useEffect(() => {
    if (user) {
      refreshAchievements()
      getAchievementProgress()
    } else {
      setAchievements([])
      setAchievementProgress([])
    }
  }, [user])

  // Set up real-time subscription for achievements
  useEffect(() => {
    if (!user) return

    const channel = supabase
      .channel('achievements_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'achievements',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('New achievement received:', payload)
          refreshAchievements()
          getAchievementProgress()
          
          // Show achievement notification
          if (payload.new) {
            const achievement = payload.new as Achievement
            // Trigger achievement notification display
            window.dispatchEvent(new CustomEvent('newAchievement', {
              detail: achievement
            }))
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'achievements',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('Achievement updated:', payload)
          refreshAchievements()
          getAchievementProgress()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user])

  const value: AchievementContextType = {
    achievements,
    achievementProgress,
    loading,
    error,
    refreshAchievements,
    getAchievementProgress,
    hasAchievement,
    getAchievementByType,
  }

  return (
    <AchievementContext.Provider value={value}>
      {children}
    </AchievementContext.Provider>
  )
}

export function useAchievements() {
  const context = useContext(AchievementContext)
  if (context === undefined) {
    throw new Error('useAchievements must be used within an AchievementProvider')
  }
  return context
}