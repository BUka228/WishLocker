'use client'

import React from 'react'
import { X, Calendar } from 'lucide-react'
import { WishType, WISH_METADATA } from '@/lib/types'
import { useWish } from '@/contexts/WishContext'
import { validateWishTitle, validateWishDescription } from '@/lib/validation'
import { useFormValidation } from '@/hooks/useFormValidation'
import { TextInput, TextArea, Select, FormErrorSummary } from '@/components/ui/FormInputs'
import { LoadingButton } from '@/components/ui/LoadingStates'
import { ErrorBoundary } from '@/components/error/ErrorBoundary'
import { useToast } from '@/components/ui/Toast'

interface WishFormProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function WishForm({ isOpen, onClose, onSuccess }: WishFormProps) {
  const { createWish } = useWish()
  const { showToast } = useToast()

  const {
    formState,
    isSubmitting,
    submitError,
    getFieldProps,
    handleSubmit,
    isValid,
    getErrors,
    resetForm
  } = useFormValidation({
    initialValues: {
      title: '',
      description: '',
      type: 'green' as WishType,
      deadline: ''
    },
    validationRules: {
      title: validateWishTitle,
      description: validateWishDescription,
      type: (value: WishType) => {
        if (!value || !['green', 'blue', 'red'].includes(value)) {
          return { isValid: false, error: 'Выберите тип желания' }
        }
        return { isValid: true }
      },
      deadline: (value: string) => {
        if (value) {
          const deadlineDate = new Date(value)
          const now = new Date()
          if (deadlineDate <= now) {
            return { isValid: false, error: 'Дедлайн должен быть в будущем' }
          }
        }
        return { isValid: true }
      }
    },
    validateOnBlur: true,
    showToastOnError: false
  })

  const onSubmit = async (values: Record<string, any>) => {
    try {
      const result = await createWish({
        title: values.title.trim(),
        description: values.description.trim(),
        type: values.type,
        deadline: values.deadline || undefined
      })

      if (result.error) {
        throw new Error(result.error)
      }

      showToast({
        type: 'success',
        title: 'Желание создано!',
        message: 'Ваше желание успешно добавлено'
      })

      resetForm()
      onSuccess?.()
      onClose()
    } catch (error: any) {
      throw error
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      resetForm()
      onClose()
    }
  }

  const wishTypeOptions = (Object.keys(WISH_METADATA) as WishType[]).map((wishType) => {
    const metadata = WISH_METADATA[wishType]
    return {
      value: wishType,
      label: `${metadata.emoji} ${metadata.name} (1 ${metadata.name.toLowerCase()}) - ${metadata.description}`
    }
  })

  const errors = getErrors()
  const hasFormErrors = Object.keys(errors).length > 0 || submitError

  if (!isOpen) return null

  return (
    <ErrorBoundary>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-800">
              Создать новое желание
            </h2>
            <button
              onClick={handleClose}
              disabled={isSubmitting}
              className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={(e) => {
            e.preventDefault()
            handleSubmit(onSubmit)
          }} className="p-6 space-y-4">
            
            {/* Error Summary */}
            {hasFormErrors && (
              <FormErrorSummary 
                errors={{
                  ...errors,
                  ...(submitError ? { submit: submitError } : {})
                }} 
              />
            )}

            {/* Title Field */}
            <TextInput
              {...getFieldProps('title')}
              label="Название желания"
              placeholder="Например: Сделай мне чай"
              required
              maxLength={100}
              showCharCount
              disabled={isSubmitting}
            />

            {/* Description Field */}
            <TextArea
              {...getFieldProps('description')}
              label="Описание"
              placeholder="Подробное описание желания..."
              maxLength={500}
              rows={3}
              showCharCount
              disabled={isSubmitting}
            />

            {/* Wish Type Field */}
            <Select
              {...getFieldProps('type')}
              label="Тип желания"
              options={wishTypeOptions}
              required
              disabled={isSubmitting}
            />

            {/* Deadline Field */}
            <div>
              <label htmlFor="deadline" className="block text-sm font-medium text-gray-700 mb-1">
                Дедлайн (необязательно)
              </label>
              <div className="relative">
                <input
                  {...getFieldProps('deadline')}
                  type="datetime-local"
                  min={new Date().toISOString().slice(0, 16)}
                  className={`
                    w-full px-3 py-2 border rounded-lg shadow-sm
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                    disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
                    ${getFieldProps('deadline').error 
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                      : 'border-gray-300'
                    }
                  `}
                  disabled={isSubmitting}
                />
                <Calendar className="absolute right-3 top-2.5 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
              {getFieldProps('deadline').error && (
                <div className="flex items-center gap-1 text-sm text-red-600 mt-1">
                  <span>{getFieldProps('deadline').error}</span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Отмена
              </button>
              <LoadingButton
                type="submit"
                loading={isSubmitting}
                disabled={!isValid || isSubmitting}
                className="flex-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {isSubmitting ? 'Создание...' : 'Создать желание'}
              </LoadingButton>
            </div>
          </form>
        </div>
      </div>
    </ErrorBoundary>
  )
}