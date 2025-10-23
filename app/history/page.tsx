'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Layout } from '@/components/layout/Layout'
import { Button } from '@/components/ui/Button'
import { mockTransactions, mockAssets } from '@/lib/mock-data'
import { Transaction, TransactionFilter } from '@/lib/types'
import { 
  History, 
  Filter, 
  ExternalLink, 
  ArrowUpRight, 
  ArrowDownRight,
  Gift,
  Search,
  Calendar,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react'
import { clsx } from 'clsx'
import { isValidSearchQuery } from '@/lib/validation'
import { useError } from '@/components/providers/ErrorProvider'
import { withErrorHandling, createValidationError } from '@/lib/error-utils'

const transactionTypeLabels = {
  buy: 'Buy',
  sell: 'Sell',
  dividend: 'Dividend',
  airdrop: 'Airdrop'
}

const transactionTypeIcons = {
  buy: ArrowUpRight,
  sell: ArrowDownRight,
  dividend: Gift,
  airdrop: Gift
}

const statusLabels = {
  completed: 'Completed',
  confirmed: 'Confirmed',
  pending: 'Pending',
  failed: 'Failed'
}

const statusColors = {
  completed: 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20',
  confirmed: 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20',
  pending: 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/20',
  failed: 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20'
}

const statusIcons = {
  completed: CheckCircle,
  confirmed: CheckCircle,
  pending: Clock,
  failed: XCircle
}

export default function HistoryPage() {
  const [filters, setFilters] = useState<TransactionFilter>({})
  const [showFilters, setShowFilters] = useState(false)
  const [searchError, setSearchError] = useState('')

  const filteredTransactions = useMemo(() => {
    return mockTransactions.filter(transaction => {
      if (filters.type && transaction.type !== filters.type) return false
      if (filters.status && transaction.status !== filters.status) return false
      if (filters.asset && transaction.assetId !== filters.asset) return false
      if (filters.dateFrom && new Date(transaction.timestamp) < new Date(filters.dateFrom)) return false
      if (filters.dateTo && new Date(transaction.timestamp) > new Date(filters.dateTo)) return false
      if (filters.search) {
        const asset = mockAssets.find(a => a.id === transaction.assetId)
        const searchTerm = filters.search.toLowerCase()
        if (!asset?.name.toLowerCase().includes(searchTerm) && 
            !transaction.signature.toLowerCase().includes(searchTerm)) return false
      }
      return true
    })
  }, [filters])

  const updateFilter = (key: keyof TransactionFilter, value: any) => {
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

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getAssetName = (assetId: string) => {
    const asset = mockAssets.find(a => a.id === assetId)
    return asset ? asset.name : 'Unknown Asset'
  }

  const getAssetTicker = (assetId: string) => {
    const asset = mockAssets.find(a => a.id === assetId)
    return asset ? asset.ticker : 'N/A'
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 dark:bg-dark-900">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
              <History className="mr-3 h-8 w-8" />
              Transaction History
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              View all your transactions and operations
            </p>
          </div>

          {/* Search and Filters */}
          <div className="mb-8 space-y-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by asset or signature..."
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
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
                  {/* Transaction Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Transaction Type
                    </label>
                    <select
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-dark-700 dark:text-white"
                      value={filters.type}
                      onChange={(e) => updateFilter('type', e.target.value)}
                    >
                      <option value="">All Types</option>
                      <option value="buy">Buy</option>
                      <option value="sell">Sell</option>
                      <option value="dividend">Dividend</option>
                      <option value="airdrop">Airdrop</option>
                    </select>
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Status
                    </label>
                    <select
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-dark-700 dark:text-white"
                      value={filters.status}
                      onChange={(e) => updateFilter('status', e.target.value)}
                    >
                      <option value="">All Statuses</option>
                      <option value="completed">Completed</option>
                      <option value="pending">Pending</option>
                      <option value="failed">Failed</option>
                    </select>
                  </div>

                  {/* Asset */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Asset
                    </label>
                    <select
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-dark-700 dark:text-white"
                      value={filters.asset}
                      onChange={(e) => updateFilter('asset', e.target.value)}
                    >
                      <option value="">All Assets</option>
                      {mockAssets.map(asset => (
                        <option key={asset.id} value={asset.id}>
                          {asset.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Date From */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Date From
                    </label>
                    <input
                      type="date"
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-dark-700 dark:text-white"
                      value={filters.dateFrom}
                      onChange={(e) => updateFilter('dateFrom', e.target.value)}
                    />
                  </div>

                  {/* Date To */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Date To
                    </label>
                    <input
                      type="date"
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-dark-700 dark:text-white"
                      value={filters.dateTo}
                      onChange={(e) => updateFilter('dateTo', e.target.value)}
                    />
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <Button variant="ghost" onClick={clearFilters}>
                    Clear Filters
                  </Button>
                </div>
              </motion.div>
            )}
          </div>

          {/* Results Count */}
          <div className="mb-6">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Transactions found: {filteredTransactions.length}
            </p>
          </div>

          {/* Transactions Table */}
          {filteredTransactions.length > 0 ? (
            <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-sm ring-1 ring-gray-200 dark:ring-gray-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-dark-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Asset
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Total
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Signature
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredTransactions.map((transaction, index) => {
                      const TypeIcon = transactionTypeIcons[transaction.type]
                      const StatusIcon = statusIcons[transaction.status]
                      
                      return (
                        <motion.tr
                          key={transaction.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          className="hover:bg-gray-50 dark:hover:bg-dark-700/50"
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                            {formatDate(transaction.timestamp)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className={clsx(
                              'flex items-center text-sm font-medium',
                              transaction.type === 'buy' && 'text-green-600 dark:text-green-400',
                              transaction.type === 'sell' && 'text-red-600 dark:text-red-400',
                              (transaction.type === 'dividend' || transaction.type === 'airdrop') && 'text-blue-600 dark:text-blue-400'
                            )}>
                              <TypeIcon className="mr-2 h-4 w-4" />
                              {transactionTypeLabels[transaction.type]}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {getAssetName(transaction.assetId)}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {getAssetTicker(transaction.assetId)}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {transaction.amount}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            ${transaction.totalAmount?.toLocaleString() || '0'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={clsx(
                              'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                              statusColors[transaction.status]
                            )}>
                              <StatusIcon className="mr-1 h-3 w-3" />
                              {statusLabels[transaction.status]}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <span className="font-mono text-xs text-gray-600 dark:text-gray-400 mr-2">
                                {transaction.signature.slice(0, 8)}...{transaction.signature.slice(-8)}
                              </span>
                              <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                                <ExternalLink className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            /* Empty State */
            <div className="bg-white dark:bg-dark-800 rounded-2xl p-12 text-center shadow-sm ring-1 ring-gray-200 dark:ring-gray-700">
              <div className="mx-auto h-24 w-24 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-6">
                <History className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {Object.values(filters).some(f => f) ? 'No transactions found' : 'You haven\'t made any transactions yet'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {Object.values(filters).some(f => f) 
                  ? 'Try changing your search parameters or filters'
                  : 'Start investing in tokenized assets'
                }
              </p>
              {Object.values(filters).some(f => f) ? (
                <Button variant="outline" onClick={clearFilters}>
                  Reset Filters
                </Button>
              ) : (
                <Button variant="primary" onClick={() => window.location.href = '/assets'}>
                  View Assets
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}