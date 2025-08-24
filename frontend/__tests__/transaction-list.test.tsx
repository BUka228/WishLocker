import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import TransactionList from '@/components/transactions/TransactionList'
import { AuthContext } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'

// Mock Supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          order: jest.fn(() => ({
            limit: jest.fn(() => Promise.resolve({ data: [], error: null }))
          }))
        }))
      }))
    }))
  }
}))

const mockUser = {
  id: 'user-1',
  email: 'test@example.com',
  username: 'testuser',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z'
}

const mockTransactions = [
  {
    id: 'tx-1',
    user_id: 'user-1',
    type: 'earn' as const,
    currency: 'green' as const,
    amount: 5,
    description: 'Стартовый баланс при регистрации',
    related_wish_id: null,
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'tx-2',
    user_id: 'user-1',
    type: 'spend' as const,
    currency: 'blue' as const,
    amount: -1,
    description: 'Создание желания: Помочь с уборкой',
    related_wish_id: 'wish-1',
    created_at: '2024-01-02T00:00:00Z',
    related_wish: {
      id: 'wish-1',
      title: 'Помочь с уборкой',
      type: 'blue' as const
    }
  }
]

const renderWithAuth = (component: React.ReactElement, user = mockUser) => {
  const authContextValue = {
    user,
    loading: false,
    signIn: jest.fn(),
    signUp: jest.fn(),
    signOut: jest.fn()
  }

  return render(
    <AuthContext.Provider value={authContextValue}>
      {component}
    </AuthContext.Provider>
  )
}

describe('TransactionList', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders with default props', async () => {
    const mockQuery = {
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          order: jest.fn(() => ({
            limit: jest.fn(() => Promise.resolve({ 
              data: mockTransactions, 
              error: null 
            }))
          }))
        }))
      }))
    }
    
    ;(supabase.from as jest.Mock).mockReturnValue(mockQuery)

    renderWithAuth(<TransactionList />)

    await waitFor(() => {
      expect(screen.getByText('Последние операции')).toBeInTheDocument()
      expect(screen.getByText('Все операции')).toBeInTheDocument()
    })
  })

  it('renders without header when showHeader is false', async () => {
    const mockQuery = {
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          order: jest.fn(() => ({
            limit: jest.fn(() => Promise.resolve({ 
              data: [], 
              error: null 
            }))
          }))
        }))
      }))
    }
    
    ;(supabase.from as jest.Mock).mockReturnValue(mockQuery)

    renderWithAuth(<TransactionList showHeader={false} />)

    await waitFor(() => {
      expect(screen.queryByText('Последние операции')).not.toBeInTheDocument()
    })
  })

  it('renders without view all link when showViewAll is false', async () => {
    const mockQuery = {
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          order: jest.fn(() => ({
            limit: jest.fn(() => Promise.resolve({ 
              data: [], 
              error: null 
            }))
          }))
        }))
      }))
    }
    
    ;(supabase.from as jest.Mock).mockReturnValue(mockQuery)

    renderWithAuth(<TransactionList showViewAll={false} />)

    await waitFor(() => {
      expect(screen.queryByText('Все операции')).not.toBeInTheDocument()
    })
  })

  it('displays transactions with correct formatting', async () => {
    const mockQuery = {
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          order: jest.fn(() => ({
            limit: jest.fn(() => Promise.resolve({ 
              data: mockTransactions, 
              error: null 
            }))
          }))
        }))
      }))
    }
    
    ;(supabase.from as jest.Mock).mockReturnValue(mockQuery)

    renderWithAuth(<TransactionList />)

    await waitFor(() => {
      expect(screen.getByText('Стартовый баланс при регистрации')).toBeInTheDocument()
      expect(screen.getByText('Создание желания: Помочь с уборкой')).toBeInTheDocument()
      
      // Check currency emojis
      expect(screen.getByText('💚')).toBeInTheDocument()
      expect(screen.getByText('💙')).toBeInTheDocument()
      
      // Check amounts
      expect(screen.getByText('+5')).toBeInTheDocument()
      expect(screen.getByText('-1')).toBeInTheDocument()
    })
  })

  it('filters by currency when currency prop is provided', async () => {
    const mockQuery = {
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          order: jest.fn(() => ({
            limit: jest.fn(() => Promise.resolve({ 
              data: mockTransactions.filter(t => t.currency === 'green'), 
              error: null 
            }))
          }))
        }))
      }))
    }
    
    ;(supabase.from as jest.Mock).mockReturnValue(mockQuery)

    renderWithAuth(<TransactionList currency="green" />)

    await waitFor(() => {
      expect(mockQuery.eq).toHaveBeenCalledWith('currency', 'green')
    })
  })

  it('filters by type when type prop is provided', async () => {
    const mockQuery = {
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          order: jest.fn(() => ({
            limit: jest.fn(() => Promise.resolve({ 
              data: mockTransactions.filter(t => t.type === 'earn'), 
              error: null 
            }))
          }))
        }))
      }))
    }
    
    ;(supabase.from as jest.Mock).mockReturnValue(mockQuery)

    renderWithAuth(<TransactionList type="earn" />)

    await waitFor(() => {
      expect(mockQuery.eq).toHaveBeenCalledWith('type', 'earn')
    })
  })

  it('respects limit prop', async () => {
    const mockQuery = {
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          order: jest.fn(() => ({
            limit: jest.fn(() => Promise.resolve({ 
              data: mockTransactions.slice(0, 3), 
              error: null 
            }))
          }))
        }))
      }))
    }
    
    ;(supabase.from as jest.Mock).mockReturnValue(mockQuery)

    renderWithAuth(<TransactionList limit={3} />)

    await waitFor(() => {
      expect(mockQuery.limit).toHaveBeenCalledWith(3)
    })
  })

  it('shows wish links for transactions with related wishes', async () => {
    const mockQuery = {
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          order: jest.fn(() => ({
            limit: jest.fn(() => Promise.resolve({ 
              data: mockTransactions, 
              error: null 
            }))
          }))
        }))
      }))
    }
    
    ;(supabase.from as jest.Mock).mockReturnValue(mockQuery)

    renderWithAuth(<TransactionList />)

    await waitFor(() => {
      const wishLinks = screen.getAllByTitle('Перейти к желанию')
      expect(wishLinks).toHaveLength(1)
      expect(wishLinks[0].closest('a')).toHaveAttribute('href', '/wishes/wish-1')
    })
  })

  it('shows empty state when no transactions', async () => {
    const mockQuery = {
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          order: jest.fn(() => ({
            limit: jest.fn(() => Promise.resolve({ 
              data: [], 
              error: null 
            }))
          }))
        }))
      }))
    }
    
    ;(supabase.from as jest.Mock).mockReturnValue(mockQuery)

    renderWithAuth(<TransactionList />)

    await waitFor(() => {
      expect(screen.getByText('Нет операций')).toBeInTheDocument()
    })
  })

  it('shows error state', async () => {
    const mockQuery = {
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          order: jest.fn(() => ({
            limit: jest.fn(() => Promise.resolve({ 
              data: null, 
              error: { message: 'Database error' }
            }))
          }))
        }))
      }))
    }
    
    ;(supabase.from as jest.Mock).mockReturnValue(mockQuery)

    renderWithAuth(<TransactionList />)

    await waitFor(() => {
      expect(screen.getByText('Ошибка загрузки транзакций')).toBeInTheDocument()
    })
  })

  it('shows loading state', () => {
    const mockQuery = {
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          order: jest.fn(() => ({
            limit: jest.fn(() => new Promise(() => {})) // Never resolves
          }))
        }))
      }))
    }
    
    ;(supabase.from as jest.Mock).mockReturnValue(mockQuery)

    renderWithAuth(<TransactionList />)

    expect(screen.getAllByRole('generic')).toContain(
      expect.objectContaining({
        className: expect.stringContaining('animate-pulse')
      })
    )
  })

  it('does not render when user is not authenticated', () => {
    renderWithAuth(<TransactionList />, null)
    
    expect(screen.queryByText('Последние операции')).not.toBeInTheDocument()
  })

  it('formats dates correctly', async () => {
    const recentTransaction = {
      ...mockTransactions[0],
      created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString() // 30 minutes ago
    }

    const mockQuery = {
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          order: jest.fn(() => ({
            limit: jest.fn(() => Promise.resolve({ 
              data: [recentTransaction], 
              error: null 
            }))
          }))
        }))
      }))
    }
    
    ;(supabase.from as jest.Mock).mockReturnValue(mockQuery)

    renderWithAuth(<TransactionList />)

    await waitFor(() => {
      expect(screen.getByText('Только что')).toBeInTheDocument()
    })
  })
})