'use client'

import { useState, useCallback, useEffect } from 'react'
import { ValidationResult, FormValidationResult, validateForm } from '@/lib/validation'
import { useToast } from '@/components/ui/Toast'
import { ErrorHandler } from '@/lib/error-handler'

export interface FormField {
  value: any
  error?: string
  warnings?: string[]
  touched: boolean
  dirty: boolean
}

export interface FormState {
  [key: string]: FormField
}

export interface ValidationRules {
  [key: string]: (value: any) => ValidationResult
}

export interface UseFormValidationOptions {
  initialValues: Record<string, any>
  validationRules: ValidationRules
  validateOnChange?: boolean
  validateOnBlur?: boolean
  showToastOnError?: boolean
}

export function useFormValidation({
  initialValues,
  validationRules,
  validateOnChange = false,
  validateOnBlur = true,
  showToastOnError = false
}: UseFormValidationOptions) {
  const { showToast } = useToast()
  
  // Initialize form state
  const [formState, setFormState] = useState<FormState>(() => {
    const state: FormState = {}
    for (const [key, value] of Object.entries(initialValues)) {
      state[key] = {
        value,
        touched: false,
        dirty: false
      }
    }
    return state
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  // Validate a single field
  const validateField = useCallback((fieldName: string, value: any): ValidationResult => {
    const validator = validationRules[fieldName]
    if (!validator) {
      return { isValid: true }
    }
    return validator(value)
  }, [validationRules])

  // Validate all fields
  const validateAllFields = useCallback((): FormValidationResult => {
    const data: Record<string, any> = {}
    for (const [key, field] of Object.entries(formState)) {
      data[key] = field.value
    }
    return validateForm(data, validationRules)
  }, [formState, validationRules])

  // Update field value
  const setFieldValue = useCallback((fieldName: string, value: any) => {
    setFormState(prev => {
      const field = prev[fieldName]
      const newField: FormField = {
        ...field,
        value,
        dirty: value !== initialValues[fieldName],
        error: undefined,
        warnings: undefined
      }

      // Validate on change if enabled
      if (validateOnChange || field.touched) {
        const validation = validateField(fieldName, value)
        if (!validation.isValid) {
          newField.error = validation.error
        }
        if (validation.warnings) {
          newField.warnings = validation.warnings
        }
      }

      return {
        ...prev,
        [fieldName]: newField
      }
    })
  }, [validateField, validateOnChange, initialValues])

  // Mark field as touched (usually on blur)
  const setFieldTouched = useCallback((fieldName: string, touched: boolean = true) => {
    setFormState(prev => {
      const field = prev[fieldName]
      const newField: FormField = {
        ...field,
        touched,
        error: undefined,
        warnings: undefined
      }

      // Validate on blur if enabled and field is touched
      if (validateOnBlur && touched) {
        const validation = validateField(fieldName, field.value)
        if (!validation.isValid) {
          newField.error = validation.error
        }
        if (validation.warnings) {
          newField.warnings = validation.warnings
        }
      }

      return {
        ...prev,
        [fieldName]: newField
      }
    })
  }, [validateField, validateOnBlur])

  // Set field error manually
  const setFieldError = useCallback((fieldName: string, error: string | undefined) => {
    setFormState(prev => ({
      ...prev,
      [fieldName]: {
        ...prev[fieldName],
        error
      }
    }))
  }, [])

  // Clear all errors
  const clearErrors = useCallback(() => {
    setFormState(prev => {
      const newState: FormState = {}
      for (const [key, field] of Object.entries(prev)) {
        newState[key] = {
          ...field,
          error: undefined,
          warnings: undefined
        }
      }
      return newState
    })
    setSubmitError(null)
  }, [])

  // Reset form to initial values
  const resetForm = useCallback(() => {
    const state: FormState = {}
    for (const [key, value] of Object.entries(initialValues)) {
      state[key] = {
        value,
        touched: false,
        dirty: false
      }
    }
    setFormState(state)
    setSubmitError(null)
    setIsSubmitting(false)
  }, [initialValues])

  // Get form values
  const getValues = useCallback((): Record<string, any> => {
    const values: Record<string, any> = {}
    for (const [key, field] of Object.entries(formState)) {
      values[key] = field.value
    }
    return values
  }, [formState])

  // Check if form is valid
  const isValid = useCallback((): boolean => {
    const validation = validateAllFields()
    return validation.isValid
  }, [validateAllFields])

  // Check if form has errors
  const hasErrors = useCallback((): boolean => {
    return Object.values(formState).some(field => field.error) || !!submitError
  }, [formState, submitError])

  // Check if form is dirty (has changes)
  const isDirty = useCallback((): boolean => {
    return Object.values(formState).some(field => field.dirty)
  }, [formState])

  // Get all errors
  const getErrors = useCallback((): Record<string, string> => {
    const errors: Record<string, string> = {}
    for (const [key, field] of Object.entries(formState)) {
      if (field.error) {
        errors[key] = field.error
      }
    }
    return errors
  }, [formState])

  // Handle form submission
  const handleSubmit = useCallback(async (
    onSubmit: (values: Record<string, any>) => Promise<void> | void,
    options: { validateBeforeSubmit?: boolean } = {}
  ) => {
    const { validateBeforeSubmit = true } = options

    try {
      setIsSubmitting(true)
      setSubmitError(null)

      // Validate all fields before submit if enabled
      if (validateBeforeSubmit) {
        const validation = validateAllFields()
        
        if (!validation.isValid) {
          // Set field errors
          setFormState(prev => {
            const newState: FormState = { ...prev }
            for (const [key, error] of Object.entries(validation.errors)) {
              if (newState[key]) {
                newState[key] = {
                  ...newState[key],
                  error,
                  touched: true
                }
              }
            }
            return newState
          })

          if (showToastOnError) {
            showToast({
              type: 'error',
              title: 'Ошибка валидации',
              message: 'Пожалуйста, исправьте ошибки в форме'
            })
          }

          return
        }
      }

      // Call submit handler
      const values = getValues()
      await onSubmit(values)

    } catch (error: any) {
      const processedError = ErrorHandler.processError(error, 'form-submission')
      setSubmitError(processedError.message)

      if (showToastOnError) {
        showToast({
          type: 'error',
          title: 'Ошибка отправки',
          message: processedError.message
        })
      }

      // Handle field-specific errors from server
      if (error.fieldErrors) {
        setFormState(prev => {
          const newState: FormState = { ...prev }
          for (const [key, fieldError] of Object.entries(error.fieldErrors)) {
            if (newState[key]) {
              newState[key] = {
                ...newState[key],
                error: fieldError as string,
                touched: true
              }
            }
          }
          return newState
        })
      }
    } finally {
      setIsSubmitting(false)
    }
  }, [validateAllFields, getValues, showToastOnError, showToast])

  // Helper function to get field props for input components
  const getFieldProps = useCallback((fieldName: string) => {
    const field = formState[fieldName]
    if (!field) {
      console.warn(`Field "${fieldName}" not found in form state`)
      return {
        value: '',
        onChange: () => {},
        onBlur: () => {},
        error: undefined,
        warnings: undefined
      }
    }

    return {
      value: field.value,
      onChange: (value: any) => setFieldValue(fieldName, value),
      onBlur: () => setFieldTouched(fieldName, true),
      error: field.error,
      warnings: field.warnings,
      touched: field.touched,
      dirty: field.dirty
    }
  }, [formState, setFieldValue, setFieldTouched])

  // Auto-validate touched fields when validation rules change
  useEffect(() => {
    const touchedFields = Object.entries(formState)
      .filter(([_, field]) => field.touched)
      .map(([key, _]) => key)

    if (touchedFields.length > 0) {
      setFormState(prev => {
        const newState: FormState = { ...prev }
        
        for (const fieldName of touchedFields) {
          const field = newState[fieldName]
          const validation = validateField(fieldName, field.value)
          
          newState[fieldName] = {
            ...field,
            error: validation.isValid ? undefined : validation.error,
            warnings: validation.warnings
          }
        }
        
        return newState
      })
    }
  }, [validationRules, validateField])

  return {
    // Form state
    formState,
    isSubmitting,
    submitError,
    
    // Field operations
    setFieldValue,
    setFieldTouched,
    setFieldError,
    getFieldProps,
    
    // Form operations
    handleSubmit,
    resetForm,
    clearErrors,
    
    // Form status
    isValid: isValid(),
    hasErrors: hasErrors(),
    isDirty: isDirty(),
    
    // Getters
    getValues,
    getErrors,
    validateAllFields
  }
}