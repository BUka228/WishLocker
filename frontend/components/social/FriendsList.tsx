'use client'

import React from 'react'
import { useSocial } from '@/contexts/SocialContext'
import { User } from '@/shared/types'
import { UserPlus, UserMinus, UserX, MessageCircle } from 'lucide-react'

interface FriendsListProps {
  showActions?: boolean
}

export default function FriendsList({ showActions = true }: FriendsListProps) {
  const { friends, loading, blockUser } = useSocial()

  const handleBlockUser = async (userId: string) => {
    if (confirm('Вы уверены, что хотите заблокировать этого пользователя?')) {
      await blockUser(userId)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
              <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-300 rounded w-1/4 mb-2"></div>
                <div className="h-3 bg-gray-300 rounded w-1/3"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (friends.length === 0) {
    return (
      <div className="text-center py-8">
        <UserPlus className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Нет друзей</h3>
        <p className="text-gray-500">
          Добавьте друзей, чтобы видеть их желания и взаимодействовать с ними
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Друзья ({friends.length})
      </h2>
      
      <div className="space-y-3">
        {friends.map((friend) => (
          <FriendCard
            key={friend.id}
            friend={friend}
            showActions={showActions}
            onBlock={() => handleBlockUser(friend.id)}
          />
        ))}
      </div>
    </div>
  )
}

interface FriendCardProps {
  friend: User
  showActions: boolean
  onBlock: () => void
}

function FriendCard({ friend, showActions, onBlock }: FriendCardProps) {
  return (
    <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-lg">
          {friend.username.charAt(0).toUpperCase()}
        </div>
        
        <div>
          <h3 className="font-medium text-gray-900">{friend.username}</h3>
          <p className="text-sm text-gray-500">{friend.email}</p>
          <p className="text-xs text-gray-400">
            Друг с {new Date(friend.created_at).toLocaleDateString('ru-RU')}
          </p>
        </div>
      </div>

      {showActions && (
        <div className="flex items-center space-x-2">
          <button
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Написать сообщение"
          >
            <MessageCircle className="h-5 w-5" />
          </button>
          
          <button
            onClick={onBlock}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Заблокировать пользователя"
          >
            <UserX className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  )
}