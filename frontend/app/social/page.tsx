'use client'

import React, { useState } from 'react'
import { Users, UserPlus, Inbox } from 'lucide-react'
import FriendsList from '@/components/social/FriendsList'
import FriendRequests from '@/components/social/FriendRequests'
import UserSearch from '@/components/social/UserSearch'
import { useSocial } from '@/contexts/SocialContext'

type TabType = 'friends' | 'requests' | 'search'

export default function SocialPage() {
  const [activeTab, setActiveTab] = useState<TabType>('friends')
  const { friends, friendRequests } = useSocial()

  const tabs = [
    {
      id: 'friends' as TabType,
      name: 'Друзья',
      icon: Users,
      count: friends.length,
    },
    {
      id: 'requests' as TabType,
      name: 'Запросы',
      icon: Inbox,
      count: friendRequests.length,
    },
    {
      id: 'search' as TabType,
      name: 'Поиск',
      icon: UserPlus,
      count: 0,
    },
  ]

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Социальные связи</h1>
        <p className="text-gray-600">
          Управляйте своими друзьями и социальными связями
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center py-2 px-1 border-b-2 font-medium text-sm transition-colors
                  ${isActive
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <Icon className="h-5 w-5 mr-2" />
                {tab.name}
                {tab.count > 0 && (
                  <span className={`
                    ml-2 px-2 py-1 text-xs rounded-full
                    ${isActive
                      ? 'bg-blue-100 text-blue-600'
                      : 'bg-gray-100 text-gray-600'
                    }
                  `}>
                    {tab.count}
                  </span>
                )}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        {activeTab === 'friends' && <FriendsList />}
        {activeTab === 'requests' && <FriendRequests />}
        {activeTab === 'search' && <UserSearch />}
      </div>
    </div>
  )
}