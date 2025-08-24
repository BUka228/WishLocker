'use client'

import React from 'react'
import { WishCard } from './WishCard'
import { useDragAndDrop } from '@/hooks/useDragAndDrop'
import { useWish } from '@/contexts/WishContext'
import { useToast } from '@/components/ui/Toast'
import { Wish, WishStatus } from '@/lib/types'
import { Clock, Play, CheckCircle, XCircle, AlertTriangle } from 'lucide-react'

interface WishBoardProps {
  wishes: Wish[]
  className?: string
}

const statusColumns: { status: WishStatus; title: string; icon: React.ComponentType<{ className?: string }>; color: string }[] = [
  { status: 'active', title: 'Активные', icon: Clock, color: 'border-yellow-300 bg-yellow-50' },
  { status: 'in_progress', title: 'В процессе', icon: Play, color: 'border-blue-300 bg-blue-50' },
  { status: 'completed', title: 'Выполненные', icon: CheckCircle, color: 'border-green-300 bg-green-50' },
  { status: 'disputed', title: 'Спорные', icon: AlertTriangle, color: 'border-orange-300 bg-orange-50' },
  { status: 'rejected', title: 'Отклоненные', icon: XCircle, color: 'border-red-300 bg-red-50' }
]

export function WishBoard({ wishes, className = '' }: WishBoardProps) {
  const { updateWishStatus } = useWish()
  const { showToast } = useToast()

  const { getDragProps, getDropProps, isDragging, draggedItem } = useDragAndDrop({
    onDrop: async (draggedWish: Wish, newStatus: string) => {
      if (draggedWish.status === newStatus) return

      try {
        await updateWishStatus(draggedWish.id, newStatus as WishStatus)
        showToast({
          type: 'success',
          title: 'Статус обновлен',
          message: `Желание "${draggedWish.title}" перемещено в "${statusColumns.find(col => col.status === newStatus)?.title}"`
        })
      } catch (error) {
        showToast({
          type: 'error',
          title: 'Ошибка',
          message: 'Не удалось обновить статус желания'
        })
      }
    }
  })

  const getWishesByStatus = (status: WishStatus) => {
    return wishes.filter(wish => wish.status === status)
  }

  return (
    <div className={`${className}`}>
      {/* Mobile View - Stacked */}
      <div className="lg:hidden space-y-6">
        {statusColumns.map(column => {
          const columnWishes = getWishesByStatus(column.status)
          const Icon = column.icon
          
          return (
            <div key={column.status} className="space-y-3">
              <div className="flex items-center space-x-2">
                <Icon className="w-5 h-5 text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-800">{column.title}</h3>
                <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-sm">
                  {columnWishes.length}
                </span>
              </div>
              
              <div className="space-y-3">
                {columnWishes.map(wish => (
                  <div key={wish.id} {...getDragProps(wish)}>
                    <WishCard wish={wish} />
                  </div>
                ))}
                
                {columnWishes.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Icon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>Нет желаний в этой категории</p>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Desktop View - Kanban Board */}
      <div className="hidden lg:block">
        <div className="grid grid-cols-5 gap-6 h-[calc(100vh-200px)]">
          {statusColumns.map(column => {
            const columnWishes = getWishesByStatus(column.status)
            const Icon = column.icon
            const dropProps = getDropProps(column.status)
            
            return (
              <div
                key={column.status}
                {...dropProps}
                className={`
                  flex flex-col bg-gray-50 rounded-lg border-2 border-dashed border-gray-200 
                  transition-all duration-200 ${dropProps.className || ''}
                `}
              >
                {/* Column Header */}
                <div className="p-4 border-b border-gray-200 bg-white rounded-t-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Icon className="w-5 h-5 text-gray-600" />
                      <h3 className="font-semibold text-gray-800">{column.title}</h3>
                    </div>
                    <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-sm">
                      {columnWishes.length}
                    </span>
                  </div>
                </div>

                {/* Column Content */}
                <div className="flex-1 p-4 space-y-3 overflow-y-auto scrollbar-hide">
                  {columnWishes.map(wish => (
                    <div
                      key={wish.id}
                      {...getDragProps(wish)}
                      className={`
                        transition-all duration-200 cursor-move
                        ${draggedItem === wish ? 'opacity-50 scale-95 rotate-2' : 'hover:scale-105'}
                      `}
                    >
                      <WishCard wish={wish} />
                    </div>
                  ))}
                  
                  {columnWishes.length === 0 && (
                    <div className="text-center py-12 text-gray-400">
                      <Icon className="w-12 h-12 mx-auto mb-3 opacity-30" />
                      <p className="text-sm">Перетащите желания сюда</p>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Drag Overlay */}
        {isDragging && (
          <div className="fixed inset-0 bg-blue-500 bg-opacity-10 pointer-events-none z-40 flex items-center justify-center">
            <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Play className="w-6 h-6 text-blue-600" />
                </div>
                <p className="text-gray-800 font-medium">Перетащите в нужную колонку</p>
                <p className="text-gray-600 text-sm mt-1">Отпустите, чтобы изменить статус</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}