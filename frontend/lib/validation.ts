// Validation utilities for the Wish Bank system

export interface ValidationResult {
  isValid: boolean
  error?: string
}

/**
 * Validates username according to system requirements
 * - Length: 3-20 characters
 * - Characters: letters, numbers, hyphens, underscores
 * - Cannot start or end with special characters
 * - Cannot contain consecutive special characters
 */
export function validateUsername(username: string): ValidationResult {
  if (!username) {
    return { isValid: false, error: 'Имя пользователя обязательно' }
  }

  if (username.length < 3) {
    return { isValid: false, error: 'Имя пользователя должно содержать минимум 3 символа' }
  }

  if (username.length > 20) {
    return { isValid: false, error: 'Имя пользователя должно содержать максимум 20 символов' }
  }

  // Check allowed characters
  const allowedCharsRegex = /^[a-zA-Z0-9_-]+$/
  if (!allowedCharsRegex.test(username)) {
    return { 
      isValid: false, 
      error: 'Имя пользователя может содержать только буквы, цифры, дефисы и подчеркивания' 
    }
  }

  // Cannot start or end with special characters
  if (username.startsWith('-') || username.startsWith('_') || 
      username.endsWith('-') || username.endsWith('_')) {
    return { 
      isValid: false, 
      error: 'Имя пользователя не может начинаться или заканчиваться дефисом или подчеркиванием' 
    }
  }

  // Cannot contain consecutive special characters
  if (username.includes('--') || username.includes('__') || 
      username.includes('-_') || username.includes('_-')) {
    return { 
      isValid: false, 
      error: 'Имя пользователя не может содержать подряд идущие специальные символы' 
    }
  }

  return { isValid: true }
}

/**
 * Validates email format
 */
export function validateEmail(email: string): ValidationResult {
  if (!email) {
    return { isValid: false, error: 'Email обязателен' }
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Неверный формат email' }
  }

  return { isValid: true }
}

/**
 * Validates password strength
 */
export function validatePassword(password: string): ValidationResult {
  if (!password) {
    return { isValid: false, error: 'Пароль обязателен' }
  }

  if (password.length < 6) {
    return { isValid: false, error: 'Пароль должен содержать минимум 6 символов' }
  }

  if (password.length > 128) {
    return { isValid: false, error: 'Пароль слишком длинный' }
  }

  return { isValid: true }
}

/**
 * Validates wish title
 */
export function validateWishTitle(title: string): ValidationResult {
  if (!title) {
    return { isValid: false, error: 'Название желания обязательно' }
  }

  if (title.length > 100) {
    return { isValid: false, error: 'Название желания не может превышать 100 символов' }
  }

  return { isValid: true }
}

/**
 * Validates wish description
 */
export function validateWishDescription(description: string): ValidationResult {
  if (description && description.length > 500) {
    return { isValid: false, error: 'Описание желания не может превышать 500 символов' }
  }

  return { isValid: true }
}