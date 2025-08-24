'use client'

import React, { createContext, useContext, useState, useCallback } from 'react'
import { Transaction, CurrencyType, TransactionType } from '@/lib/types'
import { supabase } from '@/lib/supabase'
import { useAuth } from './AuthContext'

interface TransactionFilters {
  currency?: CurrencyType | 'all'
  type?: TransactionType | 'all'
  search?: string
  dateFrom?: string
  dateTo?: string
}

interface TransactionStats {
  totalEarned: Record<CurrencyType, number>
  totalSpent: Record<CurrencyType, number>
  totalConverted: Record<CurrencyType, number>
  transactionCount: number
}

interface TransactionContextType {
  // Data
  transactions: Transaction[]
  loading: boolean
  error: string | null
  
  // Filters and pagination
  filters: TransactionFilters
  currentPage: number
  totalCount: number
  totalPages: number
  
  // Actions
  fetchTransactions: (page?: number) => Promise<void>
  setFilters: (filters: TransactionFilters) => void
  setCurrentPage: (page: number) => void
  refreshTransactions: () => Promise<void>
  getTransactionStats: () => Promise<TransactionStats | null>
  
  // Utilities
  formatCurrency: (currency: CurrencyType) => { emoji: string; name: string }
  formatTransactionType: (type: TransactionType) => { name: string; color: string; sign: string }
  formatDate: (dateString: string) => string
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined)

const ITEMS_PER_PAGE = 20

export function TransactionProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFiltersState] = useState<TransactionFilters>({
    currency: 'all',
    type: 'all',
    search: ''
  })
  const [currentPage, setCurrentPageState] = useState(1)
  const [totalCount, setTotalCount] = useState(0)

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE)

  const fetchTransactions = useCallback(async (page: number = currentPage) => {
    if (!user) return

    setLoading(true)
    setError(null)

    try {
      let query = supabase
        .from('transactions')
        .select(`
          *,
          related_wish:wishes(
            id,
            title,
            type,
            creator_id,
            assignee_id
          )
        `, { count: 'exact' })
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      // Apply filters
      if (filters.currency && filters.currency !== 'all') {
        query = query.eq('currency', filters.currency)
      }

      if (filters.type && filters.type !== 'all') {
        query = query.eq('type', filters.type)
      }

      if (filters.search && filters.search.trim()) {
        query = query.ilike('description', `%${filters.search.trim()}%`)
      }

      if (filters.dateFrom) {
        query = query.gte('created_at', filters.dateFrom)
      }

      if (filters.dateTo) {
        query = query.lte('created_at', filters.dateTo)
      }

      // Apply pagination
      const from = (page - 1) * ITEMS_PER_PAGE
      const to = from + ITEMS_PER_PAGE - 1
      query = query.range(from, to)

      const { data, error: fetchError, count } = await query

      if (fetchError) throw fetchError

      setTransactions(data || [])
      setTotalCount(count || 0)
    } catch (err) {
      console.error('Error fetching transactions:', err)
      setError('Ошибка загрузки истории транзакций')
    } finally {
      setLoading(false)
    }
  }, [user, filters, currentPage])

  const setFilters = useCallback((newFilters: TransactionFilters) => {
    setFiltersState(newFilters)
    setCurrentPageState(1) // Reset to first page when filters change
  }, [])

  const setCurrentPage = useCallback((page: number) => {
    setCurrentPageState(page)
  }, [])

  const refreshTransactions = useCallback(async () => {
    await fetchTransactions(currentPage)
  }, [fetchTransactions, currentPage])

  const getTransactionStats = useCallback(async (): Promise<TransactionStats | null> => {
    if (!user) return null

    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('type, currency, amount')
        .eq('user_id', user.id)

      if (error) throw error

      const stats: TransactionStats = {
        totalEarned: { green: 0, blue: 0, red: 0 },
        totalSpent: { green: 0, blue: 0, red: 0 },
        totalConverted: { green: 0, blue: 0, red: 0 },
        transactionCount: data?.length || 0
      }

      data?.forEach(transaction => {
        const amount = Math.abs(transaction.amount)
        switch (transaction.type) {
          case 'earn':
            stats.totalEarned[transaction.currency] += amount
            break
          case 'spend':
            stats.totalSpent[transaction.currency] += amount
            break
          case 'convert':
            stats.totalConverted[transaction.currency] += amount
            break
        }
      })

      return stats
    } catch (err) {
      console.error('Error fetching transaction stats:', err)
      return null
    }
  }, [user])

  // Utility functions
  const formatCurrency = useCallback((currency: CurrencyType) => {
    const currencyMap = {
      green: { emoji: '💚', name: 'Зеленые' },
      blue: { emoji: '💙', name: 'Синие' },
      red: { emoji: '❤️', name: 'Красные' }
    }
    return currencyMap[currency]
  }, [])

  const formatTransactionType = useCallback((type: TransactionType) => {
    const typeMap = {
      earn: { name: 'Заработок', color: 'text-green-600', sign: '+' },
      spend: { name: 'Трата', color: 'text-red-600', sign: '-' },
      convert: { name: 'Конвертация', color: 'text-blue-600', sign: '~' }
    }
    return typeMap[type]
  }, [])

  const formatDate = useCallback((dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 1) {
      return 'Только что'
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} ч. назад`
    } else if (diffInHours < 48) {
      return 'Вчера'
    } else {
      return date.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'short',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      })
    }
  }, [])

  const value: TransactionContextType = {
    // Data
    transactions,
    loading,
    error,
    
    // Filters and pagination
    filters,
    currentPage,
    totalCount,
    totalPages,
    
    // Actions
    fetchTransactions,
    setFilters,
    setCurrentPage,
    refreshTransactions,
    getTransactionStats,
    
    // Utilities
    formatCurrency,
    formatTransactionType,
    formatDate
  }

  return (
    <TransactionContext.Provider value={value}>
      {children}
    </TransactionContext.Provider>
  )
}

export function useTransactions() {
  const context = useContext(TransactionContext)
  if (context === undefined) {
    throw new Error('useTransactions must be used within a TransactionProvider')
  }
  return context
}