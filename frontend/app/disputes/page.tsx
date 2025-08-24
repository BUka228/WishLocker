'use client'

import React from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useDispute } from '@/contexts/DisputeContext'
import { DisputesList } from '@/components/disputes/DisputesList'

export default function DisputesPage() {
  const { user } = useAuth()
  const { userDisputes, creatorDisputes, loading } = useDispute()

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Доступ запрещен
          </h1>
          <p className="text-gray-600">
            Войдите в систему, чтобы просматривать споры
          </p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Споры по желаниям
          </h1>
          <p className="text-gray-600">
            Управляйте спорами по желаниям и разрешайте конфликты
          </p>
        </div>

        <div className="space-y-8">
          {/* Disputes created by user */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <DisputesList
              disputes={userDisputes}
              title="Мои споры"
              emptyMessage="Вы не создавали споров"
              showWishTitle={true}
            />
          </div>

          {/* Disputes on user's wishes */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <DisputesList
              disputes={creatorDisputes}
              title="Споры по моим желаниям"
              emptyMessage="Споров по вашим желаниям нет"
              showWishTitle={false}
            />
          </div>
        </div>
      </div>
    </div>
  )
}