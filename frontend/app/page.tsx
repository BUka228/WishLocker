'use client'

import { WalletCard } from '@/components/wallet/WalletCard'
import { WishList } from '@/components/WishList'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { UserProfile } from '@/components/auth/UserProfile'
import { AppLayout } from '@/components/layout/AppLayout'
import { useAuth } from '@/contexts/AuthContext'
import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { CurrencyConverter } from '@/components/wallet/CurrencyConverter'

export default function HomePage() {
  const { user } = useAuth()
  const [showProfile, setShowProfile] = useState(false)
  const [showConverter, setShowConverter] = useState(false)
  const searchParams = useSearchParams()

  // Handle URL actions
  useEffect(() => {
    const action = searchParams.get('action')
    if (action === 'convert') {
      setShowConverter(true)
    }
  }, [searchParams])

  return (
    <ProtectedRoute>
      <AppLayout>
        <div className="container-responsive py-4 sm:py-6 lg:py-8">
          {/* Welcome Header - Hidden on mobile when navigation is present */}
          <header className="text-center mb-6 sm:mb-8 lg:block">
            <h1 className="heading-responsive font-bold text-gray-800 mb-2">
              Добро пожаловать в Банк Желаний! 💚💙❤️
            </h1>
            <p className="text-responsive text-gray-600 max-w-2xl mx-auto">
              Создавайте желания, помогайте друзьям и зарабатывайте валюту в нашей уникальной системе
            </p>
          </header>

          {showProfile ? (
            <div className="max-w-2xl mx-auto animate-fade-in">
              <UserProfile />
              <div className="text-center mt-6">
                <button
                  onClick={() => setShowProfile(false)}
                  className="btn-secondary"
                >
                  Вернуться к главной
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              {/* Sidebar */}
              <div className="lg:col-span-1 space-y-4 sm:space-y-6">
                <div className="animate-slide-up">
                  <WalletCard />
                </div>
                
                {/* Quick Stats Card */}
                <div className="card p-4 sm:p-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Быстрая статистика</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Активных желаний</span>
                      <span className="font-medium text-gray-900">-</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Выполнено</span>
                      <span className="font-medium text-green-600">-</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Друзей</span>
                      <span className="font-medium text-blue-600">-</span>
                    </div>
                  </div>
                </div>

                {/* Quick Actions Card - Desktop only */}
                <div className="hidden lg:block card p-4 sm:p-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Быстрые действия</h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => setShowConverter(true)}
                      className="w-full btn-secondary text-left"
                    >
                      Конвертировать валюту
                    </button>
                    <button className="w-full btn-secondary text-left">
                      Найти друзей
                    </button>
                    <button className="w-full btn-secondary text-left">
                      Создать желание
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Main Content */}
              <div className="lg:col-span-2 animate-slide-up" style={{ animationDelay: '0.3s' }}>
                <WishList />
              </div>
            </div>
          )}
        </div>

        {/* Currency Converter Modal */}
        {showConverter && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full animate-scale-in">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">Конвертация валюты</h3>
                  <button
                    onClick={() => setShowConverter(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>
                <CurrencyConverter onSuccess={() => setShowConverter(false)} />
              </div>
            </div>
          </div>
        )}
      </AppLayout>
    </ProtectedRoute>
  )
}