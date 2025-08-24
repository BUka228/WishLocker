'use client'

import React, { useState } from 'react'
import { X, Calendar, AlertCircle } from 'lucide-react'
import { WishType, WISH_METADATA } from '@/lib/types'
import { useWish } from '@/contexts/WishContext'
import { validateWishTitle, validateWishDescription } from '@/lib/validation'

interface WishFormProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function WishForm({ isOpen, onClose, onSuccess }: WishFormProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState<WishType>('green')
  const [deadline, setDeadline] = useState('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const { createWish } = useWish()

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    const titleValidation = validateWishTitle(title)
    if (!titleValidation.isValid) {
      newErrors.title = titleValidation.error!
    }

    const descriptionValidation = validateWishDescription(description)
    if (!descriptionValidation.isValid) {
      newErrors.description = descriptionValidation.error!
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setLoading(true)
    
    try {
      const result = await createWish({
        title: title.trim(),
        description: description.trim(),
        type,
        deadline: deadline || undefined
      })

      if (result.error) {
        setErrors({ submit: result.error })
      } else {
        // Reset form
        setTitle('')
        setDescription('')
        setType('green')
        setDeadline('')
        setErrors({})
        
        onSuccess?.()
        onClose()
      }
    } catch (err) {
      setErrors({ submit: 'Произошла ошибка при создании желания' })
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!loading) {
      setTitle('')
      setDescription('')
      setType('green')
      setDeadline('')
      setErrors({})
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-800">
            Создать новое желание
          </h2>
          <button
            onClick={handleClose}
            disabled={loading}
            className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Название желания *
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Например: Сделай мне чай"
              maxLength={100}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.title ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={loading}
            />
            <div className="flex justify-between mt-1">
              {errors.title && (
                <span className="text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.title}
                </span>
              )}
              <span className="text-sm text-gray-500 ml-auto">
                {title.length}/100
              </span>
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Описание
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Подробное описание желания..."
              maxLength={500}
              rows={3}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={loading}
            />
            <div className="flex justify-between mt-1">
              {errors.description && (
                <span className="text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.description}
                </span>
              )}
              <span className="text-sm text-gray-500 ml-auto">
                {description.length}/500
              </span>
            </div>
          </div>

          {/* Wish Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Тип желания *
            </label>
            <div className="space-y-2">
              {(Object.keys(WISH_METADATA) as WishType[]).map((wishType) => {
                const metadata = WISH_METADATA[wishType]
                return (
                  <label
                    key={wishType}
                    className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                      type === wishType
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <input
                      type="radio"
                      name="type"
                      value={wishType}
                      checked={type === wishType}
                      onChange={(e) => setType(e.target.value as WishType)}
                      className="sr-only"
                      disabled={loading}
                    />
                    <span className="text-xl mr-3">{metadata.emoji}</span>
                    <div className="flex-1">
                      <div className="font-medium text-gray-800">
                        {metadata.name} (1 {metadata.name.toLowerCase()})
                      </div>
                      <div className="text-sm text-gray-600">
                        {metadata.description}
                      </div>
                    </div>
                  </label>
                )
              })}
            </div>
          </div>

          {/* Deadline (Optional) */}
          <div>
            <label htmlFor="deadline" className="block text-sm font-medium text-gray-700 mb-1">
              Дедлайн (необязательно)
            </label>
            <div className="relative">
              <input
                id="deadline"
                type="datetime-local"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loading}
              />
              <Calendar className="absolute right-3 top-2.5 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <span className="text-sm text-red-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-2" />
                {errors.submit}
              </span>
            </div>
          )}

          {/* Actions */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={loading || !title.trim()}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Создание...' : 'Создать желание'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}