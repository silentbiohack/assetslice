'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useWallet } from '@solana/wallet-adapter-react'
import { Layout } from '@/components/layout/Layout'
import { Button } from '@/components/ui/Button'
import { mockAssets } from '@/lib/mock-data'
import { Asset } from '@/lib/types'
import { api } from '@/lib/api'
import { 
  ArrowLeft, 
  ExternalLink, 
  Building2, 
  Palette, 
  Cog, 
  TrendingUp, 
  MapPin, 
  Shield,
  Users,
  Calendar,
  FileText,
  PieChart,
  X,
  Wallet,
  AlertTriangle
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { clsx } from 'clsx'
import { useParams } from 'next/navigation'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Cell, Pie } from 'recharts'

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

const tabs = [
  { id: 'overview', label: 'Overview', icon: FileText },
  { id: 'performance', label: 'Performance', icon: TrendingUp },
  { id: 'documents', label: 'Documents', icon: FileText },
  { id: 'tokenomics', label: 'Tokenomics', icon: PieChart }
]

// Mock performance data
const performanceData = [
  { date: '2024-01', price: 38 },
  { date: '2024-02', price: 40 },
  { date: '2024-03', price: 39 },
  { date: '2024-04', price: 42 },
  { date: '2024-05', price: 44 },
  { date: '2024-06', price: 42 }
]

// Mock tokenomics data
const tokenomicsData = [
  { name: 'Public Sale', value: 60, color: '#00A8E8' },
  { name: 'Team', value: 20, color: '#14F195' },
  { name: 'Reserve', value: 15, color: '#8B5CF6' },
  { name: 'Marketing', value: 5, color: '#F59E0B' }
]

export default function AssetDetailPage() {
  const params = useParams()
  const assetId = params.id as string
  const { publicKey } = useWallet()
  
  const [activeTab, setActiveTab] = useState('overview')
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [showBuyModal, setShowBuyModal] = useState(false)
  const [buyAmount, setBuyAmount] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const asset = useMemo(() => {
    return mockAssets.find(a => a.id === assetId)
  }, [assetId])

  if (!asset) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 dark:bg-dark-900 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Asset not found
            </h1>
            <Link href="/assets">
              <Button variant="primary">
                Back to catalog
              </Button>
            </Link>
          </div>
        </div>
      </Layout>
    )
  }

  const CategoryIcon = categoryIcons[asset.category]
  const totalCost = buyAmount ? (Number(buyAmount) * asset.price).toFixed(2) : '0.00'
  const networkFee = '0.01' // Mock network fee

  const handleBuy = async () => {
    if (!publicKey) {
      setError('Please connect your wallet first')
      return
    }

    if (!buyAmount || Number(buyAmount) <= 0) {
      setError('Please enter a valid amount')
      return
    }

    setIsProcessing(true)
    setError(null)

    try {
      const response = await api.buyShares({
        mint: asset.mint || 'demo-mint-address', // Use actual mint address from asset
        amount: Number(buyAmount),
        userWallet: publicKey.toString()
      })

      console.log('Transaction created:', response.transaction)
      
      // Here you would normally sign and send the transaction
      // For demo purposes, we'll just simulate success
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      setShowBuyModal(false)
      setBuyAmount('')
      // Show success message (could be implemented with toast)
    } catch (error) {
      console.error('Error buying shares:', error)
      setError(error instanceof Error ? error.message : 'Failed to create transaction')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 dark:bg-dark-900">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Back Button */}
          <div className="mb-6">
            <Link href="/assets">
              <Button variant="ghost" className="mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to catalog
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Images and Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Image Gallery */}
              <div className="relative">
                <div className="aspect-[16/10] overflow-hidden rounded-2xl">
                  <Image
                    src={asset.images[currentImageIndex]}
                    alt={asset.name}
                    fill
                    className="object-cover"
                  />
                </div>
                {asset.images.length > 1 && (
                  <div className="mt-4 flex space-x-2">
                    {asset.images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={clsx(
                          'relative h-16 w-16 overflow-hidden rounded-lg',
                          currentImageIndex === index
                            ? 'ring-2 ring-primary-500'
                            : 'opacity-70 hover:opacity-100'
                        )}
                      >
                        <Image
                          src={image}
                          alt={`${asset.name} ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Tabs */}
              <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="-mb-px flex space-x-8">
                  {tabs.map((tab) => {
                    const Icon = tab.icon
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={clsx(
                          'flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors',
                          activeTab === tab.id
                            ? 'border-primary-500 text-primary-600 dark:text-solana-400 dark:border-solana-500'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                        )}
                      >
                        <Icon className="mr-2 h-4 w-4" />
                        {tab.label}
                      </button>
                    )
                  })}
                </nav>
              </div>

              {/* Tab Content */}
              <div className="bg-white dark:bg-dark-800 rounded-2xl p-6">
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                        Description
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                        {asset.description}
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                        Risks
                      </h3>
                      <div className="space-y-2">
                        <div className="flex items-start">
                          <AlertTriangle className="mr-2 h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            Market risk: asset value may fluctuate
                          </span>
                        </div>
                        <div className="flex items-start">
                          <AlertTriangle className="mr-2 h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            Liquidity: possible restrictions when selling
                          </span>
                        </div>
                        <div className="flex items-start">
                          <AlertTriangle className="mr-2 h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            Regulatory risk: changes in legislation
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'performance' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Share Price Chart
                      </h3>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={performanceData}>
                            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip 
                              contentStyle={{
                                backgroundColor: 'var(--color-dark-800)',
                                border: '1px solid var(--color-gray-600)',
                                borderRadius: '8px'
                              }}
                            />
                            <Line 
                              type="monotone" 
                              dataKey="price" 
                              stroke="#00A8E8" 
                              strokeWidth={2}
                              dot={{ fill: '#00A8E8', strokeWidth: 2, r: 4 }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="bg-gray-50 dark:bg-dark-700 rounded-lg p-4">
                        <div className="text-sm text-gray-600 dark:text-gray-400">Annual Yield</div>
                        <div className="text-xl font-semibold text-green-600 dark:text-green-400">
                          +{asset.apy}%
                        </div>
                      </div>
                      <div className="bg-gray-50 dark:bg-dark-700 rounded-lg p-4">
                        <div className="text-sm text-gray-600 dark:text-gray-400">Volatility</div>
                        <div className="text-xl font-semibold text-gray-900 dark:text-white">
                          12.5%
                        </div>
                      </div>
                      <div className="bg-gray-50 dark:bg-dark-700 rounded-lg p-4">
                        <div className="text-sm text-gray-600 dark:text-gray-400">Max Drawdown</div>
                        <div className="text-xl font-semibold text-red-600 dark:text-red-400">
                          -8.2%
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'documents' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Documents
                    </h3>
                    {asset.documents.map((doc, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                        <div className="flex items-center">
                          <FileText className="mr-3 h-5 w-5 text-gray-400" />
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">
                              {doc.name}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {doc.type}
                            </div>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'tokenomics' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Token Distribution
                      </h3>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <RechartsPieChart>
                            <Pie
                              data={tokenomicsData}
                              cx="50%"
                              cy="50%"
                              outerRadius={80}
                              dataKey="value"
                            >
                              {tokenomicsData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </RechartsPieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="grid grid-cols-2 gap-4 mt-4">
                        {tokenomicsData.map((item, index) => (
                          <div key={index} className="flex items-center">
                            <div 
                              className="w-3 h-3 rounded-full mr-2"
                              style={{ backgroundColor: item.color }}
                            />
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {item.name}: {item.value}%
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-gray-50 dark:bg-dark-700 rounded-lg p-4">
                        <div className="text-sm text-gray-600 dark:text-gray-400">Total Supply</div>
                        <div className="text-xl font-semibold text-gray-900 dark:text-white">
                          {asset.totalSupply.toLocaleString()}
                        </div>
                      </div>
                      <div className="bg-gray-50 dark:bg-dark-700 rounded-lg p-4">
                        <div className="text-sm text-gray-600 dark:text-gray-400">In Circulation</div>
                        <div className="text-xl font-semibold text-gray-900 dark:text-white">
                          {asset.availableSupply.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Asset Info and CTA */}
            <div className="space-y-6">
              {/* Asset Info Card */}
              <div className="bg-white dark:bg-dark-800 rounded-2xl p-6 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {asset.name}
                    </h1>
                    <div className="flex items-center mt-2 space-x-4">
                      <div className="flex items-center">
                        <CategoryIcon className="mr-1 h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {categoryLabels[asset.category]}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <MapPin className="mr-1 h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {asset.country}
                        </span>
                      </div>
                    </div>
                  </div>
                  <span className={clsx(
                    'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                    riskColors[asset.risk]
                  )}>
                    <Shield className="mr-1 h-3 w-3" />
                    {riskLabels[asset.risk]}
                  </span>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Share Price</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {asset.price} USDC
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Yield</span>
                    <span className="font-semibold text-green-600 dark:text-green-400">
                      +{asset.apy}% annually
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Available</span>
                    <span className="text-gray-600 dark:text-gray-400">
                      {asset.availableSupply.toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Issuer</span>
                    <span className="text-gray-600 dark:text-gray-400">
                      {asset.issuer}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Ticker</span>
                    <span className="font-mono text-sm text-gray-600 dark:text-gray-400">
                      {asset.ticker}
                    </span>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                    <div>Mint: {asset.mintAddress}</div>
                    <div>Decimals: 6</div>
                    <div className="flex items-center">
                      <span>Solana Explorer</span>
                      <ExternalLink className="ml-1 h-3 w-3" />
                    </div>
                  </div>
                </div>
              </div>

              {/* CTA Card */}
              <div className="bg-white dark:bg-dark-800 rounded-2xl p-6 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700">
                <Button
                  variant="primary" 
                  className="w-full mb-4"
                  onClick={() => {
                    if (!publicKey) {
                      setError('Please connect your wallet first')
                      setShowBuyModal(true)
                      return
                    }
                    setShowBuyModal(true)
                  }}
                >
                  <Wallet className="mr-2 h-4 w-4" />
                  Buy Shares
                </Button>

                <div className="text-xs text-gray-500 dark:text-gray-400 space-y-2">
                  <div className="flex items-start">
                    <AlertTriangle className="mr-1 h-3 w-3 mt-0.5 flex-shrink-0" />
                    <span>Not investment advice</span>
                  </div>
                  <div className="flex items-start">
                    <AlertTriangle className="mr-1 h-3 w-3 mt-0.5 flex-shrink-0" />
                    <span>Demo mode: transactions are not real</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Buy Modal */}
      <AnimatePresence>
        {showBuyModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            onClick={() => setShowBuyModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-dark-800 rounded-2xl p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Buy Shares
                </h3>
                <button
                  onClick={() => setShowBuyModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Quantity of shares
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-dark-700 dark:text-white"
                    value={buyAmount}
                    onChange={(e) => setBuyAmount(e.target.value)}
                  />
                </div>

                <div className="bg-gray-50 dark:bg-dark-700 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Price per share</span>
                    <span className="text-gray-900 dark:text-white">{asset.price} USDC</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Network fee</span>
                    <span className="text-gray-900 dark:text-white">{networkFee} SOL</span>
                  </div>
                  <div className="border-t border-gray-200 dark:border-gray-600 pt-2">
                    <div className="flex justify-between font-semibold">
                      <span className="text-gray-900 dark:text-white">Total</span>
                      <span className="text-gray-900 dark:text-white">{totalCost} USDC</span>
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                    <div className="flex items-center">
                      <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400 mr-2" />
                      <span className="text-sm text-red-600 dark:text-red-400">{error}</span>
                    </div>
                  </div>
                )}

                <Button
                  variant="primary"
                  className="w-full"
                  onClick={handleBuy}
                  disabled={!buyAmount || Number(buyAmount) <= 0 || isProcessing}
                >
                  {isProcessing ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Processing...
                    </div>
                  ) : (
                     'Confirm via wallet'
                   )}
                </Button>

                <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                  Demo mode: real funds are not charged
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  )
}