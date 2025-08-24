'use client'

import React from 'react'
import { Achievement, AchievementProgress, ACHIEVEMENT_METADATA } from '@/lib/types'

interface AchievementBadgeProps {
  achievement?: Achievement
  progress?: AchievementProgress
  size?: 'sm' | 'md' | 'lg'
  showProgress?: boolean
  className?: string
}

export function AchievementBadge({ 
  achievement, 
  progress, 
  size = 'md', 
  showProgress = false,
  className = '' 
}: AchievementBadgeProps) {
  const achievementType = achievement?.achievement_type_enum || progress?.achievement_type
  const metadata = achievementType ? ACHIEVEMENT_METADATA[achievementType] : null
  
  if (!metadata) return null

  const isEarned = achievement ? true : progress?.earned || false
  const title = achievement?.title || progress?.title || metadata.title
  const description = achievement?.description || progress?.description || metadata.description

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-sm',
    lg: 'w-16 h-16 text-base'
  }

  const rarityClasses = {
    common: 'bg-gray-100 border-gray-300',
    rare: 'bg-blue-100 border-blue-300',
    legendary: 'bg-purple-100 border-purple-300'
  }

  const earnedClasses = isEarned 
    ? `${rarityClasses[metadata.rarity]} shadow-md` 
    : 'bg-gray-50 border-gray-200 opacity-60'

  return (
    <div className={`relative ${className}`}>
      <div 
        className={`
          ${sizeClasses[size]} 
          ${earnedClasses}
          rounded-full border-2 flex items-center justify-center
          transition-all duration-200 hover:scale-105
          ${isEarned ? 'cursor-pointer' : 'cursor-default'}
        `}
        title={`${title}: ${description}`}
      >
        <span className={`${size === 'sm' ? 'text-lg' : size === 'md' ? 'text-2xl' : 'text-3xl'}`}>
          {metadata.icon}
        </span>
        
        {!isEarned && (
          <div className="absolute inset-0 bg-gray-400 bg-opacity-50 rounded-full flex items-center justify-center">
            <span className="text-white font-bold">?</span>
          </div>
        )}
      </div>
      
      {showProgress && progress && !isEarned && (
        <div className="mt-1">
          <div className="w-full bg-gray-200 rounded-full h-1">
            <div 
              className="bg-blue-500 h-1 rounded-full transition-all duration-300"
              style={{ width: `${(progress.progress / progress.max_progress) * 100}%` }}
            />
          </div>
          <div className="text-xs text-gray-500 text-center mt-1">
            {progress.progress}/{progress.max_progress}
          </div>
        </div>
      )}
      
      {isEarned && achievement?.earned_at && (
        <div className="text-xs text-gray-500 text-center mt-1">
          {new Date(achievement.earned_at).toLocaleDateString('ru-RU')}
        </div>
      )}
    </div>
  )
}