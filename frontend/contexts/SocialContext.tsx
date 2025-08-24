'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from './AuthContext'
import { User, Friendship } from '@/lib/types'

interface SocialContextType {
  friends: User[]
  friendRequests: Friendship[]
  sentRequests: Friendship[]
  loading: boolean
  sendFriendRequest: (friendId: string) => Promise<boolean>
  acceptFriendRequest: (requestId: string) => Promise<boolean>
  rejectFriendRequest: (requestId: string) => Promise<boolean>
  blockUser: (userId: string) => Promise<boolean>
  unblockUser: (userId: string) => Promise<boolean>
  searchUsers: (query: string) => Promise<User[]>
  refreshFriendships: () => Promise<void>
}

const SocialContext = createContext<SocialContextType | undefined>(undefined)

export function SocialProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [friends, setFriends] = useState<User[]>([])
  const [friendRequests, setFriendRequests] = useState<Friendship[]>([])
  const [sentRequests, setSentRequests] = useState<Friendship[]>([])
  const [loading, setLoading] = useState(false)

  const loadFriendships = useCallback(async () => {
    if (!user) return

    setLoading(true)
    try {
      // Load accepted friendships (friends)
      const { data: acceptedFriendships, error: friendsError } = await supabase
        .from('friendships')
        .select(`
          id,
          user_id,
          friend_id,
          status,
          created_at,
          friend:users!friendships_friend_id_fkey (
            id,
            username,
            email,
            avatar_url,
            created_at,
            updated_at
          )
        `)
        .eq('user_id', user.id)
        .eq('status', 'accepted')

      if (friendsError) throw friendsError

      // Load incoming friend requests
      const { data: incomingRequests, error: requestsError } = await supabase
        .from('friendships')
        .select(`
          id,
          user_id,
          friend_id,
          status,
          created_at,
          friend:users!friendships_user_id_fkey (
            id,
            username,
            email,
            avatar_url,
            created_at,
            updated_at
          )
        `)
        .eq('friend_id', user.id)
        .eq('status', 'pending')

      if (requestsError) throw requestsError

      // Load sent friend requests
      const { data: outgoingRequests, error: sentError } = await supabase
        .from('friendships')
        .select(`
          id,
          user_id,
          friend_id,
          status,
          created_at,
          friend:users!friendships_friend_id_fkey (
            id,
            username,
            email,
            avatar_url,
            created_at,
            updated_at
          )
        `)
        .eq('user_id', user.id)
        .eq('status', 'pending')

      if (sentError) throw sentError

      // Extract friends from accepted friendships
      const friendsList = acceptedFriendships?.map(f => f.friend).filter(Boolean) || []
      setFriends(friendsList as User[])

      // Set incoming requests
      setFriendRequests((incomingRequests || []) as Friendship[])

      // Set sent requests
      setSentRequests((outgoingRequests || []) as Friendship[])

    } catch (error) {
      console.error('Error loading friendships:', error)
    } finally {
      setLoading(false)
    }
  }, [user])

  const sendFriendRequest = async (friendId: string): Promise<boolean> => {
    if (!user || user.id === friendId) return false

    try {
      const { data: result, error } = await supabase
        .rpc('send_friend_request', {
          p_user_id: user.id,
          p_friend_id: friendId
        })

      if (error) throw error

      if (result) {
        await loadFriendships()
        return true
      } else {
        console.error('Friend request failed')
        return false
      }
    } catch (error) {
      console.error('Error sending friend request:', error)
      return false
    }
  }

  const acceptFriendRequest = async (requestId: string): Promise<boolean> => {
    if (!user) return false

    try {
      const { data: result, error } = await supabase
        .rpc('accept_friend_request', {
          p_request_id: requestId,
          p_user_id: user.id
        })

      if (error) throw error

      if (result) {
        await loadFriendships()
        return true
      } else {
        console.error('Accept friend request failed')
        return false
      }
    } catch (error) {
      console.error('Error accepting friend request:', error)
      return false
    }
  }

  const rejectFriendRequest = async (requestId: string): Promise<boolean> => {
    if (!user) return false

    try {
      const { data: result, error } = await supabase
        .rpc('reject_friend_request', {
          p_request_id: requestId,
          p_user_id: user.id
        })

      if (error) throw error

      if (result) {
        await loadFriendships()
        return true
      } else {
        console.error('Reject friend request failed')
        return false
      }
    } catch (error) {
      console.error('Error rejecting friend request:', error)
      return false
    }
  }

  const blockUser = async (userId: string): Promise<boolean> => {
    if (!user) return false

    try {
      const { data: result, error } = await supabase
        .rpc('block_user', {
          p_user_id: user.id,
          p_target_id: userId
        })

      if (error) throw error

      if (result) {
        await loadFriendships()
        return true
      } else {
        console.error('Block user failed')
        return false
      }
    } catch (error) {
      console.error('Error blocking user:', error)
      return false
    }
  }

  const unblockUser = async (userId: string): Promise<boolean> => {
    if (!user) return false

    try {
      const { data: result, error } = await supabase
        .rpc('unblock_user', {
          p_user_id: user.id,
          p_target_id: userId
        })

      if (error) throw error

      if (result) {
        await loadFriendships()
        return true
      } else {
        console.error('Unblock user failed')
        return false
      }
    } catch (error) {
      console.error('Error unblocking user:', error)
      return false
    }
  }

  const searchUsers = async (query: string): Promise<User[]> => {
    if (!query.trim() || !user) return []

    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, username, email, avatar_url, created_at, updated_at')
        .or(`username.ilike.%${query}%,email.ilike.%${query}%`)
        .neq('id', user.id)
        .limit(10)

      if (error) throw error

      return (data || []) as User[]
    } catch (error) {
      console.error('Error searching users:', error)
      return []
    }
  }

  const refreshFriendships = async () => {
    await loadFriendships()
  }

  useEffect(() => {
    if (user) {
      loadFriendships()
    } else {
      setFriends([])
      setFriendRequests([])
      setSentRequests([])
    }
  }, [user, loadFriendships])

  // Set up real-time subscriptions for friendships
  useEffect(() => {
    if (!user) return

    const subscription = supabase
      .channel('friendships')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'friendships',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          loadFriendships()
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'friendships',
          filter: `friend_id=eq.${user.id}`,
        },
        () => {
          loadFriendships()
        }
      )
      .subscribe()

    return () => {
      if (subscription && typeof subscription.unsubscribe === 'function') {
        subscription.unsubscribe()
      }
    }
  }, [user, loadFriendships])

  const value = {
    friends,
    friendRequests,
    sentRequests,
    loading,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    blockUser,
    unblockUser,
    searchUsers,
    refreshFriendships,
  }

  return (
    <SocialContext.Provider value={value}>
      {children}
    </SocialContext.Provider>
  )
}

export function useSocial() {
  const context = useContext(SocialContext)
  if (context === undefined) {
    throw new Error('useSocial must be used within a SocialProvider')
  }
  return context
}