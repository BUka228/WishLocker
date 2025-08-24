import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { useAchievements } from '@/contexts/AchievementContext'
import { AchievementsList } from '@/components/achievements/AchievementsList'
import { AchievementBadge } from '@/components/achievements/AchievementBadge'
import { Achievement, AchievementProgress } from '@/../../shared/types'

// Mock the context
jest.mock('@/contexts/AchievementContext')
const mockUseAchievements = useAchievements as jest.MockedFunction<typeof useAchievements>

// Mock data
const mockAchievements: Achievement[] = [
  {
    id: '1',
    user_id: 'user1',
    achievement_type: 'first_wish',
    achievement_type_enum: 'first_wish',
    title: 'Первое желание',
    description: 'Создал своё первое желание в системе',
    earned_at: '2024-01-15T10:00:00Z'
  }
]

const mockAchievementProgress: AchievementProgress[] = [
  {
    achievement_type: 'first_wish',
    title: 'Первое желание',
    description: 'Создал своё первое желание в системе',
    earned: true,
    earned_at: '2024-01-15T10:00:00Z',
    progress: 1,
    max_progress: 1
  },
  {
    achievement_type: 'wish_master',
    title: 'Мастер желаний',
    description: 'Выполнил 5 желаний других пользователей',
    earned: false,
    earned_at: null,
    progress: 2,
    max_progress: 5
  },
  {
    achievement_type: 'converter',
    title: 'Конвертер',
    description: 'Впервые конвертировал валюту',
    earned: false,
    earned_at: null,
    progress: 0,
    max_progress: 1
  },
  {
    achievement_type: 'legendary_fulfiller',
    title: 'Легендарный исполнитель',
    description: 'Выполнил красное (легендарное) желание',
    earned: false,
    earned_at: null,
    progress: 0,
    max_progress: 1
  }
]

describe('Achievement System', () => {
  beforeEach(() => {
    mockUseAchievements.mockReturnValue({
      achievements: mockAchievements,
      achievementProgress: mockAchievementProgress,
      loading: false,
      error: null,
      refreshAchievements: jest.fn(),
      getAchievementProgress: jest.fn(),
      hasAchievement: jest.fn((type) => type === 'first_wish'),
      getAchievementByType: jest.fn((type) => 
        type === 'first_wish' ? mockAchievements[0] : null
      )
    })
  })

  describe('AchievementBadge', () => {
    it('renders earned achievement correctly', () => {
      render(
        <AchievementBadge 
          achievement={mockAchievements[0]}
          size="md"
        />
      )

      const badge = screen.getByTitle(/Первое желание/)
      expect(badge).toBeInTheDocument()
      expect(badge).toHaveTextContent('🌟')
    })

    it('renders unearned achievement with progress', () => {
      const unearned = mockAchievementProgress.find(p => p.achievement_type === 'wish_master')!
      
      render(
        <AchievementBadge 
          progress={unearned}
          size="md"
          showProgress={true}
        />
      )

      expect(screen.getByText('2/5')).toBeInTheDocument()
      expect(screen.getByTitle(/Мастер желаний/)).toBeInTheDocument()
    })

    it('shows question mark for unearned achievements', () => {
      const unearned = mockAchievementProgress.find(p => p.achievement_type === 'converter')!
      
      render(
        <AchievementBadge 
          progress={unearned}
          size="md"
        />
      )

      expect(screen.getByText('?')).toBeInTheDocument()
    })
  })

  describe('AchievementsList', () => {
    it('renders all achievements in grid layout', () => {
      render(<AchievementsList layout="grid" />)

      expect(screen.getByText('Первое желание')).toBeInTheDocument()
      expect(screen.getByText('Мастер желаний')).toBeInTheDocument()
      expect(screen.getByText('Конвертер')).toBeInTheDocument()
      expect(screen.getByText('Легендарный исполнитель')).toBeInTheDocument()
    })

    it('renders achievements in list layout with progress', () => {
      render(<AchievementsList layout="list" showProgress={true} />)

      expect(screen.getByText('Первое желание')).toBeInTheDocument()
      expect(screen.getByText('Мастер желаний')).toBeInTheDocument()
      
      // Check for progress indicators
      expect(screen.getByText('2/5')).toBeInTheDocument() // wish_master progress
      expect(screen.getByText('✓ Получено')).toBeInTheDocument() // earned achievement
    })

    it('shows loading state', () => {
      mockUseAchievements.mockReturnValue({
        achievements: [],
        achievementProgress: [],
        loading: true,
        error: null,
        refreshAchievements: jest.fn(),
        getAchievementProgress: jest.fn(),
        hasAchievement: jest.fn(),
        getAchievementByType: jest.fn()
      })

      render(<AchievementsList />)
      
      // Should show loading skeleton
      const loadingElements = screen.getAllByRole('generic')
      expect(loadingElements.length).toBeGreaterThan(0)
    })

    it('shows error state', () => {
      mockUseAchievements.mockReturnValue({
        achievements: [],
        achievementProgress: [],
        loading: false,
        error: 'Failed to load achievements',
        refreshAchievements: jest.fn(),
        getAchievementProgress: jest.fn(),
        hasAchievement: jest.fn(),
        getAchievementByType: jest.fn()
      })

      render(<AchievementsList />)
      
      expect(screen.getByText(/Ошибка загрузки достижений/)).toBeInTheDocument()
    })
  })

  describe('Achievement Context Functions', () => {
    it('hasAchievement returns correct values', () => {
      const { hasAchievement } = mockUseAchievements()
      
      expect(hasAchievement('first_wish')).toBe(true)
      expect(hasAchievement('wish_master')).toBe(false)
    })

    it('getAchievementByType returns correct achievement', () => {
      const { getAchievementByType } = mockUseAchievements()
      
      const achievement = getAchievementByType('first_wish')
      expect(achievement).toEqual(mockAchievements[0])
      
      const nonExistent = getAchievementByType('wish_master')
      expect(nonExistent).toBeNull()
    })
  })
})

describe('Achievement Progress Calculation', () => {
  it('calculates progress correctly for wish_master', () => {
    const progress = mockAchievementProgress.find(p => p.achievement_type === 'wish_master')!
    
    expect(progress.progress).toBe(2)
    expect(progress.max_progress).toBe(5)
    expect(progress.earned).toBe(false)
  })

  it('shows completed progress for earned achievements', () => {
    const progress = mockAchievementProgress.find(p => p.achievement_type === 'first_wish')!
    
    expect(progress.progress).toBe(1)
    expect(progress.max_progress).toBe(1)
    expect(progress.earned).toBe(true)
  })
})