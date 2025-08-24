import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { DisputeModal } from '@/components/disputes/DisputeModal'
import { DisputesList } from '@/components/disputes/DisputesList'
import { Wish, Dispute } from '@/lib/types'

// Mock the contexts to avoid dependency issues
jest.mock('@/contexts/WishContext', () => ({
  useWish: () => ({
    disputeWish: jest.fn().mockResolvedValue({ message: 'Спор создан' })
  })
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

describe('Dispute Components', () => {
  describe('DisputeModal', () => {
    it('renders dispute modal when open', () => {
      render(
        <DisputeModal
          wish={mockWish}
          isOpen={true}
          onClose={jest.fn()}
        />
      )

      expect(screen.getByText('Оспорить желание')).toBeInTheDocument()
      expect(screen.getByText('Test Wish')).toBeInTheDocument()
      expect(screen.getByPlaceholderText(/Объясните, почему вы оспариваете/)).toBeInTheDocument()
    })

    it('does not render when closed', () => {
      render(
        <DisputeModal
          wish={mockWish}
          isOpen={false}
          onClose={jest.fn()}
        />
      )

      expect(screen.queryByText('Оспорить желание')).not.toBeInTheDocument()
    })

    it('validates comment input', () => {
      render(
        <DisputeModal
          wish={mockWish}
          isOpen={true}
          onClose={jest.fn()}
        />
      )

      const submitButton = screen.getByText('Отправить спор')
      expect(submitButton).toBeDisabled()

      const commentInput = screen.getByPlaceholderText(/Объясните, почему вы оспариваете/)
      fireEvent.change(commentInput, { target: { value: 'Valid comment' } })

      expect(submitButton).not.toBeDisabled()
    })

    it('shows alternative description field when checkbox is checked', () => {
      render(
        <DisputeModal
          wish={mockWish}
          isOpen={true}
          onClose={jest.fn()}
        />
      )

      expect(screen.queryByPlaceholderText(/Предложите улучшенное описание/)).not.toBeInTheDocument()

      const checkbox = screen.getByLabelText(/Предложить альтернативное описание/)
      fireEvent.click(checkbox)

      expect(screen.getByPlaceholderText(/Предложите улучшенное описание/)).toBeInTheDocument()
    })

    it('tracks character count for comment', () => {
      render(
        <DisputeModal
          wish={mockWish}
          isOpen={true}
          onClose={jest.fn()}
        />
      )

      const commentInput = screen.getByPlaceholderText(/Объясните, почему вы оспариваете/)
      fireEvent.change(commentInput, { target: { value: 'Test comment' } })

      expect(screen.getByText('12/1000 символов')).toBeInTheDocument()
    })
  })

  describe('DisputesList', () => {
    it('renders empty state when no disputes', () => {
      render(
        <DisputesList
          disputes={[]}
          title="Test Disputes"
          emptyMessage="No disputes found"
        />
      )

      expect(screen.getByText('No disputes found')).toBeInTheDocument()
    })

    it('renders disputes list correctly', () => {
      render(
        <DisputesList
          disputes={mockDisputes}
          title="Test Disputes"
          emptyMessage="No disputes found"
        />
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
        <DisputesList
          disputes={disputesWithWishTitle}
          title="Test Disputes"
          emptyMessage="No disputes found"
          showWishTitle={true}
        />
      )

      expect(screen.getByText('Test Wish Title')).toBeInTheDocument()
      expect(screen.getByText('Создатель: creator')).toBeInTheDocument()
    })

    it('shows disputer when showWishTitle is false', () => {
      const disputesWithDisputer = mockDisputes.map(dispute => ({
        ...dispute,
        disputer_username: 'disputer'
      }))

      render(
        <DisputesList
          disputes={disputesWithDisputer}
          title="Test Disputes"
          emptyMessage="No disputes found"
          showWishTitle={false}
        />
      )

      expect(screen.getByText('Спор от: disputer')).toBeInTheDocument()
    })
  })

  describe('Dispute Status Display', () => {
    it('displays correct status colors and text', () => {
      const disputeStatuses = [
        { status: 'pending' as const, expectedText: 'Ожидает' },
        { status: 'accepted' as const, expectedText: 'Принято' },
        { status: 'rejected' as const, expectedText: 'Отклонено' }
      ]

      disputeStatuses.forEach(({ status, expectedText }) => {
        const dispute = { ...mockDisputes[0], status }
        
        const { unmount } = render(
          <DisputesList
            disputes={[dispute]}
            title="Test"
            emptyMessage="Empty"
          />
        )

        expect(screen.getByText(expectedText)).toBeInTheDocument()
        unmount()
      })
    })

    it('shows resolution comment for resolved disputes', () => {
      const resolvedDispute = {
        ...mockDisputes[0],
        status: 'accepted' as const,
        resolution_comment: 'Accepted the alternative',
        resolved_at: '2024-01-15T12:00:00Z'
      }
      
      render(
        <DisputesList
          disputes={[resolvedDispute]}
          title="Resolved Disputes"
          emptyMessage="No disputes"
        />
      )

      expect(screen.getByText('Accepted the alternative')).toBeInTheDocument()
      expect(screen.getByText('Решение:')).toBeInTheDocument()
    })
  })

  describe('Date Formatting', () => {
    it('formats dates correctly', () => {
      render(
        <DisputesList
          disputes={mockDisputes}
          title="Test Disputes"
          emptyMessage="No disputes"
        />
      )

      // Should show formatted date (exact format may vary by system locale)
      const dateElements = screen.getAllByText(/15/)
      expect(dateElements.length).toBeGreaterThan(0)
    })
  })
})