'use client'

import React, { useState } from 'react'
import { Plus, Heart, Gift, ArrowUpDown, X } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function QuickActionsFAB() {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()

  const quickActions = [
    {
      icon: Heart,
      label: 'Создать желание',
      color: 'bg-green-500 hover:bg-green-600',
      action: () => {
        // Navigate to create wish page or open modal
        router.push('/wishes/create')
        setIsOpen(false)
      }
    },
    {
      icon: Gift,
      label: 'Подарить валюту',
      color: 'bg-purple-500 hover:bg-purple-600',
      action: () => {
        // Open gift modal or navigate to gift page
        router.push('/social?action=gift')
        setIsOpen(false)
      }
    },
    {
      icon: ArrowUpDown,
      label: 'Конвертировать',
      color: 'bg-blue-500 hover:bg-blue-600',
      action: () => {
        // Open converter modal or navigate to converter
        router.push('/?action=convert')
        setIsOpen(false)
      }
    }
  ]

  return (
    <div className="fixed bottom-20 right-4 lg:bottom-8 lg:right-8 z-30">
      {/* Action Buttons */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 space-y-3 animate-slide-up">
          {quickActions.map((action, index) => {
            const Icon = action.icon
            return (
              <div
                key={index}
                className="flex items-center space-x-3 animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <span className="bg-white text-gray-800 px-3 py-2 rounded-lg shadow-lg text-sm font-medium whitespace-nowrap">
                  {action.label}
                </span>
                <button
                  onClick={action.action}
                  className={`
                    w-12 h-12 rounded-full shadow-lg text-white transition-all duration-200 transform hover:scale-110 active:scale-95
                    ${action.color}
                  `}
                >
                  <Icon className="w-5 h-5 mx-auto" />
                </button>
              </div>
            )
          })}
        </div>
      )}

      {/* Main FAB */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-14 h-14 rounded-full shadow-lg text-white transition-all duration-300 transform hover:scale-110 active:scale-95
          ${isOpen 
            ? 'bg-red-500 hover:bg-red-600 rotate-45' 
            : 'bg-blue-600 hover:bg-blue-700'
          }
        `}
      >
        {isOpen ? (
          <X className="w-6 h-6 mx-auto" />
        ) : (
          <Plus className="w-6 h-6 mx-auto" />
        )}
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-20 -z-10"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}