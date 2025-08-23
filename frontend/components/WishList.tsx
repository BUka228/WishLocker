'use client'

import { useState } from 'react'
import { Filter, Clock, CheckCircle, XCircle } from 'lucide-react'

interface Wish {
  id: string
  title: string
  description: string
  type: 'green' | 'blue' | 'red'
  cost: number
  status: 'active' | 'in_progress' | 'completed' | 'rejected'
  creator: string
  assignee?: string
  createdAt: string
  deadline?: string
}

const mockWishes: Wish[] = [
  {
    id: '1',
    title: 'Сделай мне чай',
    description: 'Хочу зеленый чай с медом',
    type: 'green',
    cost: 1,
    status: 'active',
    creator: 'Аня',
    createdAt: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    title: 'Приготовь ужин',
    description: 'Что-то вкусное и сытное',
    type: 'blue',
    cost: 1,
    status: 'in_progress',
    creator: 'Максим',
    assignee: 'Аня',
    createdAt: '2024-01-14T15:30:00Z',
    deadline: '2024-01-20T20:00:00Z'
  }
]

export function WishList() {
  const [filter, setFilter] = useState<'all' | 'green' | 'blue' | 'red'>('all')
  const [wishes] = useState<Wish[]>(mockWishes)

  const getWishIcon = (type: string) => {
    switch (type) {
      case 'green': return '💚'
      case 'blue': return '💙'
      case 'red': return '❤️'
      default: return '💚'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Clock className="w-4 h-4 text-yellow-500" />
      case 'in_progress': return <Clock className="w-4 h-4 text-blue-500" />
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'rejected': return <XCircle className="w-4 h-4 text-red-500" />
      default: return <Clock className="w-4 h-4 text-gray-500" />
    }
  }

  const filteredWishes = filter === 'all' 
    ? wishes 
    : wishes.filter(wish => wish.type === filter)

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Активные желания</h2>
        
        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5 text-gray-500" />
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value as any)}
            className="border border-gray-300 rounded-lg px-3 py-1 text-sm"
          >
            <option value="all">Все</option>
            <option value="green">💚 Зеленые</option>
            <option value="blue">💙 Синие</option>
            <option value="red">❤️ Красные</option>
          </select>
        </div>
      </div>

      <div className="space-y-4">
        {filteredWishes.map((wish) => (
          <div key={wish.id} className={`wish-card wish-${wish.type}`}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  <span className="text-xl mr-2">{getWishIcon(wish.type)}</span>
                  <h3 className="font-semibold text-gray-800">{wish.title}</h3>
                  <span className="ml-2 text-sm text-gray-500">
                    от {wish.creator}
                  </span>
                </div>
                
                <p className="text-gray-600 mb-3">{wish.description}</p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      {getStatusIcon(wish.status)}
                      <span className="ml-1 text-sm text-gray-600 capitalize">
                        {wish.status === 'active' && 'Активно'}
                        {wish.status === 'in_progress' && 'В процессе'}
                        {wish.status === 'completed' && 'Выполнено'}
                        {wish.status === 'rejected' && 'Отклонено'}
                      </span>
                    </div>
                    
                    {wish.assignee && (
                      <span className="text-sm text-blue-600">
                        Исполнитель: {wish.assignee}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex space-x-2">
                    <button className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm hover:bg-green-200 transition-colors">
                      Принять
                    </button>
                    <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors">
                      Оспорить
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}