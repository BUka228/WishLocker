'use client'

import { useState, useEffect } from 'react'
import { Wallet, TrendingUp } from 'lucide-react'

interface WalletBalance {
  green: number
  blue: number
  red: number
}

export function WalletCard() {
  const [balance, setBalance] = useState<WalletBalance>({
    green: 15,
    blue: 2,
    red: 0
  })

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <div className="flex items-center mb-4">
        <Wallet className="w-6 h-6 text-purple-600 mr-2" />
        <h2 className="text-xl font-semibold text-gray-800">Мой кошелек</h2>
      </div>
      
      <div className="space-y-3">
        <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
          <div className="flex items-center">
            <span className="text-2xl mr-2">💚</span>
            <span className="font-medium text-green-800">Зеленые</span>
          </div>
          <span className="text-xl font-bold text-green-600">{balance.green}</span>
        </div>
        
        <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center">
            <span className="text-2xl mr-2">💙</span>
            <span className="font-medium text-blue-800">Синие</span>
          </div>
          <span className="text-xl font-bold text-blue-600">{balance.blue}</span>
        </div>
        
        <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
          <div className="flex items-center">
            <span className="text-2xl mr-2">❤️</span>
            <span className="font-medium text-red-800">Красные</span>
          </div>
          <span className="text-xl font-bold text-red-600">{balance.red}</span>
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center text-sm text-gray-600">
          <TrendingUp className="w-4 h-4 mr-1" />
          <span>10 💚 = 1 💙 | 10 💙 = 1 ❤️</span>
        </div>
      </div>
    </div>
  )
}