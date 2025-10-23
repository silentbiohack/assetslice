import { ErrorMessage } from '@/components/providers/ErrorProvider'

export type ApiErrorType = 
  | 'NETWORK_ERROR'
  | 'VALIDATION_ERROR'
  | 'AUTHENTICATION_ERROR'
  | 'AUTHORIZATION_ERROR'
  | 'NOT_FOUND_ERROR'
  | 'SERVER_ERROR'
  | 'WALLET_ERROR'
  | 'SOLANA_ERROR'
  | 'UNKNOWN_ERROR'

export interface ApiError extends Error {
  type: ApiErrorType
  code?: string | number
  details?: any
  statusCode?: number
}

export class CustomError extends Error implements ApiError {
  type: ApiErrorType
  code?: string | number
  details?: any
  statusCode?: number

  constructor(
    message: string,
    type: ApiErrorType = 'UNKNOWN_ERROR',
    code?: string | number,
    details?: any,
    statusCode?: number
  ) {
    super(message)
    this.name = 'CustomError'
    this.type = type
    this.code = code
    this.details = details
    this.statusCode = statusCode
  }
}

// Error classification functions
export const classifyError = (error: any): ApiError => {
  if (error instanceof CustomError) {
    return error
  }

  // Network errors
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return new CustomError(
      'Network connection failed. Please check your internet connection.',
      'NETWORK_ERROR'
    )
  }

  // Wallet errors
  if (error.message?.includes('wallet') || error.message?.includes('WalletNotConnectedError')) {
    return new CustomError(
      'Wallet not connected. Please connect your wallet to continue.',
      'WALLET_ERROR'
    )
  }

  // Solana errors
  if (error.message?.includes('Solana') || error.message?.includes('PublicKey')) {
    return new CustomError(
      'Solana blockchain error. Please try again.',
      'SOLANA_ERROR',
      undefined,
      error
    )
  }

  // HTTP errors
  if (error.status || error.statusCode) {
    const statusCode = error.status || error.statusCode
    
    switch (statusCode) {
      case 400:
        return new CustomError(
          'Invalid request. Please check your input.',
          'VALIDATION_ERROR',
          statusCode,
          error,
          statusCode
        )
      case 401:
        return new CustomError(
          'Authentication required. Please log in.',
          'AUTHENTICATION_ERROR',
          statusCode,
          error,
          statusCode
        )
      case 403:
        return new CustomError(
          'Access denied. You do not have permission to perform this action.',
          'AUTHORIZATION_ERROR',
          statusCode,
          error,
          statusCode
        )
      case 404:
        return new CustomError(
          'Resource not found.',
          'NOT_FOUND_ERROR',
          statusCode,
          error,
          statusCode
        )
      case 500:
      case 502:
      case 503:
      case 504:
        return new CustomError(
          'Server error. Please try again later.',
          'SERVER_ERROR',
          statusCode,
          error,
          statusCode
        )
    }
  }

  // Default unknown error
  return new CustomError(
    error.message || 'An unexpected error occurred.',
    'UNKNOWN_ERROR',
    undefined,
    error
  )
}

// Convert error to user-friendly message
export const getErrorMessage = (error: any): Omit<ErrorMessage, 'id'> => {
  const classifiedError = classifyError(error)
  
  const baseMessage: Omit<ErrorMessage, 'id'> = {
    type: 'error',
    title: 'Error',
    message: classifiedError.message
  }

  switch (classifiedError.type) {
    case 'NETWORK_ERROR':
      return {
        ...baseMessage,
        title: 'Connection Error',
        action: {
          label: 'Retry',
          onClick: () => window.location.reload()
        }
      }

    case 'WALLET_ERROR':
      return {
        ...baseMessage,
        title: 'Wallet Error',
        type: 'warning'
      }

    case 'VALIDATION_ERROR':
      return {
        ...baseMessage,
        title: 'Validation Error',
        type: 'warning'
      }

    case 'AUTHENTICATION_ERROR':
      return {
        ...baseMessage,
        title: 'Authentication Required',
        type: 'warning'
      }

    case 'AUTHORIZATION_ERROR':
      return {
        ...baseMessage,
        title: 'Access Denied',
        type: 'warning'
      }

    case 'NOT_FOUND_ERROR':
      return {
        ...baseMessage,
        title: 'Not Found',
        type: 'warning'
      }

    case 'SERVER_ERROR':
      return {
        ...baseMessage,
        title: 'Server Error',
        action: {
          label: 'Retry',
          onClick: () => window.location.reload()
        }
      }

    case 'SOLANA_ERROR':
      return {
        ...baseMessage,
        title: 'Blockchain Error',
        message: 'There was an issue with the Solana blockchain. Please try again.'
      }

    default:
      return baseMessage
  }
}

// Async error handler wrapper
export const withErrorHandling = <T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  onError?: (error: ApiError) => void
) => {
  return async (...args: T): Promise<R | null> => {
    try {
      return await fn(...args)
    } catch (error) {
      const classifiedError = classifyError(error)
      
      if (onError) {
        onError(classifiedError)
      } else {
        console.error('Unhandled error:', classifiedError)
      }
      
      return null
    }
  }
}

// Validation error helpers
export const createValidationError = (field: string, message: string) => {
  return new CustomError(
    `${field}: ${message}`,
    'VALIDATION_ERROR',
    'VALIDATION_FAILED',
    { field, message }
  )
}

// Wallet error helpers
export const createWalletError = (message: string, code?: string) => {
  return new CustomError(
    message,
    'WALLET_ERROR',
    code || 'WALLET_ERROR'
  )
}

// Solana error helpers
export const createSolanaError = (message: string, details?: any) => {
  return new CustomError(
    message,
    'SOLANA_ERROR',
    'SOLANA_ERROR',
    details
  )
}

// Error logging utility
export const logError = (error: ApiError, context?: string) => {
  const errorData = {
    message: error.message,
    type: error.type,
    code: error.code,
    statusCode: error.statusCode,
    context,
    timestamp: new Date().toISOString(),
    stack: error.stack,
    details: error.details
  }

  if (process.env.NODE_ENV === 'development') {
    console.error('Error logged:', errorData)
  }

  // In production, you might want to send this to an error tracking service
  // Example: Sentry, LogRocket, etc.
}