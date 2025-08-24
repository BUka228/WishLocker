import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { NotificationBell } from '@/components/notifications/NotificationBell'
import { NotificationsList } from '@/components/notifications/NotificationsList'
import { NotificationProvider } from '@/contexts/NotificationContext'
import { AuthProvider } from '@/contexts/AuthContext'

// Mock Supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          order: jest.fn(() => ({
            limit: jest.fn(),
          })),
        })),
      })),
      update: jest.fn(() => ({
        eq: jest.fn(),
      })),
    })),
    rpc: jest.fn(),
    channel: jest.fn(() => ({
      on: jest.fn(() => ({
        subscribe: jest.fn(),
      })),
    })),
  },
}))

const mockUser = {
  id: 'user-1',
  email: 'test@example.com',
  username: 'testuser',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
}

const mockNotifications = [
  {
    id: 'notif-1',
    user_id: 'user-1',
    type: 'currency_gift',
    title: 'Получен подарок!',
    message: 'friend1 подарил вам 5 зеленых желаний 💚',
    data: {
      sender_id: 'friend-1',
      sender_username: 'friend1',
      currency: 'green',
      amount: 5,
    },
    read: false,
    created_at: '2024-01-15T10:00:00Z',
  },
  {
    id: 'notif-2',
    user_id: 'user-1',
    type: 'currency_gift',
    title: 'Получен подарок!',
    message: 'friend2 подарил вам 2 синих желания 💙',
    data: {
      sender_id: 'friend-2',
      sender_username: 'friend2',
      currency: 'blue',
      amount: 2,
    },
    read: true,
    created_at: '2024-01-14T15:30:00Z',
  },
]

// Mock contexts
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: mockUser,
    loading: false,
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

jest.mock('@/contexts/NotificationContext', () => ({
  useNotifications: () => ({
    notifications: mockNotifications,
    unreadCount: 1,
    loading: false,
    markAsRead: jest.fn(),
    markAllAsRead: jest.fn(),
    refreshNotifications: jest.fn(),
  }),
  NotificationProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

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
      <NotificationProvider>
        {children}
      </NotificationProvider>
    </AuthProvider>
  )
}

describe('NotificationBell Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders notification bell', () => {
    render(
      <MockProviders>
        <NotificationBell />
      </MockProviders>
    )

    expect(screen.getByTitle('Уведомления')).toBeInTheDocument()
  })

  it('shows unread count badge', () => {
    render(
      <MockProviders>
        <NotificationBell />
      </MockProviders>
    )

    expect(screen.getByText('1')).toBeInTheDocument()
  })

  it('shows 9+ for counts over 9', () => {
    jest.mocked(require('@/contexts/NotificationContext').useNotifications).mockReturnValue({
      notifications: [],
      unreadCount: 15,
      loading: false,
      markAsRead: jest.fn(),
      markAllAsRead: jest.fn(),
      refreshNotifications: jest.fn(),
    })

    render(
      <MockProviders>
        <NotificationBell />
      </MockProviders>
    )

    expect(screen.getByText('9+')).toBeInTheDocument()
  })

  it('does not show badge when no unread notifications', () => {
    jest.mocked(require('@/contexts/NotificationContext').useNotifications).mockReturnValue({
      notifications: [],
      unreadCount: 0,
      loading: false,
      markAsRead: jest.fn(),
      markAllAsRead: jest.fn(),
      refreshNotifications: jest.fn(),
    })

    render(
      <MockProviders>
        <NotificationBell />
      </MockProviders>
    )

    expect(screen.queryByText('0')).not.toBeInTheDocument()
  })

  it('opens notifications list when clicked', () => {
    render(
      <MockProviders>
        <NotificationBell />
      </MockProviders>
    )

    const bellButton = screen.getByTitle('Уведомления')
    fireEvent.click(bellButton)

    expect(screen.getByText('Уведомления')).toBeInTheDocument()
  })
})

describe('NotificationsList Component', () => {
  const mockOnClose = jest.fn()
  const mockMarkAsRead = jest.fn()
  const mockMarkAllAsRead = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    jest.mocked(require('@/contexts/NotificationContext').useNotifications).mockReturnValue({
      notifications: mockNotifications,
      unreadCount: 1,
      loading: false,
      markAsRead: mockMarkAsRead,
      markAllAsRead: mockMarkAllAsRead,
      refreshNotifications: jest.fn(),
    })
  })

  it('renders when open', () => {
    render(
      <MockProviders>
        <NotificationsList isOpen={true} onClose={mockOnClose} />
      </MockProviders>
    )

    expect(screen.getByText('Уведомления')).toBeInTheDocument()
  })

  it('does not render when closed', () => {
    render(
      <MockProviders>
        <NotificationsList isOpen={false} onClose={mockOnClose} />
      </MockProviders>
    )

    expect(screen.queryByText('Уведомления')).not.toBeInTheDocument()
  })

  it('displays notifications', () => {
    render(
      <MockProviders>
        <NotificationsList isOpen={true} onClose={mockOnClose} />
      </MockProviders>
    )

    expect(screen.getByText('friend1 подарил вам 5 зеленых желаний 💚')).toBeInTheDocument()
    expect(screen.getByText('friend2 подарил вам 2 синих желания 💙')).toBeInTheDocument()
  })

  it('shows mark all as read button when there are unread notifications', () => {
    render(
      <MockProviders>
        <NotificationsList isOpen={true} onClose={mockOnClose} />
      </MockProviders>
    )

    expect(screen.getByText('Прочитать все')).toBeInTheDocument()
  })

  it('does not show mark all as read button when no unread notifications', () => {
    jest.mocked(require('@/contexts/NotificationContext').useNotifications).mockReturnValue({
      notifications: mockNotifications.map(n => ({ ...n, read: true })),
      unreadCount: 0,
      loading: false,
      markAsRead: mockMarkAsRead,
      markAllAsRead: mockMarkAllAsRead,
      refreshNotifications: jest.fn(),
    })

    render(
      <MockProviders>
        <NotificationsList isOpen={true} onClose={mockOnClose} />
      </MockProviders>
    )

    expect(screen.queryByText('Прочитать все')).not.toBeInTheDocument()
  })

  it('calls markAsRead when mark as read button clicked', () => {
    render(
      <MockProviders>
        <NotificationsList isOpen={true} onClose={mockOnClose} />
      </MockProviders>
    )

    const markAsReadButtons = screen.getAllByTitle('Отметить как прочитанное')
    fireEvent.click(markAsReadButtons[0])

    expect(mockMarkAsRead).toHaveBeenCalledWith('notif-1')
  })

  it('calls markAllAsRead when mark all as read button clicked', () => {
    render(
      <MockProviders>
        <NotificationsList isOpen={true} onClose={mockOnClose} />
      </MockProviders>
    )

    const markAllButton = screen.getByText('Прочитать все')
    fireEvent.click(markAllButton)

    expect(mockMarkAllAsRead).toHaveBeenCalled()
  })

  it('calls onClose when close button clicked', () => {
    render(
      <MockProviders>
        <NotificationsList isOpen={true} onClose={mockOnClose} />
      </MockProviders>
    )

    const closeButton = screen.getByRole('button', { name: '' }) // X button
    fireEvent.click(closeButton)

    expect(mockOnClose).toHaveBeenCalled()
  })

  it('shows loading state', () => {
    jest.mocked(require('@/contexts/NotificationContext').useNotifications).mockReturnValue({
      notifications: [],
      unreadCount: 0,
      loading: true,
      markAsRead: mockMarkAsRead,
      markAllAsRead: mockMarkAllAsRead,
      refreshNotifications: jest.fn(),
    })

    render(
      <MockProviders>
        <NotificationsList isOpen={true} onClose={mockOnClose} />
      </MockProviders>
    )

    expect(screen.getByRole('status')).toBeInTheDocument() // Loading spinner
  })

  it('shows empty state when no notifications', () => {
    jest.mocked(require('@/contexts/NotificationContext').useNotifications).mockReturnValue({
      notifications: [],
      unreadCount: 0,
      loading: false,
      markAsRead: mockMarkAsRead,
      markAllAsRead: mockMarkAllAsRead,
      refreshNotifications: jest.fn(),
    })

    render(
      <MockProviders>
        <NotificationsList isOpen={true} onClose={mockOnClose} />
      </MockProviders>
    )

    expect(screen.getByText('Нет уведомлений')).toBeInTheDocument()
  })

  it('highlights unread notifications', () => {
    render(
      <MockProviders>
        <NotificationsList isOpen={true} onClose={mockOnClose} />
      </MockProviders>
    )

    const notifications = screen.getAllByText(/подарил вам/)
    const unreadNotification = notifications[0].closest('div')
    const readNotification = notifications[1].closest('div')

    expect(unreadNotification).toHaveClass('bg-blue-50')
    expect(readNotification).not.toHaveClass('bg-blue-50')
  })

  it('shows gift icon for currency gift notifications', () => {
    render(
      <MockProviders>
        <NotificationsList isOpen={true} onClose={mockOnClose} />
      </MockProviders>
    )

    // Gift icons should be present for currency_gift type notifications
    const giftIcons = screen.getAllByTestId('gift-icon') // We'd need to add test-id to the component
    expect(giftIcons).toHaveLength(2)
  })
})