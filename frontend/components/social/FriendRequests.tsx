'use client'

import React from 'react'
import { useSocial } from '@/contexts/SocialContext'
import { Check, X, Clock, UserPlus } from 'lucide-react'

export default function FriendRequests() {
  const { 
    friendRequests, 
    sentRequests, 
    loading, 
    acceptFriendRequest, 
    rejectFriendRequest 
  } = useSocial()

  const handleAccept = async (requestId: string) => {
    await acceptFriendRequest(requestId)
  }

  const handleReject = async (requestId: string) => {
    await rejectFriendRequest(requestId)
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-300 rounded w-1/3 mb-2"></div>
                  <div className="h-3 bg-gray-300 rounded w-1/4"></div>
                </div>
              </div>
              <div className="flex space-x-2">
                <div className="w-8 h-8 bg-gray-300 rounded"></div>
                <div className="w-8 h-8 bg-gray-300 rounded"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Incoming Friend Requests */}
      {friendRequests.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <UserPlus className="h-5 w-5 mr-2 text-blue-600" />
            Входящие запросы ({friendRequests.length})
          </h3>
          
          <div className="space-y-3">
            {friendRequests.map((request) => (
              <div
                key={request.id}
                className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                    {request.friend?.username?.charAt(0).toUpperCase() || '?'}
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {request.friend?.username || 'Неизвестный пользователь'}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {request.friend?.email}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(request.created_at).toLocaleDateString('ru-RU')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleAccept(request.id)}
                    className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    title="Принять запрос"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                  
                  <button
                    onClick={() => handleReject(request.id)}
                    className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    title="Отклонить запрос"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sent Friend Requests */}
      {sentRequests.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Clock className="h-5 w-5 mr-2 text-yellow-600" />
            Отправленные запросы ({sentRequests.length})
          </h3>
          
          <div className="space-y-3">
            {sentRequests.map((request) => (
              <div
                key={request.id}
                className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white font-semibold">
                    {request.friend?.username?.charAt(0).toUpperCase() || '?'}
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {request.friend?.username || 'Неизвестный пользователь'}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {request.friend?.email}
                    </p>
                    <p className="text-xs text-gray-500">
                      Отправлено {new Date(request.created_at).toLocaleDateString('ru-RU')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full">
                    Ожидает ответа
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {friendRequests.length === 0 && sentRequests.length === 0 && (
        <div className="text-center py-8">
          <UserPlus className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Нет запросов в друзья</h3>
          <p className="text-gray-500">
            Здесь будут отображаться входящие и исходящие запросы в друзья
          </p>
        </div>
      )}
    </div>
  )
}