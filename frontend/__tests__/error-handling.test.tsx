import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { ErrorBoundary, WishErrorBoundary, WalletErrorBoundary, SocialErrorBoundary } from '../components/error/ErrorBoundary'
import { ErrorHandler } from '../lib/error-handler'
import { useFormValidation } from '../hooks/useFormValidation'
import { validateEmail, validatePassword, validateUsername, validateWishTitle } from '../lib/validation'
import { ToastProvider } from '../components/ui/Toast'

// Mock component that throws an error
const ThrowError = ({ shouldThrow = false }: { shouldThrow?: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error')
  }
  return <div>No error</div>
}

// Test component for form validation
const TestForm = () => {
  const {
    getFieldProps,
    handleSubmit,
    isValid,
    getErrors,
    isSubmitting
  } = useFormValidation({
    initialValues: {
      email: '',
      password: '',
      username: ''
    },
    validationRules: {
      email: validateEmail,
      password: validatePassword,
      username: validateUsername
    },
    validateOnBlur: true
  })

  const onSubmit = async (values: Record<string, any>) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 100))
  }

  const errors = getErrors()

  return (
    <form onSubmit={(e) => {
      e.preventDefault()
      handleSubmit(onSubmit)
    }}>
      <input
        {...getFieldProps('email')}
        data-testid="email-input"
        placeholder="Email"
      />
      {getFieldProps('email').error && (
        <div data-testid="email-error">{getFieldProps('email').error}</div>
      )}
      
      <input
        {...getFieldProps('password')}
        data-testid="password-input"
        placeholder="Password"
      />
      {getFieldProps('password').error && (
        <div data-testid="password-error">{getFieldProps('password').error}</div>
      )}
      
      <input
        {...getFieldProps('username')}
        data-testid="username-input"
        placeholder="Username"
      />
      {getFieldProps('username').error && (
        <div data-testid="username-error">{getFieldProps('username').error}</div>
      )}
      
      <button type="submit" disabled={!isValid || isSubmitting}>
        Submit
      </button>
      
      <div data-testid="form-valid">{isValid.toString()}</div>
      <div data-testid="form-errors">{JSON.stringify(errors)}</div>
    </form>
  )
}

describe('Error Handling System', () => {
  describe('ErrorBoundary', () => {
    // Suppress console.error for these tests
    const originalError = console.error
    beforeAll(() => {
      console.error = jest.fn()
    })
    afterAll(() => {
      console.error = originalError
    })

    it('renders children when there is no error', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>
      )
      
      expect(screen.getByText('No error')).toBeInTheDocument()
    })

    it('renders error UI when child component throws', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )
      
      expect(screen.getByText('Что-то пошло не так')).toBeInTheDocument()
      expect(screen.getByText('Попробовать снова')).toBeInTheDocument()
      expect(screen.getByText('На главную')).toBeInTheDocument()
    })

    it('renders custom fallback when provided', () => {
      const customFallback = <div>Custom error message</div>
      
      render(
        <ErrorBoundary fallback={customFallback}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )
      
      expect(screen.getByText('Custom error message')).toBeInTheDocument()
    })

    it('calls onError callback when error occurs', () => {
      const onError = jest.fn()
      
      render(
        <ErrorBoundary onError={onError}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )
      
      expect(onError).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({
          componentStack: expect.any(String)
        })
      )
    })
  })

  describe('Specialized Error Boundaries', () => {
    const originalError = console.error
    beforeAll(() => {
      console.error = jest.fn()
    })
    afterAll(() => {
      console.error = originalError
    })

    it('WishErrorBoundary shows wish-specific error message', () => {
      render(
        <WishErrorBoundary>
          <ThrowError shouldThrow={true} />
        </WishErrorBoundary>
      )
      
      expect(screen.getByText('Ошибка загрузки желаний')).toBeInTheDocument()
    })

    it('WalletErrorBoundary shows wallet-specific error message', () => {
      render(
        <WalletErrorBoundary>
          <ThrowError shouldThrow={true} />
        </WalletErrorBoundary>
      )
      
      expect(screen.getByText('Ошибка загрузки кошелька')).toBeInTheDocument()
    })

    it('SocialErrorBoundary shows social-specific error message', () => {
      render(
        <SocialErrorBoundary>
          <ThrowError shouldThrow={true} />
        </SocialErrorBoundary>
      )
      
      expect(screen.getByText('Ошибка социальных функций')).toBeInTheDocument()
    })
  })

  describe('ErrorHandler', () => {
    it('processes string errors correctly', () => {
      const error = ErrorHandler.processError('Test error message')
      
      expect(error.code).toBe('UNKNOWN_ERROR')
      expect(error.message).toBe('Test error message')
      expect(error.timestamp).toBeDefined()
    })

    it('processes Supabase auth errors correctly', () => {
      const supabaseError = {
        code: 'invalid_credentials',
        message: 'Invalid login credentials'
      }
      
      const error = ErrorHandler.processError(supabaseError)
      
      expect(error.code).toBe('AUTH_ERROR')
      expect(error.message).toBe('Неверный email или пароль')
    })

    it('processes PostgreSQL constraint errors correctly', () => {
      const pgError = {
        code: '23505',
        message: 'duplicate key value violates unique constraint "users_username_key"'
      }
      
      const error = ErrorHandler.processError(pgError)
      
      expect(error.code).toBe('VALIDATION_ERROR')
      expect(error.message).toBe('Это имя пользователя уже занято')
    })

    it('processes business logic errors correctly', () => {
      const businessError = {
        message: 'INSUFFICIENT_FUNDS: Not enough balance'
      }
      
      const error = ErrorHandler.processError(businessError)
      
      expect(error.code).toBe('BUSINESS_LOGIC_ERROR')
      expect(error.message).toBe('Недостаточно средств для выполнения операции')
    })

    it('processes network errors correctly', () => {
      const networkError = {
        message: 'Failed to fetch'
      }
      
      const error = ErrorHandler.processError(networkError)
      
      expect(error.code).toBe('NETWORK_ERROR')
      expect(error.message).toContain('Проблемы с подключением к интернету')
    })

    it('handles null/undefined errors', () => {
      const error1 = ErrorHandler.processError(null)
      const error2 = ErrorHandler.processError(undefined)
      
      expect(error1.code).toBe('UNKNOWN_ERROR')
      expect(error1.message).toBe('Произошла неизвестная ошибка')
      expect(error2.code).toBe('UNKNOWN_ERROR')
      expect(error2.message).toBe('Произошла неизвестная ошибка')
    })
  })

  describe('Form Validation Hook', () => {
    it('validates fields on blur', async () => {
      render(
        <ToastProvider>
          <TestForm />
        </ToastProvider>
      )
      
      const emailInput = screen.getByTestId('email-input')
      
      // Enter invalid email and blur
      fireEvent.change(emailInput, { target: { value: 'invalid-email' } })
      fireEvent.blur(emailInput)
      
      await waitFor(() => {
        expect(screen.getByTestId('email-error')).toHaveTextContent('Неверный формат email')
      })
    })

    it('validates username correctly', async () => {
      render(
        <ToastProvider>
          <TestForm />
        </ToastProvider>
      )
      
      const usernameInput = screen.getByTestId('username-input')
      
      // Test too short username
      fireEvent.change(usernameInput, { target: { value: 'ab' } })
      fireEvent.blur(usernameInput)
      
      await waitFor(() => {
        expect(screen.getByTestId('username-error')).toHaveTextContent('Имя пользователя должно содержать минимум 3 символа')
      })
      
      // Test valid username
      fireEvent.change(usernameInput, { target: { value: 'validuser' } })
      fireEvent.blur(usernameInput)
      
      await waitFor(() => {
        expect(screen.queryByTestId('username-error')).not.toBeInTheDocument()
      })
    })

    it('validates password correctly', async () => {
      render(
        <ToastProvider>
          <TestForm />
        </ToastProvider>
      )
      
      const passwordInput = screen.getByTestId('password-input')
      
      // Test too short password
      fireEvent.change(passwordInput, { target: { value: '123' } })
      fireEvent.blur(passwordInput)
      
      await waitFor(() => {
        expect(screen.getByTestId('password-error')).toHaveTextContent('Пароль должен содержать минимум 6 символов')
      })
      
      // Test valid password
      fireEvent.change(passwordInput, { target: { value: 'validpassword' } })
      fireEvent.blur(passwordInput)
      
      await waitFor(() => {
        expect(screen.queryByTestId('password-error')).not.toBeInTheDocument()
      })
    })

    it('updates form validity based on field validation', async () => {
      render(
        <ToastProvider>
          <TestForm />
        </ToastProvider>
      )
      
      // Initially form should be invalid
      expect(screen.getByTestId('form-valid')).toHaveTextContent('false')
      
      // Fill in valid values
      fireEvent.change(screen.getByTestId('email-input'), { target: { value: 'test@example.com' } })
      fireEvent.change(screen.getByTestId('password-input'), { target: { value: 'validpassword' } })
      fireEvent.change(screen.getByTestId('username-input'), { target: { value: 'validuser' } })
      
      // Blur all fields to trigger validation
      fireEvent.blur(screen.getByTestId('email-input'))
      fireEvent.blur(screen.getByTestId('password-input'))
      fireEvent.blur(screen.getByTestId('username-input'))
      
      await waitFor(() => {
        expect(screen.getByTestId('form-valid')).toHaveTextContent('true')
      })
    })
  })

  describe('Validation Functions', () => {
    describe('validateEmail', () => {
      it('validates correct email formats', () => {
        expect(validateEmail('test@example.com').isValid).toBe(true)
        expect(validateEmail('user.name@domain.co.uk').isValid).toBe(true)
        expect(validateEmail('test+tag@gmail.com').isValid).toBe(true)
      })

      it('rejects invalid email formats', () => {
        expect(validateEmail('invalid-email').isValid).toBe(false)
        expect(validateEmail('test@').isValid).toBe(false)
        expect(validateEmail('@domain.com').isValid).toBe(false)
        expect(validateEmail('').isValid).toBe(false)
      })

      it('provides warnings for common typos', () => {
        const result = validateEmail('test@gmial.com')
        expect(result.isValid).toBe(true)
        expect(result.warnings).toContain('Возможно, вы имели в виду gmail.com?')
      })
    })

    describe('validateUsername', () => {
      it('validates correct usernames', () => {
        expect(validateUsername('validuser').isValid).toBe(true)
        expect(validateUsername('user123').isValid).toBe(true)
        expect(validateUsername('user-name').isValid).toBe(true)
        expect(validateUsername('user_name').isValid).toBe(true)
      })

      it('rejects invalid usernames', () => {
        expect(validateUsername('ab').isValid).toBe(false) // too short
        expect(validateUsername('a'.repeat(21)).isValid).toBe(false) // too long
        expect(validateUsername('-username').isValid).toBe(false) // starts with special char
        expect(validateUsername('username-').isValid).toBe(false) // ends with special char
        expect(validateUsername('user--name').isValid).toBe(false) // consecutive special chars
        expect(validateUsername('user@name').isValid).toBe(false) // invalid character
        expect(validateUsername('admin').isValid).toBe(false) // reserved username
      })
    })

    describe('validateWishTitle', () => {
      it('validates correct wish titles', () => {
        expect(validateWishTitle('Valid wish title').isValid).toBe(true)
        expect(validateWishTitle('Сделай мне чай').isValid).toBe(true)
      })

      it('rejects invalid wish titles', () => {
        expect(validateWishTitle('').isValid).toBe(false) // empty
        expect(validateWishTitle('ab').isValid).toBe(false) // too short
        expect(validateWishTitle('a'.repeat(101)).isValid).toBe(false) // too long
        expect(validateWishTitle('спам реклама').isValid).toBe(false) // inappropriate content
      })
    })
  })
})