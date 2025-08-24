import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { TransactionProvider, useTransactions } from '@/contexts/TransactionContext'
import { AuthContext } from '@/contexts/AuthContext'

// Mock Supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          order: jest.fn(() => ({
            range: jest.fn(() => Promise.resolve({ data: [], error: null, count: 0 }))
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

// Simple test component to verify context works
function TestComponent() {
  const { formatCurrency, formatTransactionType, formatDate } = useTransactions()
  
  return (
    <div>
      <div data-testid="green-currency">{formatCurrency('green').name}</div>
      <div data-testid="earn-type">{formatTransactionType('earn').name}</div>
      <div data-testid="recent-date">{formatDate(new Date().toISOString())}</div>
    </div>
  )
}

describe('Transaction System Integration', () => {
  it('provides transaction context functionality', () => {
    const authContextValue = {
      user: mockUser,
      loading: false,
      signIn: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn()
    }

    render(
      <AuthContext.Provider value={authContextValue}>
        <TransactionProvider>
          <TestComponent />
        </TransactionProvider>
      </AuthContext.Provider>
    )

    expect(screen.getByTestId('green-currency')).toHaveTextContent('Зеленые')
    expect(screen.getByTestId('earn-type')).toHaveTextContent('Заработок')
    expect(screen.getByTestId('recent-date')).toHaveTextContent('Только что')
  })

  it('throws error when used outside provider', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
    
    expect(() => {
      render(<TestComponent />)
    }).toThrow('useTransactions must be used within a TransactionProvider')

    consoleSpy.mockRestore()
  })
})