'use client'

import React, { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { validateEmail } from '../../lib/validation'
import { useToast } from '../ui/Toast'
import { LoadingButton } from '../ui/LoadingSpinner'

interface SignInFormProps {
  onSuccess?: () => void
  onSwitchToSignUp?: () => void
}

export function SignInForm({ onSuccess, onSwitchToSignUp }: SignInFormProps) {
  const { signIn, loading } = useAuth()
  const { showToast } = useToast()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!formData.email || !formData.password) {
      setError('Пожалуйста, заполните все поля')
      return
    }

    // Validate email format
    const emailValidation = validateEmail(formData.email)
    if (!emailValidation.isValid) {
      setError(emailValidation.error!)
      return
    }

    try {
      await signIn(formData.email, formData.password)
      showToast({
        type: 'success',
        title: 'Вход выполнен!',
        message: 'Добро пожаловать обратно!'
      })
      onSuccess?.()
    } catch (err: any) {
      const errorMessage = err.message || 'Произошла ошибка при входе'
      setError(errorMessage)
      showToast({
        type: 'error',
        title: 'Ошибка входа',
        message: errorMessage
      })
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
          Вход
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Введите email"
              disabled={loading}
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Пароль
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Введите пароль"
              disabled={loading}
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          <LoadingButton
            type="submit"
            loading={loading}
            className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors"
          >
            {loading ? 'Вход...' : 'Войти'}
          </LoadingButton>
        </form>

        {onSwitchToSignUp && (
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={onSwitchToSignUp}
              className="text-purple-600 hover:text-purple-700 text-sm font-medium"
            >
              Нет аккаунта? Зарегистрироваться
            </button>
          </div>
        )}
      </div>
    </div>
  )
}