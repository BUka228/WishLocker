// Comprehensive error handling utilities for the Wish Bank system

export interface AppError {
  code: string
  message: string
  details?: any
  timestamp: string
  context?: string
}

export type ErrorType = 
  | 'NETWORK_ERROR'
  | 'VALIDATION_ERROR'
  | 'AUTH_ERROR'
  | 'PERMISSION_ERROR'
  | 'BUSINESS_LOGIC_ERROR'
  | 'DATABASE_ERROR'
  | 'UNKNOWN_ERROR'

/**
 * Centralized error handler that processes all types of errors
 */
export class ErrorHandler {
  /**
   * Process any error and return a user-friendly message
   */
  static processError(error: any, context?: string): AppError {
    const timestamp = new Date().toISOString()
    
    // Handle null/undefined errors
    if (!error) {
      return {
        code: 'UNKNOWN_ERROR',
        message: 'Произошла неизвестная ошибка',
        timestamp,
        context
      }
    }

    // Handle string errors
    if (typeof error === 'string') {
      return {
        code: 'UNKNOWN_ERROR',
        message: error,
        timestamp,
        context
      }
    }

    // Handle Supabase errors
    if (error.code || error.error_description) {
      return this.processSupabaseError(error, context, timestamp)
    }

    // Handle PostgreSQL errors
    if (error.code && error.code.startsWith('23')) {
      return this.processPostgreSQLError(error, context, timestamp)
    }

    // Handle network errors
    if (this.isNetworkError(error)) {
      return {
        code: 'NETWORK_ERROR',
        message: 'Проблемы с подключением к интернету. Проверьте соединение и попробуйте снова.',
        details: error,
        timestamp,
        context
      }
    }

    // Handle validation errors
    if (this.isValidationError(error)) {
      return {
        code: 'VALIDATION_ERROR',
        message: error.message || 'Ошибка валидации данных',
        details: error,
        timestamp,
        context
      }
    }

    // Handle business logic errors from database functions
    if (error.message && this.isBusinessLogicError(error.message)) {
      return this.processBusinessLogicError(error, context, timestamp)
    }

    // Default error handling
    return {
      code: 'UNKNOWN_ERROR',
      message: error.message || 'Произошла неожиданная ошибка. Попробуйте позже.',
      details: error,
      timestamp,
      context
    }
  }

  /**
   * Process Supabase-specific errors
   */
  private static processSupabaseError(error: any, context?: string, timestamp?: string): AppError {
    const code = error.code || error.error || 'SUPABASE_ERROR'
    const message = error.message || error.error_description || ''

    // Authentication errors
    if (code.includes('auth') || code.includes('invalid_credentials')) {
      return {
        code: 'AUTH_ERROR',
        message: this.getAuthErrorMessage(error),
        details: error,
        timestamp: timestamp || new Date().toISOString(),
        context
      }
    }

    // Permission errors
    if (code.includes('permission') || code.includes('policy') || message.includes('RLS')) {
      return {
        code: 'PERMISSION_ERROR',
        message: 'У вас нет прав для выполнения этого действия',
        details: error,
        timestamp: timestamp || new Date().toISOString(),
        context
      }
    }

    // Database constraint errors
    if (code.includes('23505') || message.includes('duplicate key')) {
      return {
        code: 'DATABASE_ERROR',
        message: 'Данные уже существуют в системе',
        details: error,
        timestamp: timestamp || new Date().toISOString(),
        context
      }
    }

    return {
      code: 'DATABASE_ERROR',
      message: message || 'Ошибка базы данных',
      details: error,
      timestamp: timestamp || new Date().toISOString(),
      context
    }
  }

  /**
   * Process PostgreSQL constraint errors
   */
  private static processPostgreSQLError(error: any, context?: string, timestamp?: string): AppError {
    const code = error.code
    const message = error.message || ''

    switch (code) {
      case '23505': // unique_violation
        if (message.includes('users_username_key')) {
          return {
            code: 'VALIDATION_ERROR',
            message: 'Это имя пользователя уже занято',
            details: error,
            timestamp: timestamp || new Date().toISOString(),
            context
          }
        }
        if (message.includes('users_email_key')) {
          return {
            code: 'VALIDATION_ERROR',
            message: 'Пользователь с таким email уже зарегистрирован',
            details: error,
            timestamp: timestamp || new Date().toISOString(),
            context
          }
        }
        return {
          code: 'DATABASE_ERROR',
          message: 'Данные уже существуют в системе',
          details: error,
          timestamp: timestamp || new Date().toISOString(),
          context
        }

      case '23503': // foreign_key_violation
        return {
          code: 'DATABASE_ERROR',
          message: 'Ссылка на несуществующие данные',
          details: error,
          timestamp: timestamp || new Date().toISOString(),
          context
        }

      case '23514': // check_violation
        if (message.includes('balance')) {
          return {
            code: 'BUSINESS_LOGIC_ERROR',
            message: 'Недостаточно средств для выполнения операции',
            details: error,
            timestamp: timestamp || new Date().toISOString(),
            context
          }
        }
        return {
          code: 'VALIDATION_ERROR',
          message: 'Данные не соответствуют требованиям системы',
          details: error,
          timestamp: timestamp || new Date().toISOString(),
          context
        }

      default:
        return {
          code: 'DATABASE_ERROR',
          message: 'Ошибка базы данных',
          details: error,
          timestamp: timestamp || new Date().toISOString(),
          context
        }
    }
  }

  /**
   * Process business logic errors from database functions
   */
  private static processBusinessLogicError(error: any, context?: string, timestamp?: string): AppError {
    const message = error.message || ''

    if (message.includes('INSUFFICIENT_FUNDS')) {
      return {
        code: 'BUSINESS_LOGIC_ERROR',
        message: 'Недостаточно средств для выполнения операции',
        details: error,
        timestamp: timestamp || new Date().toISOString(),
        context
      }
    }

    if (message.includes('WISH_NOT_FOUND')) {
      return {
        code: 'BUSINESS_LOGIC_ERROR',
        message: 'Желание не найдено или недоступно',
        details: error,
        timestamp: timestamp || new Date().toISOString(),
        context
      }
    }

    if (message.includes('INVALID_CONVERSION')) {
      return {
        code: 'BUSINESS_LOGIC_ERROR',
        message: 'Недопустимое направление конвертации валюты',
        details: error,
        timestamp: timestamp || new Date().toISOString(),
        context
      }
    }

    if (message.includes('ALREADY_FRIENDS')) {
      return {
        code: 'BUSINESS_LOGIC_ERROR',
        message: 'Вы уже друзья с этим пользователем',
        details: error,
        timestamp: timestamp || new Date().toISOString(),
        context
      }
    }

    if (message.includes('CANNOT_ADD_SELF')) {
      return {
        code: 'BUSINESS_LOGIC_ERROR',
        message: 'Нельзя добавить себя в друзья',
        details: error,
        timestamp: timestamp || new Date().toISOString(),
        context
      }
    }

    return {
      code: 'BUSINESS_LOGIC_ERROR',
      message: message.split(':')[1]?.trim() || message,
      details: error,
      timestamp: timestamp || new Date().toISOString(),
      context
    }
  }

  /**
   * Get user-friendly auth error message
   */
  private static getAuthErrorMessage(error: any): string {
    const message = error.message || error.error_description || ''
    const code = error.code || error.error || ''

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
      case 'too_many_requests':
        return 'Слишком много попыток. Попробуйте позже'
      default:
        if (message.includes('Invalid login credentials')) {
          return 'Неверный email или пароль'
        }
        if (message.includes('Email not confirmed')) {
          return 'Подтвердите свой email перед входом'
        }
        return message || 'Ошибка аутентификации'
    }
  }

  /**
   * Check if error is a network error
   */
  private static isNetworkError(error: any): boolean {
    const message = error?.message || ''
    return message.includes('Failed to fetch') || 
           message.includes('Network request failed') ||
           message.includes('ERR_NETWORK') ||
           message.includes('ERR_INTERNET_DISCONNECTED') ||
           error?.name === 'NetworkError'
  }

  /**
   * Check if error is a validation error
   */
  private static isValidationError(error: any): boolean {
    const message = error?.message || ''
    return message.includes('должно содержать') ||
           message.includes('может содержать только') ||
           message.includes('обязательно') ||
           message.includes('не может') ||
           message.includes('превышать') ||
           error?.name === 'ValidationError'
  }

  /**
   * Check if error is a business logic error
   */
  private static isBusinessLogicError(message: string): boolean {
    return message.includes('INSUFFICIENT_FUNDS') ||
           message.includes('WISH_NOT_FOUND') ||
           message.includes('INVALID_CONVERSION') ||
           message.includes('ALREADY_FRIENDS') ||
           message.includes('CANNOT_ADD_SELF') ||
           message.includes('DISPUTE_') ||
           message.includes('ACHIEVEMENT_')
  }

  /**
   * Log error to monitoring service (placeholder for real implementation)
   */
  static logError(error: AppError): void {
    // In production, this would send to a monitoring service like Sentry
    console.error('Application Error:', {
      ...error,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
      url: typeof window !== 'undefined' ? window.location.href : 'unknown'
    })
  }

  /**
   * Get error type from error code
   */
  static getErrorType(code: string): ErrorType {
    if (code.includes('NETWORK')) return 'NETWORK_ERROR'
    if (code.includes('VALIDATION')) return 'VALIDATION_ERROR'
    if (code.includes('AUTH')) return 'AUTH_ERROR'
    if (code.includes('PERMISSION')) return 'PERMISSION_ERROR'
    if (code.includes('BUSINESS_LOGIC')) return 'BUSINESS_LOGIC_ERROR'
    if (code.includes('DATABASE')) return 'DATABASE_ERROR'
    return 'UNKNOWN_ERROR'
  }
}

/**
 * Hook for handling errors with toast notifications
 */
export function useErrorHandler() {
  return {
    handleError: (error: any, context?: string) => {
      const processedError = ErrorHandler.processError(error, context)
      ErrorHandler.logError(processedError)
      return processedError
    },
    
    processError: ErrorHandler.processError,
    logError: ErrorHandler.logError,
    getErrorType: ErrorHandler.getErrorType
  }
}