'use client'

import React, { useState } from 'react'
import { useWallet } from '../../contexts/WalletContext'
import { CurrencyType, CURRENCY_CONVERSION, WISH_METADATA } from '../../lib/types'
import { ArrowRight, RefreshCw } from 'lucide-react'

interface CurrencyConverterProps {
  className?: string
  onSuccess?: () => void
}

export function CurrencyConverter({ className = '', onSuccess }: CurrencyConverterProps) {
  const { wallet, convertCurrency, loading, error } = useWallet()
  const [fromCurrency, setFromCurrency] = useState<CurrencyType>('green')
  const [toCurrency, setToCurrency] = useState<CurrencyType>('blue')
  const [amount, setAmount] = useState<number>(10)
  const [isConverting, setIsConverting] = useState(false)
  const [convertError, setConvertError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Available conversion pairs
  const conversionPairs = [
    { from: 'green', to: 'blue', rate: CURRENCY_CONVERSION.GREEN_TO_BLUE },
    { from: 'blue', to: 'red', rate: CURRENCY_CONVERSION.BLUE_TO_RED },
  ] as const

  // Get current conversion pair
  const currentPair = conversionPairs.find(
    (pair) => pair.from === fromCurrency && pair.to === toCurrency
  )

  // Calculate converted amount
  const convertedAmount = currentPair ? Math.floor(amount / currentPair.rate) : 0

  // Get available balance for selected currency
  const availableBalance = wallet ? wallet[`${fromCurrency}_balance` as keyof typeof wallet] as number : 0

  // Validation
  const canConvert = () => {
    if (!wallet || !currentPair) return false
    if (amount <= 0) return false
    if (amount > availableBalance) return false
    if (amount % currentPair.rate !== 0) return false
    return convertedAmount > 0
  }

  const handleFromCurrencyChange = (newFromCurrency: CurrencyType) => {
    setFromCurrency(newFromCurrency)
    setConvertError(null)
    setSuccessMessage(null)
    
    // Auto-adjust to currency based on from currency
    if (newFromCurrency === 'green') {
      setToCurrency('blue')
    } else if (newFromCurrency === 'blue') {
      setToCurrency('red')
    }
  }

  const handleAmountChange = (newAmount: string) => {
    const numAmount = parseInt(newAmount) || 0
    setAmount(numAmount)
    setConvertError(null)
    setSuccessMessage(null)
  }

  const handleConvert = async () => {
    if (!canConvert()) return

    setIsConverting(true)
    setConvertError(null)
    setSuccessMessage(null)

    try {
      const success = await convertCurrency(fromCurrency, toCurrency, amount)
      
      if (success) {
        setSuccessMessage(
          `Успешно конвертировано ${amount} ${WISH_METADATA[fromCurrency].name.toLowerCase()} в ${convertedAmount} ${WISH_METADATA[toCurrency].name.toLowerCase()}`
        )
        setAmount(currentPair?.rate || 10) // Reset to minimum conversion amount
        onSuccess?.()
      } else {
        setConvertError('Не удалось выполнить конвертацию')
      }
    } catch (err) {
      setConvertError('Произошла ошибка при конвертации')
    } finally {
      setIsConverting(false)
    }
  }

  const getMaxConvertibleAmount = () => {
    if (!currentPair || !wallet) return 0
    const balance = availableBalance
    return Math.floor(balance / currentPair.rate) * currentPair.rate
  }

  const setMaxAmount = () => {
    const maxAmount = getMaxConvertibleAmount()
    setAmount(maxAmount)
    setConvertError(null)
    setSuccessMessage(null)
  }

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Конвертация валют</h2>
        <div className="animate-pulse space-y-4">
          <div className="h-20 bg-gray-200 rounded-lg" />
          <div className="h-12 bg-gray-200 rounded-lg" />
          <div className="h-10 bg-gray-200 rounded-lg" />
        </div>
      </div>
    )
  }

  if (!wallet) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Конвертация валют</h2>
        <div className="text-center py-8">
          <p className="text-gray-600">Кошелек не найден</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Конвертация валют</h2>

      {/* Conversion Rate Info */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-medium text-blue-800 mb-2">Курсы конвертации:</h3>
        <div className="space-y-1 text-sm text-blue-700">
          <div>💚 10 Зеленых = 💙 1 Синее</div>
          <div>💙 10 Синих = ❤️ 1 Красное</div>
        </div>
      </div>

      {/* From Currency Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Конвертировать из:
        </label>
        <div className="grid grid-cols-2 gap-2">
          {(['green', 'blue'] as const).map((currency) => (
            <button
              key={currency}
              onClick={() => handleFromCurrencyChange(currency)}
              className={`p-3 border rounded-lg text-left transition-all ${
                fromCurrency === currency
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">{WISH_METADATA[currency].emoji}</span>
                <div>
                  <div className="font-medium">{WISH_METADATA[currency].name}</div>
                  <div className="text-sm text-gray-600">
                    Баланс: {wallet[`${currency}_balance` as keyof typeof wallet]}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Amount Input */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Количество для конвертации:
        </label>
        <div className="flex gap-2">
          <input
            type="number"
            value={amount}
            onChange={(e) => handleAmountChange(e.target.value)}
            min="0"
            max={availableBalance}
            step={currentPair?.rate || 1}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Введите количество"
          />
          <button
            onClick={setMaxAmount}
            className="px-3 py-2 text-sm text-blue-600 hover:text-blue-700 border border-blue-300 hover:border-blue-400 rounded-lg transition-colors"
            disabled={getMaxConvertibleAmount() === 0}
          >
            Макс
          </button>
        </div>
        
        {currentPair && amount > 0 && (
          <div className="mt-2 text-sm text-gray-600">
            {amount % currentPair.rate !== 0 && (
              <p className="text-red-600">
                Количество должно быть кратно {currentPair.rate}
              </p>
            )}
            {amount > availableBalance && (
              <p className="text-red-600">
                Недостаточно средств (доступно: {availableBalance})
              </p>
            )}
          </div>
        )}
      </div>

      {/* Conversion Preview */}
      {currentPair && amount > 0 && (
        <div className="mb-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="flex items-center justify-center gap-4">
            <div className="text-center">
              <div className="text-2xl">{WISH_METADATA[fromCurrency].emoji}</div>
              <div className="font-semibold">{amount}</div>
              <div className="text-sm text-gray-600">{WISH_METADATA[fromCurrency].name}</div>
            </div>
            
            <ArrowRight className="w-6 h-6 text-gray-400" />
            
            <div className="text-center">
              <div className="text-2xl">{WISH_METADATA[toCurrency].emoji}</div>
              <div className="font-semibold">{convertedAmount}</div>
              <div className="text-sm text-gray-600">{WISH_METADATA[toCurrency].name}</div>
            </div>
          </div>
        </div>
      )}

      {/* Error Messages */}
      {(error || convertError) && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm">{error || convertError}</p>
        </div>
      )}

      {/* Success Message */}
      {successMessage && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-700 text-sm">{successMessage}</p>
        </div>
      )}

      {/* Convert Button */}
      <button
        onClick={handleConvert}
        disabled={!canConvert() || isConverting}
        className={`w-full py-3 px-4 rounded-lg font-medium transition-all ${
          canConvert() && !isConverting
            ? 'bg-blue-600 hover:bg-blue-700 text-white'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
      >
        {isConverting ? (
          <div className="flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin" />
            Конвертация...
          </div>
        ) : (
          'Конвертировать'
        )}
      </button>

      {/* Help Text */}
      <div className="mt-4 text-xs text-gray-500 text-center">
        Конвертация необратима. Убедитесь в правильности выбора перед подтверждением.
      </div>
    </div>
  )
}