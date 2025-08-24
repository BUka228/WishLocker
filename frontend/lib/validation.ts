// Comprehensive validation utilities for the Wish Bank system

export interface ValidationResult {
  isValid: boolean
  error?: string
  warnings?: string[]
}

export interface FormValidationResult {
  isValid: boolean
  errors: Record<string, string>
  warnings: Record<string, string[]>
}

/**
 * Validates username according to system requirements
 * - Length: 3-20 characters
 * - Characters: letters, numbers, hyphens, underscores
 * - Cannot start or end with special characters
 * - Cannot contain consecutive special characters
 */
export function validateUsername(username: string): ValidationResult {
  if (!username || typeof username !== 'string') {
    return { isValid: false, error: 'Имя пользователя обязательно' }
  }

  // Trim whitespace
  username = username.trim()

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

  // Check for reserved usernames
  const reservedUsernames = ['admin', 'root', 'system', 'api', 'www', 'mail', 'support']
  if (reservedUsernames.includes(username.toLowerCase())) {
    return {
      isValid: false,
      error: 'Это имя пользователя зарезервировано системой'
    }
  }

  return { isValid: true }
}

/**
 * Validates email format
 */
export function validateEmail(email: string): ValidationResult {
  if (!email || typeof email !== 'string') {
    return { isValid: false, error: 'Email обязателен' }
  }

  // Trim whitespace
  email = email.trim().toLowerCase()

  if (email.length > 254) {
    return { isValid: false, error: 'Email слишком длинный' }
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Неверный формат email' }
  }

  // Check for common typos in domains
  const commonDomains = ['gmail.com', 'yandex.ru', 'mail.ru', 'yahoo.com', 'outlook.com']
  const domain = email.split('@')[1]
  const warnings: string[] = []

  if (domain && !commonDomains.includes(domain)) {
    // Check for common typos
    const typos = [
      { wrong: 'gmial.com', correct: 'gmail.com' },
      { wrong: 'gmai.com', correct: 'gmail.com' },
      { wrong: 'yandx.ru', correct: 'yandex.ru' },
      { wrong: 'mai.ru', correct: 'mail.ru' },
    ]

    const typo = typos.find(t => t.wrong === domain)
    if (typo) {
      warnings.push(`Возможно, вы имели в виду ${typo.correct}?`)
    }
  }

  return { isValid: true, warnings }
}

/**
 * Validates password strength
 */
export function validatePassword(password: string): ValidationResult {
  if (!password || typeof password !== 'string') {
    return { isValid: false, error: 'Пароль обязателен' }
  }

  if (password.length < 6) {
    return { isValid: false, error: 'Пароль должен содержать минимум 6 символов' }
  }

  if (password.length > 128) {
    return { isValid: false, error: 'Пароль слишком длинный' }
  }

  const warnings: string[] = []

  // Check password strength
  const hasUpperCase = /[A-Z]/.test(password)
  const hasLowerCase = /[a-z]/.test(password)
  const hasNumbers = /\d/.test(password)
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password)

  if (!hasUpperCase) {
    warnings.push('Добавьте заглавные буквы для большей безопасности')
  }
  if (!hasNumbers) {
    warnings.push('Добавьте цифры для большей безопасности')
  }
  if (!hasSpecialChar) {
    warnings.push('Добавьте специальные символы для большей безопасности')
  }

  // Check for common weak passwords
  const weakPasswords = ['123456', 'password', 'qwerty', '111111', '123123']
  if (weakPasswords.includes(password.toLowerCase())) {
    return { isValid: false, error: 'Этот пароль слишком простой и небезопасный' }
  }

  return { isValid: true, warnings }
}

/**
 * Validates wish title
 */
export function validateWishTitle(title: string): ValidationResult {
  if (!title) {
    return { isValid: false, error: 'Название желания обязательно' }
  }

  // Trim whitespace
  title = title.trim()

  if (title.length === 0) {
    return { isValid: false, error: 'Название желания не может быть пустым' }
  }

  if (title.length < 3) {
    return { isValid: false, error: 'Название желания должно содержать минимум 3 символа' }
  }

  if (title.length > 100) {
    return { isValid: false, error: 'Название желания не может превышать 100 символов' }
  }

  // Check for inappropriate content (basic check)
  const inappropriateWords = ['спам', 'реклама', 'продам', 'куплю']
  const hasInappropriate = inappropriateWords.some(word => 
    title.toLowerCase().includes(word)
  )

  if (hasInappropriate) {
    return { 
      isValid: false, 
      error: 'Название содержит недопустимый контент' 
    }
  }

  return { isValid: true }
}

/**
 * Validates wish description
 */
export function validateWishDescription(description: string): ValidationResult {
  if (!description) {
    return { isValid: true } // Description is optional
  }

  // Trim whitespace
  description = description.trim()

  if (description.length > 500) {
    return { isValid: false, error: 'Описание желания не может превышать 500 символов' }
  }

  // Check for inappropriate content (basic check)
  const inappropriateWords = ['спам', 'реклама', 'продам', 'куплю']
  const hasInappropriate = inappropriateWords.some(word => 
    description.toLowerCase().includes(word)
  )

  if (hasInappropriate) {
    return { 
      isValid: false, 
      error: 'Описание содержит недопустимый контент' 
    }
  }

  return { isValid: true }
}

/**
 * Validates currency amount
 */
export function validateCurrencyAmount(amount: number | string): ValidationResult {
  if (amount === '' || amount === null || amount === undefined) {
    return { isValid: false, error: 'Сумма обязательна' }
  }

  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount

  if (isNaN(numAmount)) {
    return { isValid: false, error: 'Сумма должна быть числом' }
  }

  if (numAmount <= 0) {
    return { isValid: false, error: 'Сумма должна быть больше нуля' }
  }

  if (!Number.isInteger(numAmount)) {
    return { isValid: false, error: 'Сумма должна быть целым числом' }
  }

  if (numAmount > 1000000) {
    return { isValid: false, error: 'Сумма слишком большая' }
  }

  return { isValid: true }
}

/**
 * Validates comment text
 */
export function validateComment(comment: string, maxLength: number = 1000): ValidationResult {
  if (!comment) {
    return { isValid: false, error: 'Комментарий обязателен' }
  }

  // Trim whitespace
  comment = comment.trim()

  if (comment.length === 0) {
    return { isValid: false, error: 'Комментарий не может быть пустым' }
  }

  if (comment.length < 3) {
    return { isValid: false, error: 'Комментарий должен содержать минимум 3 символа' }
  }

  if (comment.length > maxLength) {
    return { isValid: false, error: `Комментарий не может превышать ${maxLength} символов` }
  }

  return { isValid: true }
}

/**
 * Validates form data with multiple fields
 */
export function validateForm(data: Record<string, any>, rules: Record<string, (value: any) => ValidationResult>): FormValidationResult {
  const errors: Record<string, string> = {}
  const warnings: Record<string, string[]> = {}
  let isValid = true

  for (const [field, validator] of Object.entries(rules)) {
    const result = validator(data[field])
    
    if (!result.isValid && result.error) {
      errors[field] = result.error
      isValid = false
    }

    if (result.warnings && result.warnings.length > 0) {
      warnings[field] = result.warnings
    }
  }

  return { isValid, errors, warnings }
}

/**
 * Sanitizes user input to prevent XSS
 */
export function sanitizeInput(input: string): string {
  if (!input) return ''
  
  return input
    .trim()
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
}

/**
 * Validates file upload
 */
export function validateFile(file: File, options: {
  maxSize?: number
  allowedTypes?: string[]
}): ValidationResult {
  const { maxSize = 5 * 1024 * 1024, allowedTypes = ['image/jpeg', 'image/png', 'image/gif'] } = options

  if (!file) {
    return { isValid: false, error: 'Файл не выбран' }
  }

  if (file.size > maxSize) {
    const maxSizeMB = Math.round(maxSize / (1024 * 1024))
    return { isValid: false, error: `Размер файла не должен превышать ${maxSizeMB}MB` }
  }

  if (!allowedTypes.includes(file.type)) {
    return { isValid: false, error: 'Неподдерживаемый тип файла' }
  }

  return { isValid: true }
}