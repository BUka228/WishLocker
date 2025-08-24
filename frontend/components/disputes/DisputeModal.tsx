'use client'

import React, { useState } from 'react'
import { X, AlertTriangle, MessageSquare, Edit3 } from 'lucide-react'
import { Wish } from '@/lib/types'
import { useWish } from '@/contexts/WishContext'

interface DisputeModalProps {
  wish: Wish
  isOpen: boolean
  onClose: () => void
}

export function DisputeModal({ wish, isOpen, onClose }: DisputeModalProps) {
  const [comment, setComment] = useState('')
  const [alternativeDescription, setAlternativeDescription] = useState('')
  const [includeAlternative, setIncludeAlternative] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { disputeWish } = useWish()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!comment.trim()) {
      return
    }

    setIsSubmitting(true)
    
    try {
      const result = await disputeWish(
        wish.id, 
        comment, 
        includeAlternative ? alternativeDescription : undefined
      )
      
      if (result.error) {
        alert(result.error)
      } else {
        alert(result.message || 'Спор успешно создан!')
        onClose()
        setComment('')
        setAlternativeDescription('')
        setIncludeAlternative(false)
      }
    } catch (error) {
      console.error('Error creating dispute:', error)
      alert('Произошла ошибка при создании спора')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            <h2 className="text-lg font-semibold">Оспорить желание</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4">
          {/* Wish Info */}
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-1">{wish.title}</h3>
            <p className="text-sm text-gray-600">{wish.description}</p>
            <div className="mt-2 text-xs text-gray-500">
              Создатель: {wish.creator?.username}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Comment */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <MessageSquare className="w-4 h-4" />
                Комментарий к спору *
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Объясните, почему вы оспариваете это желание..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={4}
                maxLength={1000}
                required
              />
              <div className="text-xs text-gray-500 mt-1">
                {comment.length}/1000 символов
              </div>
            </div>

            {/* Alternative Description Toggle */}
            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={includeAlternative}
                  onChange={(e) => setIncludeAlternative(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">
                  Предложить альтернативное описание
                </span>
              </label>
            </div>

            {/* Alternative Description */}
            {includeAlternative && (
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Edit3 className="w-4 h-4" />
                  Альтернативное описание
                </label>
                <textarea
                  value={alternativeDescription}
                  onChange={(e) => setAlternativeDescription(e.target.value)}
                  placeholder="Предложите улучшенное описание желания..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={3}
                  maxLength={500}
                />
                <div className="text-xs text-gray-500 mt-1">
                  {alternativeDescription.length}/500 символов
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                disabled={isSubmitting}
              >
                Отмена
              </button>
              <button
                type="submit"
                disabled={!comment.trim() || isSubmitting}
                className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? 'Отправка...' : 'Отправить спор'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}