import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { WishList } from '@/components/WishList'
import { WishProvider } from '@/contexts/WishContext'
import { AuthProvider } from '@/contexts/AuthContext'

// Mock Supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        order: jest.fn(() => ({
          data: [
            {
              id: '1',
              title: 'Green Wish',
              description: 'A green wish',
              type: 'green',
              cost: 1,
              status: 'active',
              creator_id: 'user2',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              creator: { id: 'user2', username: 'creator1' }
            },
            {
              id: '2',
              title: 'Blue Wish',
              description: 'A blue wish',
              type: 'blue',
              cost: 1,
              status: 'in_progress',
              creator_id: 'user2',
              assignee_id: 'user1',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              creator: { id: 'user2', username: 'creator1' },
              assignee: { id: 'user1', username: 'testuser' }
            },
            {
              id: '3',
              title: 'Red Wish',
              description: 'A red wish',
              type: 'red',
              cost: 1,
              status: 'completed',
              creator_id: 'user2',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              creator: { id: 'user2', username: 'creator1' }
            }
          ],
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

describe('WishList Filtering', () => {
  test('renders all wishes by default', async () => {
    render(
      <TestWrapper>
        <WishList />
      </TestWrapper>
    )

    // Should show all 3 wishes
    expect(await screen.findByText('Green Wish')).toBeInTheDocument()
    expect(screen.getByText('Blue Wish')).toBeInTheDocument()
    expect(screen.getByText('Red Wish')).toBeInTheDocument()
  })

  test('filters wishes by type', async () => {
    render(
      <TestWrapper>
        <WishList />
      </TestWrapper>
    )

    // Wait for wishes to load
    await screen.findByText('Green Wish')

    // Filter by green type
    const typeFilter = screen.getByDisplayValue('all')
    fireEvent.change(typeFilter, { target: { value: 'green' } })

    // Should only show green wish
    expect(screen.getByText('Green Wish')).toBeInTheDocument()
    expect(screen.queryByText('Blue Wish')).not.toBeInTheDocument()
    expect(screen.queryByText('Red Wish')).not.toBeInTheDocument()
  })

  test('filters wishes by status', async () => {
    render(
      <TestWrapper>
        <WishList />
      </TestWrapper>
    )

    // Wait for wishes to load
    await screen.findByText('Green Wish')

    // Filter by active status
    const statusFilters = screen.getAllByDisplayValue('all')
    const statusFilter = statusFilters[1] // Second "all" is for status
    fireEvent.change(statusFilter, { target: { value: 'active' } })

    // Should only show active wish
    expect(screen.getByText('Green Wish')).toBeInTheDocument()
    expect(screen.queryByText('Blue Wish')).not.toBeInTheDocument()
    expect(screen.queryByText('Red Wish')).not.toBeInTheDocument()
  })

  test('shows both type and status filters', async () => {
    render(
      <TestWrapper>
        <WishList />
      </TestWrapper>
    )

    // Should have both filter dropdowns
    expect(screen.getByText('Все типы')).toBeInTheDocument()
    expect(screen.getByText('Все статусы')).toBeInTheDocument()
  })
})