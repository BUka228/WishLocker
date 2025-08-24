import React from 'react'
import { renderHook, act, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { TransactionProvider, useTransactions } from '@/contexts/TransactionContext'
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
              ilike: jest.fn(() => ({
                gte: jest.fn(() => ({
                  lte: jest.fn(() => Promise.resolve({ data: [], error: null, count: 0 }))
                }))
              }))
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
    created_at: '2024-01-02T00:00:00Z'
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

const wrapper = ({ children }: { children: React.ReactNode }) => {
  const authContextValue = {
    user: mockUser,
    loading: false,
    signIn: jest.fn(),
    signUp: jest.fn(),
    signOut: jest.fn()
  }

  return (
    <AuthContext.Provider value={authContextValue}>
      <TransactionProvider>
        {children}
      </TransactionProvider>
    </AuthContext.Provider>
  )
}

describe('TransactionContext', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('provides initial state', () => {
    const { result } = renderHook(() => useTransactions(), { wrapper })

    expect(result.current.transactions).toEqual([])
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBe(null)
    expect(result.current.currentPage).toBe(1)
    expect(result.current.totalCount).toBe(0)
    expect(result.current.totalPages).toBe(0)
    expect(result.current.filters).toEqual({
      currency: 'all',
      type: 'all',
      search: ''
    })
  })

  it('fetches transactions successfully', async () => {
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

    const { result } = renderHook(() => useTransactions(), { wrapper })

    await act(async () => {
      await result.current.fetchTransactions()
    })

    await waitFor(() => {
      expect(result.current.transactions).toEqual(mockTransactions)
      expect(result.current.totalCount).toBe(mockTransactions.length)
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBe(null)
    })
  })

  it('handles fetch error', async () => {
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

    const { result } = renderHook(() => useTransactions(), { wrapper })

    await act(async () => {
      await result.current.fetchTransactions()
    })

    await waitFor(() => {
      expect(result.current.transactions).toEqual([])
      expect(result.current.error).toBe('Ошибка загрузки истории транзакций')
      expect(result.current.loading).toBe(false)
    })
  })

  it('applies filters correctly', async () => {
    const mockQuery = {
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          order: jest.fn(() => ({
            range: jest.fn(() => ({
              ilike: jest.fn(() => Promise.resolve({ 
                data: [], 
                error: null, 
                count: 0 
              }))
            }))
          }))
        }))
      }))
    }
    
    ;(supabase.from as jest.Mock).mockReturnValue(mockQuery)

    const { result } = renderHook(() => useTransactions(), { wrapper })

    await act(async () => {
      result.current.setFilters({
        currency: 'green',
        type: 'earn',
        search: 'test'
      })
    })

    await act(async () => {
      await result.current.fetchTransactions()
    })

    await waitFor(() => {
      expect(mockQuery.eq).toHaveBeenCalledWith('currency', 'green')
      expect(mockQuery.eq).toHaveBeenCalledWith('type', 'earn')
      expect(mockQuery.ilike).toHaveBeenCalledWith('description', '%test%')
    })
  })

  it('handles pagination correctly', async () => {
    const mockQuery = {
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          order: jest.fn(() => ({
            range: jest.fn(() => Promise.resolve({ 
              data: mockTransactions, 
              error: null, 
              count: 50 
            }))
          }))
        }))
      }))
    }
    
    ;(supabase.from as jest.Mock).mockReturnValue(mockQuery)

    const { result } = renderHook(() => useTransactions(), { wrapper })

    await act(async () => {
      result.current.setCurrentPage(2)
    })

    await act(async () => {
      await result.current.fetchTransactions()
    })

    await waitFor(() => {
      expect(mockQuery.range).toHaveBeenCalledWith(20, 39) // Page 2: items 20-39
      expect(result.current.totalPages).toBe(3) // 50 items / 20 per page = 3 pages
    })
  })

  it('resets to first page when filters change', async () => {
    const { result } = renderHook(() => useTransactions(), { wrapper })

    await act(async () => {
      result.current.setCurrentPage(3)
    })

    expect(result.current.currentPage).toBe(3)

    await act(async () => {
      result.current.setFilters({ currency: 'blue' })
    })

    expect(result.current.currentPage).toBe(1)
  })

  it('calculates transaction stats correctly', async () => {
    const mockQuery = {
      select: jest.fn(() => ({
        eq: jest.fn(() => Promise.resolve({ 
          data: mockTransactions, 
          error: null 
        }))
      }))
    }
    
    ;(supabase.from as jest.Mock).mockReturnValue(mockQuery)

    const { result } = renderHook(() => useTransactions(), { wrapper })

    let stats
    await act(async () => {
      stats = await result.current.getTransactionStats()
    })

    expect(stats).toEqual({
      totalEarned: { green: 5, blue: 0, red: 0 },
      totalSpent: { green: 1, blue: 0, red: 0 },
      totalConverted: { green: 0, blue: 1, red: 0 },
      transactionCount: 3
    })
  })

  it('formats currency correctly', () => {
    const { result } = renderHook(() => useTransactions(), { wrapper })

    expect(result.current.formatCurrency('green')).toEqual({
      emoji: '💚',
      name: 'Зеленые'
    })

    expect(result.current.formatCurrency('blue')).toEqual({
      emoji: '💙',
      name: 'Синие'
    })

    expect(result.current.formatCurrency('red')).toEqual({
      emoji: '❤️',
      name: 'Красные'
    })
  })

  it('formats transaction type correctly', () => {
    const { result } = renderHook(() => useTransactions(), { wrapper })

    expect(result.current.formatTransactionType('earn')).toEqual({
      name: 'Заработок',
      color: 'text-green-600',
      sign: '+'
    })

    expect(result.current.formatTransactionType('spend')).toEqual({
      name: 'Трата',
      color: 'text-red-600',
      sign: '-'
    })

    expect(result.current.formatTransactionType('convert')).toEqual({
      name: 'Конвертация',
      color: 'text-blue-600',
      sign: '~'
    })
  })

  it('formats dates correctly', () => {
    const { result } = renderHook(() => useTransactions(), { wrapper })

    // Test recent date (30 minutes ago)
    const recentDate = new Date(Date.now() - 30 * 60 * 1000).toISOString()
    expect(result.current.formatDate(recentDate)).toBe('Только что')

    // Test yesterday
    const yesterday = new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString()
    expect(result.current.formatDate(yesterday)).toBe('Вчера')

    // Test older date
    const oldDate = new Date('2024-01-01').toISOString()
    expect(result.current.formatDate(oldDate)).toMatch(/\d+ \w+/)
  })

  it('throws error when used outside provider', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
    
    expect(() => {
      renderHook(() => useTransactions())
    }).toThrow('useTransactions must be used within a TransactionProvider')

    consoleSpy.mockRestore()
  })

  it('refreshes transactions', async () => {
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

    const { result } = renderHook(() => useTransactions(), { wrapper })

    await act(async () => {
      await result.current.refreshTransactions()
    })

    expect(mockQuery.select).toHaveBeenCalled()
  })
})