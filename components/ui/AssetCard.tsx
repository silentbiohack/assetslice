'use client'

import { motion } from 'framer-motion'
import { Asset } from '@/lib/types'
import { TrendingUp, TrendingDown, MapPin, Building, Palette, BarChart3, AlertTriangle } from 'lucide-react'
import { clsx } from 'clsx'
import Link from 'next/link'
import { LineChart, Line, ResponsiveContainer } from 'recharts'
import { useError } from '@/components/providers/ErrorProvider'
import { withErrorHandling } from '@/lib/error-utils'
import { useState, useMemo } from 'react'

interface AssetCardProps {
  asset: Asset
  index?: number
}

const categoryIcons = {
  'Real Estate': Building,
  'Equipment': Building,
  'Art': Palette
}

const categoryColors = {
  'Real Estate': 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
  'Equipment': 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400',
  'Art': 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400'
}

export function AssetCard({ asset, index = 0 }: AssetCardProps) {
  const { showError } = useError()
  const [imageError, setImageError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const CategoryIcon = categoryIcons[asset.category as keyof typeof categoryIcons] || Building
  const isPositiveReturn = asset.expectedReturn >= 0

  // Prepare performance data for mini chart with error handling
  const performanceData = useMemo(() => {
    try {
      if (!asset.performance || !Array.isArray(asset.performance)) {
        return []
      }
      return asset.performance.slice(-7).map((data, idx) => ({
        index: idx,
        price: data.price || 0
      }))
    } catch (error) {
      console.warn('Error processing performance data:', error)
      showError('Failed to process performance data', 'Data Error')
      return []
    }
  }, [asset.performance, showError])

  // Calculate 24h change from performance data with error handling
  const change24h = useMemo(() => {
    try {
      if (!asset.performance || asset.performance.length < 2) return 0
      const latest = asset.performance[asset.performance.length - 1]
      const previous = asset.performance[asset.performance.length - 2]
      
      if (!latest?.price || !previous?.price) return 0
      
      return ((latest.price - previous.price) / previous.price) * 100
    } catch (error) {
      console.warn('Error calculating 24h change:', error)
      showError('Failed to calculate price change', 'Calculation Error')
      return 0
    }
  }, [asset.performance, showError])

  const isPositive24h = change24h >= 0

  const handleImageError = () => {
    setImageError(true)
    setIsLoading(false)
    showError('Failed to load asset image', 'Image Error')
  }

  const handleImageLoad = () => {
    setIsLoading(false)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      whileHover={{ y: -4, scale: 1.02 }}
      className="group"
    >
      <Link href={`/assets/${asset.id}`}>
        <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-sm ring-1 ring-gray-200 dark:ring-gray-700 overflow-hidden transition-all duration-300 hover:shadow-lg hover:ring-primary-500/50 dark:hover:ring-primary-400/50">
          {/* Image */}
          <div className="relative h-48 overflow-hidden bg-gray-100 dark:bg-gray-700">
            {!imageError ? (
              <>
                {isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
                  </div>
                )}
                <img
                  src={asset.images?.[0] || '/placeholder-asset.jpg'}
                  alt={asset.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  onError={handleImageError}
                  onLoad={handleImageLoad}
                  style={{ display: isLoading ? 'none' : 'block' }}
                />
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-600">
                <div className="text-center">
                  <AlertTriangle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">Image unavailable</p>
                </div>
              </div>
            )}
            
            {/* Category Badge */}
            <div className="absolute top-3 left-3">
              <span className={clsx(
                'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                categoryColors[asset.category as keyof typeof categoryColors] || 'bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400'
              )}>
                <CategoryIcon className="mr-1 h-3 w-3" />
                {asset.category || 'Unknown'}
              </span>
            </div>

            {/* Network Badge */}
            <div className="absolute top-3 right-3">
              <span className="inline-flex items-center rounded-full bg-primary-100 dark:bg-primary-900/20 px-2.5 py-0.5 text-xs font-medium text-primary-700 dark:text-primary-400">
                Devnet
              </span>
            </div>

            {/* Performance Badge */}
            {performanceData.length > 0 && (
              <div className="absolute bottom-3 right-3">
                <div className="bg-white/90 dark:bg-dark-800/90 backdrop-blur-sm rounded-lg px-2 py-1 flex items-center space-x-1">
                  <BarChart3 className="h-3 w-3 text-gray-600 dark:text-gray-400" />
                  <span className={clsx(
                    'text-xs font-medium',
                    isPositive24h ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                  )}>
                    {isPositive24h ? '+' : ''}{change24h.toFixed(1)}%
                  </span>
                </div>
              </div>
            )}

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Title and Location */}
            <div className="mb-3">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                {asset.name || 'Unnamed Asset'}
              </h3>
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1">
                <MapPin className="h-3 w-3 mr-1" />
                {asset.location || 'Location not specified'}
              </div>
            </div>

            {/* Performance Chart */}
            {performanceData.length > 0 && (
              <div className="mb-4">
                <div className="h-12 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={performanceData}>
                      <Line
                        type="monotone"
                        dataKey="price"
                        stroke={isPositive24h ? "#10b981" : "#ef4444"}
                        strokeWidth={2}
                        dot={false}
                        activeDot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Metrics */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Yield</p>
                <div className="flex items-center">
                  {isPositiveReturn ? (
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                  )}
                  <span className={clsx(
                    'font-semibold',
                    isPositiveReturn ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                  )}>
                    {asset.expectedReturn > 0 ? '+' : ''}{asset.expectedReturn || 0}%
                  </span>
                </div>
              </div>
              
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Share Price</p>
                <p className="font-semibold text-gray-900 dark:text-white">
                  ${asset.sharePrice || 0}
                </p>
              </div>
            </div>

            {/* Performance Metrics */}
            {asset.performance && asset.performance.length > 0 && (
              <div className="grid grid-cols-2 gap-4 mb-4 p-3 bg-gray-50 dark:bg-dark-700 rounded-lg">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Market Cap</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    ${(asset.performance[asset.performance.length - 1]?.marketCap || 0).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">24h Volume</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    ${(asset.performance[asset.performance.length - 1]?.volume || 0).toLocaleString()}
                  </p>
                </div>
              </div>
            )}

            {/* Ticker and Supply */}
            <div className="flex items-center justify-between text-sm">
              <span className="font-mono text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                {asset.ticker || 'N/A'}
              </span>
              <span className="text-gray-500 dark:text-gray-400">
                {(asset.totalSupply || 0).toLocaleString()} shares
              </span>
            </div>

            {/* Progress Bar */}
            <div className="mt-4">
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                <span>Sold</span>
                <span>{Math.round((1 - (asset.availableShares || 0) / (asset.totalSupply || 1)) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-primary-500 to-secondary-500 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.round((1 - (asset.availableShares || 0) / (asset.totalSupply || 1)) * 100)}%`
                  }}
                />
              </div>
            </div>

            {/* Risk Level */}
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center">
                <span className="text-xs text-gray-500 dark:text-gray-400 mr-2">Risk:</span>
                <span className={clsx(
                  'text-xs px-2 py-1 rounded-full font-medium',
                  asset.risk === 'low' && 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
                  asset.risk === 'medium' && 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
                  asset.risk === 'high' && 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
                  !asset.risk && 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                )}>
                  {asset.risk === 'low' ? 'Low' : asset.risk === 'medium' ? 'Medium' : asset.risk === 'high' ? 'High' : 'Unknown'}
                </span>
              </div>
              
              <motion.div
                className="text-primary-600 dark:text-primary-400 opacity-0 group-hover:opacity-100 transition-opacity"
                whileHover={{ x: 4 }}
              >
                <span className="text-sm font-medium">Learn More →</span>
              </motion.div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}