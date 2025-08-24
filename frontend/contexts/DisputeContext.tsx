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

      // Get disputes created by user
      const { data: userDisputesData, error: userDisputesError } = await supabase
        .rpc('get_user_disputes', { p_user_id: user.id })

      if (userDisputesError) {
        throw userDisputesError
      }

      // Get disputes on wishes created by user
      const { data: creatorDisputesData, error: creatorDisputesError } = await supabase
        .rpc('get_creator_disputes', { p_creator_id: user.id })

      if (creatorDisputesError) {
        throw creatorDisputesError
      }

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
      const { data: functionResult, error: functionError } = await supabase
        .rpc('create_dispute', {
          p_wish_id: disputeData.wishId,
          p_disputer_id: user.id,
          p_comment: disputeData.comment.trim(),
          p_alternative_description: disputeData.alternativeDescription?.trim() || null
        })

      if (functionError) {
        throw functionError
      }

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
      const { data: functionResult, error: functionError } = await supabase
        .rpc('resolve_dispute', {
          p_dispute_id: resolution.disputeId,
          p_resolver_id: user.id,
          p_action: resolution.action,
          p_resolution_comment: resolution.resolutionComment?.trim() || null
        })

      if (functionError) {
        throw functionError
      }

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
      const { data, error: supabaseError } = await supabase
        .rpc('get_wish_disputes', { p_wish_id: wishId })

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