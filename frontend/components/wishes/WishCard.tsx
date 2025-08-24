'use client'

import React, { useState } from 'react'
import { Clock, CheckCircle, XCircle, User, Calendar, MessageSquare, AlertTriangle } from 'lucide-react'
import { Wish, WISH_METADATA, STATUS_METADATA } from '@/lib/types'
import { useWish } from '@/contexts/WishContext'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/components/ui/Toast'
import { DisputeModal } from '@/components/disputes/DisputeModal'

interface WishCardProps {
  wish: Wish
}

export function WishCard({ wish }: WishCardProps) {
  const [loading, setLoading] = useState(false)
  const [showDisputeModal, setShowDisputeModal] = useState(false)
  
  const { acceptWish, completeWish } = useWish()
  const { user } = useAuth()
  const { showToast } = useToast()

  const wishMetadata = WISH_METADATA[wish.type]
  const statusMetadata = STATUS_METADATA[wish.status]

  const canAccept = user && wish.status === 'active' && wish.creator_id !== user.id
  const canComplete = user && wish.status === 'in_progress' && wish.assignee_id === user.id
  const canDispute = user && ['active', 'in_progress'].includes(wish.status) && wish.creator_id !== user.id

  const handleAccept = async () => {
    if (!user) return
    
    setLoading(true)
    try {
      const result = await acceptWish(wish.id)
      if (result.error) {
        showToast({
          type: 'error',
          title: 'Ошибка при принятии желания',
          message: result.error
        })
      } else {
        showToast({
          type: 'success',
          title: 'Желание принято',
          message: result.message || 'Желание принято к выполнению!'
        })
      }
    } catch (err) {
      console.error('Error accepting wish:', err)
      showToast({
        type: 'error',
        title: 'Ошибка',
        message: 'Произошла ошибка при принятии желания'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleComplete = async () => {
    if (!user) return
    
    setLoading(true)
    try {
      const result = await completeWish(wish.id)
      if (result.error) {
        showToast({
          type: 'error',
          title: 'Ошибка при завершении желания',
          message: result.error
        })
      } else {
        showToast({
          type: 'success',
          title: 'Желание выполнено',
          message: result.message || 'Желание успешно выполнено!'
        })
      }
    } catch (err) {
      console.error('Error completing wish:', err)
      showToast({
        type: 'error',
        title: 'Ошибка',
        message: 'Произошла ошибка при завершении желания'
      })
    } finally {
      setLoading(false)
    }
  }



  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getTimeRemaining = (deadline: string) => {
    const now = new Date()
    const deadlineDate = new Date(deadline)
    const diffMs = deadlineDate.getTime() - now.getTime()
    
    if (diffMs <= 0) {
      return { text: 'Просрочено', isOverdue: true }
    }
    
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
    
    if (diffDays > 0) {
      return { text: `${diffDays} дн. ${diffHours} ч.`, isOverdue: false }
    } else if (diffHours > 0) {
      return { text: `${diffHours} ч. ${diffMinutes} мин.`, isOverdue: false }
    } else {
      return { text: `${diffMinutes} мин.`, isOverdue: false }
    }
  }

  const getStatusIcon = () => {
    switch (wish.status) {
      case 'active':
        return <Clock className="w-4 h-4 text-yellow-500" />
      case 'in_progress':
        return <Clock className="w-4 h-4 text-blue-500" />
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-500" />
      case 'disputed':
        return <AlertTriangle className="w-4 h-4 text-orange-500" />
      default:
        return <Clock className="w-4 h-4 text-gray-500" />
    }
  }

  return (
    <div className={`bg-white rounded-lg shadow-md border-l-4 p-4 hover:shadow-lg transition-shadow ${
      wish.type === 'green' ? 'border-l-green-500 bg-gradient-to-r from-green-50 to-white' :
      wish.type === 'blue' ? 'border-l-blue-500 bg-gradient-to-r from-blue-50 to-white' :
      'border-l-red-500 bg-gradient-to-r from-red-50 to-white'
    }`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center">
          <span className="text-2xl mr-2">{wishMetadata.emoji}</span>
          <div>
            <h3 className="font-semibold text-gray-800 text-lg">{wish.title}</h3>
            <div className="flex items-center text-sm text-gray-500 mt-1">
              <User className="w-4 h-4 mr-1" />
              <span>от {wish.creator?.username || 'Неизвестно'}</span>
              <span className="mx-2">•</span>
              <span>{formatDate(wish.created_at)}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            wish.status === 'active' ? 'bg-yellow-100 text-yellow-800' :
            wish.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
            wish.status === 'completed' ? 'bg-green-100 text-green-800' :
            wish.status === 'disputed' ? 'bg-orange-100 text-orange-800' :
            'bg-red-100 text-red-800'
          }`}>
            {getStatusIcon()}
            <span className="ml-1">
              {statusMetadata.name}
            </span>
          </div>
          <div className={`text-sm font-medium px-2 py-1 rounded-lg ${
            wish.type === 'green' ? 'bg-green-100 text-green-800' :
            wish.type === 'blue' ? 'bg-blue-100 text-blue-800' :
            'bg-red-100 text-red-800'
          }`}>
            {wishMetadata.emoji} {wish.cost} {wishMetadata.name.toLowerCase()}
          </div>
        </div>
      </div>

      {/* Description */}
      {wish.description && (
        <p className="text-gray-600 mb-3 leading-relaxed">
          {wish.description}
        </p>
      )}

      {/* Assignee */}
      {wish.assignee && (
        <div className="flex items-center text-sm text-blue-600 mb-3">
          <User className="w-4 h-4 mr-1" />
          <span>Исполнитель: {wish.assignee.username}</span>
        </div>
      )}

      {/* Deadline */}
      {wish.deadline && (
        <div className="mb-3">
          <div className="flex items-center text-sm text-gray-600 mb-1">
            <Calendar className="w-4 h-4 mr-1" />
            <span>Дедлайн: {formatDate(wish.deadline)}</span>
          </div>
          {(() => {
            const timeRemaining = getTimeRemaining(wish.deadline)
            return (
              <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                timeRemaining.isOverdue 
                  ? 'bg-red-100 text-red-800' 
                  : 'bg-orange-100 text-orange-800'
              }`}>
                <Clock className="w-3 h-3 mr-1" />
                {timeRemaining.isOverdue ? 'Просрочено' : `Осталось: ${timeRemaining.text}`}
              </div>
            )
          })()}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div className="flex space-x-2">
          {canAccept && (
            <button
              onClick={handleAccept}
              disabled={loading}
              className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-sm hover:bg-green-200 transition-colors disabled:opacity-50"
            >
              {loading ? 'Принимаю...' : 'Принять'}
            </button>
          )}
          
          {canComplete && (
            <button
              onClick={handleComplete}
              disabled={loading}
              className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-sm hover:bg-blue-200 transition-colors disabled:opacity-50"
            >
              {loading ? 'Завершаю...' : 'Завершить'}
            </button>
          )}
          
          {canDispute && (
            <button
              onClick={() => setShowDisputeModal(true)}
              disabled={loading}
              className="px-3 py-1.5 bg-orange-100 text-orange-700 rounded-lg text-sm hover:bg-orange-200 transition-colors disabled:opacity-50 flex items-center gap-1"
            >
              <AlertTriangle className="w-3 h-3" />
              Оспорить
            </button>
          )}
        </div>
      </div>

      {/* Dispute Modal */}
      <DisputeModal
        wish={wish}
        isOpen={showDisputeModal}
        onClose={() => setShowDisputeModal(false)}
      />
    </div>
  )
}