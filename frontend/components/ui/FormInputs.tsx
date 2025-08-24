'use client'

import React, { forwardRef, useState } from 'react'
import { Eye, EyeOff, AlertCircle, CheckCircle, Info } from 'lucide-react'

interface BaseInputProps {
  label?: string
  error?: string
  warnings?: string[]
  helperText?: string
  required?: boolean
  disabled?: boolean
  className?: string
  containerClassName?: string
}

interface TextInputProps extends BaseInputProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url'
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  placeholder?: string
  maxLength?: number
  minLength?: number
  autoComplete?: string
  showCharCount?: boolean
}

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(({
  label,
  error,
  warnings = [],
  helperText,
  required,
  disabled,
  className = '',
  containerClassName = '',
  type = 'text',
  value,
  onChange,
  onBlur,
  placeholder,
  maxLength,
  minLength,
  autoComplete,
  showCharCount = false,
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = useState(false)
  const isPassword = type === 'password'
  const inputType = isPassword && showPassword ? 'text' : type

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value)
  }

  const inputId = `input-${Math.random().toString(36).substr(2, 9)}`

  return (
    <div className={`space-y-1 ${containerClassName}`}>
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        <input
          ref={ref}
          id={inputId}
          type={inputType}
          value={value}
          onChange={handleChange}
          onBlur={onBlur}
          placeholder={placeholder}
          maxLength={maxLength}
          minLength={minLength}
          autoComplete={autoComplete}
          disabled={disabled}
          className={`
            w-full px-3 py-2 border rounded-lg shadow-sm
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
            ${error 
              ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
              : 'border-gray-300'
            }
            ${isPassword ? 'pr-10' : ''}
            ${className}
          `}
          {...props}
        />
        
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
            disabled={disabled}
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        )}
      </div>

      {/* Character count */}
      {showCharCount && maxLength && (
        <div className="text-xs text-gray-500 text-right">
          {value.length}/{maxLength}
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="flex items-center gap-1 text-sm text-red-600">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Warning messages */}
      {warnings.length > 0 && !error && (
        <div className="space-y-1">
          {warnings.map((warning, index) => (
            <div key={index} className="flex items-center gap-1 text-sm text-yellow-600">
              <Info className="w-4 h-4 flex-shrink-0" />
              <span>{warning}</span>
            </div>
          ))}
        </div>
      )}

      {/* Helper text */}
      {helperText && !error && warnings.length === 0 && (
        <div className="text-sm text-gray-500">
          {helperText}
        </div>
      )}
    </div>
  )
})

TextInput.displayName = 'TextInput'

interface TextAreaProps extends BaseInputProps {
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  placeholder?: string
  rows?: number
  maxLength?: number
  minLength?: number
  showCharCount?: boolean
  resize?: boolean
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(({
  label,
  error,
  warnings = [],
  helperText,
  required,
  disabled,
  className = '',
  containerClassName = '',
  value,
  onChange,
  onBlur,
  placeholder,
  rows = 3,
  maxLength,
  minLength,
  showCharCount = false,
  resize = true,
  ...props
}, ref) => {
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value)
  }

  const inputId = `textarea-${Math.random().toString(36).substr(2, 9)}`

  return (
    <div className={`space-y-1 ${containerClassName}`}>
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <textarea
        ref={ref}
        id={inputId}
        value={value}
        onChange={handleChange}
        onBlur={onBlur}
        placeholder={placeholder}
        rows={rows}
        maxLength={maxLength}
        minLength={minLength}
        disabled={disabled}
        className={`
          w-full px-3 py-2 border rounded-lg shadow-sm
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
          ${error 
            ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
            : 'border-gray-300'
          }
          ${resize ? 'resize-y' : 'resize-none'}
          ${className}
        `}
        {...props}
      />

      {/* Character count */}
      {showCharCount && maxLength && (
        <div className="text-xs text-gray-500 text-right">
          {value.length}/{maxLength}
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="flex items-center gap-1 text-sm text-red-600">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Warning messages */}
      {warnings.length > 0 && !error && (
        <div className="space-y-1">
          {warnings.map((warning, index) => (
            <div key={index} className="flex items-center gap-1 text-sm text-yellow-600">
              <Info className="w-4 h-4 flex-shrink-0" />
              <span>{warning}</span>
            </div>
          ))}
        </div>
      )}

      {/* Helper text */}
      {helperText && !error && warnings.length === 0 && (
        <div className="text-sm text-gray-500">
          {helperText}
        </div>
      )}
    </div>
  )
})

TextArea.displayName = 'TextArea'

interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

interface SelectProps extends BaseInputProps {
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  options: SelectOption[]
  placeholder?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(({
  label,
  error,
  warnings = [],
  helperText,
  required,
  disabled,
  className = '',
  containerClassName = '',
  value,
  onChange,
  onBlur,
  options,
  placeholder,
  ...props
}, ref) => {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(e.target.value)
  }

  const inputId = `select-${Math.random().toString(36).substr(2, 9)}`

  return (
    <div className={`space-y-1 ${containerClassName}`}>
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <select
        ref={ref}
        id={inputId}
        value={value}
        onChange={handleChange}
        onBlur={onBlur}
        disabled={disabled}
        className={`
          w-full px-3 py-2 border rounded-lg shadow-sm
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
          ${error 
            ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
            : 'border-gray-300'
          }
          ${className}
        `}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option 
            key={option.value} 
            value={option.value}
            disabled={option.disabled}
          >
            {option.label}
          </option>
        ))}
      </select>

      {/* Error message */}
      {error && (
        <div className="flex items-center gap-1 text-sm text-red-600">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Warning messages */}
      {warnings.length > 0 && !error && (
        <div className="space-y-1">
          {warnings.map((warning, index) => (
            <div key={index} className="flex items-center gap-1 text-sm text-yellow-600">
              <Info className="w-4 h-4 flex-shrink-0" />
              <span>{warning}</span>
            </div>
          ))}
        </div>
      )}

      {/* Helper text */}
      {helperText && !error && warnings.length === 0 && (
        <div className="text-sm text-gray-500">
          {helperText}
        </div>
      )}
    </div>
  )
})

Select.displayName = 'Select'

interface CheckboxProps extends BaseInputProps {
  checked: boolean
  onChange: (checked: boolean) => void
  onBlur?: () => void
  children: React.ReactNode
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(({
  label,
  error,
  warnings = [],
  helperText,
  required,
  disabled,
  className = '',
  containerClassName = '',
  checked,
  onChange,
  onBlur,
  children,
  ...props
}, ref) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.checked)
  }

  const inputId = `checkbox-${Math.random().toString(36).substr(2, 9)}`

  return (
    <div className={`space-y-1 ${containerClassName}`}>
      <div className="flex items-start">
        <input
          ref={ref}
          id={inputId}
          type="checkbox"
          checked={checked}
          onChange={handleChange}
          onBlur={onBlur}
          disabled={disabled}
          className={`
            mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded
            focus:ring-blue-500 focus:ring-2
            disabled:cursor-not-allowed disabled:opacity-50
            ${error ? 'border-red-300' : ''}
            ${className}
          `}
          {...props}
        />
        <div className="ml-3 flex-1">
          <label htmlFor={inputId} className="text-sm text-gray-700 cursor-pointer">
            {children}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="flex items-center gap-1 text-sm text-red-600 ml-7">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Warning messages */}
      {warnings.length > 0 && !error && (
        <div className="space-y-1 ml-7">
          {warnings.map((warning, index) => (
            <div key={index} className="flex items-center gap-1 text-sm text-yellow-600">
              <Info className="w-4 h-4 flex-shrink-0" />
              <span>{warning}</span>
            </div>
          ))}
        </div>
      )}

      {/* Helper text */}
      {helperText && !error && warnings.length === 0 && (
        <div className="text-sm text-gray-500 ml-7">
          {helperText}
        </div>
      )}
    </div>
  )
})

Checkbox.displayName = 'Checkbox'

interface FormErrorSummaryProps {
  errors: Record<string, string>
  className?: string
}

export function FormErrorSummary({ errors, className = '' }: FormErrorSummaryProps) {
  const errorEntries = Object.entries(errors)
  
  if (errorEntries.length === 0) {
    return null
  }

  return (
    <div className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-center gap-2 mb-2">
        <AlertCircle className="w-5 h-5 text-red-500" />
        <h3 className="text-sm font-medium text-red-800">
          Пожалуйста, исправьте следующие ошибки:
        </h3>
      </div>
      <ul className="text-sm text-red-700 space-y-1">
        {errorEntries.map(([field, error]) => (
          <li key={field}>• {error}</li>
        ))}
      </ul>
    </div>
  )
}