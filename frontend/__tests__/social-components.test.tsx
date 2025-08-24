import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import FriendsList from '@/components/social/FriendsList'
import FriendRequests from '@/components/social/FriendRequests'
import UserSearch from '@/components/social/UserSearch'
import { SocialProvider } from '@/contexts/SocialContext'
import { AuthProvider } from '@/contexts/AuthContext'

// Mock the contexts
const mockSocialContext = {
  friends: [
    {
      id: 'friend-1',
      username: 'friend1',
      email: 'friend1@example.com',
      avatar_url: null,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    }
  ],
  friendRequests: [
    {
      id: 'request-1',
      user_id: 'requester-1',
      friend_id: 'user-1',
      status: 'pending' as const,
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
  ],
  sentRequests: [
    {
      id: 'sent-1',
      user_id: 'user-1',
      friend_id: 'target-1',
      status: 'pending' as const,
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
  ],
  loading: false,
  sendFriendRequest: jest.fn(),
  acceptFriendRequest: jest.fn(),
  rejectFriendRequest: jest.fn(),
  blockUser: jest.fn(),
  unblockUser: jest.fn(),
  searchUsers: jest.fn(),
  refreshFriendships: jest.fn()
}

const mockAuthContext = {
  user: {
    id: 'user-1',
    email: 'test@example.com',
    username: 'testuser',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  loading: false
}

jest.mock('@/contexts/SocialContext', () => ({
  useSocial: () => mockSocialContext,
  SocialProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}))

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => mockAuthContext,
  AuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}))

// Mock Supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    channel: jest.fn(() => ({
      on: jest.fn(() => ({
        on: jest.fn(() => ({
          subscribe: jest.fn()
        }))
      })),
      unsubscribe: jest.fn()
    }))
  }
}))

describe('FriendsList Component', () => {
  it('should render friends list', () => {
    render(<FriendsList />)
    
    expect(screen.getByText('Друзья (1)')).toBeInTheDocument()
    expect(screen.getByText('friend1')).toBeInTheDocument()
    expect(screen.getByText('friend1@example.com')).toBeInTheDocument()
  })

  it('should show empty state when no friends', () => {
    const emptyMockContext = { ...mockSocialContext, friends: [] }
    jest.mocked(require('@/contexts/SocialContext').useSocial).mockReturnValue(emptyMockContext)
    
    render(<FriendsList />)
    
    expect(screen.getByText('Нет друзей')).toBeInTheDocument()
    expect(screen.getByText('Добавьте друзей, чтобы видеть их желания и взаимодействовать с ними')).toBeInTheDocument()
  })

  it('should call blockUser when block button is clicked', async () => {
    render(<FriendsList />)
    
    // Mock window.confirm
    window.confirm = jest.fn(() => true)
    
    const blockButton = screen.getByTitle('Заблокировать пользователя')
    fireEvent.click(blockButton)
    
    expect(window.confirm).toHaveBeenCalledWith('Вы уверены, что хотите заблокировать этого пользователя?')
    expect(mockSocialContext.blockUser).toHaveBeenCalledWith('friend-1')
  })
})

describe('FriendRequests Component', () => {
  it('should render incoming friend requests', () => {
    render(<FriendRequests />)
    
    expect(screen.getByText('Входящие запросы (1)')).toBeInTheDocument()
    expect(screen.getByText('requester1')).toBeInTheDocument()
    expect(screen.getByText('requester1@example.com')).toBeInTheDocument()
  })

  it('should render sent friend requests', () => {
    render(<FriendRequests />)
    
    expect(screen.getByText('Отправленные запросы (1)')).toBeInTheDocument()
    expect(screen.getByText('target1')).toBeInTheDocument()
    expect(screen.getByText('target1@example.com')).toBeInTheDocument()
  })

  it('should call acceptFriendRequest when accept button is clicked', () => {
    render(<FriendRequests />)
    
    const acceptButton = screen.getByTitle('Принять запрос')
    fireEvent.click(acceptButton)
    
    expect(mockSocialContext.acceptFriendRequest).toHaveBeenCalledWith('request-1')
  })

  it('should call rejectFriendRequest when reject button is clicked', () => {
    render(<FriendRequests />)
    
    const rejectButton = screen.getByTitle('Отклонить запрос')
    fireEvent.click(rejectButton)
    
    expect(mockSocialContext.rejectFriendRequest).toHaveBeenCalledWith('request-1')
  })

  it('should show empty state when no requests', () => {
    const emptyMockContext = { 
      ...mockSocialContext, 
      friendRequests: [], 
      sentRequests: [] 
    }
    jest.mocked(require('@/contexts/SocialContext').useSocial).mockReturnValue(emptyMockContext)
    
    render(<FriendRequests />)
    
    expect(screen.getByText('Нет запросов в друзья')).toBeInTheDocument()
    expect(screen.getByText('Здесь будут отображаться входящие и исходящие запросы в друзья')).toBeInTheDocument()
  })
})

describe('UserSearch Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render search input', () => {
    render(<UserSearch />)
    
    expect(screen.getByPlaceholderText('Поиск пользователей по имени или email...')).toBeInTheDocument()
  })

  it('should show empty state initially', () => {
    render(<UserSearch />)
    
    expect(screen.getByText('Поиск друзей')).toBeInTheDocument()
    expect(screen.getByText('Введите имя пользователя или email для поиска новых друзей')).toBeInTheDocument()
  })

  it('should call searchUsers when typing in search input', async () => {
    const mockSearchResults = [
      {
        id: 'search-1',
        username: 'searchuser',
        email: 'searchuser@example.com',
        avatar_url: null,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      }
    ]

    mockSocialContext.searchUsers.mockResolvedValue(mockSearchResults)
    
    render(<UserSearch />)
    
    const searchInput = screen.getByPlaceholderText('Поиск пользователей по имени или email...')
    fireEvent.change(searchInput, { target: { value: 'search' } })
    
    // Wait for debounced search
    await waitFor(() => {
      expect(mockSocialContext.searchUsers).toHaveBeenCalledWith('search')
    }, { timeout: 1000 })
  })

  it('should show no results message when search returns empty', async () => {
    mockSocialContext.searchUsers.mockResolvedValue([])
    
    render(<UserSearch />)
    
    const searchInput = screen.getByPlaceholderText('Поиск пользователей по имени или email...')
    fireEvent.change(searchInput, { target: { value: 'nonexistent' } })
    
    await waitFor(() => {
      expect(screen.getByText('Пользователи не найдены')).toBeInTheDocument()
    }, { timeout: 1000 })
  })
})