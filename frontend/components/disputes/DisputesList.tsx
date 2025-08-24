'use client'

import React from 'react'
import { MessageSquare, Clock, CheckCircle, XCircle, AlertTriangle, Calendar } from 'lucide-react'
import { Dispute, DISPUTE_STATUS_METADATA } from '@/lib/types'

interface DisputesListProps {
  disputes: Dispute[]
  title: string
  emptyMessage: string
  showWishTitle?: boolean
}

export function DisputesList({ 
  disputes, 
  title, 
  emptyMessage, 
  showWishTitle = false 
}: DisputesListProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />
      case 'accepted': return <CheckCircle className="w-4 h-4" />
      case 'rejected': return <XCircle className="w-4 h-4" />
      default: return <AlertTriangle className="w-4 h-4" />
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

  if (disputes.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p>{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
        <MessageSquare className="w-5 h-5" />
        {title} ({disputes.length})
      </h2>

      {disputes.map((dispute) => (
        <div key={dispute.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(dispute.status)}`}>
                {getStatusIcon(dispute.status)}
                {DISPUTE_STATUS_METADATA[dispute.status]?.name || dispute.status}
              </span>
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Calendar className="w-3 h-3" />
              {formatDate(dispute.created_at)}
            </div>
          </div>

          {/* Wish Title (if showing) */}
          {showWishTitle && (
            <div className="mb-2">
              <h3 className="font-medium text-gray-900">
                {dispute.wish_title || 'Желание'}
              </h3>
              <p className="text-sm text-gray-600">
                Создатель: {dispute.wish_creator_username || 'Неизвестно'}
              </p>
            </div>
          )}

          {/* Disputer (if not showing wish title, this is creator's view) */}
          {!showWishTitle && (
            <div className="mb-2">
              <p className="text-sm text-gray-600">
                Спор от: {dispute.disputer_username || 'Пользователь'}
              </p>
            </div>
          )}

          {/* Comment */}
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
          {dispute.status !== 'pending' && (
            <div className="border-t pt-3">
              {dispute.resolution_comment ? (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-900 mb-1">
                    Решение:
                  </h4>
                  <p className="text-sm text-gray-700">{dispute.resolution_comment}</p>
                  {dispute.resolved_at && (
                    <div className="text-xs text-gray-500 mt-1">
                      {formatDate(dispute.resolved_at)}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-sm text-gray-600">
                  Спор {dispute.status === 'accepted' ? 'принят' : 'отклонен'}
                  {dispute.resolved_at && (
                    <span className="ml-2 text-gray-500">
                      {formatDate(dispute.resolved_at)}
                    </span>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}