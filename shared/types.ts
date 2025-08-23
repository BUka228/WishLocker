// Shared types for frontend and backend

export type WishType = 'green' | 'blue' | 'red'
export type WishStatus = 'active' | 'in_progress' | 'completed' | 'rejected'
export type TransactionType = 'earn' | 'spend' | 'convert'
export type CurrencyType = 'green' | 'blue' | 'red'

export interface User {
  id: string
  email: string
  username: string
  avatar_url?: string
  created_at: string
  updated_at: string
}

export interface Wallet {
  id: string
  user_id: string
  green_balance: number
  blue_balance: number
  red_balance: number
  created_at: string
  updated_at: string
}

export interface Wish {
  id: string
  title: string
  description: string
  type: WishType
  cost: number
  status: WishStatus
  creator_id: string
  assignee_id?: string
  deadline?: string
  created_at: string
  updated_at: string
  // Relations
  creator?: User
  assignee?: User
}

export interface Transaction {
  id: string
  user_id: string
  type: TransactionType
  currency: CurrencyType
  amount: number
  description: string
  related_wish_id?: string
  created_at: string
  // Relations
  related_wish?: Wish
}

export interface Achievement {
  id: string
  user_id: string
  achievement_type: string
  title: string
  description: string
  earned_at: string
}

export interface Friendship {
  id: string
  user_id: string
  friend_id: string
  status: 'pending' | 'accepted' | 'blocked'
  created_at: string
  // Relations
  friend?: User
}

// API Response types
export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
}

// Currency conversion rates
export const CURRENCY_CONVERSION = {
  GREEN_TO_BLUE: 10,
  BLUE_TO_RED: 10,
} as const

// Wish type metadata
export const WISH_METADATA = {
  green: {
    emoji: '💚',
    name: 'Зеленое',
    description: 'Простые, милые или смешные желания',
    maxDuration: '1 день',
    color: 'green',
  },
  blue: {
    emoji: '💙',
    name: 'Синее',
    description: 'Более сложные или личные желания',
    maxDuration: '1 неделя',
    color: 'blue',
  },
  red: {
    emoji: '❤️',
    name: 'Красное',
    description: 'Самые ценные и серьёзные желания',
    maxDuration: '1 месяц+',
    color: 'red',
  },
} as const

// Status metadata
export const STATUS_METADATA = {
  active: {
    name: 'Активно',
    color: 'yellow',
  },
  in_progress: {
    name: 'В процессе',
    color: 'blue',
  },
  completed: {
    name: 'Выполнено',
    color: 'green',
  },
  rejected: {
    name: 'Отклонено',
    color: 'red',
  },
} as const