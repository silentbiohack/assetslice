'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Layout } from '@/components/layout/Layout'
import { AssetCard } from '@/components/ui/AssetCard'
import { mockAssets } from '@/lib/mock-data'
import { Asset, AssetFilter } from '@/lib/types'
import { Search, Filter, Building2, Palette, Cog, TrendingUp, MapPin, Shield } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { clsx } from 'clsx'
import { Button } from '@/components/ui/Button'
import { isValidSearchQuery } from '@/lib/validation'

const categoryIcons = {
  real_estate: Building2,
  art: Palette,
  equipment: Cog
}

const categoryLabels = {
  real_estate: 'Real Estate',
  art: 'Art',
  equipment: 'Equipment'
}

const riskLabels = {
  low: 'Low',
  medium: 'Medium',
  high: 'High'
}

const riskColors = {
  low: 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20',
  medium: 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/20',
  high: 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20'
}

export default function AssetsPage() {
  const [filters, setFilters] = useState<AssetFilter>({})
  const [showFilters, setShowFilters] = useState(false)
  const [searchError, setSearchError] = useState('')

  const filteredAssets = useMemo(() => {
    return mockAssets.filter(asset => {
      if (filters.category && asset.category !== filters.category) return false
      if (filters.risk && asset.risk !== filters.risk) return false
      if (filters.minApy && asset.apy < filters.minApy) return false
      if (filters.maxApy && asset.apy > filters.maxApy) return false
      if (filters.minPrice && asset.price < filters.minPrice) return false
      if (filters.maxPrice && asset.price > filters.maxPrice) return false
      if (filters.search && !asset.name.toLowerCase().includes(filters.search.toLowerCase())) return false
      return true
    })
  }, [filters])

  const updateFilter = (key: keyof AssetFilter, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const validateSearch = (search: string) => {
    if (search && !isValidSearchQuery(search)) {
      setSearchError('Search query must be 3-100 characters and contain only letters, numbers, spaces, and basic punctuation')
      return false
    }
    setSearchError('')
    return true
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    updateFilter('search', value)
    if (value) {
      validateSearch(value)
    } else {
      setSearchError('')
    }
  }

  const clearFilters = () => {
    setFilters({})
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 dark:bg-dark-900">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Asset Catalog
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Invest in tokenized real assets
            </p>
          </div>

          {/* Search and Filters */}
          <div className="mb-8 space-y-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search assets..."
                  className={clsx(
                    "w-full rounded-xl border pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-1 dark:bg-dark-800 dark:text-white",
                    searchError 
                      ? "border-red-300 focus:border-red-500 focus:ring-red-500 dark:border-red-600" 
                      : "border-gray-300 bg-white focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600"
                  )}
                  value={filters.search || ''}
                  onChange={handleSearchChange}
                  onBlur={() => filters.search && validateSearch(filters.search)}
                />
                {searchError && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{searchError}</p>
                )}
              </div>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="sm:w-auto"
              >
                <Filter className="mr-2 h-4 w-4" />
                Filters
              </Button>
            </div>

            {/* Filters Panel */}
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-dark-800"
              >
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  {/* Category Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Category
                    </label>
                    <select
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-dark-700 dark:text-white"
                      value={filters.category || ''}
                      onChange={(e) => updateFilter('category', e.target.value || undefined)}
                    >
                      <option value="">All categories</option>
                      <option value="real_estate">Real Estate</option>
                      <option value="art">Art</option>
                      <option value="equipment">Equipment</option>
                    </select>
                  </div>

                  {/* Risk Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Risk
                    </label>
                    <select
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-dark-700 dark:text-white"
                      value={filters.risk || ''}
                      onChange={(e) => updateFilter('risk', e.target.value || undefined)}
                    >
                      <option value="">Any risk</option>
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>

                  {/* APY Range */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Yield (%)
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="number"
                        placeholder="From"
                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-dark-700 dark:text-white"
                        value={filters.minApy || ''}
                        onChange={(e) => updateFilter('minApy', e.target.value ? Number(e.target.value) : undefined)}
                      />
                      <input
                        type="number"
                        placeholder="To"
                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-dark-700 dark:text-white"
                        value={filters.maxApy || ''}
                        onChange={(e) => updateFilter('maxApy', e.target.value ? Number(e.target.value) : undefined)}
                      />
                    </div>
                  </div>

                  {/* Price Range */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Share price (USDC)
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="number"
                        placeholder="From"
                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-dark-700 dark:text-white"
                        value={filters.minPrice || ''}
                        onChange={(e) => updateFilter('minPrice', e.target.value ? Number(e.target.value) : undefined)}
                      />
                      <input
                        type="number"
                        placeholder="To"
                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-dark-700 dark:text-white"
                        value={filters.maxPrice || ''}
                        onChange={(e) => updateFilter('maxPrice', e.target.value ? Number(e.target.value) : undefined)}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <Button variant="ghost" onClick={clearFilters}>
                    Clear filters
                  </Button>
                </div>
              </motion.div>
            )}
          </div>

          {/* Results Count */}
          <div className="mb-6">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Assets found: {filteredAssets.length}
            </p>
          </div>

          {/* Assets Grid */}
          {filteredAssets.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAssets.map((asset, index) => (
                <AssetCard key={asset.id} asset={asset} index={index} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="mx-auto h-24 w-24 text-gray-400 dark:text-gray-600 mb-4">
                <Search className="h-full w-full" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No assets found
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Try changing your search filters
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}