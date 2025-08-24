'use client'

import React, { useEffect, useState } from 'react'
import { useNotifications } from '@/contexts/NotificationContext'
import { useNotificationPreferences } from '@/contexts/NotificationPreferencesContext'
import { Bell, X, Check, Users, Heart, Award, Gift, MessageCircle } from 'lucide-react'

interface LiveNotification {
  id: string
  type: string
  title: string
  message: string
  data?: any
  timestamp: Date
}

export function LiveNotifications() {
  const { notifications } = useNotifications()
  const { preferences } = useNotificationPreferences()
  const [liveNotifications, setLiveNotifications] = useState<LiveNotification[]>([])

  // Show live notifications for recent unread notifications
  useEffect(() => {
    if (!notifications || !preferences) return

    const recentNotifications = notifications
      .filter(n => !n.read)
      .filter(n => {
        // Filter based on user preferences
        switch (n.type) {
          case 'friend_request':
          case 'friend_accepted':
            return preferences.friend_requests
          case 'wish_status':
          case 'new_wish':
          case 'wish_accepted':
          case 'wish_completed':
          case 'wish_fulfilled':
            return preferences.wish_updates
          case 'achievement':
            return preferences.achievements
          case 'currency_gift':
            return preferences.currency_gifts
          default:
            return true
        }
      })
      .slice(0, 3) // Show max 3 live notifications
      .map(n => ({
        id: n.id,
        type: n.type,
        title: n.title,
        message: n.message,
        data: n.data,
        timestamp: new Date(n.created_at || Date.now())
      }))

    setLiveNotifications(recentNotifications)
  }, [notifications, preferences])

  const dismissNotification = (id: string) => {
    setLiveNotifications(prev => prev.filter(n => n.id !== id))
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'friend_request':
      case 'friend_accepted':
        return Users
      case 'wish_status':
      case 'new_wish':
      case 'wish_accepted':
      case 'wish_completed':
      case 'wish_fulfilled':
        return Heart
      case 'achievement':
        return Award
      case 'currency_gift':
        return Gift
      case 'dispute':
        return MessageCircle
      default:
        return Bell
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'friend_request':
      case 'friend_accepted':
        return 'bg-blue-500'
      case 'wish_status':
      case 'new_wish':
      case 'wish_accepted':
      case 'wish_completed':
      case 'wish_fulfilled':
        return 'bg-pink-500'
      case 'achievement':
        return 'bg-yellow-500'
      case 'currency_gift':
        return 'bg-green-500'
      case 'dispute':
        return 'bg-orange-500'
      default:
        return 'bg-gray-500'
    }
  }

  if (liveNotifications.length === 0) {
    return null
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {liveNotifications.map((notification) => {
        const Icon = getNotificationIcon(notification.type)
        const colorClass = getNotificationColor(notification.type)
        
        return (
          <div
            key={notification.id}
            className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 max-w-sm animate-slide-in-right"
          >
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-full ${colorClass}`}>
                <Icon className="w-4 h-4 text-white" />
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-900 text-sm">
                  {notification.title}
                </h4>
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                  {notification.message}
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  {notification.timestamp.toLocaleTimeString('ru-RU', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
              
              <button
                onClick={() => dismissNotification(notification.id)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// Add CSS for animation
const styles = `
  @keyframes slide-in-right {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  .animate-slide-in-right {
    animation: slide-in-right 0.3s ease-out;
  }
  
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
`

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style')
  styleSheet.textContent = styles
  document.head.appendChild(styleSheet)
}