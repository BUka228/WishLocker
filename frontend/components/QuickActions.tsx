'use client'

import { Plus, Gift, Users } from 'lucide-react'

export function QuickActions() {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Быстрые действия</h3>
      
      <div className="space-y-3">
        <button className="w-full flex items-center justify-center px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
          <Plus className="w-5 h-5 mr-2" />
          Создать желание
        </button>
        
        <button className="w-full flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
          <Gift className="w-5 h-5 mr-2" />
          Начислить другу
        </button>
        
        <button className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <Users className="w-5 h-5 mr-2" />
          Мои друзья
        </button>
      </div>
    </div>
  )
}