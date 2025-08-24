'use client'

import React, { useState } from 'react'
import { Clock, CheckCircle, XCircle, User, Calendar, MessageSquare } from 'lucide-react'
import { Wish, WISH_METADATA, STATUS_METADATA } from '@/lib/types'
import { useWish } from '@/contexts/WishContext'
import { useAuth } from '@/contexts/AuthContext'

interface WishCardProps {
  wish: Wish
}

export function WishCard({ wish }: WishCardProps) {
  const [loading, setLoading] = useState(false)
  const [showDispute, setShowDispute] = useState(false)
  const [disputeComment, setDisputeComment] = useState('')
  
  const { updateWishStatus, disputeWish } = useWish()
  const { user } = useAuth()

  const wishMetadata = WISH_METADATA[wish.type]
  const statusMetadata = STATUS_METADATA[wish.status]

  const canAccept = user && wish.status === 'active' && wish.creator_id !== user.id
  const canComplete = user && wish.status === 'in_progress' && wish.assignee_id === user.id
  const canDispute = user && wish.status === 'active' && wish.creator_id !== user.id

  const handleAccept = async () => {
    if (!user) return
    
    setLoading(true)
    try {
      await updateWishStatus(wish.id, 'in_progress', user.id)
    } catch (err) {
      console.error('Error accepting wish:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleComplete = async () => {
    if (!user) return
    
    setLoading(true)
    try {
      await updateWishStatus(wish.id, 'completed')
    } catch (err) {
      console.error('Error completing wish:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDispute = async () => {
    if (!disputeComment.trim()) return
    
    setLoading(true)
    try {
      await disputeWish(wish.id, disputeComment)
      setShowDispute(false)
      setDisputeComment('')
    } catch (err) {
      console.error('Error disputing wish:', err)
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
      default:
        return <Clock className="w-4 h-4 text-gray-500" />
    }
  }

  return (
    <div className={`bg-white rounded-lg shadow-md border-l-4 border-l-${wishMetadata.color}-500 p-4 hover:shadow-lg transition-shadow`}>
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
        
        <div className="flex items-center space-x-2">
          <div className="flex items-center">
            {getStatusIcon()}
            <span className="ml-1 text-sm text-gray-600">
              {statusMetadata.name}
            </span>
          </div>
          <div className="text-sm font-medium text-gray-700">
            {wish.cost} {wishMetadata.name.toLowerCase()}
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
        <div className="flex items-center text-sm text-orange-600 mb-3">
          <Calendar className="w-4 h-4 mr-1" />
          <span>Дедлайн: {formatDate(wish.deadline)}</span>
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
          
          {canDispute && !showDispute && (
            <button
              onClick={() => setShowDispute(true)}
              disabled={loading}
              className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              Оспорить
            </button>
          )}
        </div>
      </div>

      {/* Dispute Form */}
      {showDispute && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg border">
          <div className="flex items-center mb-2">
            <MessageSquare className="w-4 h-4 text-gray-600 mr-1" />
            <span className="text-sm font-medium text-gray-700">
              Оспорить желание
            </span>
          </div>
          <textarea
            value={disputeComment}
            onChange={(e) => setDisputeComment(e.target.value)}
            placeholder="Опишите, что не так с этим желанием или предложите альтернативу..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none"
            rows={3}
            disabled={loading}
          />
          <div className="flex space-x-2 mt-2">
            <button
              onClick={handleDispute}
              disabled={loading || !disputeComment.trim()}
              className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-sm hover:bg-red-200 transition-colors disabled:opacity-50"
            >
              {loading ? 'Отправляю...' : 'Отправить спор'}
            </button>
            <button
              onClick={() => {
                setShowDispute(false)
                setDisputeComment('')
              }}
              disabled={loading}
              className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              Отмена
            </button>
          </div>
        </div>
      )}
    </div>
  )
}