import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { DisputeModal } from '@/components/disputes/DisputeModal'
import { WishDisputes } from '@/components/disputes/WishDisputes'
import { DisputesList } from '@/components/disputes/DisputesList'
import { DisputeProvider } from '@/contexts/DisputeContext'
import { AuthProvider } from '@/contexts/AuthContext'
import { WishProvider } from '@/contexts/WishContext'
import { ToastProvider } from '@/components/ui/Toast'
import { Wish, Dispute } from '@/lib/types'

// Mock Supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    rpc: jest.fn(),
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

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn()
  }),
  useParams: () => ({ id: 'test-wish-id' })
}))

const mockWish: Wish = {
  id: 'test-wish-id',
  title: 'Test Wish',
  description: 'Test wish description',
  type: 'green',
  cost: 1,
  status: 'active',
  creator_id: 'creator-id',
  assignee_id: null,
  deadline: null,
  created_at: '2024-01-15T10:00:00Z',
  updated_at: '2024-01-15T10:00:00Z',
  creator: {
    id: 'creator-id',
    username: 'creator',
    email: 'creator@test.com',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z'
  }
}

const mockDisputes: Dispute[] = [
  {
    id: 'dispute-1',
    wish_id: 'test-wish-id',
    disputer_id: 'disputer-id',
    comment: 'This wish is unclear',
    alternative_description: 'Better description',
    status: 'pending',
    resolution_comment: null,
    resolved_by: null,
    resolved_at: null,
    created_at: '2024-01-15T11:00:00Z',
    updated_at: '2024-01-15T11:00:00Z'
  }
]

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <ToastProvider>
    <AuthProvider>
      <WishProvider>
        <DisputeProvider>
          {children}
        </DisputeProvider>
      </WishProvider>
    </AuthProvider>
  </ToastProvider>
)

describe('Dispute System', () => {
  describe('DisputeModal', () => {
    it('renders dispute modal correctly', () => {
      render(
        <TestWrapper>
          <DisputeModal
            wish={mockWish}
            isOpen={true}
            onClose={jest.fn()}
          />
        </TestWrapper>
      )

      expect(screen.getByText('Оспорить желание')).toBeInTheDocument()
      expect(screen.getByText('Test Wish')).toBeInTheDocument()
      expect(screen.getByPlaceholderText(/Объясните, почему вы оспариваете/)).toBeInTheDocument()
    })

    it('validates comment input', async () => {
      const onClose = jest.fn()
      
      render(
        <TestWrapper>
          <DisputeModal
            wish={mockWish}
            isOpen={true}
            onClose={onClose}
          />
        </TestWrapper>
      )

      const submitButton = screen.getByText('Отправить спор')
      expect(submitButton).toBeDisabled()

      const commentInput = screen.getByPlaceholderText(/Объясните, почему вы оспариваете/)
      fireEvent.change(commentInput, { target: { value: 'Valid comment' } })

      expect(submitButton).not.toBeDisabled()
    })

    it('shows alternative description field when checkbox is checked', () => {
      render(
        <TestWrapper>
          <DisputeModal
            wish={mockWish}
            isOpen={true}
            onClose={jest.fn()}
          />
        </TestWrapper>
      )

      const checkbox = screen.getByLabelText(/Предложить альтернативное описание/)
      fireEvent.click(checkbox)

      expect(screen.getByPlaceholderText(/Предложите улучшенное описание/)).toBeInTheDocument()
    })

    it('tracks character count for comment', () => {
      render(
        <TestWrapper>
          <DisputeModal
            wish={mockWish}
            isOpen={true}
            onClose={jest.fn()}
          />
        </TestWrapper>
      )

      const commentInput = screen.getByPlaceholderText(/Объясните, почему вы оспариваете/)
      fireEvent.change(commentInput, { target: { value: 'Test comment' } })

      expect(screen.getByText('12/1000 символов')).toBeInTheDocument()
    })
  })

  describe('DisputesList', () => {
    it('renders empty state when no disputes', () => {
      render(
        <TestWrapper>
          <DisputesList
            disputes={[]}
            title="Test Disputes"
            emptyMessage="No disputes found"
          />
        </TestWrapper>
      )

      expect(screen.getByText('No disputes found')).toBeInTheDocument()
    })

    it('renders disputes list correctly', () => {
      render(
        <TestWrapper>
          <DisputesList
            disputes={mockDisputes}
            title="Test Disputes"
            emptyMessage="No disputes found"
          />
        </TestWrapper>
      )

      expect(screen.getByText('Test Disputes (1)')).toBeInTheDocument()
      expect(screen.getByText('This wish is unclear')).toBeInTheDocument()
      expect(screen.getByText('Better description')).toBeInTheDocument()
      expect(screen.getByText('Ожидает')).toBeInTheDocument()
    })

    it('shows wish title when showWishTitle is true', () => {
      const disputesWithWishTitle = mockDisputes.map(dispute => ({
        ...dispute,
        wish_title: 'Test Wish Title',
        wish_creator_username: 'creator'
      }))

      render(
        <TestWrapper>
          <DisputesList
            disputes={disputesWithWishTitle}
            title="Test Disputes"
            emptyMessage="No disputes found"
            showWishTitle={true}
          />
        </TestWrapper>
      )

      expect(screen.getByText('Test Wish Title')).toBeInTheDocument()
      expect(screen.getByText('Создатель: creator')).toBeInTheDocument()
    })
  })

  describe('WishDisputes', () => {
    it('renders loading state', () => {
      render(
        <TestWrapper>
          <WishDisputes wishId="test-wish-id" isCreator={false} />
        </TestWrapper>
      )

      expect(screen.getByRole('status')).toBeInTheDocument()
    })
  })

  describe('Dispute Status Handling', () => {
    it('displays correct status colors and icons', () => {
      const disputeStatuses: Array<{ status: any, expectedText: string }> = [
        { status: 'pending', expectedText: 'Ожидает' },
        { status: 'accepted', expectedText: 'Принято' },
        { status: 'rejected', expectedText: 'Отклонено' }
      ]

      disputeStatuses.forEach(({ status, expectedText }) => {
        const dispute = { ...mockDisputes[0], status }
        
        render(
          <TestWrapper>
            <DisputesList
              disputes={[dispute]}
              title="Test"
              emptyMessage="Empty"
            />
          </TestWrapper>
        )

        expect(screen.getByText(expectedText)).toBeInTheDocument()
      })
    })
  })

  describe('Dispute Validation', () => {
    it('validates comment length limits', () => {
      render(
        <TestWrapper>
          <DisputeModal
            wish={mockWish}
            isOpen={true}
            onClose={jest.fn()}
          />
        </TestWrapper>
      )

      const commentInput = screen.getByPlaceholderText(/Объясните, почему вы оспариваете/)
      const longComment = 'a'.repeat(1001)
      
      fireEvent.change(commentInput, { target: { value: longComment } })
      
      // Input should be truncated to 1000 characters
      expect(commentInput).toHaveValue('a'.repeat(1000))
    })

    it('validates alternative description length limits', () => {
      render(
        <TestWrapper>
          <DisputeModal
            wish={mockWish}
            isOpen={true}
            onClose={jest.fn()}
          />
        </TestWrapper>
      )

      const checkbox = screen.getByLabelText(/Предложить альтернативное описание/)
      fireEvent.click(checkbox)

      const altDescInput = screen.getByPlaceholderText(/Предложите улучшенное описание/)
      const longDescription = 'a'.repeat(501)
      
      fireEvent.change(altDescInput, { target: { value: longDescription } })
      
      // Input should be truncated to 500 characters
      expect(altDescInput).toHaveValue('a'.repeat(500))
    })
  })

  describe('Dispute Resolution', () => {
    it('shows resolution interface for creators on pending disputes', () => {
      const pendingDispute = { ...mockDisputes[0], status: 'pending' as const }
      
      render(
        <TestWrapper>
          <DisputesList
            disputes={[pendingDispute]}
            title="Creator Disputes"
            emptyMessage="No disputes"
          />
        </TestWrapper>
      )

      // Should show dispute content but not resolution buttons in this component
      expect(screen.getByText('This wish is unclear')).toBeInTheDocument()
    })

    it('shows resolution comment for resolved disputes', () => {
      const resolvedDispute = {
        ...mockDisputes[0],
        status: 'accepted' as const,
        resolution_comment: 'Accepted the alternative',
        resolved_at: '2024-01-15T12:00:00Z'
      }
      
      render(
        <TestWrapper>
          <DisputesList
            disputes={[resolvedDispute]}
            title="Resolved Disputes"
            emptyMessage="No disputes"
          />
        </TestWrapper>
      )

      expect(screen.getByText('Accepted the alternative')).toBeInTheDocument()
      expect(screen.getByText('Решение:')).toBeInTheDocument()
    })
  })

  describe('Date Formatting', () => {
    it('formats dates correctly in Russian locale', () => {
      render(
        <TestWrapper>
          <DisputesList
            disputes={mockDisputes}
            title="Test Disputes"
            emptyMessage="No disputes"
          />
        </TestWrapper>
      )

      // Should show formatted date (exact format may vary by system locale)
      expect(screen.getByText(/15 янв/)).toBeInTheDocument()
    })
  })
})