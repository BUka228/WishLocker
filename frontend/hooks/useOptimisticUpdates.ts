'use client'

import { useState, useCallback } from 'react'

interface OptimisticState<T> {
  data: T
  isOptimistic: boolean
  error?: string
}

export function useOptimisticUpdates<T>(initialData: T) {
  const [state, setState] = useState<OptimisticState<T>>({
    data: initialData,
    isOptimistic: false
  })

  const updateOptimistically = useCallback(
    async <R>(
      optimisticUpdate: (current: T) => T,
      asyncOperation: () => Promise<R>,
      onSuccess?: (result: R, current: T) => T,
      onError?: (error: any, current: T) => T
    ): Promise<R | null> => {
      // Apply optimistic update
      setState(prev => ({
        data: optimisticUpdate(prev.data),
        isOptimistic: true,
        error: undefined
      }))

      try {
        // Perform async operation
        const result = await asyncOperation()
        
        // Apply success update
        setState(prev => ({
          data: onSuccess ? onSuccess(result, prev.data) : prev.data,
          isOptimistic: false,
          error: undefined
        }))

        return result
      } catch (error) {
        // Revert or apply error update
        setState(prev => ({
          data: onError ? onError(error, prev.data) : initialData,
          isOptimistic: false,
          error: error instanceof Error ? error.message : 'Произошла ошибка'
        }))

        return null
      }
    },
    [initialData]
  )

  const resetOptimistic = useCallback(() => {
    setState({
      data: initialData,
      isOptimistic: false,
      error: undefined
    })
  }, [initialData])

  const updateData = useCallback((newData: T) => {
    setState({
      data: newData,
      isOptimistic: false,
      error: undefined
    })
  }, [])

  return {
    data: state.data,
    isOptimistic: state.isOptimistic,
    error: state.error,
    updateOptimistically,
    resetOptimistic,
    updateData
  }
}

// Specialized hook for wish operations
export function useOptimisticWish(wish: any) {
  return useOptimisticUpdates(wish)
}

// Specialized hook for wallet operations
export function useOptimisticWallet(wallet: any) {
  return useOptimisticUpdates(wallet)
}