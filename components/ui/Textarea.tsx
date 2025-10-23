'use client'

import React, { forwardRef } from 'react'
import { clsx } from 'clsx'
import { motion } from 'framer-motion'

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  helperText?: string
  variant?: 'default' | 'filled' | 'outlined'
  size?: 'sm' | 'md' | 'lg'
  resize?: 'none' | 'vertical' | 'horizontal' | 'both'
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ 
    className, 
    label, 
    error, 
    helperText, 
    variant = 'default',
    size = 'md',
    resize = 'vertical',
    id,
    rows = 4,
    ...props 
  }, ref) => {
    const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`

    const textareaClasses = clsx(
      'w-full rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2',
      // Size variants
      {
        'px-3 py-2 text-sm': size === 'sm',
        'px-4 py-3 text-base': size === 'md',
        'px-5 py-4 text-lg': size === 'lg',
      },
      // Style variants
      {
        'border-gray-300 bg-white focus:border-primary-500 focus:ring-primary-500/20 dark:border-gray-600 dark:bg-dark-800 dark:focus:border-primary-400': variant === 'default',
        'border-transparent bg-gray-100 focus:bg-white focus:border-primary-500 focus:ring-primary-500/20 dark:bg-gray-700 dark:focus:bg-dark-800 dark:focus:border-primary-400': variant === 'filled',
        'border-2 border-gray-300 bg-transparent focus:border-primary-500 focus:ring-primary-500/20 dark:border-gray-600 dark:focus:border-primary-400': variant === 'outlined',
      },
      // Resize variants
      {
        'resize-none': resize === 'none',
        'resize-y': resize === 'vertical',
        'resize-x': resize === 'horizontal',
        'resize': resize === 'both',
      },
      // Error state
      error && 'border-red-500 focus:border-red-500 focus:ring-red-500/20',
      className
    )

    return (
      <div className="w-full">
        {label && (
          <label 
            htmlFor={textareaId}
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            {label}
          </label>
        )}
        
        <textarea
          ref={ref}
          id={textareaId}
          rows={rows}
          className={textareaClasses}
          {...props}
        />

        {(error || helperText) && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2"
          >
            {error ? (
              <p className="text-sm text-red-600 dark:text-red-400">
                {error}
              </p>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {helperText}
              </p>
            )}
          </motion.div>
        )}
      </div>
    )
  }
)

Textarea.displayName = 'Textarea'