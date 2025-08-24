'use client'

import React, { useState, useEffect } from 'react'
import { Achievement, ACHIEVEMENT_METADATA } from '@/lib/types'
import { AchievementBadge } from './AchievementBadge'
import { X } from 'lucide-react'

interface AchievementNotificationProps {
  achievement: Achievement
  onClose: () => void
  autoClose?: boolean
  autoCloseDelay?: number
}

export function AchievementNotification({ 
  achievement, 
  onClose, 
  autoClose = true, 
  autoCloseDelay = 5000 
}: AchievementNotificationProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Animate in
    const timer = setTimeout(() => setIsVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(() => {
        handleClose()
      }, autoCloseDelay)
      return () => clearTimeout(timer)
    }
  }, [autoClose, autoCloseDelay])

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(onClose, 300) // Wait for animation to complete
  }

  const metadata = achievement.achievement_type_enum 
    ? ACHIEVEMENT_METADATA[achievement.achievement_type_enum]
    : null

  return (
    <div className={`
      fixed top-4 right-4 z-50 max-w-sm w-full
      transform transition-all duration-300 ease-out
      ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
    `}>
      <div className="bg-white rounded-lg shadow-lg border-2 border-yellow-300 p-4">
        <div className="flex items-start space-x-3">
          <AchievementBadge 
            achievement={achievement}
            size="lg"
            className="flex-shrink-0"
          />
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-lg text-yellow-600">
                  🎉 Новое достижение!
                </h3>
                <h4 className="font-semibold text-gray-900">
                  {achievement.title}
                </h4>
                <p className="text-sm text-gray-600 mt-1">
                  {achievement.description}
                </p>
              </div>
              
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        </div>
        
        {/* Animated progress bar for auto-close */}
        {autoClose && (
          <div className="mt-3 w-full bg-gray-200 rounded-full h-1">
            <div 
              className="bg-yellow-500 h-1 rounded-full transition-all ease-linear"
              style={{ 
                width: '100%',
                animation: `shrink ${autoCloseDelay}ms linear forwards`
              }}
            />
          </div>
        )}
      </div>
      
      <style jsx>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  )
}

// Achievement Notification Manager Component
interface AchievementNotificationManagerProps {
  children: React.ReactNode
}

export function AchievementNotificationManager({ children }: AchievementNotificationManagerProps) {
  const [notifications, setNotifications] = useState<Achievement[]>([])

  // This would be called when a new achievement is earned
  const showAchievementNotification = (achievement: Achievement) => {
    setNotifications(prev => [...prev, achievement])
  }

  const removeNotification = (achievementId: string) => {
    setNotifications(prev => prev.filter(a => a.id !== achievementId))
  }

  return (
    <>
      {children}
      
      {/* Render notifications */}
      <div className="fixed top-0 right-0 z-50 p-4 space-y-2">
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
            />
          </div>
        ))}
      </div>
    </>
  )
}