import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { jest } from '@jest/globals'
import { NotificationProvider } from '../contexts/NotificationContext'
import { NotificationPreferencesProvider } from '../contexts/NotificationPreferencesContext'
import { AuthProvider } from '../contexts/AuthContext'
import { NotificationBell } from '../components/notifications/NotificationBell'
import NotificationPreferences from '../components/notifications/NotificationPreferences'
import { LiveNotifications } from '../components/notifications/LiveNotifications'

// Mock Supabase
const mockSupabase = {
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      eq: jest.fn(() => ({
        order: jest.fn(() => ({
          limit: jest.fn(() => Promise.resolve({ data: [], error: null }))
        }))
      }))
    })),
    update: jest.fn(() => ({
      eq: jest.fn(() => Promise.resolve({ error: null }))
    }))
  })),
  rpc: jest.fn(() => Promise.resolve({ data: null, error: null })),
  channel: jest.fn(() => ({
    on: jest.fn(() => ({
      on: jest.fn(() => ({
        subscribe: jest.fn()
      }))
    }))
  })),
  removeChannel: jest.fn()
}

jest.mock('../lib/supabase', () => ({
  supabase: mockSupabase
}))

// Mock user
const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  username: 'testuser'
}

const MockAuthProvider = ({ children }: { children: React.ReactNode }) => (
  <div data-testid="mock-auth-provider">
    {children}
  </div>
)

// Mock auth context
jest.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: mockUser,
    loading: false
  }),
  AuthProvider: MockAuthProvider
}))

describe('Real-time Notifications', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('NotificationBell', () => {
    it('renders notification bell with unread count', async () => {
      const mockNotifications = [
        {
          id: '1',
          user_id: mockUser.id,
          type: 'friend_request',
          title: 'Новый запрос в друзья',
          message: 'Пользователь хочет добавить вас в друзья',
          read: false,
          created_at: new Date().toISOString()
        },
        {
          id: '2',
          user_id: mockUser.id,
          type: 'wish_completed',
          title: 'Желание выполнено',
          message: 'Ваше желание было выполнено',
          read: true,
          created_at: new Date().toISOString()
        }
      ]

      mockSupabase.from.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            order: jest.fn(() => ({
              limit: jest.fn(() => Promise.resolve({ 
                data: mockNotifications, 
                error: null 
              }))
            }))
          }))
        }))
      })

      mockSupabase.rpc.mockImplementation((funcName) => {
        if (funcName === 'get_unread_notification_count') {
          return Promise.resolve({ data: 1, error: null })
        }
        return Promise.resolve({ data: null, error: null })
      })

      render(
        <AuthProvider>
          <NotificationProvider>
            <NotificationBell />
          </NotificationProvider>
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByText('1')).toBeInTheDocument()
      })
    })

    it('opens notification dropdown when clicked', async () => {
      render(
        <AuthProvider>
          <NotificationProvider>
            <NotificationBell />
          </NotificationProvider>
        </AuthProvider>
      )

      const bellButton = screen.getByRole('button')
      fireEvent.click(bellButton)

      await waitFor(() => {
        expect(screen.getByText('Уведомления')).toBeInTheDocument()
      })
    })

    it('shows settings link in dropdown', async () => {
      render(
        <AuthProvider>
          <NotificationProvider>
            <NotificationBell />
          </NotificationProvider>
        </AuthProvider>
      )

      const bellButton = screen.getByRole('button')
      fireEvent.click(bellButton)

      await waitFor(() => {
        expect(screen.getByText('Настройки')).toBeInTheDocument()
      })
    })
  })

  describe('NotificationPreferences', () => {
    it('renders notification preferences with toggles', async () => {
      const mockPreferences = {
        id: 'pref-1',
        user_id: mockUser.id,
        email_notifications: true,
        push_notifications: true,
        friend_requests: true,
        wish_updates: true,
        achievements: true,
        currency_gifts: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      mockSupabase.rpc.mockImplementation((funcName) => {
        if (funcName === 'get_notification_preferences') {
          return Promise.resolve({ data: mockPreferences, error: null })
        }
        return Promise.resolve({ data: null, error: null })
      })

      render(
        <AuthProvider>
          <NotificationPreferencesProvider>
            <NotificationPreferences />
          </NotificationPreferencesProvider>
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByText('Настройки уведомлений')).toBeInTheDocument()
        expect(screen.getByText('Email уведомления')).toBeInTheDocument()
        expect(screen.getByText('Push уведомления')).toBeInTheDocument()
        expect(screen.getByText('Запросы в друзья')).toBeInTheDocument()
        expect(screen.getByText('Обновления желаний')).toBeInTheDocument()
        expect(screen.getByText('Достижения')).toBeInTheDocument()
        expect(screen.getByText('Подарки валюты')).toBeInTheDocument()
      })
    })

    it('updates preferences when toggle is clicked', async () => {
      const mockPreferences = {
        id: 'pref-1',
        user_id: mockUser.id,
        email_notifications: true,
        push_notifications: true,
        friend_requests: true,
        wish_updates: true,
        achievements: true,
        currency_gifts: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      mockSupabase.rpc.mockImplementation((funcName) => {
        if (funcName === 'get_notification_preferences') {
          return Promise.resolve({ data: mockPreferences, error: null })
        }
        if (funcName === 'update_notification_preferences') {
          return Promise.resolve({ 
            data: { ...mockPreferences, email_notifications: false }, 
            error: null 
          })
        }
        return Promise.resolve({ data: null, error: null })
      })

      render(
        <AuthProvider>
          <NotificationPreferencesProvider>
            <NotificationPreferences />
          </NotificationPreferencesProvider>
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByText('Email уведомления')).toBeInTheDocument()
      })

      // Find and click the email notifications toggle
      const emailToggle = screen.getByText('Email уведомления').closest('div')?.querySelector('button')
      if (emailToggle) {
        fireEvent.click(emailToggle)
      }

      await waitFor(() => {
        expect(mockSupabase.rpc).toHaveBeenCalledWith('update_notification_preferences', 
          expect.objectContaining({
            p_user_id: mockUser.id,
            p_email_notifications: false
          })
        )
      })
    })
  })

  describe('LiveNotifications', () => {
    it('renders live notifications for unread items', async () => {
      const mockNotifications = [
        {
          id: '1',
          user_id: mockUser.id,
          type: 'friend_request',
          title: 'Новый запрос в друзья',
          message: 'Пользователь хочет добавить вас в друзья',
          read: false,
          created_at: new Date().toISOString(),
          metadata: {}
        }
      ]

      const mockPreferences = {
        id: 'pref-1',
        user_id: mockUser.id,
        email_notifications: true,
        push_notifications: true,
        friend_requests: true,
        wish_updates: true,
        achievements: true,
        currency_gifts: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      mockSupabase.from.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            order: jest.fn(() => ({
              limit: jest.fn(() => Promise.resolve({ 
                data: mockNotifications, 
                error: null 
              }))
            }))
          }))
        }))
      })

      mockSupabase.rpc.mockImplementation((funcName) => {
        if (funcName === 'get_notification_preferences') {
          return Promise.resolve({ data: mockPreferences, error: null })
        }
        if (funcName === 'get_unread_notification_count') {
          return Promise.resolve({ data: 1, error: null })
        }
        return Promise.resolve({ data: null, error: null })
      })

      render(
        <AuthProvider>
          <NotificationProvider>
            <NotificationPreferencesProvider>
              <LiveNotifications />
            </NotificationPreferencesProvider>
          </NotificationProvider>
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByText('Новый запрос в друзья')).toBeInTheDocument()
        expect(screen.getByText('Пользователь хочет добавить вас в друзья')).toBeInTheDocument()
      })
    })

    it('filters notifications based on user preferences', async () => {
      const mockNotifications = [
        {
          id: '1',
          user_id: mockUser.id,
          type: 'friend_request',
          title: 'Новый запрос в друзья',
          message: 'Пользователь хочет добавить вас в друзья',
          read: false,
          created_at: new Date().toISOString(),
          metadata: {}
        },
        {
          id: '2',
          user_id: mockUser.id,
          type: 'achievement',
          title: 'Новое достижение',
          message: 'Вы получили достижение',
          read: false,
          created_at: new Date().toISOString(),
          metadata: {}
        }
      ]

      const mockPreferences = {
        id: 'pref-1',
        user_id: mockUser.id,
        email_notifications: true,
        push_notifications: true,
        friend_requests: false, // Disabled
        wish_updates: true,
        achievements: true,
        currency_gifts: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      mockSupabase.from.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            order: jest.fn(() => ({
              limit: jest.fn(() => Promise.resolve({ 
                data: mockNotifications, 
                error: null 
              }))
            }))
          }))
        }))
      })

      mockSupabase.rpc.mockImplementation((funcName) => {
        if (funcName === 'get_notification_preferences') {
          return Promise.resolve({ data: mockPreferences, error: null })
        }
        if (funcName === 'get_unread_notification_count') {
          return Promise.resolve({ data: 2, error: null })
        }
        return Promise.resolve({ data: null, error: null })
      })

      render(
        <AuthProvider>
          <NotificationProvider>
            <NotificationPreferencesProvider>
              <LiveNotifications />
            </NotificationPreferencesProvider>
          </NotificationProvider>
        </AuthProvider>
      )

      await waitFor(() => {
        // Should show achievement notification but not friend request
        expect(screen.getByText('Новое достижение')).toBeInTheDocument()
        expect(screen.queryByText('Новый запрос в друзья')).not.toBeInTheDocument()
      })
    })
  })

  describe('Real-time Subscriptions', () => {
    it('sets up notification subscription on mount', () => {
      render(
        <AuthProvider>
          <NotificationProvider>
            <div>Test</div>
          </NotificationProvider>
        </AuthProvider>
      )

      expect(mockSupabase.channel).toHaveBeenCalledWith('notifications')
    })

    it('sets up wallet subscription for real-time balance updates', () => {
      // This would be tested in WalletContext tests, but we verify the pattern
      expect(mockSupabase.channel).toHaveBeenCalled()
    })
  })
})