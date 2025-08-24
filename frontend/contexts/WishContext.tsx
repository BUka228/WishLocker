'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from './AuthContext'
import { Wish, WishType, WishStatus, ApiResponse } from '@/lib/types'
import { validateWishTitle, validateWishDescription } from '@/lib/validation'

interface CreateWishRequest {
  title: string
  description: string
  type: WishType
  deadline?: string
}

interface WishFilter {
  type?: WishType
  status?: WishStatus
  creatorId?: string
}

interface WishContextType {
  wishes: Wish[]
  loading: boolean
  error: string | null
  createWish: (wish: CreateWishRequest) => Promise<ApiResponse<Wish>>
  updateWishStatus: (wishId: string, status: WishStatus, assigneeId?: string) => Promise<ApiResponse<Wish>>
  disputeWish: (wishId: string, comment: string) => Promise<ApiResponse<void>>
  filterWishes: (filter: WishFilter) => Wish[]
  refreshWishes: () => Promise<void>
}

const WishContext = createContext<WishContextType | undefined>(undefined)

export function WishProvider({ children }: { children: React.ReactNode }) {
  const [wishes, setWishes] = useState<Wish[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  // Load wishes on mount and when user changes
  useEffect(() => {
    if (user) {
      refreshWishes()
    } else {
      setWishes([])
      setLoading(false)
    }
  }, [user])

  const refreshWishes = async () => {
    if (!user) return

    try {
      setLoading(true)
      setError(null)

      const { data, error: supabaseError } = await supabase
        .from('wishes')
        .select(`
          *,
          creator:users!creator_id(id, username, avatar_url),
          assignee:users!assignee_id(id, username, avatar_url)
        `)
        .order('created_at', { ascending: false })

      if (supabaseError) {
        throw supabaseError
      }

      setWishes((data || []) as unknown as Wish[])
    } catch (err) {
      console.error('Error loading wishes:', err)
      setError('Не удалось загрузить желания')
    } finally {
      setLoading(false)
    }
  }

  const createWish = async (wishData: CreateWishRequest): Promise<ApiResponse<Wish>> => {
    if (!user) {
      return { error: 'Необходимо войти в систему' }
    }

    // Validate input
    const titleValidation = validateWishTitle(wishData.title)
    if (!titleValidation.isValid) {
      return { error: titleValidation.error }
    }

    const descriptionValidation = validateWishDescription(wishData.description)
    if (!descriptionValidation.isValid) {
      return { error: descriptionValidation.error }
    }

    try {
      // Determine cost based on wish type (1 currency unit per type)
      const cost = 1

      const { data, error: supabaseError } = await supabase
        .from('wishes')
        .insert({
          title: wishData.title.trim(),
          description: wishData.description.trim(),
          type: wishData.type,
          cost,
          status: 'active' as WishStatus,
          creator_id: user.id,
          deadline: wishData.deadline || null
        })
        .select(`
          *,
          creator:users!creator_id(id, username, avatar_url),
          assignee:users!assignee_id(id, username, avatar_url)
        `)
        .single()

      if (supabaseError) {
        throw supabaseError
      }

      // Add to local state
      setWishes(prev => [data as unknown as Wish, ...prev])

      return { 
        data: data as unknown as Wish, 
        message: 'Желание успешно создано!' 
      }
    } catch (err) {
      console.error('Error creating wish:', err)
      return { 
        error: 'Не удалось создать желание. Попробуйте еще раз.' 
      }
    }
  }

  const updateWishStatus = async (
    wishId: string, 
    status: WishStatus, 
    assigneeId?: string
  ): Promise<ApiResponse<Wish>> => {
    if (!user) {
      return { error: 'Необходимо войти в систему' }
    }

    try {
      const updateData: any = { 
        status, 
        updated_at: new Date().toISOString() 
      }
      
      if (assigneeId) {
        updateData.assignee_id = assigneeId
      }

      const { data, error: supabaseError } = await supabase
        .from('wishes')
        .update(updateData)
        .eq('id', wishId)
        .select(`
          *,
          creator:users!creator_id(id, username, avatar_url),
          assignee:users!assignee_id(id, username, avatar_url)
        `)
        .single()

      if (supabaseError) {
        throw supabaseError
      }

      // Update local state
      setWishes(prev => 
        prev.map(wish => 
          wish.id === wishId ? data as unknown as Wish : wish
        )
      )

      return { 
        data: data as unknown as Wish, 
        message: 'Статус желания обновлен!' 
      }
    } catch (err) {
      console.error('Error updating wish status:', err)
      return { 
        error: 'Не удалось обновить статус желания' 
      }
    }
  }

  const disputeWish = async (wishId: string, comment: string): Promise<ApiResponse<void>> => {
    if (!user) {
      return { error: 'Необходимо войти в систему' }
    }

    if (!comment.trim()) {
      return { error: 'Комментарий к спору обязателен' }
    }

    try {
      // For now, we'll just log the dispute
      // In a full implementation, this would create a dispute record
      console.log('Dispute created:', { wishId, comment, userId: user.id })
      
      return { 
        message: 'Спор отправлен создателю желания' 
      }
    } catch (err) {
      console.error('Error creating dispute:', err)
      return { 
        error: 'Не удалось создать спор' 
      }
    }
  }

  const filterWishes = (filter: WishFilter): Wish[] => {
    return wishes.filter(wish => {
      if (filter.type && wish.type !== filter.type) return false
      if (filter.status && wish.status !== filter.status) return false
      if (filter.creatorId && wish.creator_id !== filter.creatorId) return false
      return true
    })
  }

  const value: WishContextType = {
    wishes,
    loading,
    error,
    createWish,
    updateWishStatus,
    disputeWish,
    filterWishes,
    refreshWishes
  }

  return (
    <WishContext.Provider value={value}>
      {children}
    </WishContext.Provider>
  )
}

export function useWish() {
  const context = useContext(WishContext)
  if (context === undefined) {
    throw new Error('useWish must be used within a WishProvider')
  }
  return context
}