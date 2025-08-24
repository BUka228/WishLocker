// Shared types for frontend and backend

export type WishType = 'green' | 'blue' | 'red'
export type WishStatus = 'active' | 'in_progress' | 'completed' | 'rejected' | 'disputed'
export type DisputeStatus = 'pending' | 'accepted' | 'rejected'
export type TransactionType = 'earn' | 'spend' | 'convert'
export type CurrencyType = 'green' | 'blue' | 'red'
export type AchievementType = 'first_wish' | 'wish_master' | 'converter' | 'legendary_fulfiller'

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
  description: string | null
  type: WishType
  cost: number
  status: WishStatus
  creator_id: string
  assignee_id?: string | null
  deadline?: string | null
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
  related_wish_id?: string | null
  created_at: string | null
  // Relations
  related_wish?: Partial<Wish> | null
}

export interface Achievement {
  id: string
  user_id: string
  achievement_type: string
  achievement_type_enum?: AchievementType
  title: string
  description: string | null
  earned_at: string | null
}

export interface AchievementProgress {
  achievement_type: AchievementType
  title: string
  description: string
  earned: boolean
  earned_at: string | null
  progress: number
  max_progress: number
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

export interface Dispute {
  id: string
  wish_id: string
  disputer_id: string
  comment: string
  alternative_description?: string | null
  status: DisputeStatus
  resolution_comment?: string | null
  resolved_by?: string | null
  resolved_at?: string | null
  created_at: string
  updated_at: string
  // Relations
  disputer?: User
  wish?: Wish
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
  disputed: {
    name: 'Спорное',
    color: 'orange',
  },
} as const

// Dispute status metadata
export const DISPUTE_STATUS_METADATA = {
  pending: {
    name: 'Ожидает',
    color: 'yellow',
  },
  accepted: {
    name: 'Принято',
    color: 'green',
  },
  rejected: {
    name: 'Отклонено',
    color: 'red',
  },
} as const

// Achievement metadata
export const ACHIEVEMENT_METADATA = {
  first_wish: {
    title: 'Первое желание',
    description: 'Создал своё первое желание в системе',
    icon: '🌟',
    color: 'yellow',
    rarity: 'common',
  },
  wish_master: {
    title: 'Мастер желаний',
    description: 'Выполнил 5 желаний других пользователей',
    icon: '🏆',
    color: 'gold',
    rarity: 'rare',
  },
  converter: {
    title: 'Конвертер',
    description: 'Впервые конвертировал валюту',
    icon: '🔄',
    color: 'blue',
    rarity: 'common',
  },
  legendary_fulfiller: {
    title: 'Легендарный исполнитель',
    description: 'Выполнил красное (легендарное) желание',
    icon: '👑',
    color: 'red',
    rarity: 'legendary',
  },
} as const