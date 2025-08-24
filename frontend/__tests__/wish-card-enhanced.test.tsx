import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { WishCard } from '@/components/wishes/WishCard'
import { WishProvider } from '@/contexts/WishContext'
import { AuthProvider } from '@/contexts/AuthContext'
import { Wish } from '@/lib/types'

// Mock Supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        order: jest.fn(() => ({
          data: [],
          error: null
        }))
      }))
    }))
  }
}))

// Mock AuthContext
const mockUser = {
  id: 'user1',
  email: 'test@example.com',
  username: 'testuser',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
}

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: mockUser,
    loading: false,
    signIn: jest.fn(),
    signUp: jest.fn(),
    signOut: jest.fn()
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}))

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>
    <WishProvider>
      {children}
    </WishProvider>
  </AuthProvider>
)

describe('WishCard Enhanced Features', () => {
  const baseWish: Wish = {
    id: '1',
    title: 'Test Wish',
    description: 'Test Description',
    type: 'green',
    cost: 1,
    status: 'active',
    creator_id: 'user2',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    creator: { id: 'user2', username: 'creator1', email: 'creator@test.com', created_at: '', updated_at: '' }
  }

  test('displays color-coded wish types correctly', () => {
    const greenWish = { ...baseWish, type: 'green' as const }
    const { rerender } = render(
      <TestWrapper>
        <WishCard wish={greenWish} />
      </TestWrapper>
    )

    // Check for green styling
    expect(screen.getByText('💚')).toBeInTheDocument()
    expect(screen.getByText('1 зеленое')).toBeInTheDocument()

    // Test blue wish
    const blueWish = { ...baseWish, type: 'blue' as const }
    rerender(
      <TestWrapper>
        <WishCard wish={blueWish} />
      </TestWrapper>
    )

    expect(screen.getByText('💙')).toBeInTheDocument()
    expect(screen.getByText('1 синее')).toBeInTheDocument()

    // Test red wish
    const redWish = { ...baseWish, type: 'red' as const }
    rerender(
      <TestWrapper>
        <WishCard wish={redWish} />
      </TestWrapper>
    )

    expect(screen.getByText('❤️')).toBeInTheDocument()
    expect(screen.getByText('1 красное')).toBeInTheDocument()
  })

  test('displays status indicators with proper styling', () => {
    const activeWish = { ...baseWish, status: 'active' as const }
    const { rerender } = render(
      <TestWrapper>
        <WishCard wish={activeWish} />
      </TestWrapper>
    )

    expect(screen.getByText('Активно')).toBeInTheDocument()

    // Test in_progress status
    const inProgressWish = { ...baseWish, status: 'in_progress' as const, assignee_id: 'user1' }
    rerender(
      <TestWrapper>
        <WishCard wish={inProgressWish} />
      </TestWrapper>
    )

    expect(screen.getByText('В процессе')).toBeInTheDocument()

    // Test completed status
    const completedWish = { ...baseWish, status: 'completed' as const }
    rerender(
      <TestWrapper>
        <WishCard wish={completedWish} />
      </TestWrapper>
    )

    expect(screen.getByText('Выполнено')).toBeInTheDocument()
  })

  test('displays deadline with time remaining', () => {
    // Create a deadline 2 hours from now
    const futureDeadline = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString()
    const wishWithDeadline = { ...baseWish, deadline: futureDeadline }

    render(
      <TestWrapper>
        <WishCard wish={wishWithDeadline} />
      </TestWrapper>
    )

    expect(screen.getByText(/Дедлайн:/)).toBeInTheDocument()
    expect(screen.getByText(/Осталось:/)).toBeInTheDocument()
  })

  test('displays overdue deadline correctly', () => {
    // Create a deadline 2 hours ago
    const pastDeadline = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
    const overdueWish = { ...baseWish, deadline: pastDeadline }

    render(
      <TestWrapper>
        <WishCard wish={overdueWish} />
      </TestWrapper>
    )

    expect(screen.getByText(/Дедлайн:/)).toBeInTheDocument()
    expect(screen.getByText('Просрочено')).toBeInTheDocument()
  })

  test('displays assignee information when present', () => {
    const wishWithAssignee = { 
      ...baseWish, 
      status: 'in_progress' as const,
      assignee_id: 'user3',
      assignee: { id: 'user3', username: 'assignee1', email: 'assignee@test.com', created_at: '', updated_at: '' }
    }

    render(
      <TestWrapper>
        <WishCard wish={wishWithAssignee} />
      </TestWrapper>
    )

    expect(screen.getByText('Исполнитель: assignee1')).toBeInTheDocument()
  })
})