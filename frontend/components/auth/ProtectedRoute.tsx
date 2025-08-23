'use client'

import React from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { AuthPage } from './AuthPage'
import { LoadingOverlay } from '../ui/LoadingSpinner'

interface ProtectedRouteProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingOverlay message="Проверка авторизации..." />
      </div>
    )
  }

  if (!user) {
    return fallback || <AuthPage />
  }

  return <>{children}</>
}