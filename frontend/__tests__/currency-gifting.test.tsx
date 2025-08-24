import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { CurrencyGift } from '@/components/wallet/CurrencyGift'
import { WalletProvider } from '@/contexts/WalletContext'
import { SocialProvider } from '@/contexts/SocialContext'
import { AuthProvider } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'

// Mock Supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    rpc: jest.fn(),
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(),
        })),
      })),
    })),
    channel: jest.fn(() => ({
      on: jest.fn(() => ({
        subscribe: jest.fn(),
      })),
    })),
  },
}))

// Mock contexts
const mockUser = {
  id: 'user-1',
  email: 'test@example.com',
  username: 'testuser',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
}

const mockWallet = {
  id: 'wallet-1',
  user_id: 'user-1',
  green_balance: 10,
  blue_balance: 5,
  red_balance: 2,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
}

const mockFriends = [
  {
    id: 'friend-1',
    email: 'friend1@example.com',
    username: 'friend1',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'friend-2',
    email: 'friend2@example.com',
    username: 'friend2',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
]

// Mock ToastProvider
jest.mock('@/components/ui/Toast', () => ({
  ToastProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  useToast: () => ({
    showToast: jest.fn(),
  }),
}))

const MockProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <AuthProvider>
      <WalletProvider>
        <SocialProvider>
          {children}
        </SocialProvider>
      </WalletProvider>
    </AuthProvider>
  )
}

// Mock the contexts
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: mockUser,
    loading: false,
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

jest.mock('@/contexts/WalletContext', () => ({
  useWallet: () => ({
    wallet: mockWallet,
    loading: false,
    transferCurrency: jest.fn(),
    error: null,
  }),
  WalletProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

jest.mock('@/contexts/SocialContext', () => ({
  useSocial: () => ({
    friends: mockFriends,
    loading: false,
  }),
  SocialProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

describe('CurrencyGift Component', () => {
  const mockOnClose = jest.fn()
  const mockOnSuccess = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders when open', () => {
    render(
      <MockProviders>
        <CurrencyGift
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      </MockProviders>
    )

    expect(screen.getByText('Подарить валюту')).toBeInTheDocument()
    expect(screen.getByText('Выберите друга')).toBeInTheDocument()
  })

  it('does not render when closed', () => {
    render(
      <MockProviders>
        <CurrencyGift
          isOpen={false}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      </MockProviders>
    )

    expect(screen.queryByText('Подарить валюту')).not.toBeInTheDocument()
  })

  it('displays friends list', () => {
    render(
      <MockProviders>
        <CurrencyGift
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      </MockProviders>
    )

    expect(screen.getByText('friend1')).toBeInTheDocument()
    expect(screen.getByText('friend2')).toBeInTheDocument()
  })

  it('allows friend selection', () => {
    render(
      <MockProviders>
        <CurrencyGift
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      </MockProviders>
    )

    const friend1Button = screen.getByText('friend1').closest('button')
    fireEvent.click(friend1Button!)

    expect(friend1Button).toHaveClass('border-purple-500')
  })

  it('displays currency options with balances', () => {
    render(
      <MockProviders>
        <CurrencyGift
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      </MockProviders>
    )

    expect(screen.getByText('Зеленое')).toBeInTheDocument()
    expect(screen.getByText('Синее')).toBeInTheDocument()
    expect(screen.getByText('Красное')).toBeInTheDocument()

    // Check balances are displayed
    expect(screen.getByText('10')).toBeInTheDocument() // Green balance
    expect(screen.getByText('5')).toBeInTheDocument()  // Blue balance
    expect(screen.getByText('2')).toBeInTheDocument()  // Red balance
  })

  it('allows amount adjustment', () => {
    render(
      <MockProviders>
        <CurrencyGift
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      </MockProviders>
    )

    const amountInput = screen.getByDisplayValue('1')
    const increaseButton = screen.getByText('+')
    const decreaseButton = screen.getByText('-')

    // Test increase
    fireEvent.click(increaseButton)
    expect(amountInput).toHaveValue(2)

    // Test decrease
    fireEvent.click(decreaseButton)
    expect(amountInput).toHaveValue(1)

    // Test direct input
    fireEvent.change(amountInput, { target: { value: '5' } })
    expect(amountInput).toHaveValue(5)
  })

  it('disables gift button when no friend selected', () => {
    render(
      <MockProviders>
        <CurrencyGift
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      </MockProviders>
    )

    const giftButton = screen.getByText('Подарить').closest('button')
    expect(giftButton).toBeDisabled()
  })

  it('enables gift button when friend selected and amount valid', () => {
    render(
      <MockProviders>
        <CurrencyGift
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      </MockProviders>
    )

    // Select a friend
    const friend1Button = screen.getByText('friend1').closest('button')
    fireEvent.click(friend1Button!)

    const giftButton = screen.getByText('Подарить').closest('button')
    expect(giftButton).not.toBeDisabled()
  })

  it('shows preview when friend is selected', () => {
    render(
      <MockProviders>
        <CurrencyGift
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      </MockProviders>
    )

    // Select a friend
    const friend1Button = screen.getByText('friend1').closest('button')
    fireEvent.click(friend1Button!)

    expect(screen.getByText(/Вы отправите friend1:/)).toBeInTheDocument()
    expect(screen.getByText(/1 💚 Зеленое/)).toBeInTheDocument()
  })

  it('calls onClose when cancel button clicked', () => {
    render(
      <MockProviders>
        <CurrencyGift
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      </MockProviders>
    )

    const cancelButton = screen.getByText('Отмена')
    fireEvent.click(cancelButton)

    expect(mockOnClose).toHaveBeenCalled()
  })

  it('calls onClose when X button clicked', () => {
    render(
      <MockProviders>
        <CurrencyGift
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      </MockProviders>
    )

    const closeButton = screen.getByRole('button', { name: '' }) // X button
    fireEvent.click(closeButton)

    expect(mockOnClose).toHaveBeenCalled()
  })

  it('shows message when no friends available', () => {
    // Mock empty friends list
    jest.mocked(require('@/contexts/SocialContext').useSocial).mockReturnValue({
      friends: [],
      loading: false,
    })

    render(
      <MockProviders>
        <CurrencyGift
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      </MockProviders>
    )

    expect(screen.getByText('У вас пока нет друзей для отправки подарков')).toBeInTheDocument()
  })

  it('disables currency options with zero balance', () => {
    // Mock wallet with zero red balance
    jest.mocked(require('@/contexts/WalletContext').useWallet).mockReturnValue({
      wallet: { ...mockWallet, red_balance: 0 },
      loading: false,
      transferCurrency: jest.fn(),
      error: null,
    })

    render(
      <MockProviders>
        <CurrencyGift
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      </MockProviders>
    )

    const redCurrencyButton = screen.getByText('Красное').closest('button')
    expect(redCurrencyButton).toBeDisabled()
  })
})