'use client'

import { useState, useMemo, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useWallet } from '@solana/wallet-adapter-react'
import { Layout } from '@/components/layout/Layout'
import { Button } from '@/components/ui/Button'
import { mockAssets } from '@/lib/mock-data'
import { PortfolioAsset, WalletBalance } from '@/lib/types'
import { api } from '@/lib/api'
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  Eye, 
  EyeOff,
  Building2,
  Palette,
  Cog,
  ArrowUpRight,
  ArrowDownRight,
  Gift,
  BarChart3,
  Calendar,
  History
} from 'lucide-react'
import Link from 'next/link'
import { clsx } from 'clsx'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts'

// Mock portfolio data
const mockPortfolioAssets: PortfolioAsset[] = [
  {
    assetId: '1',
    shares: 25,
    averagePrice: 40,
    currentPrice: 42,
    totalValue: 1050,
    pnl: 50,
    pnlPercentage: 5.0
  },
  {
    assetId: '2',
    shares: 15,
    averagePrice: 85,
    currentPrice: 88,
    totalValue: 1320,
    pnl: 45,
    pnlPercentage: 3.5
  },
  {
    assetId: '3',
    shares: 8,
    averagePrice: 120,
    currentPrice: 115,
    totalValue: 920,
    pnl: -40,
    pnlPercentage: -4.2
  }
]

const mockWalletBalance: WalletBalance = {
  sol: 2.45,
  usdc: 1250.75,
  totalUsd: 1750.25
}

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

const categoryColors = {
  real_estate: '#00A8E8',
  art: '#8B5CF6',
  equipment: '#F59E0B'
}

export default function PortfolioPage() {
  const { publicKey } = useWallet()
  const [showBalance, setShowBalance] = useState(true)
  const [isAirdropping, setIsAirdropping] = useState(false)
  const [pnlData, setPnlData] = useState<any>(null)
  const [pnlHistory, setPnlHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [timeframe, setTimeframe] = useState<'7' | '30' | '90'>('7')

  // Fetch P&L data when wallet is connected
  useEffect(() => {
    if (publicKey) {
      fetchPnLData()
      fetchPnLHistory()
    }
  }, [publicKey, timeframe])

  const fetchPnLData = async () => {
    if (!publicKey) return
    
    try {
      setLoading(true)
      const data = await api.fetchPortfolioPnL(publicKey.toString())
      setPnlData(data)
    } catch (error) {
      console.error('Failed to fetch P&L data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchPnLHistory = async () => {
    if (!publicKey) return
    
    try {
      const history = await api.fetchHistoricalPnL(publicKey.toString(), parseInt(timeframe))
      setPnlHistory(history)
    } catch (error) {
      console.error('Failed to fetch P&L history:', error)
    }
  }

  const portfolioData = useMemo(() => {
    return mockPortfolioAssets.map(portfolioAsset => {
      const asset = mockAssets.find(a => a.id === portfolioAsset.assetId)
      return {
        ...portfolioAsset,
        asset
      }
    }).filter(item => item.asset)
  }, [])

  const totalPortfolioValue = useMemo(() => {
    return portfolioData.reduce((sum, item) => sum + item.totalValue, 0)
  }, [portfolioData])

  const totalPnL = useMemo(() => {
    return portfolioData.reduce((sum, item) => sum + item.pnl, 0)
  }, [portfolioData])

  const totalPnLPercentage = useMemo(() => {
    const totalInvested = portfolioData.reduce((sum, item) => sum + (item.shares * item.averagePrice), 0)
    return totalInvested > 0 ? (totalPnL / totalInvested) * 100 : 0
  }, [portfolioData, totalPnL])

  const distributionData = useMemo(() => {
    const categoryTotals = portfolioData.reduce((acc, item) => {
      if (!item.asset) return acc
      const category = item.asset.category
      acc[category] = (acc[category] || 0) + item.totalValue
      return acc
    }, {} as Record<string, number>)

    return Object.entries(categoryTotals).map(([category, value]) => ({
      name: categoryLabels[category as keyof typeof categoryLabels],
      value,
      color: categoryColors[category as keyof typeof categoryColors]
    }))
  }, [portfolioData])

  const handleAirdrop = async () => {
    setIsAirdropping(true)
    // Simulate airdrop
    await new Promise(resolve => setTimeout(resolve, 2000))
    setIsAirdropping(false)
    // Show success message
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 dark:bg-dark-900">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              My Portfolio
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Track your tokenized asset investments
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Balance and Stats */}
            <div className="lg:col-span-2 space-y-6">
              {/* Wallet Balance */}
              <div className="bg-white dark:bg-dark-800 rounded-2xl p-6 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <Wallet className="mr-3 h-6 w-6 text-primary-500 dark:text-solana-400" />
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                       Wallet Balance
                     </h2>
                  </div>
                  <button
                    onClick={() => setShowBalance(!showBalance)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    {showBalance ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-gradient-to-br from-primary-500 to-primary-600 dark:from-solana-500 dark:to-solana-600 rounded-xl p-4 text-white">
                    <div className="text-sm opacity-90">Total Balance</div>
                    <div className="text-2xl font-bold">
                      {showBalance ? `$${mockWalletBalance.totalUsd.toLocaleString()}` : '****'}
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-dark-700 rounded-xl p-4">
                    <div className="text-sm text-gray-600 dark:text-gray-400">SOL</div>
                    <div className="text-xl font-semibold text-gray-900 dark:text-white">
                      {showBalance ? mockWalletBalance.sol.toFixed(2) : '****'}
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-dark-700 rounded-xl p-4">
                    <div className="text-sm text-gray-600 dark:text-gray-400">USDC</div>
                    <div className="text-xl font-semibold text-gray-900 dark:text-white">
                      {showBalance ? mockWalletBalance.usdc.toLocaleString() : '****'}
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <Button
                    variant="outline"
                    onClick={handleAirdrop}
                    disabled={isAirdropping}
                    className="w-full sm:w-auto"
                  >
                    {isAirdropping ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                        Receiving...
                       </div>
                     ) : (
                       <>
                         <Gift className="mr-2 h-4 w-4" />
                         Top Up Balance (Airdrop 1 SOL)
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Portfolio Performance */}
              <div className="bg-white dark:bg-dark-800 rounded-2xl p-6 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                   Portfolio Performance
                 </h2>

                 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                   <div className="text-center">
                     <div className="text-sm text-gray-600 dark:text-gray-400">Total Value</div>
                     <div className="text-2xl font-bold text-gray-900 dark:text-white">
                       ${pnlData ? pnlData.totalValue.toLocaleString() : totalPortfolioValue.toLocaleString()}
                     </div>
                   </div>
                   
                   <div className="text-center">
                     <div className="text-sm text-gray-600 dark:text-gray-400">P&L</div>
                     <div className={clsx(
                       'text-2xl font-bold flex items-center justify-center',
                       (pnlData ? pnlData.totalPnL : totalPnL) >= 0 
                         ? 'text-green-600 dark:text-green-400' 
                         : 'text-red-600 dark:text-red-400'
                     )}>
                       {(pnlData ? pnlData.totalPnL : totalPnL) >= 0 ? (
                         <ArrowUpRight className="mr-1 h-5 w-5" />
                       ) : (
                         <ArrowDownRight className="mr-1 h-5 w-5" />
                       )}
                       ${Math.abs(pnlData ? pnlData.totalPnL : totalPnL).toLocaleString()}
                     </div>
                   </div>
                   
                   <div className="text-center">
                     <div className="text-sm text-gray-600 dark:text-gray-400">Return</div>
                     <div className={clsx(
                       'text-2xl font-bold',
                       (pnlData ? pnlData.totalPnLPercentage : totalPnLPercentage) >= 0 
                         ? 'text-green-600 dark:text-green-400' 
                         : 'text-red-600 dark:text-red-400'
                     )}>
                       {(pnlData ? pnlData.totalPnLPercentage : totalPnLPercentage) >= 0 ? '+' : ''}{(pnlData ? pnlData.totalPnLPercentage : totalPnLPercentage).toFixed(1)}%
                     </div>
                   </div>
                 </div>
              </div>

              {/* P&L History Chart */}
              {publicKey && (
                <div className="bg-white dark:bg-dark-800 rounded-2xl p-6 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                      P&L History
                    </h2>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <select
                        value={timeframe}
                        onChange={(e) => setTimeframe(e.target.value as '7' | '30' | '90')}
                        className="text-sm border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
                      >
                        <option value="7">7 days</option>
                        <option value="30">30 days</option>
                        <option value="90">90 days</option>
                      </select>
                    </div>
                  </div>

                  {loading ? (
                    <div className="flex items-center justify-center h-64">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
                    </div>
                  ) : pnlHistory.length > 0 ? (
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={pnlHistory}>
                          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                          <XAxis 
                            dataKey="date" 
                            tick={{ fontSize: 12 }}
                            tickFormatter={(value) => new Date(value).toLocaleDateString()}
                          />
                          <YAxis 
                            tick={{ fontSize: 12 }}
                            tickFormatter={(value) => `$${value.toLocaleString()}`}
                          />
                          <Tooltip 
                            formatter={(value: number) => [`$${value.toLocaleString()}`, 'P&L']}
                            labelFormatter={(value) => new Date(value).toLocaleDateString()}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="pnl" 
                            stroke="#00A8E8" 
                            strokeWidth={2}
                            dot={{ fill: '#00A8E8', strokeWidth: 2, r: 4 }}
                            activeDot={{ r: 6 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <BarChart3 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <p className="text-gray-600 dark:text-gray-400">
                        No P&L history available
                      </p>
                    </div>
                  )}
                </div>
              )}
              {/* Portfolio Assets Table */}
              <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-sm ring-1 ring-gray-200 dark:ring-gray-700 overflow-hidden">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                     My Assets
                   </h2>
                </div>

                {portfolioData.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[800px]">
                      <thead className="bg-gray-50 dark:bg-dark-700">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[200px]">
                             Asset
                           </th>
                           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[80px]">
                             Shares
                           </th>
                           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[100px]">
                             Average Price
                           </th>
                           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[100px]">
                             Current Price
                           </th>
                           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[100px]">
                             Value
                           </th>
                           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[120px]">
                             P&L
                           </th>
                           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[100px]">
                             Actions
                           </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {portfolioData.map((item, index) => {
                          if (!item.asset) return null
                          const CategoryIcon = categoryIcons[item.asset.category]
                          
                          return (
                            <motion.tr
                              key={item.assetId}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.3, delay: index * 0.1 }}
                              className="hover:bg-gray-50 dark:hover:bg-dark-700/50"
                            >
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <CategoryIcon className="mr-3 h-5 w-5 text-gray-400" />
                                  <div>
                                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                                      {item.asset.name}
                                    </div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                      {item.asset.ticker}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                {item.shares}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                ${item.averagePrice}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                ${item.currentPrice}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                ${item.totalValue.toLocaleString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className={clsx(
                                  'text-sm font-medium',
                                  item.pnl >= 0 
                                    ? 'text-green-600 dark:text-green-400' 
                                    : 'text-red-600 dark:text-red-400'
                                )}>
                                  {item.pnl >= 0 ? '+' : ''}${item.pnl}
                                </div>
                                <div className={clsx(
                                  'text-xs',
                                  item.pnl >= 0 
                                    ? 'text-green-600 dark:text-green-400' 
                                    : 'text-red-600 dark:text-red-400'
                                )}>
                                  {item.pnlPercentage >= 0 ? '+' : ''}{item.pnlPercentage.toFixed(1)}%
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <Button variant="outline" size="sm" className="min-w-[60px]">
                                   Sell
                                 </Button>
                              </td>
                            </motion.tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="mx-auto h-24 w-24 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                      <TrendingUp className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                       Portfolio is empty
                     </h3>
                     <p className="text-gray-600 dark:text-gray-400 mb-6">
                       Start investing in tokenized assets
                     </p>
                     <Link href="/assets">
                       <Button variant="primary">
                         <Plus className="mr-2 h-4 w-4" />
                         View Assets
                       </Button>
                     </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Distribution Chart */}
            <div className="space-y-6">
              <div className="bg-white dark:bg-dark-800 rounded-2xl p-6 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                   Distribution by Categories
                 </h3>

                {distributionData.length > 0 ? (
                  <>
                    <div className="h-64 mb-6">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={distributionData}
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            dataKey="value"
                          >
                            {distributionData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip 
                            formatter={(value: number) => [`$${value.toLocaleString()}`, 'Value']}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="space-y-3">
                      {distributionData.map((item, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div 
                              className="w-3 h-3 rounded-full mr-3"
                              style={{ backgroundColor: item.color }}
                            />
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {item.name}
                            </span>
                          </div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            ${item.value.toLocaleString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <div className="mx-auto h-16 w-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                      <PieChart className="h-6 w-6 text-gray-400" />
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                       No data to display
                     </p>
                  </div>
                )}
              </div>

              {/* Quick Actions */}
              <div className="bg-white dark:bg-dark-800 rounded-2xl p-6 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                   Quick Actions
                 </h3>
                 
                 <div className="space-y-3">
                   <Link href="/assets">
                     <Button variant="outline" className="w-full justify-start" asChild>
                       <div>
                         <Plus className="mr-2 h-4 w-4" />
                         Buy Assets
                       </div>
                     </Button>
                   </Link>
                   
                   <Link href="/trade">
                     <Button variant="outline" className="w-full justify-start" asChild>
                       <div>
                         <TrendingUp className="mr-2 h-4 w-4" />
                         Trade
                       </div>
                     </Button>
                   </Link>
                   
                   <Link href="/history">
                     <Button variant="outline" className="w-full justify-start" asChild>
                       <div>
                         <History className="mr-2 h-4 w-4" />
                         Transaction History
                       </div>
                     </Button>
                   </Link>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}