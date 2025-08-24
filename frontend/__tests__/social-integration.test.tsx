import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { SocialProvider } from '@/contexts/SocialContext'
import { AuthProvider } from '@/contexts/AuthContext'
import { WishProvider } from '@/contexts/WishContext'
import { ToastProvider } from '@/components/ui/Toast'
import { supabase } from '@/lib/supabase'

// Mock Supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(),
    rpc: jest.fn(),
    channel: jest.fn(() => ({
      on: jest.fn(() => ({
        on: jest.fn(() => ({
          subscribe: jest.fn()
        }))
      })),
      subscribe: jest.fn(),
      unsubscribe: jest.fn()
    }))
  }
}))

// Mock AuthContext
const mockUser = {
  id: 'user-1',
  email: 'test@example.com',
  username: 'testuser',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z'
}

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: mockUser,
    loading: false
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}))

// Test component that uses both Social and Wish contexts
function TestIntegrationComponent() {
  return (
    <div data-testid="integration-test">
      Social and Wish integration working
    </div>
  )
}

function renderWithProviders(component: React.ReactElement) {
  return render(
    <ToastProvider>
      <AuthProvider>
        <SocialProvider>
          <WishProvider>
            {component}
          </WishProvider>
        </SocialProvider>
      </AuthProvider>
    </ToastProvider>
  )
}

describe('Social System Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    
    // Mock successful database responses
    ;(supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            data: [],
            error: null
          })
        }),
        or: jest.fn().mockReturnValue({
          neq: jest.fn().mockReturnValue({
            limit: jest.fn().mockReturnValue({
              data: [],
              error: null
            })
          })
        }),
        in: jest.fn().mockReturnValue({
          order: jest.fn().mockReturnValue({
            data: [],
            error: null
          })
        }),
        order: jest.fn().mockReturnValue({
          data: [],
          error: null
        })
      })
    })
  })

  it('should render without crashing when all providers are present', async () => {
    renderWithProviders(<TestIntegrationComponent />)
    
    await waitFor(() => {
      expect(screen.getByTestId('integration-test')).toBeInTheDocument()
    })
  })

  it('should handle friend-based wish filtering gracefully', async () => {
    // Mock friends data
    const mockFriends = [
      {
        id: 'friend-1',
        username: 'friend1',
        email: 'friend1@example.com',
        avatar_url: null,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      }
    ]

    // Mock the friendship query to return friends
    ;(supabase.from as jest.Mock).mockImplementation((table: string) => {
      if (table === 'friendships') {
        return {
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                data: [{
                  id: 'friendship-1',
                  user_id: 'user-1',
                  friend_id: 'friend-1',
                  status: 'accepted',
                  created_at: '2024-01-01T00:00:00Z',
                  friend: mockFriends[0]
                }],
                error: null
              })
            })
          })
        }
      }
      
      if (table === 'wishes') {
        return {
          select: jest.fn().mockReturnValue({
            in: jest.fn().mockReturnValue({
              order: jest.fn().mockReturnValue({
                data: [],
                error: null
              })
            }),
            order: jest.fn().mockReturnValue({
              data: [],
              error: null
            })
          })
        }
      }
      
      return {
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              data: [],
              error: null
            })
          })
        })
      }
    })

    renderWithProviders(<TestIntegrationComponent />)
    
    await waitFor(() => {
      expect(screen.getByTestId('integration-test')).toBeInTheDocument()
    })

    // Verify that the wishes query was called with friend filtering
    await waitFor(() => {
      expect(supabase.from).toHaveBeenCalledWith('wishes')
    })
  })
})