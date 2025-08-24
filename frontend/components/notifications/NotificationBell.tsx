'use client'

import React, { useState } from 'react'
import { Bell } from 'lucide-react'
import { useNotifications } from '@/contexts/NotificationContext'
import { NotificationsList } from './NotificationsList'

export function NotificationBell() {
  const { unreadCount } = useNotifications()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
        title="Уведомления"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <NotificationsList
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  )
}