'use client'

import React, { useState } from 'react'
import { useAchievements } from '@/contexts/AchievementContext'
import { AchievementsList } from '@/components/achievements/AchievementsList'
import { Trophy, Grid, List } from 'lucide-react'

export default function AchievementsPage() {
  const { achievements, achievementProgress, loading } = useAchievements()
  const [layout, setLayout] = useState<'grid' | 'list'>('grid')

  const earnedCount = achievements.length
  const totalCount = achievementProgress.length

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Trophy className="w-8 h-8 text-yellow-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Достижения</h1>
              <p className="text-gray-600">
                Получено {earnedCount} из {totalCount} достижений
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setLayout('grid')}
              className={`p-2 rounded-md transition-colors ${
                layout === 'grid' 
                  ? 'bg-purple-100 text-purple-700' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Grid size={20} />
            </button>
            <button
              onClick={() => setLayout('list')}
              className={`p-2 rounded-md transition-colors ${
                layout === 'list' 
                  ? 'bg-purple-100 text-purple-700' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <List size={20} />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-3 mb-6">
          <div 
            className="bg-gradient-to-r from-yellow-400 to-yellow-600 h-3 rounded-full transition-all duration-500"
            style={{ width: `${totalCount > 0 ? (earnedCount / totalCount) * 100 : 0}%` }}
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Загрузка достижений...</p>
        </div>
      ) : (
        <AchievementsList 
          showProgress={true} 
          layout={layout}
          className="mb-8"
        />
      )}

      {/* Achievement Statistics */}
      <div className="mt-12 bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Статистика</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-600">{earnedCount}</div>
            <div className="text-gray-600">Получено достижений</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">
              {totalCount > 0 ? Math.round((earnedCount / totalCount) * 100) : 0}%
            </div>
            <div className="text-gray-600">Прогресс</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">
              {totalCount - earnedCount}
            </div>
            <div className="text-gray-600">Осталось получить</div>
          </div>
        </div>
      </div>

      {/* Achievement Tips */}
      <div className="mt-8 bg-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">
          💡 Как получить достижения
        </h3>
        <div className="space-y-2 text-blue-800">
          <p>• <strong>Первое желание:</strong> Создайте своё первое желание</p>
          <p>• <strong>Мастер желаний:</strong> Выполните 5 желаний других пользователей</p>
          <p>• <strong>Конвертер:</strong> Конвертируйте валюту впервые</p>
          <p>• <strong>Легендарный исполнитель:</strong> Выполните красное (легендарное) желание</p>
        </div>
      </div>
    </div>
  )
}