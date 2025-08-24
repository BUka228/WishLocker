'use client'

import React, { useState, useEffect } from 'react'
import { MessageSquare, Clock, CheckCircle, XCircle, User, Calendar } from 'lucide-react'
import { Dispute, DISPUTE_STATUS_METADATA } from '@/lib/types'
import { useDispute } from '@/contexts/DisputeContext'
import { useAuth } from '@/contexts/AuthContext'

interface WishDisputesProps {
  wishId: string
  isCreator: boolean
}

export function WishDisputes({ wishId, isCreator }: WishDisputesProps) {
  const [disputes, setDisputes] = useState<Dispute[]>([])
  const [loading, setLoading] = useState(true)
  const [resolvingDispute, setResolvingDispute] = useState<string | null>(null)
  const [resolutionComment, setResolutionComment] = useState('')
  const { getWishDisputes, resolveDispute } = useDispute()
  const { user } = useAuth()

  useEffect(() => {
    loadDisputes()
  }, [wishId])

  const loadDisputes = async () => {
    setLoading(true)
    try {
      const disputesData = await getWishDisputes(wishId)
      setDisputes(disputesData)
    } catch (error) {
      console.error('Error loading disputes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleResolveDispute = async (disputeId: string, action: 'accept' | 'reject') => {
    if (!user) return

    try {
      const result = await resolveDispute({
        disputeId,
        action,
        resolutionComment: resolutionComment.trim() || undefined
      })

      if (result.error) {
        alert(result.error)
      } else {
        alert(result.message || 'Спор успешно разрешен!')
        setResolvingDispute(null)
        setResolutionComment('')
        await loadDisputes()
      }
    } catch (error) {
      console.error('Error resolving dispute:', error)
      alert('Произошла ошибка при разрешении спора')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100'
      case 'accepted': return 'text-green-600 bg-green-100'
      case 'rejected': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (disputes.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500">
        <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p>Споров по этому желанию нет</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="font-medium text-gray-900 flex items-center gap-2">
        <MessageSquare className="w-4 h-4" />
        Споры ({disputes.length})
      </h3>

      {disputes.map((dispute) => (
        <div key={dispute.id} className="border border-gray-200 rounded-lg p-4">
          {/* Dispute Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-gray-400" />
              <span className="font-medium text-gray-900">
                {dispute.disputer_username || 'Пользователь'}
              </span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(dispute.status)}`}>
                {DISPUTE_STATUS_METADATA[dispute.status]?.name || dispute.status}
              </span>
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Calendar className="w-3 h-3" />
              {formatDate(dispute.created_at)}
            </div>
          </div>

          {/* Dispute Comment */}
          <div className="mb-3">
            <p className="text-gray-700">{dispute.comment}</p>
          </div>

          {/* Alternative Description */}
          {dispute.alternative_description && (
            <div className="mb-3 p-3 bg-blue-50 rounded-lg">
              <h4 className="text-sm font-medium text-blue-900 mb-1">
                Предложенное описание:
              </h4>
              <p className="text-sm text-blue-800">{dispute.alternative_description}</p>
            </div>
          )}

          {/* Resolution */}
          {dispute.status !== 'pending' && dispute.resolution_comment && (
            <div className="mb-3 p-3 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-medium text-gray-900 mb-1">
                Решение создателя:
              </h4>
              <p className="text-sm text-gray-700">{dispute.resolution_comment}</p>
              {dispute.resolved_at && (
                <div className="text-xs text-gray-500 mt-1">
                  {formatDate(dispute.resolved_at)}
                </div>
              )}
            </div>
          )}

          {/* Resolution Actions (only for creators on pending disputes) */}
          {isCreator && dispute.status === 'pending' && (
            <div className="border-t pt-3">
              {resolvingDispute === dispute.id ? (
                <div className="space-y-3">
                  <textarea
                    value={resolutionComment}
                    onChange={(e) => setResolutionComment(e.target.value)}
                    placeholder="Комментарий к решению (необязательно)..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows={2}
                    maxLength={500}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleResolveDispute(dispute.id, 'accept')}
                      className="flex items-center gap-1 px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors text-sm"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Принять
                    </button>
                    <button
                      onClick={() => handleResolveDispute(dispute.id, 'reject')}
                      className="flex items-center gap-1 px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors text-sm"
                    >
                      <XCircle className="w-4 h-4" />
                      Отклонить
                    </button>
                    <button
                      onClick={() => {
                        setResolvingDispute(null)
                        setResolutionComment('')
                      }}
                      className="px-3 py-1 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors text-sm"
                    >
                      Отмена
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setResolvingDispute(dispute.id)}
                  className="flex items-center gap-1 px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm"
                >
                  <Clock className="w-4 h-4" />
                  Разрешить спор
                </button>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}