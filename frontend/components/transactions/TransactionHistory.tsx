'use client'

import React, { useEffect } from 'react'
import { useTransactions } from '@/contexts/TransactionContext'
import { useAuth } from '@/contexts/AuthContext'
import { Clock, Search, ExternalLink } from 'lucide-react'
import Link from 'next/link'

interface TransactionHistoryProps {
  className?: string
}

export default function TransactionHistory({ className = '' }: TransactionHistoryProps) {
  const { user } = useAuth()
  const {
    transactions,
    loading,
    error,
    filters,
    currentPage,
    totalCount,
    totalPages,
    fetchTransactions,
    setFilters,
    setCurrentPage,
    formatCurrency,
    formatTransactionType,
    formatDate
  } = useTransactions()

  useEffect(() => {
    if (user) {
      fetchTransactions()
    }
  }, [user, fetchTransactions])

  const handleFilterChange = (key: string, value: string) => {
    setFilters({ ...filters, [key]: value })
  }

  if (!user) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Войдите в систему для просмотра истории транзакций</p>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border ${className}`}>
      {/* Header */}
      <div className="p-6 border-b">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Clock className="w-5 h-5" />
            История транзакций
          </h2>
          <div className="text-sm text-gray-500">
            Всего: {totalCount} операций
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4">
          {/* Search */}
          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Поиск по описанию..."
                value={filters.search || ''}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Currency Filter */}
          <select
            value={filters.currency || 'all'}
            onChange={(e) => handleFilterChange('currency', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Все валюты</option>
            <option value="green">💚 Зеленые</option>
            <option value="blue">💙 Синие</option>
            <option value="red">❤️ Красные</option>
          </select>

          {/* Type Filter */}
          <select
            value={filters.type || 'all'}
            onChange={(e) => handleFilterChange('type', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Все операции</option>
            <option value="earn">Заработок</option>
            <option value="spend">Трата</option>
            <option value="convert">Конвертация</option>
          </select>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                    <div className="space-y-2">
                      <div className="w-32 h-4 bg-gray-200 rounded"></div>
                      <div className="w-24 h-3 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                  <div className="w-16 h-4 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-600">{error}</p>
            <button
              onClick={() => fetchTransactions()}
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Попробовать снова
            </button>
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">
              {Object.values(filters).some(f => f && f !== 'all') 
                ? 'Нет транзакций по выбранным фильтрам'
                : 'У вас пока нет транзакций'
              }
            </p>
          </div>
        ) : (
          <>
            {/* Transaction List */}
            <div className="space-y-3">
              {transactions.map((transaction) => {
                const currency = formatCurrency(transaction.currency)
                const type = formatTransactionType(transaction.type)
                
                return (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {/* Currency Icon */}
                      <div className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full">
                        <span className="text-lg">{currency.emoji}</span>
                      </div>

                      {/* Transaction Details */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-gray-900">
                            {transaction.description}
                          </span>
                          {transaction.related_wish && (
                            <Link
                              href={`/wishes/${transaction.related_wish.id}`}
                              className="text-blue-600 hover:text-blue-800 transition-colors"
                              title="Перейти к желанию"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </Link>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <span className={type.color}>{type.name}</span>
                          <span>•</span>
                          <span>{currency.name}</span>
                          <span>•</span>
                          <span>{formatDate(transaction.created_at)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Amount */}
                    <div className={`text-lg font-semibold ${type.color}`}>
                      {type.sign}{Math.abs(transaction.amount)}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-6 border-t">
                <div className="text-sm text-gray-500">
                  Страница {currentPage} из {totalPages}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Назад
                  </button>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Вперед
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}