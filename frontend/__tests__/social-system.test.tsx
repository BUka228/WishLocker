import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { SocialProvider, useSocial } from '@/contexts/SocialContext'
import { AuthProvider } from '@/contexts/AuthContext'
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

// Test component that uses SocialContext
function TestSocialComponent() {
  const { 
    friends, 
    friendRequests, 
    sentRequests, 
    loading, 
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    searchUsers
  } = useSocial()

  return (
    <div>
      <div data-testid="loading">{loading ? 'Loading' : 'Not Loading'}</div>
      <div data-testid="friends-count">{friends.length}</div>
      <div data-testid="requests-count">{friendRequests.length}</div>
      <div data-testid="sent-count">{sentRequests.length}</div>
      
      <button 
        onClick={() => sendFriendRequest('friend-1')}
        data-testid="send-request"
      >
        Send Request
      </button>
      
      <button 
        onClick={() => acceptFriendRequest('request-1')}
        data-testid="accept-request"
      >
        Accept Request
      </button>
      
      <button 
        onClick={() => rejectFriendRequest('request-1')}
        data-testid="reject-request"
      >
        Reject Request
      </button>
      
      <button 
        onClick={() => searchUsers('test')}
        data-testid="search-users"
      >
        Search Users
      </button>
    </div>
  )
}

function renderWithProviders(component: React.ReactElement) {
  return render(
    <AuthProvider>
      <SocialProvider>
        {component}
      </SocialProvider>
    </AuthProvider>
  )
}

describe('SocialContext', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render without crashing', () => {
    renderWithProviders(<TestSocialComponent />)
    expect(screen.getByTestId('loading')).toBeInTheDocument()
  })

  it('should load friendships on mount', async () => {
    const mockFriends = [
      {
        id: 'friendship-1',
        user_id: 'user-1',
        friend_id: 'friend-1',
        status: 'accepted',
        created_at: '2024-01-01T00:00:00Z',
        friend: {
          id: 'friend-1',
          username: 'friend1',
          email: 'friend1@example.com',
          avatar_url: null,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        }
      }
    ]

    const mockRequests = [
      {
        id: 'request-1',
        user_id: 'requester-1',
        friend_id: 'user-1',
        status: 'pending',
        created_at: '2024-01-01T00:00:00Z',
        friend: {
          id: 'requester-1',
          username: 'requester1',
          email: 'requester1@example.com',
          avatar_url: null,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        }
      }
    ]

    const mockSentRequests = [
      {
        id: 'sent-1',
        user_id: 'user-1',
        friend_id: 'target-1',
        status: 'pending',
        created_at: '2024-01-01T00:00:00Z',
        friend: {
          id: 'target-1',
          username: 'target1',
          email: 'target1@example.com',
          avatar_url: null,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        }
      }
    ]

    ;(supabase.from as jest.Mock).mockImplementation((table: string) => {
      if (table === 'friendships') {
        return {
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                data: table === 'friendships' ? 
                  (mockFriends.length > 0 ? mockFriends : mockRequests.length > 0 ? mockRequests : mockSentRequests) : 
                  [],
                error: null
              })
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

    renderWithProviders(<TestSocialComponent />)

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading')
    })
  })

  it('should send friend request', async () => {
    ;(supabase.rpc as jest.Mock).mockResolvedValue({
      data: { success: true, message: 'Запрос в друзья отправлен' },
      error: null
    })

    ;(supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            data: [],
            error: null
          })
        })
      })
    })

    renderWithProviders(<TestSocialComponent />)

    const sendButton = screen.getByTestId('send-request')
    fireEvent.click(sendButton)

    await waitFor(() => {
      expect(supabase.rpc).toHaveBeenCalledWith('send_friend_request', {
        p_user_id: 'user-1',
        p_friend_id: 'friend-1'
      })
    })
  })

  it('should accept friend request', async () => {
    ;(supabase.rpc as jest.Mock).mockResolvedValue({
      data: { success: true, message: 'Запрос в друзья принят' },
      error: null
    })

    ;(supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            data: [],
            error: null
          })
        })
      })
    })

    renderWithProviders(<TestSocialComponent />)

    const acceptButton = screen.getByTestId('accept-request')
    fireEvent.click(acceptButton)

    await waitFor(() => {
      expect(supabase.rpc).toHaveBeenCalledWith('accept_friend_request', {
        p_request_id: 'request-1',
        p_user_id: 'user-1'
      })
    })
  })

  it('should reject friend request', async () => {
    ;(supabase.rpc as jest.Mock).mockResolvedValue({
      data: { success: true, message: 'Запрос в друзья отклонен' },
      error: null
    })

    ;(supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            data: [],
            error: null
          })
        })
      })
    })

    renderWithProviders(<TestSocialComponent />)

    const rejectButton = screen.getByTestId('reject-request')
    fireEvent.click(rejectButton)

    await waitFor(() => {
      expect(supabase.rpc).toHaveBeenCalledWith('reject_friend_request', {
        p_request_id: 'request-1',
        p_user_id: 'user-1'
      })
    })
  })

  it('should search users', async () => {
    const mockSearchResults = [
      {
        id: 'search-1',
        username: 'testuser1',
        email: 'testuser1@example.com',
        avatar_url: null,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      }
    ]

    ;(supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnValue({
        or: jest.fn().mockReturnValue({
          neq: jest.fn().mockReturnValue({
            limit: jest.fn().mockReturnValue({
              data: mockSearchResults,
              error: null
            })
          })
        })
      })
    })

    renderWithProviders(<TestSocialComponent />)

    const searchButton = screen.getByTestId('search-users')
    fireEvent.click(searchButton)

    await waitFor(() => {
      expect(supabase.from).toHaveBeenCalledWith('users')
    })
  })
})