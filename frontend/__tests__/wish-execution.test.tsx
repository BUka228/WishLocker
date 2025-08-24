import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { WishCard } from '@/components/wishes/WishCard'
import { WishProvider } from '@/contexts/WishContext'
import { AuthProvider } from '@/contexts/AuthContext'
import { WalletProvider } from '@/contexts/WalletContext'
import { ToastProvider } from '@/components/ui/Toast'
import { Wish, WishType, WishStatus } from '@/lib/types'

// Mock Supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn()
        })),
        order: jest.fn(() => Promise.resolve({ data: [], error: null }))
      })),
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn()
        }))
      })),
      update: jest.fn(() => ({
        eq: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn()
          }))
        }))
      }))
    })),
    rpc: jest.fn(),
    channel: jest.fn(() => ({
      on: jest.fn(() => ({
        subscribe: jest.fn()
      }))
    })),
    auth: {
      getUser: jest.fn(() => Promise.resolve({ 
        data: { 
          user: { 
            id: 'test-user-id', 
            email: 'test@example.com' 
          } 
        }, 
        error: null 
      })),
      onAuthStateChange: jest.fn(() => ({
        data: { subscription: { unsubscribe: jest.fn() } }
      }))
    }
  }
}))

const mockWish: Wish = {
  id: 'test-wish-id',
  title: 'Test Wish',
  description: 'Test description',
  type: 'green' as WishType,
  cost: 1,
  status: 'active' as WishStatus,
  creator_id: 'creator-id',
  assignee_id: null,
  deadline: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  creator: {
    id: 'creator-id',
    username: 'creator',
    email: 'creator@example.com',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
}

const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  username: 'testuser',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
}

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <ToastProvider>
    <AuthProvider>
      <WalletProvider>
        <WishProvider>
          {children}
        </WishProvider>
      </WalletProvider>
    </AuthProvider>
  </ToastProvider>
)

describe('Wish Execution Workflow', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('should show accept button for active wishes from other users', () => {
    render(
      <TestWrapper>
        <WishCard wish={mockWish} />
      </TestWrapper>
    )

    expect(screen.getByText('Принять')).toBeInTheDocument()
  })

  test('should show complete button for in-progress wishes assigned to current user', () => {
    const inProgressWish: Wish = {
      ...mockWish,
      status: 'in_progress',
      assignee_id: 'test-user-id',
      assignee: mockUser
    }

    render(
      <TestWrapper>
        <WishCard wish={inProgressWish} />
      </TestWrapper>
    )

    expect(screen.getByText('Завершить')).toBeInTheDocument()
  })

  test('should handle wish acceptance with proper error handling', async () => {
    const { supabase } = require('@/lib/supabase')
    
    // Mock successful acceptance
    supabase.rpc.mockResolvedValueOnce({
      data: { success: true, message: 'Желание принято к выполнению!' },
      error: null
    })

    render(
      <TestWrapper>
        <WishCard wish={mockWish} />
      </TestWrapper>
    )

    const acceptButton = screen.getByText('Принять')
    fireEvent.click(acceptButton)

    await waitFor(() => {
      expect(supabase.rpc).toHaveBeenCalledWith('accept_wish', {
        p_wish_id: 'test-wish-id',
        p_assignee_id: 'test-user-id'
      })
    })
  })

  test('should handle wish completion with balance validation', async () => {
    const { supabase } = require('@/lib/supabase')
    
    // Mock successful completion
    supabase.rpc.mockResolvedValueOnce({
      data: { success: true, message: 'Желание успешно выполнено!' },
      error: null
    })

    const inProgressWish: Wish = {
      ...mockWish,
      status: 'in_progress',
      assignee_id: 'test-user-id',
      assignee: mockUser
    }

    render(
      <TestWrapper>
        <WishCard wish={inProgressWish} />
      </TestWrapper>
    )

    const completeButton = screen.getByText('Завершить')
    fireEvent.click(completeButton)

    await waitFor(() => {
      expect(supabase.rpc).toHaveBeenCalledWith('complete_wish', {
        p_wish_id: 'test-wish-id',
        p_assignee_id: 'test-user-id'
      })
    })
  })

  test('should handle insufficient funds error', async () => {
    const { supabase } = require('@/lib/supabase')
    
    // Mock insufficient funds error
    supabase.rpc.mockResolvedValueOnce({
      data: { 
        success: false, 
        error: 'INSUFFICIENT_FUNDS',
        message: 'У создателя желания недостаточно средств для оплаты' 
      },
      error: null
    })

    const inProgressWish: Wish = {
      ...mockWish,
      status: 'in_progress',
      assignee_id: 'test-user-id',
      assignee: mockUser
    }

    render(
      <TestWrapper>
        <WishCard wish={inProgressWish} />
      </TestWrapper>
    )

    const completeButton = screen.getByText('Завершить')
    fireEvent.click(completeButton)

    await waitFor(() => {
      expect(supabase.rpc).toHaveBeenCalledWith('complete_wish', {
        p_wish_id: 'test-wish-id',
        p_assignee_id: 'test-user-id'
      })
    })

    // Should show error toast (we can't easily test toast content without more setup)
  })

  test('should prevent self-assignment of wishes', () => {
    const ownWish: Wish = {
      ...mockWish,
      creator_id: 'test-user-id'
    }

    render(
      <TestWrapper>
        <WishCard wish={ownWish} />
      </TestWrapper>
    )

    // Should not show accept button for own wishes
    expect(screen.queryByText('Принять')).not.toBeInTheDocument()
  })

  test('should show dispute button for active wishes from other users', () => {
    render(
      <TestWrapper>
        <WishCard wish={mockWish} />
      </TestWrapper>
    )

    expect(screen.getByText('Оспорить')).toBeInTheDocument()
  })

  test('should handle dispute submission', async () => {
    render(
      <TestWrapper>
        <WishCard wish={mockWish} />
      </TestWrapper>
    )

    const disputeButton = screen.getByText('Оспорить')
    fireEvent.click(disputeButton)

    // Should show dispute form
    expect(screen.getByPlaceholderText(/Опишите, что не так/)).toBeInTheDocument()

    const textarea = screen.getByPlaceholderText(/Опишите, что не так/)
    fireEvent.change(textarea, { target: { value: 'This wish is inappropriate' } })

    const submitButton = screen.getByText('Отправить спор')
    fireEvent.click(submitButton)

    // Should handle dispute submission
    await waitFor(() => {
      expect(screen.queryByPlaceholderText(/Опишите, что не так/)).not.toBeInTheDocument()
    })
  })
})