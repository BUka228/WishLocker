'use client'

import React from 'react'
import { useAchievements } from '@/contexts/AchievementContext'
import { AchievementBadge } from './AchievementBadge'
import { ACHIEVEMENT_METADATA, AchievementType } from '@/lib/types'

interface AchievementsListProps {
  showProgress?: boolean
  layout?: 'grid' | 'list'
  className?: string
}

export function AchievementsList({ 
  showProgress = true, 
  layout = 'grid',
  className = '' 
}: AchievementsListProps) {
  const { achievements, achievementProgress, loading, error } = useAchievements()

  if (loading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="w-16 h-16 bg-gray-200 rounded-full" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`text-red-500 text-center p-4 ${className}`}>
        Ошибка загрузки достижений: {error}
      </div>
    )
  }

  const allAchievementTypes = Object.keys(ACHIEVEMENT_METADATA) as AchievementType[]

  if (layout === 'list') {
    return (
      <div className={`space-y-4 ${className}`}>
        {allAchievementTypes.map(type => {
          const achievement = achievements.find(a => 
            a.achievement_type === type || a.achievement_type_enum === type
          )
          const progress = achievementProgress.find(p => p.achievement_type === type)
          const metadata = ACHIEVEMENT_METADATA[type]
          
          return (
            <div key={type} className="flex items-center space-x-4 p-4 bg-white rounded-lg border">
              <AchievementBadge 
                achievement={achievement}
                progress={progress}
                size="lg"
                showProgress={showProgress}
              />
              <div className="flex-1">
                <h3 className="font-semibold text-lg">
                  {achievement?.title || progress?.title || metadata.title}
                </h3>
                <p className="text-gray-600">
                  {achievement?.description || progress?.description || metadata.description}
                </p>
                {showProgress && progress && !achievement && (
                  <div className="mt-2">
                    <div className="flex justify-between text-sm text-gray-500 mb-1">
                      <span>Прогресс</span>
                      <span>{progress.progress}/{progress.max_progress}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(progress.progress / progress.max_progress) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
                {achievement && (
                  <div className="text-sm text-green-600 mt-2">
                    ✓ Получено {achievement.earned_at ? new Date(achievement.earned_at).toLocaleDateString('ru-RU') : 'Неизвестно'}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 ${className}`}>
      {allAchievementTypes.map(type => {
        const achievement = achievements.find(a => 
          a.achievement_type === type || a.achievement_type_enum === type
        )
        const progress = achievementProgress.find(p => p.achievement_type === type)
        
        return (
          <div key={type} className="text-center">
            <AchievementBadge 
              achievement={achievement}
              progress={progress}
              size="lg"
              showProgress={showProgress}
            />
            <div className="mt-2">
              <div className="font-medium text-sm">
                {achievement?.title || progress?.title || ACHIEVEMENT_METADATA[type].title}
              </div>
              {showProgress && progress && !achievement && (
                <div className="text-xs text-gray-500 mt-1">
                  {progress.progress}/{progress.max_progress}
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}