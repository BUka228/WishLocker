'use client'

import { WalletCard } from '@/components/WalletCard'
import { WishList } from '@/components/WishList'
import { QuickActions } from '@/components/QuickActions'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { UserProfile } from '@/components/auth/UserProfile'
import { useAuth } from '@/contexts/AuthContext'
import { useState } from 'react'
import { User } from 'lucide-react'

export default function HomePage() {
  const { user } = useAuth()
  const [showProfile, setShowProfile] = useState(false)

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        <header className="flex justify-between items-center mb-8">
          <div className="text-center flex-1">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              Банк Желаний 💚💙❤️
            </h1>
            <p className="text-gray-600">
              Система управления желаниями с трехуровневой валютой
            </p>
          </div>
          
          {user && (
            <div className="flex items-center gap-4">
              <span className="text-gray-700">
                Привет, <span className="font-semibold">{user.username}</span>!
              </span>
              <button
                onClick={() => setShowProfile(!showProfile)}
                className="flex items-center gap-1 px-3 py-2 bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 transition-colors"
              >
                <User className="w-4 h-4" />
                Профиль
              </button>
            </div>
          )}
        </header>

        {showProfile ? (
          <div className="max-w-2xl mx-auto mb-8">
            <UserProfile />
            <div className="text-center mt-4">
              <button
                onClick={() => setShowProfile(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
              >
                Вернуться к главной
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <WalletCard />
              <QuickActions />
            </div>
            
            <div className="lg:col-span-2">
              <WishList />
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  )
}