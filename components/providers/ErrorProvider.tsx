'use client'

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, AlertCircle, CheckCircle, AlertTriangle, Info } from 'lucide-react'

export type ErrorType = 'error' | 'warning' | 'success' | 'info'

export interface ErrorMessage {
  id: string
  type: ErrorType
  title: string
  message: string
  duration?: number
  persistent?: boolean
  action?: {
    label: string
    onClick: () => void
  }
}

interface ErrorContextType {
  errors: ErrorMessage[]
  addError: (error: Omit<ErrorMessage, 'id'>) => string
  removeError: (id: string) => void
  clearAllErrors: () => void
  showError: (message: string, title?: string) => string
  showWarning: (message: string, title?: string) => string
  showSuccess: (message: string, title?: string) => string
  showInfo: (message: string, title?: string) => string
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined)

export const useError = () => {
  const context = useContext(ErrorContext)
  if (!context) {
    throw new Error('useError must be used within an ErrorProvider')
  }
  return context
}

interface ErrorProviderProps {
  children: ReactNode
  maxErrors?: number
}

export const ErrorProvider: React.FC<ErrorProviderProps> = ({ 
  children, 
  maxErrors = 5 
}) => {
  const [errors, setErrors] = useState<ErrorMessage[]>([])

  const generateId = () => Math.random().toString(36).substr(2, 9)

  const addError = useCallback((error: Omit<ErrorMessage, 'id'>) => {
    const id = generateId()
    const newError: ErrorMessage = {
      ...error,
      id,
      duration: error.duration ?? (error.persistent ? undefined : 5000)
    }

    setErrors(prev => {
      const updated = [newError, ...prev]
      return updated.slice(0, maxErrors)
    })

    // Auto-remove non-persistent errors
    if (!error.persistent && newError.duration) {
      setTimeout(() => {
        removeError(id)
      }, newError.duration)
    }

    return id
  }, [maxErrors])

  const removeError = useCallback((id: string) => {
    setErrors(prev => prev.filter(error => error.id !== id))
  }, [])

  const clearAllErrors = useCallback(() => {
    setErrors([])
  }, [])

  const showError = useCallback((message: string, title = 'Error') => {
    return addError({ type: 'error', title, message })
  }, [addError])

  const showWarning = useCallback((message: string, title = 'Warning') => {
    return addError({ type: 'warning', title, message })
  }, [addError])

  const showSuccess = useCallback((message: string, title = 'Success') => {
    return addError({ type: 'success', title, message })
  }, [addError])

  const showInfo = useCallback((message: string, title = 'Info') => {
    return addError({ type: 'info', title, message })
  }, [addError])

  const value: ErrorContextType = {
    errors,
    addError,
    removeError,
    clearAllErrors,
    showError,
    showWarning,
    showSuccess,
    showInfo
  }

  return (
    <ErrorContext.Provider value={value}>
      {children}
      <ErrorToastContainer errors={errors} onRemove={removeError} />
    </ErrorContext.Provider>
  )
}

interface ErrorToastContainerProps {
  errors: ErrorMessage[]
  onRemove: (id: string) => void
}

const ErrorToastContainer: React.FC<ErrorToastContainerProps> = ({ errors, onRemove }) => {
  const getIcon = (type: ErrorType) => {
    switch (type) {
      case 'error':
        return <AlertCircle className="h-5 w-5" />
      case 'warning':
        return <AlertTriangle className="h-5 w-5" />
      case 'success':
        return <CheckCircle className="h-5 w-5" />
      case 'info':
        return <Info className="h-5 w-5" />
      default:
        return <AlertCircle className="h-5 w-5" />
    }
  }

  const getColors = (type: ErrorType) => {
    switch (type) {
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200'
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-200'
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-200'
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-200'
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800 dark:bg-gray-900/20 dark:border-gray-800 dark:text-gray-200'
    }
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      <AnimatePresence>
        {errors.map((error) => (
          <motion.div
            key={error.id}
            initial={{ opacity: 0, x: 300, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 300, scale: 0.8 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className={`
              relative rounded-lg border p-4 shadow-lg backdrop-blur-sm
              ${getColors(error.type)}
            `}
          >
            <div className="flex items-start">
              <div className="flex-shrink-0">
                {getIcon(error.type)}
              </div>
              <div className="ml-3 flex-1">
                <h3 className="text-sm font-medium">
                  {error.title}
                </h3>
                <p className="mt-1 text-sm opacity-90">
                  {error.message}
                </p>
                {error.action && (
                  <div className="mt-3">
                    <button
                      onClick={error.action.onClick}
                      className="text-sm font-medium underline hover:no-underline"
                    >
                      {error.action.label}
                    </button>
                  </div>
                )}
              </div>
              <div className="ml-4 flex-shrink-0">
                <button
                  onClick={() => onRemove(error.id)}
                  className="inline-flex rounded-md p-1.5 hover:bg-black/5 dark:hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-offset-2"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}