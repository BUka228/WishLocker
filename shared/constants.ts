// Shared constants

export const APP_CONFIG = {
  name: 'Банк Желаний',
  version: '1.0.0',
  description: 'Система управления желаниями с трехуровневой валютной системой',
} as const

export const CURRENCY_LIMITS = {
  MAX_GREEN: 999,
  MAX_BLUE: 99,
  MAX_RED: 9,
  STARTING_GREEN: 5,
} as const

export const WISH_LIMITS = {
  TITLE_MAX_LENGTH: 100,
  DESCRIPTION_MAX_LENGTH: 500,
  MAX_ACTIVE_WISHES_PER_USER: 10,
} as const

export const ACHIEVEMENT_TYPES = {
  FIRST_WISH: 'first_wish',
  WISH_CREATOR: 'wish_creator', // Created 10 wishes
  WISH_MASTER: 'wish_master', // Completed 5 wishes
  CURRENCY_COLLECTOR: 'currency_collector', // Earned 100 green wishes
  CONVERTER: 'converter', // First currency conversion
  SOCIAL_BUTTERFLY: 'social_butterfly', // Added 5 friends
  LEGENDARY_FULFILLER: 'legendary_fulfiller', // Completed a red wish
} as const

export const NOTIFICATION_TYPES = {
  WISH_CREATED: 'wish_created',
  WISH_ASSIGNED: 'wish_assigned',
  WISH_COMPLETED: 'wish_completed',
  WISH_REJECTED: 'wish_rejected',
  CURRENCY_EARNED: 'currency_earned',
  FRIEND_REQUEST: 'friend_request',
  ACHIEVEMENT_EARNED: 'achievement_earned',
} as const

export const API_ENDPOINTS = {
  WISHES: '/api/wishes',
  WALLET: '/api/wallet',
  TRANSACTIONS: '/api/transactions',
  USERS: '/api/users',
  FRIENDS: '/api/friends',
  ACHIEVEMENTS: '/api/achievements',
} as const

export const ROUTES = {
  HOME: '/',
  PROFILE: '/profile',
  WISHES: '/wishes',
  FRIENDS: '/friends',
  TRANSACTIONS: '/transactions',
  SETTINGS: '/settings',
} as const