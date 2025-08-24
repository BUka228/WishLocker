'use client'

import { useAuth } from '@/contexts/AuthContext'
import { NotificationPreferencesProvider } from '@/contexts/NotificationPreferencesContext'
import NotificationPreferences from '@/components/notifications/NotificationPreferences'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function NotificationSettingsPage() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Загрузка...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Необходима авторизация</h1>
          <p className="text-gray-600 mb-6">Войдите в систему для настройки уведомлений</p>
          <Link
            href="/auth/signin"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Войти
          </Link>
        </div>
      </div>
    )
  }

  return (
    <NotificationPreferencesProvider>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Назад к приложению
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Настройки уведомлений</h1>
            <p className="text-gray-600 mt-2">
              Управляйте тем, какие уведомления вы хотите получать
            </p>
          </div>

          {/* Notification Preferences */}
          <NotificationPreferences />
        </div>
      </div>
    </NotificationPreferencesProvider>
  )
}