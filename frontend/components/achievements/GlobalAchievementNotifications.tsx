'use client'

import React, { useState, useEffect } from 'react'
import { AchievementNotification } from './AchievementNotification'
import { Achievement } from '@/lib/types'

export function GlobalAchievementNotifications() {
  const [notifications, setNotifications] = useState<Achievement[]>([])

  useEffect(() => {
    const handleNewAchievement = (event: CustomEvent<Achievement>) => {
      const achievement = event.detail
      setNotifications(prev => [...prev, achievement])
    }

    // Listen for new achievement events
    window.addEventListener('newAchievement', handleNewAchievement as EventListener)

    return () => {
      window.removeEventListener('newAchievement', handleNewAchievement as EventListener)
    }
  }, [])

  const removeNotification = (achievementId: string) => {
    setNotifications(prev => prev.filter(a => a.id !== achievementId))
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map((achievement, index) => (
        <div
          key={achievement.id}
          style={{ 
            transform: `translateY(${index * 10}px)`,
            zIndex: 50 - index
          }}
        >
          <AchievementNotification
            achievement={achievement}
            onClose={() => removeNotification(achievement.id)}
            autoClose={true}
            autoCloseDelay={6000}
          />
        </div>
      ))}
    </div>
  )
}