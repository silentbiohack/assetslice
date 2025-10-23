'use client'

import { useState, useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { Layout } from '@/components/layout/Layout'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { useError } from '@/components/providers/ErrorProvider'
import { Asset } from '@/lib/types'
import { Search, Filter, TrendingUp, TrendingDown, Building, MapPin, Palette, BarChart3 } from 'lucide-react'
import { clsx } from 'clsx'
import Link from 'next/link'

interface BuyAssetsPageProps {}

export default function BuyAssetsPage({}: BuyAssetsPageProps) {
  const { publicKey } = useWallet()
  const { showError, showSuccess } = useError()
  const [assets, setAssets] = useState<Asset[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedClass, setSelectedClass] = useState<string>('')
  const [sortBy, setSortBy] = useState<string>('market_cap')

  const assetClasses = [
    { value: '', label: 'All Assets' },
    { value: 'real_estate', label: 'Real Estate' },
    { value: 'art', label: 'Art' },
    { value: 'equipment', label: 'Equipment' },
    { value: 'commodities', label: 'Commodities' }
  ]

  const sortOptions = [
    { value: 'market_cap', label: 'Market Cap' },
    { value: 'price', label: 'Price' },
    { value: 'volume', label: 'Volume' },
    { value: 'change_24h', label: '24h Change' }
  ]

  useEffect(() => {
    fetchAssets()
  }, [searchQuery, selectedClass, sortBy])

  const fetchAssets = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (searchQuery) params.append('q', searchQuery)
      if (selectedClass) params.append('class', selectedClass)
      if (sortBy) params.append('sort', sortBy)

      const response = await fetch(`/api/assets?${params.toString()}`)
      if (!response.ok) {
        throw new Error('Failed to fetch assets')
      }

      const data = await response.json()
      setAssets(data.assets || [])
    } catch (error) {
      console.error('Error fetching assets:', error)
      showError('Failed to load assets')
      setAssets([])
    } finally {
      setLoading(false)
    }
  }

  const getAssetIcon = (assetClass: string) => {
    switch (assetClass) {
      case 'real_estate':
        return Building
      case 'art':
        return Palette
      case 'equipment':
        return BarChart3
      default:
        return MapPin
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 6
    }).format(price)
  }

  const formatMarketCap = (marketCap: number) => {
    if (marketCap >= 1e9) {
      return `$${(marketCap / 1e9).toFixed(2)}B`
    } else if (marketCap >= 1e6) {
      return `$${(marketCap / 1e6).toFixed(2)}M`
    } else if (marketCap >= 1e3) {
      return `$${(marketCap / 1e3).toFixed(2)}K`
    }
    return `$${marketCap.toFixed(2)}`
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 dark:bg-dark-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Buy Assets
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Discover and invest in tokenized real-world assets
            </p>
          </div>

          {/* Filters */}
          <div className="mb-8 space-y-4 lg:space-y-0 lg:flex lg:items-center lg:space-x-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search assets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Asset Class Filter */}
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              {assetClasses.map((assetClass) => (
                <option key={assetClass.value} value={assetClass.value}>
                  {assetClass.label}
                </option>
              ))}
            </select>

            {/* Sort Filter */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  Sort by {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Assets Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="p-6 animate-pulse">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                  <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </Card>
              ))}
            </div>
          ) : assets.length === 0 ? (
            <div className="text-center py-12">
              <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No assets found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Try adjusting your search or filter criteria
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {assets.map((asset) => {
                const Icon = getAssetIcon(asset.class || asset.category)
                const priceChange = asset.price_change_24h || 0
                const isPositive = priceChange >= 0

                return (
                  <Card key={asset.id} className="p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-primary-100 dark:bg-primary-900/20 rounded-lg">
                          <Icon className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {asset.ticker}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                            {(asset.class || asset.category)?.replace('_', ' ')}
                          </p>
                        </div>
                      </div>
                      <Badge variant={isPositive ? 'success' : 'destructive'}>
                        <div className="flex items-center space-x-1">
                          {isPositive ? (
                            <TrendingUp className="h-3 w-3" />
                          ) : (
                            <TrendingDown className="h-3 w-3" />
                          )}
                          <span>{Math.abs(priceChange).toFixed(2)}%</span>
                        </div>
                      </Badge>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Price</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {formatPrice(asset.price_usdc || asset.price)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Market Cap</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {formatMarketCap(asset.market_cap || 0)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Volume 24h</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {formatMarketCap(asset.volume_24h || 0)}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Link href={`/assets/${asset.id}`}>
                        <Button variant="outline" className="w-full">
                          View Details
                        </Button>
                      </Link>
                      <Link href={`/trade?asset=${asset.id}`}>
                        <Button variant="primary" className="w-full">
                          Buy Now
                        </Button>
                      </Link>
                    </div>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}