'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Wallet, CurrencyType, CURRENCY_CONVERSION } from '../lib/types'
import { useAuth } from './AuthContext'

interface WalletContextType {
  wallet: Wallet | null
  loading: boolean
  convertCurrency: (fromCurrency: CurrencyType, toCurrency: CurrencyType, amount: number) => Promise<boolean>
  transferCurrency: (toUserId: string, currency: CurrencyType, amount: number) => Promise<boolean>
  refreshWallet: () => Promise<void>
  error: string | null
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

export function useWallet() {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider')
  }
  return context
}

interface WalletProviderProps {
  children: React.ReactNode
}

export function WalletProvider({ children }: WalletProviderProps) {
  const { user } = useAuth()
  const [wallet, setWallet] = useState<Wallet | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch wallet data
  const fetchWallet = async (userId: string) => {
    try {
      setError(null)
      const { data, error } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error) {
        console.error('Error fetching wallet:', error)
        setError('Ошибка загрузки кошелька')
        return
      }

      // Convert null values to 0 for balances
      const walletData: Wallet = {
        ...data,
        green_balance: data.green_balance || 0,
        blue_balance: data.blue_balance || 0,
        red_balance: data.red_balance || 0,
        created_at: data.created_at || new Date().toISOString(),
        updated_at: data.updated_at || new Date().toISOString(),
      }

      setWallet(walletData)
    } catch (error) {
      console.error('Error fetching wallet:', error)
      setError('Ошибка загрузки кошелька')
    }
  }

  // Set up real-time subscription
  useEffect(() => {
    if (!user) {
      setWallet(null)
      setLoading(false)
      return
    }

    // Initial fetch
    fetchWallet(user.id)
    setLoading(false)

    // Set up real-time subscription
    const subscription = supabase
      .channel('wallet-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'wallets',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('Wallet updated:', payload)
          if (payload.new) {
            const newData = payload.new as any
            const walletData: Wallet = {
              ...newData,
              green_balance: newData.green_balance || 0,
              blue_balance: newData.blue_balance || 0,
              red_balance: newData.red_balance || 0,
              created_at: newData.created_at || new Date().toISOString(),
              updated_at: newData.updated_at || new Date().toISOString(),
            }
            setWallet(walletData)
          }
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [user])

  const refreshWallet = async () => {
    if (!user) return
    setLoading(true)
    await fetchWallet(user.id)
    setLoading(false)
  }

  const convertCurrency = async (
    fromCurrency: CurrencyType,
    toCurrency: CurrencyType,
    amount: number
  ): Promise<boolean> => {
    if (!user || !wallet) {
      setError('Пользователь не авторизован')
      return false
    }

    try {
      setError(null)

      // Validate conversion direction
      const validConversions = [
        { from: 'green', to: 'blue' },
        { from: 'blue', to: 'red' },
      ]

      const isValidConversion = validConversions.some(
        (conv) => conv.from === fromCurrency && conv.to === toCurrency
      )

      if (!isValidConversion) {
        setError('Недопустимое направление конвертации')
        return false
      }

      // Check if user has enough balance
      const currentBalance = wallet[`${fromCurrency}_balance` as keyof Wallet] as number
      if (currentBalance < amount) {
        setError('Недостаточно средств для конвертации')
        return false
      }

      // Check if amount is divisible by conversion rate
      const conversionRate = CURRENCY_CONVERSION.GREEN_TO_BLUE // Both conversions use 10:1 rate
      if (amount % conversionRate !== 0) {
        setError(`Сумма должна быть кратна ${conversionRate}`)
        return false
      }

      // Call database function
      const { data, error } = await supabase.rpc('convert_currency', {
        p_user_id: user.id,
        p_from_currency: fromCurrency,
        p_to_currency: toCurrency,
        p_amount: amount,
      })

      if (error) {
        console.error('Currency conversion error:', error)
        setError('Ошибка конвертации валюты')
        return false
      }

      if (!data) {
        setError('Не удалось выполнить конвертацию')
        return false
      }

      // Wallet will be updated via real-time subscription
      return true
    } catch (error) {
      console.error('Currency conversion error:', error)
      setError('Ошибка конвертации валюты')
      return false
    }
  }

  const transferCurrency = async (
    toUserId: string,
    currency: CurrencyType,
    amount: number
  ): Promise<boolean> => {
    if (!user || !wallet) {
      setError('Пользователь не авторизован')
      return false
    }

    try {
      setError(null)

      // Use the new atomic transfer function
      const { data: result, error } = await supabase.rpc('transfer_currency_to_friend', {
        p_sender_id: user.id,
        p_receiver_id: toUserId,
        p_currency: currency,
        p_amount: amount,
      })

      if (error) {
        console.error('Currency transfer error:', error)
        setError('Ошибка перевода валюты')
        return false
      }

      const transferResult = result as { success?: boolean; message?: string; error?: string }
      
      if (!transferResult?.success) {
        const errorMessage = transferResult?.message || 'Не удалось выполнить перевод'
        setError(errorMessage)
        return false
      }

      // Wallet will be updated via real-time subscription
      return true
    } catch (error) {
      console.error('Currency transfer error:', error)
      setError('Ошибка перевода валюты')
      return false
    }
  }

  const value = {
    wallet,
    loading,
    convertCurrency,
    transferCurrency,
    refreshWallet,
    error,
  }

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  )
}