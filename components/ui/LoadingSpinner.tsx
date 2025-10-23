'use client'

import { motion } from 'framer-motion'
import { clsx } from 'clsx'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8'
}

export function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
  return (
    <motion.div
      className={clsx(
        'inline-block rounded-full border-2 border-current border-r-transparent',
        sizeClasses[size],
        className
      )}
      animate={{ rotate: 360 }}
      transition={{
        duration: 1,
        repeat: Infinity,
        ease: 'linear'
      }}
    />
  )
}

export function LoadingSkeleton({ className }: { className?: string }) {
  return (
    <motion.div
      className={clsx(
        'bg-gray-200 dark:bg-gray-700 rounded',
        className
      )}
      animate={{
        opacity: [0.5, 1, 0.5]
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeInOut'
      }}
    />
  )
}

export function AssetCardSkeleton() {
  return (
    <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-sm ring-1 ring-gray-200 dark:ring-gray-700 overflow-hidden">
      <LoadingSkeleton className="h-48 w-full" />
      <div className="p-6 space-y-4">
        <div className="space-y-2">
          <LoadingSkeleton className="h-5 w-3/4" />
          <LoadingSkeleton className="h-4 w-1/2" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <LoadingSkeleton className="h-3 w-16" />
            <LoadingSkeleton className="h-4 w-12" />
          </div>
          <div className="space-y-1">
            <LoadingSkeleton className="h-3 w-16" />
            <LoadingSkeleton className="h-4 w-12" />
          </div>
        </div>
        <div className="flex justify-between">
          <LoadingSkeleton className="h-6 w-20" />
          <LoadingSkeleton className="h-4 w-16" />
        </div>
        <LoadingSkeleton className="h-2 w-full" />
      </div>
    </div>
  )
}