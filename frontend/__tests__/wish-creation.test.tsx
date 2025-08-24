import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { WishForm } from '@/components/wishes/WishForm'
import { WishProvider } from '@/contexts/WishContext'
import { AuthProvider } from '@/contexts/AuthContext'

// Mock Supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        order: jest.fn(() => ({
          data: [],
          error: null
        }))
      })),
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(() => ({
            data: {
              id: '1',
              title: 'Test Wish',
              description: 'Test Description',
              type: 'green',
              cost: 1,
              status: 'active',
              creator_id: 'user1',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            },
            error: null
          }))
        }))
      }))
    }))
  }
}))

// Mock AuthContext
const mockUser = {
  id: 'user1',
  email: 'test@example.com',
  username: 'testuser',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
}

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: mockUser,
    loading: false,
    signIn: jest.fn(),
    signUp: jest.fn(),
    signOut: jest.fn()
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}))

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>
    <WishProvider>
      {children}
    </WishProvider>
  </AuthProvider>
)

describe('Wish Creation', () => {
  test('renders wish form with all required fields', () => {
    render(
      <TestWrapper>
        <WishForm isOpen={true} onClose={() => {}} />
      </TestWrapper>
    )

    expect(screen.getByLabelText(/название желания/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/описание/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/тип желания/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /создать желание/i })).toBeInTheDocument()
  })

  test('validates title length', async () => {
    render(
      <TestWrapper>
        <WishForm isOpen={true} onClose={() => {}} />
      </TestWrapper>
    )

    const titleInput = screen.getByLabelText(/название желания/i)
    const submitButton = screen.getByRole('button', { name: /создать желание/i })

    // Test empty title
    fireEvent.click(submitButton)
    await waitFor(() => {
      expect(screen.getByText(/название желания обязательно/i)).toBeInTheDocument()
    })

    // Test title too long
    const longTitle = 'a'.repeat(101)
    fireEvent.change(titleInput, { target: { value: longTitle } })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/не может превышать 100 символов/i)).toBeInTheDocument()
    })
  })

  test('validates description length', async () => {
    render(
      <TestWrapper>
        <WishForm isOpen={true} onClose={() => {}} />
      </TestWrapper>
    )

    const titleInput = screen.getByLabelText(/название желания/i)
    const descriptionInput = screen.getByLabelText(/описание/i)
    const submitButton = screen.getByRole('button', { name: /создать желание/i })

    // Valid title
    fireEvent.change(titleInput, { target: { value: 'Valid Title' } })
    
    // Test description too long
    const longDescription = 'a'.repeat(501)
    fireEvent.change(descriptionInput, { target: { value: longDescription } })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/не может превышать 500 символов/i)).toBeInTheDocument()
    })
  })

  test('shows character count for title and description', () => {
    render(
      <TestWrapper>
        <WishForm isOpen={true} onClose={() => {}} />
      </TestWrapper>
    )

    const titleInput = screen.getByLabelText(/название желания/i)
    const descriptionInput = screen.getByLabelText(/описание/i)

    // Initial counts
    expect(screen.getByText('0/100')).toBeInTheDocument()
    expect(screen.getByText('0/500')).toBeInTheDocument()

    // Type in title
    fireEvent.change(titleInput, { target: { value: 'Test' } })
    expect(screen.getByText('4/100')).toBeInTheDocument()

    // Type in description
    fireEvent.change(descriptionInput, { target: { value: 'Test description' } })
    expect(screen.getByText('16/500')).toBeInTheDocument()
  })

  test('allows selecting different wish types', () => {
    render(
      <TestWrapper>
        <WishForm isOpen={true} onClose={() => {}} />
      </TestWrapper>
    )

    // Check that all wish types are available
    expect(screen.getByText(/зеленое/i)).toBeInTheDocument()
    expect(screen.getByText(/синее/i)).toBeInTheDocument()
    expect(screen.getByText(/красное/i)).toBeInTheDocument()

    // Check that green is selected by default
    const greenRadio = screen.getByDisplayValue('green')
    expect(greenRadio).toBeChecked()

    // Select blue
    const blueRadio = screen.getByDisplayValue('blue')
    fireEvent.click(blueRadio)
    expect(blueRadio).toBeChecked()
    expect(greenRadio).not.toBeChecked()
  })
})