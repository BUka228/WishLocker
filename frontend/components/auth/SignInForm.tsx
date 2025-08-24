'use client'

import React from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { validateEmail } from '../../lib/validation'
import { useToast } from '../ui/Toast'
import { LoadingButton } from '../ui/LoadingStates'
import { TextInput, FormErrorSummary } from '../ui/FormInputs'
import { useFormValidation } from '../../hooks/useFormValidation'
import { ErrorBoundary } from '../error/ErrorBoundary'

interface SignInFormProps {
  onSuccess?: () => void
  onSwitchToSignUp?: () => void
}

export function SignInForm({ onSuccess, onSwitchToSignUp }: SignInFormProps) {
  const { signIn } = useAuth()
  const { showToast } = useToast()

  const {
    formState,
    isSubmitting,
    submitError,
    getFieldProps,
    handleSubmit,
    isValid,
    getErrors
  } = useFormValidation({
    initialValues: {
      email: '',
      password: ''
    },
    validationRules: {
      email: validateEmail,
      password: (value: string) => {
        if (!value) {
          return { isValid: false, error: 'Пароль обязателен' }
        }
        return { isValid: true }
      }
    },
    validateOnBlur: true,
    showToastOnError: false
  })

  const onSubmit = async (values: Record<string, any>) => {
    try {
      await signIn(values.email, values.password)
      showToast({
        type: 'success',
        title: 'Вход выполнен!',
        message: 'Добро пожаловать обратно!'
      })
      onSuccess?.()
    } catch (error: any) {
      // Error will be handled by the form validation hook
      throw error
    }
  }

  const errors = getErrors()
  const hasFormErrors = Object.keys(errors).length > 0 || submitError

  return (
    <ErrorBoundary>
      <div className="w-full max-w-md mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
            Вход
          </h2>

          <form onSubmit={(e) => {
            e.preventDefault()
            handleSubmit(onSubmit)
          }} className="space-y-4">
            
            {/* Error Summary */}
            {hasFormErrors && (
              <FormErrorSummary 
                errors={{
                  ...errors,
                  ...(submitError ? { submit: submitError } : {})
                }} 
              />
            )}

            {/* Email Field */}
            <TextInput
              {...getFieldProps('email')}
              type="email"
              label="Email"
              placeholder="Введите email"
              required
              autoComplete="email"
              disabled={isSubmitting}
            />

            {/* Password Field */}
            <TextInput
              {...getFieldProps('password')}
              type="password"
              label="Пароль"
              placeholder="Введите пароль"
              required
              autoComplete="current-password"
              disabled={isSubmitting}
            />

            {/* Submit Button */}
            <LoadingButton
              type="submit"
              loading={isSubmitting}
              disabled={!isValid || isSubmitting}
              className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors"
            >
              {isSubmitting ? 'Вход...' : 'Войти'}
            </LoadingButton>
          </form>

          {onSwitchToSignUp && (
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={onSwitchToSignUp}
                className="text-purple-600 hover:text-purple-700 text-sm font-medium"
                disabled={isSubmitting}
              >
                Нет аккаунта? Зарегистрироваться
              </button>
            </div>
          )}
        </div>
      </div>
    </ErrorBoundary>
  )
}