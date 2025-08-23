'use client'

import React, { useState } from 'react'
import { SignInForm } from './SignInForm'
import { SignUpForm } from './SignUpForm'

interface AuthPageProps {
  onSuccess?: () => void
}

export function AuthPage({ onSuccess }: AuthPageProps) {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            💚 Банк Желаний
          </h1>
          <p className="text-gray-600">
            Система управления желаниями с трехуровневой валютной системой
          </p>
        </div>

        {mode === 'signin' ? (
          <SignInForm
            onSuccess={onSuccess}
            onSwitchToSignUp={() => setMode('signup')}
          />
        ) : (
          <SignUpForm
            onSuccess={onSuccess}
            onSwitchToSignIn={() => setMode('signin')}
          />
        )}
      </div>
    </div>
  )
}