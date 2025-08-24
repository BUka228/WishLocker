'use client'

import React from 'react'
import TransactionHistory from '@/components/transactions/TransactionHistory'
import { TransactionProvider } from '@/contexts/TransactionContext'
import { useAuth } from '@/contexts/AuthContext'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function TransactionsPage() {
  const { user } = useAuth()

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Вход в систему требуется
          </h1>
          <p className="text-gray-600 mb-6">
            Для просмотра истории транзакций необходимо войти в систему
          </p>
          <Link
            href="/"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Вернуться на главную
          </Link>
        </div>
      </div>
    )
  }

  return (
    <TransactionProvider>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-6">
            <Link
              href="/"
              className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Вернуться на главную
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">
              История транзакций
            </h1>
            <p className="text-gray-600 mt-2">
              Просмотрите все ваши операции с валютами и желаниями
            </p>
          </div>

          {/* Transaction History Component */}
          <TransactionHistory />
        </div>
      </div>
    </TransactionProvider>
  )
}