'use client'

import React, { forwardRef } from 'react'
import { clsx } from 'clsx'
import { motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'

export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label?: string
  error?: string
  helperText?: string
  options: SelectOption[]
  placeholder?: string
  variant?: 'default' | 'filled' | 'outlined'
  size?: 'sm' | 'md' | 'lg'
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ 
    className, 
    label, 
    error, 
    helperText, 
    options,
    placeholder,
    variant = 'default',
    size = 'md',
    id,
    ...props 
  }, ref) => {
    const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`

    const selectClasses = clsx(
      'w-full rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 appearance-none bg-no-repeat bg-right cursor-pointer',
      // Size variants
      {
        'px-3 py-2 pr-8 text-sm': size === 'sm',
        'px-4 py-3 pr-10 text-base': size === 'md',
        'px-5 py-4 pr-12 text-lg': size === 'lg',
      },
      // Style variants
      {
        'border-gray-300 bg-white focus:border-primary-500 focus:ring-primary-500/20 dark:border-gray-600 dark:bg-dark-800 dark:focus:border-primary-400': variant === 'default',
        'border-transparent bg-gray-100 focus:bg-white focus:border-primary-500 focus:ring-primary-500/20 dark:bg-gray-700 dark:focus:bg-dark-800 dark:focus:border-primary-400': variant === 'filled',
        'border-2 border-gray-300 bg-transparent focus:border-primary-500 focus:ring-primary-500/20 dark:border-gray-600 dark:focus:border-primary-400': variant === 'outlined',
      },
      // Error state
      error && 'border-red-500 focus:border-red-500 focus:ring-red-500/20',
      className
    )

    return (
      <div className="w-full">
        {label && (
          <label 
            htmlFor={selectId}
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            {label}
          </label>
        )}
        
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={selectClasses}
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
          
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <ChevronDown className="h-4 w-4 text-gray-400 dark:text-gray-500" />
          </div>
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

Select.displayName = 'Select'