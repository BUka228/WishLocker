'use client'

import React from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { validateUsername, validateEmail, validatePassword } from '../../lib/validation'
import { useToast } from '../ui/Toast'
import { LoadingButton } from '../ui/LoadingStates'
import { TextInput, FormErrorSummary } from '../ui/FormInputs'
import { useFormValidation } from '../../hooks/useFormValidation'
import { ErrorBoundary } from '../error/ErrorBoundary'

interface SignUpFormProps {
  onSuccess?: () => void
  onSwitchToSignIn?: () => void
}

export function SignUpForm({ onSuccess, onSwitchToSignIn }: SignUpFormProps) {
  const { signUp } = useAuth()
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
      username: '',
      email: '',
      password: '',
      confirmPassword: ''
    },
    validationRules: {
      username: validateUsername,
      email: validateEmail,
      password: validatePassword,
      confirmPassword: (value: string) => {
        const password = formState.password?.value || ''
        if (!value) {
          return { isValid: false, error: 'Подтверждение пароля обязательно' }
        }
        if (value !== password) {
          return { isValid: false, error: 'Пароли не совпадают' }
        }
        return { isValid: true }
      }
    },
    validateOnBlur: true,
    showToastOnError: false
  })

  const onSubmit = async (values: Record<string, any>) => {
    try {
      await signUp(values.email, values.password, values.username)
      showToast({
        type: 'success',
        title: 'Регистрация успешна!',
        message: 'Добро пожаловать в Банк Желаний!'
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
            Регистрация
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

            {/* Username Field */}
            <TextInput
              {...getFieldProps('username')}
              label="Имя пользователя"
              placeholder="Введите имя пользователя"
              required
              maxLength={20}
              showCharCount
              helperText="От 3 до 20 символов. Только буквы, цифры, дефисы и подчеркивания"
              autoComplete="username"
              disabled={isSubmitting}
            />

            {/* Email Field */}
            <TextInput
              {...getFieldProps('email')}
              type="email"
              label="Email"
              placeholder="Введите email"
              required
              autoComplete="email"
              helperText="Мы используем email для входа в систему"
              disabled={isSubmitting}
            />

            {/* Password Field */}
            <TextInput
              {...getFieldProps('password')}
              type="password"
              label="Пароль"
              placeholder="Введите пароль"
              required
              minLength={6}
              maxLength={128}
              autoComplete="new-password"
              helperText="Минимум 6 символов. Рекомендуем использовать заглавные буквы, цифры и специальные символы"
              disabled={isSubmitting}
            />

            {/* Confirm Password Field */}
            <TextInput
              {...getFieldProps('confirmPassword')}
              type="password"
              label="Подтвердите пароль"
              placeholder="Подтвердите пароль"
              required
              autoComplete="new-password"
              disabled={isSubmitting}
            />

            {/* Submit Button */}
            <LoadingButton
              type="submit"
              loading={isSubmitting}
              disabled={!isValid || isSubmitting}
              className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors"
            >
              {isSubmitting ? 'Регистрация...' : 'Зарегистрироваться'}
            </LoadingButton>
          </form>

          {onSwitchToSignIn && (
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={onSwitchToSignIn}
                className="text-purple-600 hover:text-purple-700 text-sm font-medium"
                disabled={isSubmitting}
              >
                Уже есть аккаунт? Войти
              </button>
            </div>
          )}
        </div>
      </div>
    </ErrorBoundary>
  )
}