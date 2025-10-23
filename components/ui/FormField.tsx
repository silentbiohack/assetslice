'use client'

import React from 'react'
import { clsx } from 'clsx'
import { motion } from 'framer-motion'
import { useError } from '@/components/providers/ErrorProvider'
import { withErrorHandling } from '@/lib/error-utils'

export interface FormFieldProps {
  children: React.ReactNode
  label?: string
  error?: string
  helperText?: string
  required?: boolean
  className?: string
  id?: string
  onError?: (error: string) => void
}

export const FormField: React.FC<FormFieldProps> = ({
  children,
  label,
  error,
  helperText,
  required = false,
  className,
  id,
  onError
}) => {
  const { showError } = useError()
  const fieldId = id || `field-${Math.random().toString(36).substr(2, 9)}`

  // Handle field-level errors
  const handleFieldError = (errorMessage: string) => {
    try {
      if (onError) {
        onError(errorMessage)
      } else {
        showError(errorMessage, 'Form Validation Error')
      }
    } catch (err) {
      console.error('Error in FormField:', err)
      showError('An unexpected error occurred in the form field', 'Form Error')
    }
  }

  // Enhanced error display with better UX
  const renderError = () => {
    if (!error) return null

    return (
      <motion.div
        initial={{ opacity: 0, y: -5, height: 0 }}
        animate={{ opacity: 1, y: 0, height: 'auto' }}
        exit={{ opacity: 0, y: -5, height: 0 }}
        className="mt-2"
      >
        <p className="text-sm text-red-600 dark:text-red-400 flex items-center bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-md border border-red-200 dark:border-red-800">
          <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span>{error}</span>
        </p>
      </motion.div>
    )
  }

  // Enhanced helper text display
  const renderHelperText = () => {
    if (!helperText || error) return null

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mt-2"
      >
        <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
          <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          {helperText}
        </p>
      </motion.div>
    )
  }

  return (
    <div className={clsx('w-full', className)}>
      {label && (
        <label 
          htmlFor={fieldId}
          className={clsx(
            'block text-sm font-medium mb-2 transition-colors',
            error 
              ? 'text-red-700 dark:text-red-400' 
              : 'text-gray-700 dark:text-gray-300'
          )}
        >
          {label}
          {required && (
            <span className="text-red-500 ml-1" aria-label="required">*</span>
          )}
        </label>
      )}
      
      <div className="relative">
        {React.cloneElement(children as React.ReactElement, { 
          id: fieldId,
          'aria-invalid': !!error,
          'aria-describedby': error ? `${fieldId}-error` : helperText ? `${fieldId}-help` : undefined,
          className: clsx(
            (children as React.ReactElement).props.className,
            error && 'border-red-300 dark:border-red-600 focus:border-red-500 focus:ring-red-500'
          )
        })}
        
        {/* Error icon overlay for input fields */}
        {error && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
        )}
      </div>

      {renderError()}
      {renderHelperText()}
    </div>
  )
}

// Compound component for form groups
export interface FormGroupProps {
  children: React.ReactNode
  className?: string
  title?: string
  description?: string
}

export const FormGroup: React.FC<FormGroupProps> = ({
  children,
  className,
  title,
  description
}) => {
  return (
    <div className={clsx('space-y-6', className)}>
      {(title || description) && (
        <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
          {title && (
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {title}
            </h3>
          )}
          {description && (
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {description}
            </p>
          )}
        </div>
      )}
      <div className="space-y-6">
        {children}
      </div>
    </div>
  )
}

// Form row for horizontal layouts
export interface FormRowProps {
  children: React.ReactNode
  className?: string
  cols?: 1 | 2 | 3 | 4
}

export const FormRow: React.FC<FormRowProps> = ({
  children,
  className,
  cols = 2
}) => {
  const gridClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
  }

  return (
    <div className={clsx('grid gap-6', gridClasses[cols], className)}>
      {children}
    </div>
  )
}