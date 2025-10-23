'use client'

import React, { forwardRef } from 'react'
import { clsx } from 'clsx'
import { motion } from 'framer-motion'

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string
  error?: string
  helperText?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  variant?: 'default' | 'filled' | 'outlined'
  size?: 'sm' | 'md' | 'lg'
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className, 
    label, 
    error, 
    helperText, 
    leftIcon, 
    rightIcon, 
    variant = 'default',
    size = 'md',
    type = 'text',
    id,
    ...props 
  }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`

    const inputClasses = clsx(
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
      // Error state
      error && 'border-red-500 focus:border-red-500 focus:ring-red-500/20',
      // Icon padding
      leftIcon && 'pl-10',
      rightIcon && 'pr-10',
      className
    )

    return (
      <div className="w-full">
        {label && (
          <label 
            htmlFor={inputId}
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            {label}
          </label>
        )}
        
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
              {leftIcon}
            </div>
          )}
          
          <input
            ref={ref}
            type={type}
            id={inputId}
            className={inputClasses}
            {...props}
          />
          
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
              {rightIcon}
            </div>
          )}
        </div>

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

Input.displayName = 'Input'