'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { useSocial } from '@/contexts/SocialContext'
import { useAuth } from '@/contexts/AuthContext'
import { User } from '@/shared/types'
import { Search, UserPlus, Check, Clock, X } from 'lucide-react'
import { debounce } from 'lodash'

export default function UserSearch() {
  const { user } = useAuth()
  const { 
    friends, 
    friendRequests, 
    sentRequests, 
    searchUsers, 
    sendFriendRequest 
  } = useSocial()
  
  const [query, setQuery] = useState('')
  const [searchResults, setSearchResults] = useState<User[]>([])
  const [loading, setLoading] = useState(false)

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (searchQuery: string) => {
      if (!searchQuery.trim()) {
        setSearchResults([])
        return
      }

      setLoading(true)
      try {
        const results = await searchUsers(searchQuery)
        setSearchResults(results)
      } catch (error) {
        console.error('Search error:', error)
        setSearchResults([])
      } finally {
        setLoading(false)
      }
    }, 300),
    [searchUsers]
  )

  useEffect(() => {
    debouncedSearch(query)
    return () => {
      debouncedSearch.cancel()
    }
  }, [query, debouncedSearch])

  const handleSendRequest = async (userId: string) => {
    const success = await sendFriendRequest(userId)
    if (success) {
      // Remove from search results after sending request
      setSearchResults(prev => prev.filter(u => u.id !== userId))
    }
  }

  const getUserRelationshipStatus = (userId: string) => {
    // Check if already friends
    if (friends.some(f => f.id === userId)) {
      return 'friend'
    }
    
    // Check if there's a pending incoming request
    if (friendRequests.some(r => r.user_id === userId)) {
      return 'incoming_request'
    }
    
    // Check if there's a pending outgoing request
    if (sentRequests.some(r => r.friend_id === userId)) {
      return 'outgoing_request'
    }
    
    return 'none'
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Поиск пользователей по имени или email..."
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {loading && (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-300 rounded w-1/3 mb-2"></div>
                    <div className="h-3 bg-gray-300 rounded w-1/4"></div>
                  </div>
                </div>
                <div className="w-8 h-8 bg-gray-300 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && searchResults.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-700">
            Результаты поиска ({searchResults.length})
          </h3>
          
          {searchResults.map((searchUser) => {
            const relationshipStatus = getUserRelationshipStatus(searchUser.id)
            
            return (
              <div
                key={searchUser.id}
                className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                    {searchUser.username.charAt(0).toUpperCase()}
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {searchUser.username}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {searchUser.email}
                    </p>
                    <p className="text-xs text-gray-500">
                      Зарегистрирован {new Date(searchUser.created_at).toLocaleDateString('ru-RU')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center">
                  {relationshipStatus === 'friend' && (
                    <span className="flex items-center px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                      <Check className="h-4 w-4 mr-1" />
                      Друг
                    </span>
                  )}
                  
                  {relationshipStatus === 'incoming_request' && (
                    <span className="flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                      <Clock className="h-4 w-4 mr-1" />
                      Входящий запрос
                    </span>
                  )}
                  
                  {relationshipStatus === 'outgoing_request' && (
                    <span className="flex items-center px-3 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full">
                      <Clock className="h-4 w-4 mr-1" />
                      Запрос отправлен
                    </span>
                  )}
                  
                  {relationshipStatus === 'none' && (
                    <button
                      onClick={() => handleSendRequest(searchUser.id)}
                      className="flex items-center px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <UserPlus className="h-4 w-4 mr-1" />
                      Добавить
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {!loading && query.trim() && searchResults.length === 0 && (
        <div className="text-center py-8">
          <Search className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Пользователи не найдены</h3>
          <p className="text-gray-500">
            Попробуйте изменить поисковый запрос
          </p>
        </div>
      )}

      {!query.trim() && (
        <div className="text-center py-8">
          <UserPlus className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Поиск друзей</h3>
          <p className="text-gray-500">
            Введите имя пользователя или email для поиска новых друзей
          </p>
        </div>
      )}
    </div>
  )
}