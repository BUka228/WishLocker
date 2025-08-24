'use client'

import React, { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useAchievements } from '../../contexts/AchievementContext'
import { User, Edit3, Save, X, Trophy } from 'lucide-react'
import { validateUsername } from '../../lib/validation'
import { useToast } from '../ui/Toast'
import { LoadingButton } from '../ui/LoadingSpinner'
import { AchievementsList } from '../achievements/AchievementsList'

export function UserProfile() {
  const { user, updateProfile, signOut, loading } = useAuth()
  const { achievements } = useAchievements()
  const { showToast } = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [updating, setUpdating] = useState(false)

  if (!user) return null

  const handleEdit = () => {
    setIsEditing(true)
    setFormData({
      username: user.username,
      email: user.email,
    })
    setError('')
    setSuccess('')
  }

  const handleCancel = () => {
    setIsEditing(false)
    setFormData({
      username: user.username,
      email: user.email,
    })
    setError('')
    setSuccess('')
  }

  const handleSave = async () => {
    setError('')
    setSuccess('')
    setUpdating(true)

    try {
      // Validate username
      const usernameValidation = validateUsername(formData.username)
      if (!usernameValidation.isValid) {
        setError(usernameValidation.error!)
        return
      }

      // Only update if something changed
      const updates: Partial<typeof user> = {}
      if (formData.username !== user.username) {
        updates.username = formData.username
      }

      if (Object.keys(updates).length > 0) {
        await updateProfile(updates)
        setSuccess('Профиль успешно обновлен')
        showToast({
          type: 'success',
          title: 'Профиль обновлен',
          message: 'Изменения успешно сохранены'
        })
      } else {
        showToast({
          type: 'info',
          title: 'Нет изменений',
          message: 'Данные не были изменены'
        })
      }

      setIsEditing(false)
    } catch (err: any) {
      const errorMessage = err.message || 'Произошла ошибка при обновлении профиля'
      setError(errorMessage)
      showToast({
        type: 'error',
        title: 'Ошибка обновления',
        message: errorMessage
      })
    } finally {
      setUpdating(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      showToast({
        type: 'success',
        title: 'Выход выполнен',
        message: 'До свидания!'
      })
    } catch (err: any) {
      const errorMessage = err.message || 'Произошла ошибка при выходе'
      setError(errorMessage)
      showToast({
        type: 'error',
        title: 'Ошибка выхода',
        message: errorMessage
      })
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <User className="w-5 h-5" />
          Профиль пользователя
        </h2>
        {!isEditing && (
          <button
            onClick={handleEdit}
            className="flex items-center gap-1 px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 transition-colors"
          >
            <Edit3 className="w-4 h-4" />
            Редактировать
          </button>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Имя пользователя
          </label>
          {isEditing ? (
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              disabled={updating}
            />
          ) : (
            <p className="text-gray-900 font-medium">{user.username}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <p className="text-gray-900">{user.email}</p>
          {isEditing && (
            <p className="text-xs text-gray-500 mt-1">
              Email нельзя изменить через профиль
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Дата регистрации
          </label>
          <p className="text-gray-600">
            {new Date(user.created_at).toLocaleDateString('ru-RU', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>

        {/* Achievements Section */}
        <div className="pt-4 border-t border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="w-5 h-5 text-yellow-600" />
            <h3 className="text-lg font-semibold text-gray-800">
              Достижения ({achievements.length})
            </h3>
          </div>
          <AchievementsList showProgress={true} layout="grid" />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md text-sm">
            {success}
          </div>
        )}

        {isEditing && (
          <div className="flex gap-2 pt-4">
            <LoadingButton
              onClick={handleSave}
              loading={updating}
              className="flex items-center gap-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
            >
              <Save className="w-4 h-4" />
              {updating ? 'Сохранение...' : 'Сохранить'}
            </LoadingButton>
            <button
              onClick={handleCancel}
              disabled={updating}
              className="flex items-center gap-1 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <X className="w-4 h-4" />
              Отмена
            </button>
          </div>
        )}

        <div className="pt-4 border-t border-gray-200">
          <LoadingButton
            onClick={handleSignOut}
            loading={loading}
            className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
          >
            {loading ? 'Выход...' : 'Выйти из аккаунта'}
          </LoadingButton>
        </div>
      </div>
    </div>
  )
}