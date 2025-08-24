'use client'

import React from 'react'
import { Loader2, RefreshCw, AlertCircle } from 'lucide-react'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function LoadingSpinner({ size = 'md', className = '' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  }

  return (
    <Loader2 className={`animate-spin ${sizeClasses[size]} ${className}`} />
  )
}

interface LoadingButtonProps {
  loading: boolean
  children: React.ReactNode
  disabled?: boolean
  onClick?: () => void
  className?: string
  type?: 'button' | 'submit' | 'reset'
}

export function LoadingButton({ 
  loading, 
  children, 
  disabled, 
  onClick, 
  className = '',
  type = 'button'
}: LoadingButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={loading || disabled}
      className={`
        flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium
        transition-all duration-200
        ${loading || disabled 
          ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
          : 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800'
        }
        ${className}
      `}
    >
      {loading && <LoadingSpinner size="sm" />}
      {children}
    </button>
  )
}

interface LoadingCardProps {
  title?: string
  description?: string
  className?: string
}

export function LoadingCard({ title, description, className = '' }: LoadingCardProps) {
  return (
    <div className={`bg-white rounded-lg shadow-sm border p-6 ${className}`}>
      <div className="flex items-center justify-center mb-4">
        <LoadingSpinner size="lg" className="text-blue-600" />
      </div>
      {title && (
        <h3 className="text-lg font-medium text-gray-900 text-center mb-2">
          {title}
        </h3>
      )}
      {description && (
        <p className="text-gray-600 text-center text-sm">
          {description}
        </p>
      )}
    </div>
  )
}

interface LoadingSkeletonProps {
  lines?: number
  className?: string
}

export function LoadingSkeleton({ lines = 3, className = '' }: LoadingSkeletonProps) {
  return (
    <div className={`animate-pulse ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className={`
            bg-gray-200 rounded h-4 mb-3
            ${index === 0 ? 'w-3/4' : ''}
            ${index === 1 ? 'w-full' : ''}
            ${index === 2 ? 'w-2/3' : ''}
            ${index > 2 ? 'w-5/6' : ''}
          `}
        />
      ))}
    </div>
  )
}

interface LoadingListProps {
  items?: number
  className?: string
}

export function LoadingList({ items = 5, className = '' }: LoadingListProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      {Array.from({ length: items }).map((_, index) => (
        <div key={index} className="bg-white rounded-lg shadow-sm border p-4">
          <LoadingSkeleton lines={2} />
        </div>
      ))}
    </div>
  )
}

interface LoadingOverlayProps {
  show: boolean
  message?: string
  className?: string
}

export function LoadingOverlay({ show, message, className = '' }: LoadingOverlayProps) {
  if (!show) return null

  return (
    <div className={`
      fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50
      ${className}
    `}>
      <div className="bg-white rounded-lg p-6 max-w-sm mx-4 text-center">
        <LoadingSpinner size="lg" className="text-blue-600 mx-auto mb-4" />
        <p className="text-gray-700">
          {message || 'Загрузка...'}
        </p>
      </div>
    </div>
  )
}

interface RetryableLoadingProps {
  loading: boolean
  error?: string | null
  onRetry: () => void
  children: React.ReactNode
  loadingComponent?: React.ReactNode
  className?: string
}

export function RetryableLoading({
  loading,
  error,
  onRetry,
  children,
  loadingComponent,
  className = ''
}: RetryableLoadingProps) {
  if (loading) {
    return (
      <div className={className}>
        {loadingComponent || (
          <LoadingCard 
            title="Загрузка..." 
            description="Пожалуйста, подождите"
          />
        )}
      </div>
    )
  }

  if (error) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-lg p-6 text-center ${className}`}>
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-red-900 mb-2">
          Ошибка загрузки
        </h3>
        <p className="text-red-700 mb-4">
          {error}
        </p>
        <button
          onClick={onRetry}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors mx-auto"
        >
          <RefreshCw className="w-4 h-4" />
          Попробовать снова
        </button>
      </div>
    )
  }

  return <div className={className}>{children}</div>
}

interface InlineLoadingProps {
  loading: boolean
  error?: string | null
  children: React.ReactNode
  loadingText?: string
  className?: string
}

export function InlineLoading({
  loading,
  error,
  children,
  loadingText = 'Загрузка...',
  className = ''
}: InlineLoadingProps) {
  if (loading) {
    return (
      <div className={`flex items-center gap-2 text-gray-600 ${className}`}>
        <LoadingSpinner size="sm" />
        <span className="text-sm">{loadingText}</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`flex items-center gap-2 text-red-600 ${className}`}>
        <AlertCircle className="w-4 h-4" />
        <span className="text-sm">{error}</span>
      </div>
    )
  }

  return <>{children}</>
}

// Specialized loading components for different features

export function WishLoadingCard() {
  return (
    <div className="bg-white rounded-lg shadow-md border-l-4 border-l-gray-200 p-4 animate-pulse">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-3 space-y-2 sm:space-y-0">
        <div className="flex items-center min-w-0 flex-1">
          <div className="w-8 h-8 bg-gray-200 rounded mr-3 flex-shrink-0"></div>
          <div className="min-w-0 flex-1">
            <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
        <div className="flex items-center space-x-2 flex-shrink-0">
          <div className="h-6 bg-gray-200 rounded-full w-16"></div>
          <div className="h-6 bg-gray-200 rounded w-12"></div>
        </div>
      </div>
      
      <div className="space-y-2 mb-3">
        <div className="h-4 bg-gray-200 rounded w-full"></div>
        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
      </div>
      
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div className="flex space-x-2">
          <div className="h-8 bg-gray-200 rounded w-20"></div>
          <div className="h-8 bg-gray-200 rounded w-16"></div>
        </div>
      </div>
    </div>
  )
}

export function WalletLoadingCard() {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-gray-200 rounded"></div>
          <div className="h-6 bg-gray-200 rounded w-24"></div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-200 rounded"></div>
          <div className="w-4 h-4 bg-gray-200 rounded"></div>
        </div>
      </div>
      
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
              <div>
                <div className="h-4 bg-gray-200 rounded w-20 mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-32"></div>
              </div>
            </div>
            <div className="text-right">
              <div className="h-6 bg-gray-200 rounded w-12 mb-1"></div>
              <div className="h-3 bg-gray-200 rounded w-16"></div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="h-3 bg-gray-200 rounded w-48 mx-auto"></div>
      </div>
    </div>
  )
}