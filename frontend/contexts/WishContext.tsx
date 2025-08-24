'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from './AuthContext'
import { useSocial } from './SocialContext'
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
  acceptWish: (wishId: string) => Promise<ApiResponse<void>>
  completeWish: (wishId: string) => Promise<ApiResponse<void>>
  disputeWish: (wishId: string, comment: string, alternativeDescription?: string) => Promise<ApiResponse<void>>
  filterWishes: (filter: WishFilter) => Wish[]
  refreshWishes: () => Promise<void>
}

const WishContext = createContext<WishContextType | undefined>(undefined)

export function WishProvider({ children }: { children: React.ReactNode }) {
  const [wishes, setWishes] = useState<Wish[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()
  
  // Get friends from SocialContext for friend-based wish visibility
  // Handle case where SocialProvider is not available (e.g., in tests)
  let friends: any[] = []
  try {
    const socialContext = useSocial()
    friends = socialContext.friends || []
  } catch (error) {
    // SocialContext not available, continue without friends
    friends = []
  }

  // Load wishes on mount and when user or friends change
  useEffect(() => {
    if (user) {
      refreshWishes()
    } else {
      setWishes([])
      setLoading(false)
    }
  }, [user, friends])

  // Set up real-time subscriptions for wishes
  useEffect(() => {
    if (!user) return

    const subscription = supabase
      .channel('wishes_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'wishes',
        },
        (payload) => {
          console.log('New wish created:', payload)
          const newWish = payload.new as any
          
          // Only add to local state if it's visible to current user
          // (either user's own wish or friend's wish)
          const friendIds = friends.map(f => f.id)
          const visibleUserIds = [user.id, ...friendIds]
          
          if (visibleUserIds.includes(newWish.creator_id)) {
            // Fetch full wish data with relations
            supabase
              .from('wishes')
              .select(`
                *,
                creator:users!creator_id(id, username, avatar_url),
                assignee:users!assignee_id(id, username, avatar_url)
              `)
              .eq('id', newWish.id)
              .single()
              .then(({ data, error }) => {
                if (!error && data) {
                  setWishes(prev => [data as unknown as Wish, ...prev])
                  
                  // Create notification for new wish from friends
                  if (newWish.creator_id !== user.id) {
                    // This is a friend's wish, create notification
                    supabase
                      .from('notifications')
                      .insert({
                        user_id: user.id,
                        type: 'new_wish',
                        title: 'Новое желание!',
                        message: `${data.creator?.username || 'Друг'} создал новое желание: ${newWish.title}`,
                      })
                      .then(({ error }) => {
                        if (error) console.error('Error creating notification:', error)
                      })
                  }
                }
              })
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'wishes',
        },
        (payload) => {
          console.log('Wish updated:', payload)
          const updatedWish = payload.new as any
          
          // Update local state
          setWishes(prev => 
            prev.map(wish => {
              if (wish.id === updatedWish.id) {
                // Fetch full updated data with relations
                supabase
                  .from('wishes')
                  .select(`
                    *,
                    creator:users!creator_id(id, username, avatar_url),
                    assignee:users!assignee_id(id, username, avatar_url)
                  `)
                  .eq('id', updatedWish.id)
                  .single()
                  .then(({ data, error }) => {
                    if (!error && data) {
                      setWishes(prevWishes => 
                        prevWishes.map(w => 
                          w.id === updatedWish.id ? data as unknown as Wish : w
                        )
                      )
                    }
                  })
                
                // Create notifications for status changes
                if (payload.old && payload.old.status !== updatedWish.status) {
                  // Notify creator when wish is accepted
                  if (updatedWish.status === 'in_progress' && updatedWish.assignee_id && updatedWish.creator_id !== user.id) {
                    supabase
                      .from('notifications')
                      .insert({
                        user_id: updatedWish.creator_id,
                        type: 'wish_accepted',
                        title: 'Желание принято!',
                        message: `Ваше желание "${updatedWish.title}" принято к выполнению`,
                      })
                      .then(({ error }) => {
                        if (error) console.error('Error creating notification:', error)
                      })
                  }
                  
                  // Notify assignee when wish is completed
                  if (updatedWish.status === 'completed' && updatedWish.assignee_id === user.id) {
                    supabase
                      .from('notifications')
                      .insert({
                        user_id: user.id,
                        type: 'wish_completed',
                        title: 'Желание выполнено!',
                        message: `Вы успешно выполнили желание "${updatedWish.title}"`,
                      })
                      .then(({ error }) => {
                        if (error) console.error('Error creating notification:', error)
                      })
                  }
                  
                  // Notify creator when wish is completed
                  if (updatedWish.status === 'completed' && updatedWish.creator_id === user.id) {
                    supabase
                      .from('notifications')
                      .insert({
                        user_id: user.id,
                        type: 'wish_fulfilled',
                        title: 'Желание исполнено!',
                        message: `Ваше желание "${updatedWish.title}" было выполнено`,
                      })
                      .then(({ error }) => {
                        if (error) console.error('Error creating notification:', error)
                      })
                  }
                }
                
                return wish
              }
              return wish
            })
          )
        }
      )
      .subscribe()

    return () => {
      if (subscription && typeof subscription.unsubscribe === 'function') {
        subscription.unsubscribe()
      }
    }
  }, [user, friends])

  const refreshWishes = async () => {
    if (!user) return

    try {
      setLoading(true)
      setError(null)

      let query = supabase
        .from('wishes')
        .select(`
          *,
          creator:users!creator_id(id, username, avatar_url),
          assignee:users!assignee_id(id, username, avatar_url)
        `)

      // If we have friends, filter to show user's wishes + friends' wishes
      if (friends.length > 0) {
        const friendIds = friends.map(f => f.id)
        const userIds = [user.id, ...friendIds]
        query = query.in('creator_id', userIds)
      }
      // Otherwise, show all wishes (backward compatibility)

      const { data, error: supabaseError } = await query.order('created_at', { ascending: false })

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
          status: 'active',
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
      // Handle different status transitions with appropriate database functions
      if (status === 'in_progress' && assigneeId) {
        // Accept wish with direct update
        const { data, error: supabaseError } = await supabase
          .from('wishes')
          .update({ 
            status: 'in_progress', 
            assignee_id: assigneeId,
            updated_at: new Date().toISOString() 
          })
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
          message: 'Желание принято к выполнению!' 
        }
      } else if (status === 'completed' && assigneeId) {
        // Use complete_wish function for completing wishes
        const { data: functionResult, error: functionError } = await supabase
          .rpc('complete_wish', {
            p_wish_id: wishId,
            p_assignee_id: assigneeId
          })

        if (functionError) {
          throw functionError
        }

        if (!functionResult) {
          return { 
            error: 'Не удалось завершить желание' 
          }
        }

        // Refresh wishes to get updated data
        await refreshWishes()
        
        return { 
          message: 'Желание успешно выполнено!' 
        }
      } else {
        // For other status updates, use direct database update
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
      }
    } catch (err) {
      console.error('Error updating wish status:', err)
      return { 
        error: 'Не удалось обновить статус желания' 
      }
    }
  }

  const acceptWish = async (wishId: string): Promise<ApiResponse<void>> => {
    if (!user) {
      return { error: 'Необходимо войти в систему' }
    }

    try {
      const { error: supabaseError } = await supabase
        .from('wishes')
        .update({ 
          status: 'in_progress', 
          assignee_id: user.id,
          updated_at: new Date().toISOString() 
        })
        .eq('id', wishId)

      if (supabaseError) {
        throw supabaseError
      }

      // Refresh wishes to get updated data
      await refreshWishes()
      
      return { 
        message: 'Желание принято к выполнению!' 
      }
    } catch (err) {
      console.error('Error accepting wish:', err)
      return { 
        error: 'Не удалось принять желание' 
      }
    }
  }

  const completeWish = async (wishId: string): Promise<ApiResponse<void>> => {
    if (!user) {
      return { error: 'Необходимо войти в систему' }
    }

    try {
      // Use the complete_wish function which handles wallet transactions
      const { data: functionResult, error: functionError } = await supabase
        .rpc('complete_wish', {
          p_wish_id: wishId,
          p_assignee_id: user.id
        })

      if (functionError) {
        throw functionError
      }

      if (!functionResult) {
        return { 
          error: 'Не удалось завершить желание' 
        }
      }

      // Refresh wishes to get updated data
      await refreshWishes()
      
      return { 
        message: 'Желание успешно выполнено!' 
      }
    } catch (err) {
      console.error('Error completing wish:', err)
      return { 
        error: 'Не удалось завершить желание' 
      }
    }
  }

  const disputeWish = async (wishId: string, comment: string, alternativeDescription?: string): Promise<ApiResponse<void>> => {
    if (!user) {
      return { error: 'Необходимо войти в систему' }
    }

    if (!comment.trim()) {
      return { error: 'Комментарий к спору обязателен' }
    }

    if (comment.length > 1000) {
      return { error: 'Комментарий не может быть длиннее 1000 символов' }
    }

    if (alternativeDescription && alternativeDescription.length > 500) {
      return { error: 'Альтернативное описание не может быть длиннее 500 символов' }
    }

    try {
      const { data: functionResult, error: functionError } = await supabase
        .rpc('create_dispute', {
          p_wish_id: wishId,
          p_disputer_id: user.id,
          p_comment: comment.trim(),
          p_alternative_description: alternativeDescription?.trim() || undefined
        })

      if (functionError) {
        throw functionError
      }

      if (!functionResult) {
        return { 
          error: 'Не удалось создать спор' 
        }
      }

      const disputeResult = functionResult as { success?: boolean; message?: string }
      
      if (!disputeResult.success) {
        return { 
          error: disputeResult.message || 'Не удалось создать спор' 
        }
      }

      // Refresh wishes to get updated status
      await refreshWishes()
      
      return { 
        message: disputeResult.message || 'Спор отправлен создателю желания' 
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
    acceptWish,
    completeWish,
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