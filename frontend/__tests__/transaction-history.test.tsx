import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import TransactionHistory from '@/components/transactions/TransactionHistory'
import { TransactionProvider } from '@/contexts/TransactionContext'
import { AuthContext } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'

// Mock Supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          order: jest.fn(() => ({
            range: jest.fn(() => ({
              ilike: jest.fn(() => Promise.resolve({ data: [], error: null, count: 0 }))
            }))
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
    currency: 'green' as const,
    amount: -1,
    description: 'Создание желания: Помочь с покупками',
    related_wish_id: 'wish-1',
    created_at: '2024-01-02T00:00:00Z',
    related_wish: {
      id: 'wish-1',
      title: 'Помочь с покупками',
      type: 'green' as const,
      creator_id: 'user-1',
      assignee_id: null
    }
  },
  {
    id: 'tx-3',
    user_id: 'user-1',
    type: 'convert' as const,
    currency: 'blue' as const,
    amount: 1,
    description: 'Конвертация: 10 зеленых → 1 синее',
    related_wish_id: null,
    created_at: '2024-01-03T00:00:00Z'
  }
]

const renderWithProviders = (component: React.ReactElement) => {
  const authContextValue = {
    user: mockUser,
    loading: false,
    signIn: jest.fn(),
    signUp: jest.fn(),
    signOut: jest.fn()
  }

  return render(
    <AuthContext.Provider value={authContextValue}>
      <TransactionProvider>
        {component}
      </TransactionProvider>
    </AuthContext.Provider>
  )
}

describe('TransactionHistory', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders transaction history header', async () => {
    const mockQuery = {
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          order: jest.fn(() => ({
            range: jest.fn(() => Promise.resolve({ 
              data: mockTransactions, 
              error: null, 
              count: mockTransactions.length 
            }))
          }))
        }))
      }))
    }
    
    ;(supabase.from as jest.Mock).mockReturnValue(mockQuery)

    renderWithProviders(<TransactionHistory />)

    expect(screen.getByText('История транзакций')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Поиск по описанию...')).toBeInTheDocument()
    expect(screen.getByDisplayValue('all')).toBeInTheDocument()
  })

  it('displays transactions correctly', async () => {
    const mockQuery = {
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          order: jest.fn(() => ({
            range: jest.fn(() => Promise.resolve({ 
              data: mockTransactions, 
              error: null, 
              count: mockTransactions.length 
            }))
          }))
        }))
      }))
    }
    
    ;(supabase.from as jest.Mock).mockReturnValue(mockQuery)

    renderWithProviders(<TransactionHistory />)

    await waitFor(() => {
      expect(screen.getByText('Стартовый баланс при регистрации')).toBeInTheDocument()
      expect(screen.getByText('Создание желания: Помочь с покупками')).toBeInTheDocument()
      expect(screen.getByText('Конвертация: 10 зеленых → 1 синее')).toBeInTheDocument()
    })

    // Check transaction types
    expect(screen.getByText('Заработок')).toBeInTheDocument()
    expect(screen.getByText('Трата')).toBeInTheDocument()
    expect(screen.getByText('Конвертация')).toBeInTheDocument()

    // Check amounts with signs
    expect(screen.getByText('+5')).toBeInTheDocument()
    expect(screen.getByText('-1')).toBeInTheDocument()
    expect(screen.getByText('~1')).toBeInTheDocument()
  })

  it('filters transactions by currency', async () => {
    const mockQuery = {
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          order: jest.fn(() => ({
            range: jest.fn(() => Promise.resolve({ 
              data: mockTransactions.filter(t => t.currency === 'green'), 
              error: null, 
              count: 2 
            }))
          }))
        }))
      }))
    }
    
    ;(supabase.from as jest.Mock).mockReturnValue(mockQuery)

    renderWithProviders(<TransactionHistory />)

    const currencyFilter = screen.getByDisplayValue('all')
    fireEvent.change(currencyFilter, { target: { value: 'green' } })

    await waitFor(() => {
      expect(mockQuery.eq).toHaveBeenCalledWith('currency', 'green')
    })
  })

  it('filters transactions by type', async () => {
    const mockQuery = {
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          order: jest.fn(() => ({
            range: jest.fn(() => Promise.resolve({ 
              data: mockTransactions.filter(t => t.type === 'earn'), 
              error: null, 
              count: 1 
            }))
          }))
        }))
      }))
    }
    
    ;(supabase.from as jest.Mock).mockReturnValue(mockQuery)

    renderWithProviders(<TransactionHistory />)

    const typeFilters = screen.getAllByDisplayValue('all')
    const typeFilter = typeFilters[1] // Second select is for type
    fireEvent.change(typeFilter, { target: { value: 'earn' } })

    await waitFor(() => {
      expect(mockQuery.eq).toHaveBeenCalledWith('type', 'earn')
    })
  })

  it('searches transactions by description', async () => {
    const mockQuery = {
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          order: jest.fn(() => ({
            range: jest.fn(() => ({
              ilike: jest.fn(() => Promise.resolve({ 
                data: mockTransactions.filter(t => t.description.includes('Стартовый')), 
                error: null, 
                count: 1 
              }))
            }))
          }))
        }))
      }))
    }
    
    ;(supabase.from as jest.Mock).mockReturnValue(mockQuery)

    renderWithProviders(<TransactionHistory />)

    const searchInput = screen.getByPlaceholderText('Поиск по описанию...')
    fireEvent.change(searchInput, { target: { value: 'Стартовый' } })

    await waitFor(() => {
      expect(mockQuery.ilike).toHaveBeenCalledWith('description', '%Стартовый%')
    })
  })

  it('displays wish links for wish-related transactions', async () => {
    const mockQuery = {
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          order: jest.fn(() => ({
            range: jest.fn(() => Promise.resolve({ 
              data: mockTransactions, 
              error: null, 
              count: mockTransactions.length 
            }))
          }))
        }))
      }))
    }
    
    ;(supabase.from as jest.Mock).mockReturnValue(mockQuery)

    renderWithProviders(<TransactionHistory />)

    await waitFor(() => {
      const wishLinks = screen.getAllByTitle('Перейти к желанию')
      expect(wishLinks).toHaveLength(1) // Only one transaction has related_wish
    })
  })

  it('handles pagination correctly', async () => {
    const manyTransactions = Array.from({ length: 25 }, (_, i) => ({
      ...mockTransactions[0],
      id: `tx-${i}`,
      description: `Transaction ${i}`
    }))

    const mockQuery = {
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          order: jest.fn(() => ({
            range: jest.fn(() => Promise.resolve({ 
              data: manyTransactions.slice(0, 20), 
              error: null, 
              count: 25 
            }))
          }))
        }))
      }))
    }
    
    ;(supabase.from as jest.Mock).mockReturnValue(mockQuery)

    renderWithProviders(<TransactionHistory />)

    await waitFor(() => {
      expect(screen.getByText('Страница 1 из 2')).toBeInTheDocument()
      expect(screen.getByText('Вперед')).toBeInTheDocument()
    })

    const nextButton = screen.getByText('Вперед')
    fireEvent.click(nextButton)

    await waitFor(() => {
      expect(mockQuery.range).toHaveBeenCalledWith(20, 39)
    })
  })

  it('shows empty state when no transactions', async () => {
    const mockQuery = {
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          order: jest.fn(() => ({
            range: jest.fn(() => Promise.resolve({ 
              data: [], 
              error: null, 
              count: 0 
            }))
          }))
        }))
      }))
    }
    
    ;(supabase.from as jest.Mock).mockReturnValue(mockQuery)

    renderWithProviders(<TransactionHistory />)

    await waitFor(() => {
      expect(screen.getByText('У вас пока нет транзакций')).toBeInTheDocument()
    })
  })

  it('shows error state and retry button', async () => {
    const mockQuery = {
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          order: jest.fn(() => ({
            range: jest.fn(() => Promise.resolve({ 
              data: null, 
              error: { message: 'Database error' }, 
              count: 0 
            }))
          }))
        }))
      }))
    }
    
    ;(supabase.from as jest.Mock).mockReturnValue(mockQuery)

    renderWithProviders(<TransactionHistory />)

    await waitFor(() => {
      expect(screen.getByText('Ошибка загрузки истории транзакций')).toBeInTheDocument()
      expect(screen.getByText('Попробовать снова')).toBeInTheDocument()
    })

    const retryButton = screen.getByText('Попробовать снова')
    fireEvent.click(retryButton)

    // Should attempt to fetch again
    expect(mockQuery.select).toHaveBeenCalledTimes(2)
  })

  it('shows loading state', () => {
    const mockQuery = {
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          order: jest.fn(() => ({
            range: jest.fn(() => new Promise(() => {})) // Never resolves
          }))
        }))
      }))
    }
    
    ;(supabase.from as jest.Mock).mockReturnValue(mockQuery)

    renderWithProviders(<TransactionHistory />)

    expect(screen.getAllByRole('generic')).toContain(
      expect.objectContaining({
        className: expect.stringContaining('animate-pulse')
      })
    )
  })
})