'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Clock, CheckCircle, XCircle, User, Calendar, AlertTriangle } from 'lucide-react'
import { Wish, WISH_METADATA, STATUS_METADATA } from '@/lib/types'
import { useWish } from '@/contexts/WishContext'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/components/ui/Toast'
import { WishDisputes } from '@/components/disputes/WishDisputes'
import { DisputeModal } from '@/components/disputes/DisputeModal'

export default function WishDetailPage() {
  const params = useParams()
  const router = useRouter()
  const wishId = params.id as string
  
  const [wish, setWish] = useState<Wish | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [showDisputeModal, setShowDisputeModal] = useState(false)
  
  const { wishes, acceptWish, completeWish } = useWish()
  const { user } = useAuth()
  const { showToast } = useToast()

  useEffect(() => {
    const foundWish = wishes.find(w => w.id === wishId)
    if (foundWish) {
      setWish(foundWish)
    }
    setLoading(false)
  }, [wishId, wishes])

  const wishMetadata = wish ? WISH_METADATA[wish.type] : null
  const statusMetadata = wish ? STATUS_METADATA[wish.status] : null

  const canAccept = user && wish && wish.status === 'active' && wish.creator_id !== user.id
  const canComplete = user && wish && wish.status === 'in_progress' && wish.assignee_id === user.id
  const canDispute = user && wish && ['active', 'in_progress'].includes(wish.status) && wish.creator_id !== user.id
  const isCreator = !!(user && wish && wish.creator_id === user.id)

  const handleAccept = async () => {
    if (!user || !wish) return
    
    setActionLoading(true)
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
      setActionLoading(false)
    }
  }

  const handleComplete = async () => {
    if (!user || !wish) return
    
    setActionLoading(true)
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
      setActionLoading(false)
    }
  }

  const getStatusIcon = () => {
    if (!wish) return null
    
    switch (wish.status) {
      case 'active':
        return <Clock className="w-5 h-5 text-yellow-500" />
      case 'in_progress':
        return <Clock className="w-5 h-5 text-blue-500" />
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-500" />
      case 'disputed':
        return <AlertTriangle className="w-5 h-5 text-orange-500" />
      default:
        return <Clock className="w-5 h-5 text-gray-500" />
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!wish) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Желание не найдено
          </h1>
          <button
            onClick={() => router.back()}
            className="text-blue-600 hover:text-blue-800"
          >
            Вернуться назад
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Назад
          </button>
        </div>

        {/* Wish Details */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center">
              <span className="text-4xl mr-3">{wishMetadata?.emoji}</span>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{wish.title}</h1>
                <div className="flex items-center text-sm text-gray-500">
                  <User className="w-4 h-4 mr-1" />
                  <span>от {wish.creator?.username || 'Неизвестно'}</span>
                  <span className="mx-2">•</span>
                  <Calendar className="w-4 h-4 mr-1" />
                  <span>{formatDate(wish.created_at)}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className={`flex items-center px-3 py-2 rounded-full text-sm font-medium ${
                wish.status === 'active' ? 'bg-yellow-100 text-yellow-800' :
                wish.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                wish.status === 'completed' ? 'bg-green-100 text-green-800' :
                wish.status === 'disputed' ? 'bg-orange-100 text-orange-800' :
                'bg-red-100 text-red-800'
              }`}>
                {getStatusIcon()}
                <span className="ml-2">
                  {statusMetadata?.name}
                </span>
              </div>
              <div className={`text-sm font-medium px-3 py-2 rounded-lg ${
                wish.type === 'green' ? 'bg-green-100 text-green-800' :
                wish.type === 'blue' ? 'bg-blue-100 text-blue-800' :
                'bg-red-100 text-red-800'
              }`}>
                {wishMetadata?.emoji} {wish.cost} {wishMetadata?.name.toLowerCase()}
              </div>
            </div>
          </div>

          {/* Description */}
          {wish.description && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Описание</h2>
              <p className="text-gray-700 leading-relaxed">{wish.description}</p>
            </div>
          )}

          {/* Assignee */}
          {wish.assignee && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Исполнитель</h2>
              <div className="flex items-center text-blue-600">
                <User className="w-4 h-4 mr-2" />
                <span>{wish.assignee.username}</span>
              </div>
            </div>
          )}

          {/* Deadline */}
          {wish.deadline && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Дедлайн</h2>
              <div className="flex items-center text-gray-600">
                <Calendar className="w-4 h-4 mr-2" />
                <span>{formatDate(wish.deadline)}</span>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3 pt-6 border-t border-gray-100">
            {canAccept && (
              <button
                onClick={handleAccept}
                disabled={actionLoading}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                {actionLoading ? 'Принимаю...' : 'Принять желание'}
              </button>
            )}
            
            {canComplete && (
              <button
                onClick={handleComplete}
                disabled={actionLoading}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                {actionLoading ? 'Завершаю...' : 'Завершить желание'}
              </button>
            )}
            
            {canDispute && (
              <button
                onClick={() => setShowDisputeModal(true)}
                disabled={actionLoading}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                <AlertTriangle className="w-4 h-4" />
                Оспорить желание
              </button>
            )}
          </div>
        </div>

        {/* Disputes Section */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <WishDisputes wishId={wish.id} isCreator={isCreator} />
        </div>

        {/* Dispute Modal */}
        <DisputeModal
          wish={wish}
          isOpen={showDisputeModal}
          onClose={() => setShowDisputeModal(false)}
        />
      </div>
    </div>
  )
}