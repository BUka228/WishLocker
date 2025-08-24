'use client'

import { useState } from 'react'
import { Filter, Plus, RefreshCw, AlertCircle } from 'lucide-react'
import { WishType, WISH_METADATA } from '@/lib/types'
import { useWish } from '@/contexts/WishContext'
import { WishCard } from './wishes/WishCard'
import { WishForm } from './wishes/WishForm'

export function WishList() {
  const [filter, setFilter] = useState<'all' | WishType>('all')
  const [showCreateForm, setShowCreateForm] = useState(false)
  
  const { wishes, loading, error, filterWishes, refreshWishes } = useWish()

  const filteredWishes = filter === 'all' 
    ? wishes 
    : filterWishes({ type: filter })

  const handleRefresh = () => {
    refreshWishes()
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="w-6 h-6 text-gray-400 animate-spin mr-2" />
          <span className="text-gray-600">Загрузка желаний...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-center py-8">
          <AlertCircle className="w-6 h-6 text-red-500 mr-2" />
          <span className="text-red-600">{error}</span>
          <button
            onClick={handleRefresh}
            className="ml-4 px-3 py-1 bg-red-100 text-red-700 rounded-lg text-sm hover:bg-red-200 transition-colors"
          >
            Попробовать снова
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-800">
            Желания ({filteredWishes.length})
          </h2>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowCreateForm(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Создать желание
            </button>
            
            <button
              onClick={handleRefresh}
              className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
              title="Обновить список"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
            
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-500" />
              <select 
                value={filter} 
                onChange={(e) => setFilter(e.target.value as any)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Все типы</option>
                {(Object.keys(WISH_METADATA) as WishType[]).map((type) => (
                  <option key={type} value={type}>
                    {WISH_METADATA[type].emoji} {WISH_METADATA[type].name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {filteredWishes.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400 mb-2">
                {filter === 'all' ? '📝' : WISH_METADATA[filter as WishType]?.emoji}
              </div>
              <p className="text-gray-600">
                {filter === 'all' 
                  ? 'Пока нет желаний. Создайте первое!' 
                  : `Нет ${WISH_METADATA[filter as WishType]?.name.toLowerCase()} желаний`
                }
              </p>
              {filter === 'all' && (
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Создать первое желание
                </button>
              )}
            </div>
          ) : (
            filteredWishes.map((wish) => (
              <WishCard key={wish.id} wish={wish} />
            ))
          )}
        </div>
      </div>

      <WishForm
        isOpen={showCreateForm}
        onClose={() => setShowCreateForm(false)}
        onSuccess={() => {
          // Optionally show a success message
        }}
      />
    </>
  )
}