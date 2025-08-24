'use client'

import React, { useState, useEffect } from 'react'
import { Transaction, CurrencyType, TransactionType } from '@/lib/types'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { Clock, ExternalLink, ArrowRight } from 'lucide-react'
import Link from 'next/link'

interface TransactionListProps {
  limit?: number
  showHeader?: boolean
  showViewAll?: boolean
  currency?: CurrencyType
  type?: TransactionType
  className?: string
}

export default function TransactionList({ 
  limit = 5, 
  showHeader = true, 
  showViewAll = true,
  currency,
  type,
  className = '' 
}: TransactionListProps) {
  const { user } = useAuth()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTransactions = async () => {
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
              type
            )
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(limit)

        // Apply filters if provided
        if (currency) {
          query = query.eq('currency', currency)
        }

        if (type) {
          query = query.eq('type', type)
        }

        const { data, error: fetchError } = await query

        if (fetchError) throw fetchError

        setTransactions(data || [])
      } catch (err) {
        console.error('Error fetching transactions:', err)
        setError('Ошибка загрузки транзакций')
      } finally {
        setLoading(false)
      }
    }

    fetchTransactions()
  }, [user, limit, currency, type])

  const formatCurrency = (currency: CurrencyType) => {
    const currencyMap = {
      green: { emoji: '💚', name: 'Зеленые' },
      blue: { emoji: '💙', name: 'Синие' },
      red: { emoji: '❤️', name: 'Красные' }
    }
    return currencyMap[currency]
  }

  const formatTransactionType = (type: TransactionType) => {
    const typeMap = {
      earn: { name: 'Заработок', color: 'text-green-600', sign: '+' },
      spend: { name: 'Трата', color: 'text-red-600', sign: '-' },
      convert: { name: 'Конвертация', color: 'text-blue-600', sign: '~' }
    }
    return typeMap[type]
  }

  const formatDate = (dateString: string) => {
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
        month: 'short'
      })
    }
  }

  if (!user) {
    return null
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border ${className}`}>
      {showHeader && (
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Последние операции
          </h3>
          {showViewAll && (
            <Link
              href="/transactions"
              className="text-sm text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1"
            >
              Все операции
              <ArrowRight className="w-3 h-3" />
            </Link>
          )}
        </div>
      )}

      <div className="p-4">
        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
                    <div className="space-y-1">
                      <div className="w-24 h-3 bg-gray-200 rounded"></div>
                      <div className="w-16 h-2 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                  <div className="w-8 h-3 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-4">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-4">
            <Clock className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500 text-sm">Нет операций</p>
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.map((transaction) => {
              const currencyInfo = formatCurrency(transaction.currency)
              const typeInfo = formatTransactionType(transaction.type)
              
              return (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between py-2"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {/* Currency Icon */}
                    <div className="w-6 h-6 flex items-center justify-center bg-gray-100 rounded-full flex-shrink-0">
                      <span className="text-sm">{currencyInfo.emoji}</span>
                    </div>

                    {/* Transaction Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900 truncate">
                          {transaction.description}
                        </span>
                        {transaction.related_wish && (
                          <Link
                            href={`/wishes/${transaction.related_wish.id}`}
                            className="text-blue-600 hover:text-blue-800 transition-colors flex-shrink-0"
                            title="Перейти к желанию"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        )}
                      </div>
                      <div className="text-xs text-gray-500">
                        {transaction.created_at ? formatDate(transaction.created_at) : 'Неизвестно'}
                      </div>
                    </div>
                  </div>

                  {/* Amount */}
                  <div className={`text-sm font-semibold ${typeInfo.color} flex-shrink-0`}>
                    {typeInfo.sign}{Math.abs(transaction.amount)}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}