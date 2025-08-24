'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Gift, Users, Clock } from 'lucide-react'
import { CurrencyConverter } from './wallet/CurrencyConverter'
import { WishForm } from './wishes/WishForm'

export function QuickActions() {
  const [showWishForm, setShowWishForm] = useState(false)
  const router = useRouter()

  return (
    <>
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Быстрые действия</h3>
          
          <div className="space-y-3">
            <button 
              onClick={() => setShowWishForm(true)}
              className="w-full flex items-center justify-center px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Plus className="w-5 h-5 mr-2" />
              Создать желание
            </button>
            
            <button className="w-full flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              <Gift className="w-5 h-5 mr-2" />
              Начислить другу
            </button>
            
            <button 
              onClick={() => router.push('/social')}
              className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Users className="w-5 h-5 mr-2" />
              Мои друзья
            </button>
            
            <button 
              onClick={() => router.push('/transactions')}
              className="w-full flex items-center justify-center px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <Clock className="w-5 h-5 mr-2" />
              История операций
            </button>
          </div>
        </div>
        
        <CurrencyConverter />
      </div>

      <WishForm
        isOpen={showWishForm}
        onClose={() => setShowWishForm(false)}
        onSuccess={() => {
          // Optionally show a success message
        }}
      />
    </>
  )
}