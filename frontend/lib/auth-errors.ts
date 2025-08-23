// Authentication error handling utilities

export interface AuthError {
  message: string
  code?: string
}

/**
 * Converts Supabase auth errors to user-friendly Russian messages
 */
export function getAuthErrorMessage(error: any): string {
  if (!error) return 'Произошла неизвестная ошибка'

  // Handle string errors
  if (typeof error === 'string') {
    return error
  }

  // Handle error objects
  const message = error.message || error.error_description || ''
  const code = error.code || error.error || ''

  // Common Supabase auth error codes
  switch (code) {
    case 'invalid_credentials':
      return 'Неверный email или пароль'
    
    case 'email_not_confirmed':
      return 'Подтвердите свой email перед входом'
    
    case 'signup_disabled':
      return 'Регистрация временно отключена'
    
    case 'email_address_invalid':
      return 'Неверный формат email адреса'
    
    case 'password_too_short':
      return 'Пароль слишком короткий'
    
    case 'weak_password':
      return 'Пароль слишком простой. Используйте более сложный пароль'
    
    case 'email_address_not_authorized':
      return 'Этот email адрес не авторизован для регистрации'
    
    case 'user_already_registered':
      return 'Пользователь с таким email уже зарегистрирован'
    
    case 'too_many_requests':
      return 'Слишком много попыток. Попробуйте позже'
    
    case 'captcha_failed':
      return 'Ошибка проверки капчи'
    
    default:
      break
  }

  // Handle common message patterns
  if (message.includes('Invalid login credentials')) {
    return 'Неверный email или пароль'
  }
  
  if (message.includes('Email not confirmed')) {
    return 'Подтвердите свой email перед входом'
  }
  
  if (message.includes('User already registered')) {
    return 'Пользователь с таким email уже зарегистрирован'
  }
  
  if (message.includes('Password should be at least')) {
    return 'Пароль должен содержать минимум 6 символов'
  }
  
  if (message.includes('Unable to validate email address')) {
    return 'Неверный формат email адреса'
  }
  
  if (message.includes('Email rate limit exceeded')) {
    return 'Превышен лимит отправки email. Попробуйте позже'
  }

  // Database constraint errors
  if (message.includes('duplicate key value violates unique constraint')) {
    if (message.includes('users_username_key')) {
      return 'Это имя пользователя уже занято'
    }
    if (message.includes('users_email_key')) {
      return 'Пользователь с таким email уже зарегистрирован'
    }
    return 'Данные уже используются другим пользователем'
  }

  // Network errors
  if (message.includes('Failed to fetch') || message.includes('Network request failed')) {
    return 'Ошибка сети. Проверьте подключение к интернету'
  }

  // Return original message if no specific handling found
  return message || 'Произошла ошибка. Попробуйте позже'
}

/**
 * Checks if an error is a network/connection error
 */
export function isNetworkError(error: any): boolean {
  const message = error?.message || ''
  return message.includes('Failed to fetch') || 
         message.includes('Network request failed') ||
         message.includes('ERR_NETWORK') ||
         message.includes('ERR_INTERNET_DISCONNECTED')
}

/**
 * Checks if an error is a validation error
 */
export function isValidationError(error: any): boolean {
  const message = error?.message || ''
  return message.includes('должно содержать') ||
         message.includes('может содержать только') ||
         message.includes('обязательно') ||
         message.includes('не может')
}