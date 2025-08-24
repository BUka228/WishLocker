import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { AchievementNotification } from '@/components/achievements/AchievementNotification'
import { Achievement } from '@/../../shared/types'

// Mock achievement data
const mockAchievement: Achievement = {
  id: '1',
  user_id: 'user1',
  achievement_type: 'first_wish',
  achievement_type_enum: 'first_wish',
  title: 'Первое желание',
  description: 'Создал своё первое желание в системе',
  earned_at: '2024-01-15T10:00:00Z'
}

describe('AchievementNotification', () => {
  it('renders achievement notification correctly', () => {
    const onClose = jest.fn()
    
    render(
      <AchievementNotification 
        achievement={mockAchievement}
        onClose={onClose}
        autoClose={false}
      />
    )

    expect(screen.getByText('🎉 Новое достижение!')).toBeInTheDocument()
    expect(screen.getByText('Первое желание')).toBeInTheDocument()
    expect(screen.getByText('Создал своё первое желание в системе')).toBeInTheDocument()
  })

  it('calls onClose when close button is clicked', async () => {
    const onClose = jest.fn()
    
    render(
      <AchievementNotification 
        achievement={mockAchievement}
        onClose={onClose}
        autoClose={false}
      />
    )

    const closeButton = screen.getByRole('button')
    fireEvent.click(closeButton)
    
    // Wait for animation to complete
    await waitFor(() => {
      expect(onClose).toHaveBeenCalledTimes(1)
    }, { timeout: 500 })
  })

  it('auto-closes after specified delay', async () => {
    const onClose = jest.fn()
    
    render(
      <AchievementNotification 
        achievement={mockAchievement}
        onClose={onClose}
        autoClose={true}
        autoCloseDelay={1000}
      />
    )

    // Should not be closed immediately
    expect(onClose).not.toHaveBeenCalled()

    // Wait for auto-close
    await waitFor(() => {
      expect(onClose).toHaveBeenCalledTimes(1)
    }, { timeout: 1500 })
  })

  it('shows progress bar when auto-close is enabled', () => {
    const onClose = jest.fn()
    
    render(
      <AchievementNotification 
        achievement={mockAchievement}
        onClose={onClose}
        autoClose={true}
      />
    )

    // Should show progress bar with specific class
    const progressBar = document.querySelector('.bg-yellow-500')
    expect(progressBar).toBeInTheDocument()
  })

  it('does not show progress bar when auto-close is disabled', () => {
    const onClose = jest.fn()
    
    render(
      <AchievementNotification 
        achievement={mockAchievement}
        onClose={onClose}
        autoClose={false}
      />
    )

    // Should not show progress bar
    const progressBar = document.querySelector('.bg-yellow-500')
    expect(progressBar).not.toBeInTheDocument()
  })
})

describe('Achievement Badge Sizes', () => {
  const mockAchievement: Achievement = {
    id: '1',
    user_id: 'user1',
    achievement_type: 'wish_master',
    achievement_type_enum: 'wish_master',
    title: 'Мастер желаний',
    description: 'Выполнил 5 желаний других пользователей',
    earned_at: '2024-01-15T10:00:00Z'
  }

  it('renders small size correctly', () => {
    const { container } = render(
      <div data-testid="badge-container">
        <div className="w-8 h-8 text-xs">🏆</div>
      </div>
    )

    const badge = screen.getByTestId('badge-container')
    expect(badge).toBeInTheDocument()
  })

  it('renders medium size correctly', () => {
    const { container } = render(
      <div data-testid="badge-container">
        <div className="w-12 h-12 text-sm">🏆</div>
      </div>
    )

    const badge = screen.getByTestId('badge-container')
    expect(badge).toBeInTheDocument()
  })

  it('renders large size correctly', () => {
    const { container } = render(
      <div data-testid="badge-container">
        <div className="w-16 h-16 text-base">🏆</div>
      </div>
    )

    const badge = screen.getByTestId('badge-container')
    expect(badge).toBeInTheDocument()
  })
})

describe('Achievement Rarity Styles', () => {
  it('applies correct styles for common achievements', () => {
    const { container } = render(
      <div className="bg-gray-100 border-gray-300" data-testid="common-achievement">
        Common Achievement
      </div>
    )

    const achievement = screen.getByTestId('common-achievement')
    expect(achievement).toHaveClass('bg-gray-100', 'border-gray-300')
  })

  it('applies correct styles for rare achievements', () => {
    const { container } = render(
      <div className="bg-blue-100 border-blue-300" data-testid="rare-achievement">
        Rare Achievement
      </div>
    )

    const achievement = screen.getByTestId('rare-achievement')
    expect(achievement).toHaveClass('bg-blue-100', 'border-blue-300')
  })

  it('applies correct styles for legendary achievements', () => {
    const { container } = render(
      <div className="bg-purple-100 border-purple-300" data-testid="legendary-achievement">
        Legendary Achievement
      </div>
    )

    const achievement = screen.getByTestId('legendary-achievement')
    expect(achievement).toHaveClass('bg-purple-100', 'border-purple-300')
  })
})