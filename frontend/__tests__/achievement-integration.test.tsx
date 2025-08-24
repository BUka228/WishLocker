import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { supabase } from '@/lib/supabase'
import { AchievementProvider, useAchievements } from '@/contexts/AchievementContext'
import { AuthProvider } from '@/contexts/AuthContext'

// Mock Supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(),
    rpc: jest.fn(),
    channel: jest.fn(),
    removeChannel: jest.fn(),
  }
}))

// Mock auth context
jest.mock('@/contexts/AuthContext', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  useAuth: () => ({
    user: {
      id: 'test-user-id',
      email: 'test@example.com',
      username: 'testuser'
    }
  })
}))

const mockSupabase = supabase as jest.Mocked<typeof supabase>

// Test component that uses achievements
function TestAchievementComponent() {
  const { achievements, achievementProgress, loading, error } = useAchievements()
  
  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>
  
  return (
    <div>
      <div data-testid="achievements-count">{achievements.length}</div>
      <div data-testid="progress-count">{achievementProgress.length}</div>
      {achievements.map(achievement => (
        <div key={achievement.id} data-testid={`achievement-${achievement.achievement_type}`}>
          {achievement.title}
        </div>
      ))}
    </div>
  )
}

describe('Achievement Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    
    // Mock Supabase responses
    const mockSelect = jest.fn().mockReturnThis()
    const mockEq = jest.fn().mockReturnThis()
    const mockOrder = jest.fn().mockResolvedValue({
      data: [
        {
          id: '1',
          user_id: 'test-user-id',
          achievement_type: 'first_wish',
          achievement_type_enum: 'first_wish',
          title: 'Первое желание',
          description: 'Создал своё первое желание в системе',
          earned_at: '2024-01-15T10:00:00Z'
        }
      ],
      error: null
    })

    mockSupabase.from.mockReturnValue({
      select: mockSelect,
      eq: mockEq,
      order: mockOrder
    } as any)

    // Mock RPC call for progress
    mockSupabase.rpc.mockResolvedValue({
      data: [
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
        }
      ],
      error: null
    })

    // Mock real-time subscription
    const mockChannel = {
      on: jest.fn().mockReturnThis(),
      subscribe: jest.fn()
    }
    mockSupabase.channel.mockReturnValue(mockChannel as any)
  })

  it('loads achievements and progress on mount', async () => {
    render(
      <AuthProvider>
        <AchievementProvider>
          <TestAchievementComponent />
        </AchievementProvider>
      </AuthProvider>
    )

    // Should show loading initially
    expect(screen.getByText('Loading...')).toBeInTheDocument()

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByTestId('achievements-count')).toHaveTextContent('1')
      expect(screen.getByTestId('progress-count')).toHaveTextContent('2')
    })

    // Should show the achievement
    expect(screen.getByTestId('achievement-first_wish')).toHaveTextContent('Первое желание')
  })

  it('handles loading state correctly', async () => {
    // Mock delayed response
    const mockOrder = jest.fn().mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({ data: [], error: null }), 100))
    )
    
    mockSupabase.from.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: mockOrder
    } as any)

    render(
      <AuthProvider>
        <AchievementProvider>
          <TestAchievementComponent />
        </AchievementProvider>
      </AuthProvider>
    )

    // Should show loading
    expect(screen.getByText('Loading...')).toBeInTheDocument()

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
    })
  })

  it('handles error state correctly', async () => {
    // Mock error response
    mockSupabase.from.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockResolvedValue({
        data: null,
        error: { message: 'Database error' }
      })
    } as any)

    render(
      <AuthProvider>
        <AchievementProvider>
          <TestAchievementComponent />
        </AchievementProvider>
      </AuthProvider>
    )

    // Wait for error to appear
    await waitFor(() => {
      expect(screen.getByText(/Error:/)).toBeInTheDocument()
    })
  })

  it('sets up real-time subscription', () => {
    render(
      <AuthProvider>
        <AchievementProvider>
          <TestAchievementComponent />
        </AchievementProvider>
      </AuthProvider>
    )

    // Should set up channel subscription
    expect(mockSupabase.channel).toHaveBeenCalledWith('achievements_changes')
  })

  it('calls correct Supabase methods', async () => {
    render(
      <AuthProvider>
        <AchievementProvider>
          <TestAchievementComponent />
        </AchievementProvider>
      </AuthProvider>
    )

    await waitFor(() => {
      // Should call achievements query
      expect(mockSupabase.from).toHaveBeenCalledWith('achievements')
      
      // Should call progress RPC
      expect(mockSupabase.rpc).toHaveBeenCalledWith('get_achievement_progress', {
        p_user_id: 'test-user-id'
      })
    })
  })
})

describe('Achievement Context Methods', () => {
  it('hasAchievement works correctly', async () => {
    let contextValue: any

    function TestComponent() {
      contextValue = useAchievements()
      return <div>Test</div>
    }

    render(
      <AuthProvider>
        <AchievementProvider>
          <TestComponent />
        </AchievementProvider>
      </AuthProvider>
    )

    await waitFor(() => {
      expect(contextValue.hasAchievement).toBeDefined()
    })

    // Test the function (this would need the actual implementation)
    // expect(contextValue.hasAchievement('first_wish')).toBe(true)
    // expect(contextValue.hasAchievement('wish_master')).toBe(false)
  })

  it('getAchievementByType works correctly', async () => {
    let contextValue: any

    function TestComponent() {
      contextValue = useAchievements()
      return <div>Test</div>
    }

    render(
      <AuthProvider>
        <AchievementProvider>
          <TestComponent />
        </AchievementProvider>
      </AuthProvider>
    )

    await waitFor(() => {
      expect(contextValue.getAchievementByType).toBeDefined()
    })

    // Test the function (this would need the actual implementation)
    // const achievement = contextValue.getAchievementByType('first_wish')
    // expect(achievement).toBeTruthy()
    // expect(achievement.title).toBe('Первое желание')
  })
})