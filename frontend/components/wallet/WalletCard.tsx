'use client'

import React, { useState } from 'react'
import { useWallet } from '../../contexts/WalletContext'
import { WISH_METADATA } from '../../lib/types'
import { Wallet, RefreshCw, Gift } from 'lucide-react'
import { CurrencyGift } from './CurrencyGift'

interface WalletCardProps {
  className?: string
}

export function WalletCard({ className = '' }: WalletCardProps) {
  const { wallet, loading, refreshWallet, error } = useWallet()
  const [showGiftModal, setShowGiftModal] = useState(false)

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-800">Мой кошелек</h2>
          </div>
          <div className="animate-spin">
            <RefreshCw className="w-4 h-4 text-gray-400" />
          </div>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
                <div className="w-20 h-4 bg-gray-200 rounded animate-pulse" />
              </div>
              <div className="w-12 h-6 bg-gray-200 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-800">Мой кошелек</h2>
          </div>
          <button
            onClick={refreshWallet}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            title="Обновить"
          >
            <RefreshCw className="w-4 h-4 text-gray-600" />
          </button>
        </div>
        <div className="text-center py-8">
          <p className="text-red-600 mb-2">{error}</p>
          <button
            onClick={refreshWallet}
            className="text-blue-600 hover:text-blue-700 text-sm"
          >
            Попробовать снова
          </button>
        </div>
      </div>
    )
  }

  if (!wallet) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-800">Мой кошелек</h2>
          </div>
        </div>
        <div className="text-center py-8">
          <p className="text-gray-600">Кошелек не найден</p>
        </div>
      </div>
    )
  }

  const currencies = [
    {
      type: 'green' as const,
      balance: wallet.green_balance,
      metadata: WISH_METADATA.green,
    },
    {
      type: 'blue' as const,
      balance: wallet.blue_balance,
      metadata: WISH_METADATA.blue,
    },
    {
      type: 'red' as const,
      balance: wallet.red_balance,
      metadata: WISH_METADATA.red,
    },
  ]

  const getBalanceColor = (type: string, balance: number) => {
    if (balance === 0) return 'text-gray-400'
    
    switch (type) {
      case 'green':
        return 'text-green-600'
      case 'blue':
        return 'text-blue-600'
      case 'red':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  const getBackgroundColor = (type: string) => {
    switch (type) {
      case 'green':
        return 'bg-green-50 border-green-200'
      case 'blue':
        return 'bg-blue-50 border-blue-200'
      case 'red':
        return 'bg-red-50 border-red-200'
      default:
        return 'bg-gray-50 border-gray-200'
    }
  }

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Wallet className="w-5 h-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-800">Мой кошелек</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowGiftModal(true)}
            className="p-2 text-purple-600 hover:bg-purple-50 rounded-full transition-colors"
            title="Подарить валюту"
          >
            <Gift className="w-4 h-4" />
          </button>
          <button
            onClick={refreshWallet}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            title="Обновить"
          >
            <RefreshCw className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {currencies.map((currency) => (
          <div
            key={currency.type}
            className={`flex items-center justify-between p-4 border rounded-lg transition-all hover:shadow-sm ${getBackgroundColor(currency.type)}`}
          >
            <div className="flex items-center gap-3">
              <div className="text-2xl">
                {currency.metadata.emoji}
              </div>
              <div>
                <h3 className="font-medium text-gray-800">
                  {currency.metadata.name}
                </h3>
                <p className="text-sm text-gray-600">
                  {currency.metadata.description}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className={`text-2xl font-bold ${getBalanceColor(currency.type, currency.balance)}`}>
                {currency.balance}
              </div>
              <div className="text-xs text-gray-500">
                {currency.balance === 1 ? 'желание' : 'желаний'}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="text-xs text-gray-500 text-center">
          Последнее обновление: {new Date(wallet.updated_at).toLocaleString('ru-RU')}
        </div>
      </div>

      <CurrencyGift
        isOpen={showGiftModal}
        onClose={() => setShowGiftModal(false)}
        onSuccess={() => {
          // Optionally show a success message or refresh data
        }}
      />
    </div>
  )
}