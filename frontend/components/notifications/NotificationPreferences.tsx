'use client'

import React, { useState } from 'react'
import { useNotificationPreferences } from '@/contexts/NotificationPreferencesContext'
import { Settings, Bell, BellOff, Mail, Smartphone, Users, Heart, Award, Gift } from 'lucide-react'

export default function NotificationPreferences() {
  const { preferences, loading, updatePreferences } = useNotificationPreferences()
  const [saving, setSaving] = useState(false)

  const handleToggle = async (key: string, value: boolean) => {
    if (!preferences) return

    setSaving(true)
    try {
      await updatePreferences({ [key]: value } as any)
    } catch (error) {
      console.error('Error updating preferences:', error)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center gap-3 mb-6">
          <Settings className="w-5 h-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">Настройки уведомлений</h2>
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 bg-gray-300 rounded"></div>
                <div className="w-32 h-4 bg-gray-300 rounded"></div>
              </div>
              <div className="w-12 h-6 bg-gray-300 rounded-full"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!preferences) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="text-center text-gray-500">
          Не удалось загрузить настройки уведомлений
        </div>
      </div>
    )
  }

  const preferenceItems = [
    {
      key: 'email_notifications' as const,
      icon: Mail,
      title: 'Email уведомления',
      description: 'Получать уведомления на электронную почту',
      value: preferences.email_notifications
    },
    {
      key: 'push_notifications' as const,
      icon: Smartphone,
      title: 'Push уведомления',
      description: 'Получать уведомления в браузере',
      value: preferences.push_notifications
    },
    {
      key: 'friend_requests' as const,
      icon: Users,
      title: 'Запросы в друзья',
      description: 'Уведомления о новых запросах в друзья',
      value: preferences.friend_requests
    },
    {
      key: 'wish_updates' as const,
      icon: Heart,
      title: 'Обновления желаний',
      description: 'Уведомления о статусе ваших желаний',
      value: preferences.wish_updates
    },
    {
      key: 'achievements' as const,
      icon: Award,
      title: 'Достижения',
      description: 'Уведомления о новых достижениях',
      value: preferences.achievements
    },
    {
      key: 'currency_gifts' as const,
      icon: Gift,
      title: 'Подарки валюты',
      description: 'Уведомления о полученных подарках',
      value: preferences.currency_gifts
    }
  ]

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center gap-3 mb-6">
        <Settings className="w-5 h-5 text-gray-600" />
        <h2 className="text-lg font-semibold text-gray-900">Настройки уведомлений</h2>
      </div>

      <div className="space-y-4">
        {preferenceItems.map((item) => {
          const Icon = item.icon
          return (
            <div
              key={item.key}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Icon className="w-5 h-5 text-gray-600" />
                <div>
                  <h3 className="font-medium text-gray-900">{item.title}</h3>
                  <p className="text-sm text-gray-600">{item.description}</p>
                </div>
              </div>
              
              <button
                onClick={() => handleToggle(item.key, !item.value)}
                disabled={saving}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  item.value ? 'bg-blue-600' : 'bg-gray-300'
                } ${saving ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    item.value ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          )
        })}
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <div className="flex items-start gap-3">
          <Bell className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900">О уведомлениях</h4>
            <p className="text-sm text-blue-700 mt-1">
              Вы можете настроить, какие уведомления получать. Изменения применяются мгновенно.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}