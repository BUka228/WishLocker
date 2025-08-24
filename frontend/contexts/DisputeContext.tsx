'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from './AuthContext'
import { Dispute, DisputeStatus, ApiResponse } from '@/lib/types'

interface CreateDisputeRequest {
  wishId: string
  comment: string
  alternativeDescription?: string
}

interface ResolveDisputeRequest {
  disputeId: string
  action: 'accept' | 'reject'
  resolutionComment?: string
}

interface DisputeContextType {
  userDisputes: Dispute[]
  creatorDisputes: Dispute[]
  loading: boolean
  error: string | null
  createDispute: (dispute: CreateDisputeRequest) => Promise<ApiResponse<void>>
  resolveDispute: (resolution: ResolveDisputeRequest) => Promise<ApiResponse<void>>
  getWishDisputes: (wishId: string) => Promise<Dispute[]>
  refreshDisputes: () => Promise<void>
}

const DisputeContext = createContext<DisputeContextType | undefined>(undefined)

export function DisputeProvider({ children }: { children: React.ReactNode }) {
  const [userDisputes, setUserDisputes] = useState<Dispute[]>([])
  const [creatorDisputes, setCreatorDisputes] = useState<Dispute[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  // Load disputes on mount and when user changes
  useEffect(() => {
    if (user) {
      refreshDisputes()
    } else {
      setUserDisputes([])
      setCreatorDisputes([])
      setLoading(false)
    }
  }, [user])

  const refreshDisputes = async () => {
    if (!user) return

    try {
      setLoading(true)
      setError(null)

      // Dispute system temporarily disabled - focusing on social system
      const userDisputesData: any[] = []
      const creatorDisputesData: any[] = []

      setUserDisputes((userDisputesData || []) as Dispute[])
      setCreatorDisputes((creatorDisputesData || []) as Dispute[])
    } catch (err) {
      console.error('Error loading disputes:', err)
      setError('Не удалось загрузить споры')
    } finally {
      setLoading(false)
    }
  }

  const createDispute = async (disputeData: CreateDisputeRequest): Promise<ApiResponse<void>> => {
    if (!user) {
      return { error: 'Необходимо войти в систему' }
    }

    if (!disputeData.comment.trim()) {
      return { error: 'Комментарий к спору обязателен' }
    }

    if (disputeData.comment.length > 1000) {
      return { error: 'Комментарий не может быть длиннее 1000 символов' }
    }

    if (disputeData.alternativeDescription && disputeData.alternativeDescription.length > 500) {
      return { error: 'Альтернативное описание не может быть длиннее 500 символов' }
    }

    try {
      // Dispute system temporarily disabled
      const functionResult = { success: false, message: 'Система споров временно отключена' }

      if (!functionResult.success) {
        return { 
          error: functionResult.message || 'Не удалось создать спор' 
        }
      }

      // Refresh disputes to get updated data
      await refreshDisputes()
      
      return { 
        message: functionResult.message || 'Спор успешно создан!' 
      }
    } catch (err) {
      console.error('Error creating dispute:', err)
      return { 
        error: 'Не удалось создать спор. Попробуйте еще раз.' 
      }
    }
  }

  const resolveDispute = async (resolution: ResolveDisputeRequest): Promise<ApiResponse<void>> => {
    if (!user) {
      return { error: 'Необходимо войти в систему' }
    }

    if (!['accept', 'reject'].includes(resolution.action)) {
      return { error: 'Неверное действие' }
    }

    if (resolution.resolutionComment && resolution.resolutionComment.length > 500) {
      return { error: 'Комментарий к решению не может быть длиннее 500 символов' }
    }

    try {
      // Dispute system temporarily disabled
      const functionResult = { success: false, message: 'Система споров временно отключена' }

      if (!functionResult.success) {
        return { 
          error: functionResult.message || 'Не удалось разрешить спор' 
        }
      }

      // Refresh disputes to get updated data
      await refreshDisputes()
      
      return { 
        message: functionResult.message || 'Спор успешно разрешен!' 
      }
    } catch (err) {
      console.error('Error resolving dispute:', err)
      return { 
        error: 'Не удалось разрешить спор. Попробуйте еще раз.' 
      }
    }
  }

  const getWishDisputes = async (wishId: string): Promise<Dispute[]> => {
    if (!user) {
      return []
    }

    try {
      // Dispute system temporarily disabled
      const data: any[] = []
      const supabaseError = null

      if (supabaseError) {
        throw supabaseError
      }

      return (data || []) as Dispute[]
    } catch (err) {
      console.error('Error loading wish disputes:', err)
      return []
    }
  }

  const value: DisputeContextType = {
    userDisputes,
    creatorDisputes,
    loading,
    error,
    createDispute,
    resolveDispute,
    getWishDisputes,
    refreshDisputes
  }

  return (
    <DisputeContext.Provider value={value}>
      {children}
    </DisputeContext.Provider>
  )
}

export function useDispute() {
  const context = useContext(DisputeContext)
  if (context === undefined) {
    throw new Error('useDispute must be used within a DisputeProvider')
  }
  return context
}