'use client'

import React, { useState } from 'react'
import { Gift, X, Check, AlertCircle } from 'lucide-react'
import { useWallet } from '@/contexts/WalletContext'
import { useSocial } from '@/contexts/SocialContext'
import { CurrencyType, WISH_METADATA } from '@/shared/types'
import { User } from '@/shared/types'

interface CurrencyGiftProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function CurrencyGift({ isOpen, onClose, onSuccess }: CurrencyGiftProps) {
  const { wallet, transferCurrency, error: walletError } = useWallet()
  const { friends } = useSocial()
  const [selectedFriend, setSelectedFriend] = useState<User | null>(null)
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyType>('green')
  const [amount, setAmount] = useState(1)
  const [isTransferring, setIsTransferring] = useState(false)
  const [transferSuccess, setTransferSuccess] = useState(false)

  if (!isOpen) return null

  const handleTransfer = async () => {
    if (!selectedFriend || !wallet) return

    setIsTransferring(true)
    try {
      const success = await transferCurrency(selectedFriend.id, selectedCurrency, amount)
      if (success) {
        setTransferSuccess(true)
        setTimeout(() => {
          setTransferSuccess(false)
          onClose()
          onSuccess?.()
          // Reset form
          setSelectedFriend(null)
          setSelectedCurrency('green')
          setAmount(1)
        }, 2000)
      }
    } catch (error) {
      console.error('Transfer error:', error)
    } finally {
      setIsTransferring(false)
    }
  }

  const getCurrentBalance = () => {
    if (!wallet) return 0
    return wallet[`${selectedCurrency}_balance`]
  }

  const canTransfer = selectedFriend && amount > 0 && amount <= getCurrentBalance()

  if (transferSuccess) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Подарок отправлен!
            </h3>
            <p className="text-gray-600">
              {selectedFriend?.username} получил {amount} {WISH_METADATA[selectedCurrency].emoji} {WISH_METADATA[selectedCurrency].name.toLowerCase()}
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Gift className="w-5 h-5 text-purple-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              Подарить валюту
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {walletError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
            <span className="text-sm text-red-700">{walletError}</span>
          </div>
        )}

        <div className="space-y-4">
          {/* Friend Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Выберите друга
            </label>
            {friends.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                У вас пока нет друзей для отправки подарков
              </div>
            ) : (
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {friends.map((friend) => (
                  <button
                    key={friend.id}
                    onClick={() => setSelectedFriend(friend)}
                    className={`w-full p-3 text-left rounded-lg border transition-colors ${
                      selectedFriend?.id === friend.id
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-600">
                          {friend.username.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span className="font-medium text-gray-900">
                        {friend.username}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Currency Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Тип валюты
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['green', 'blue', 'red'] as CurrencyType[]).map((currency) => {
                const balance = wallet?.[`${currency}_balance`] || 0
                const metadata = WISH_METADATA[currency]
                return (
                  <button
                    key={currency}
                    onClick={() => setSelectedCurrency(currency)}
                    disabled={balance === 0}
                    className={`p-3 rounded-lg border text-center transition-colors ${
                      selectedCurrency === currency
                        ? 'border-purple-500 bg-purple-50'
                        : balance === 0
                        ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-lg mb-1">{metadata.emoji}</div>
                    <div className="text-xs font-medium text-gray-900">
                      {metadata.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {balance}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Amount Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Количество
            </label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setAmount(Math.max(1, amount - 1))}
                disabled={amount <= 1}
                className="w-8 h-8 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                -
              </button>
              <input
                type="number"
                min="1"
                max={getCurrentBalance()}
                value={amount}
                onChange={(e) => setAmount(Math.max(1, parseInt(e.target.value) || 1))}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-center"
              />
              <button
                onClick={() => setAmount(Math.min(getCurrentBalance(), amount + 1))}
                disabled={amount >= getCurrentBalance()}
                className="w-8 h-8 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                +
              </button>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Доступно: {getCurrentBalance()} {WISH_METADATA[selectedCurrency].name.toLowerCase()}
            </div>
          </div>

          {/* Preview */}
          {selectedFriend && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600">
                Вы отправите <span className="font-medium">{selectedFriend.username}</span>:
              </div>
              <div className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                {amount} {WISH_METADATA[selectedCurrency].emoji} {WISH_METADATA[selectedCurrency].name}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Отмена
          </button>
          <button
            onClick={handleTransfer}
            disabled={!canTransfer || isTransferring}
            className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {isTransferring ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Отправка...
              </>
            ) : (
              <>
                <Gift className="w-4 h-4" />
                Подарить
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}