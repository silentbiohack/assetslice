'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useWallet } from '@solana/wallet-adapter-react'
import { Layout } from '@/components/layout/Layout'
import { Button } from '@/components/ui/Button'
import { mockAssets, mockOrderBook, mockTrades } from '@/lib/mock-data'
import { OrderBookEntry, Trade } from '@/lib/types'
import { api } from '@/lib/api'
import { useError } from '@/components/providers/ErrorProvider'
import { withErrorHandling, createWalletError, createValidationError } from '@/lib/error-utils'
import { 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Activity
} from 'lucide-react'
import { clsx } from 'clsx'
import { isValidPrice, isValidAmount } from '@/lib/validation'

export default function TradePage() {
  const { publicKey } = useWallet()
  const { showError, showSuccess, showWarning } = useError()
  const [selectedAsset, setSelectedAsset] = useState(mockAssets[0])
  const [orderType, setOrderType] = useState<'buy' | 'sell'>('buy')
  const [orderPrice, setOrderPrice] = useState('')
  const [orderAmount, setOrderAmount] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [priceError, setPriceError] = useState('')
  const [amountError, setAmountError] = useState('')
  const [orderError, setOrderError] = useState('')

  // Filter order book and trades for selected asset
  const assetOrderBook = useMemo(() => {
    return mockOrderBook.filter(entry => entry.assetId === selectedAsset.id)
  }, [selectedAsset.id])

  const assetTrades = useMemo(() => {
    return mockTrades
      .filter(trade => trade.assetId === selectedAsset.id)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 20)
  }, [selectedAsset.id])

  // Separate buy and sell orders
  const buyOrders = assetOrderBook
    .filter(entry => entry.side === 'buy')
    .sort((a, b) => b.price - a.price)
    .slice(0, 10)

  const sellOrders = assetOrderBook
    .filter(entry => entry.side === 'sell')
    .sort((a, b) => a.price - b.price)
    .slice(0, 10)

  const totalCost = useMemo(() => {
    if (!orderPrice || !orderAmount) return '0.00'
    return (Number(orderPrice) * Number(orderAmount)).toFixed(2)
  }, [orderPrice, orderAmount])

  const validatePrice = (price: string) => {
    if (!price) {
      setPriceError('Price is required')
      return false
    }
    if (!isValidPrice(price)) {
      setPriceError('Please enter a valid price (positive number with up to 8 decimal places)')
      return false
    }
    setPriceError('')
    return true
  }

  const validateAmount = (amount: string) => {
    if (!amount) {
      setAmountError('Amount is required')
      return false
    }
    if (!isValidAmount(amount)) {
      setAmountError('Please enter a valid amount (positive number with up to 6 decimal places)')
      return false
    }
    setAmountError('')
    return true
  }

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setOrderPrice(value)
    if (value) {
      validatePrice(value)
    } else {
      setPriceError('')
    }
  }

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setOrderAmount(value)
    if (value) {
      validateAmount(value)
    } else {
      setAmountError('')
    }
  }

  const handlePlaceOrder = withErrorHandling(async () => {
    setOrderError('') // Clear previous errors
    
    if (!publicKey) {
      throw createWalletError('Please connect your wallet first')
    }

    if (!orderPrice || !orderAmount) {
      throw createValidationError('Order', 'Please enter valid price and amount')
    }

    // Validate before submitting
    const isPriceValid = validatePrice(orderPrice)
    const isAmountValid = validateAmount(orderAmount)
    
    if (!isPriceValid || !isAmountValid) {
      throw createValidationError('Form', 'Please fix validation errors before submitting')
    }
    
    setIsProcessing(true)

    try {
      const response = orderType === 'buy' 
        ? await api.buyShares({
            mint: selectedAsset.mint || 'demo-mint-address',
            amount: Number(orderAmount),
            userWallet: publicKey.toString(),
            maxPrice: Number(orderPrice)
          })
        : await api.sellShares({
            mint: selectedAsset.mint || 'demo-mint-address',
            amount: Number(orderAmount),
            userWallet: publicKey.toString(),
            minPrice: Number(orderPrice)
          })

      console.log('Transaction created:', response.transaction)
      
      // Here you would normally sign and send the transaction
      // For demo purposes, we'll just simulate success
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Reset form
      setOrderPrice('')
      setOrderAmount('')
      setPriceError('')
      setAmountError('')
      setOrderError('')
      
      showSuccess(`${orderType === 'buy' ? 'Buy' : 'Sell'} order placed successfully!`)
    } finally {
      setIsProcessing(false)
    }
  }, (error) => {
    setIsProcessing(false)
    setOrderError(error.message)
    showError(error.message, 'Order Failed')
  })

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 dark:bg-dark-900">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Trading
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Trade shares of tokenized assets
            </p>
          </div>

          {/* Asset Selector */}
          <div className="mb-8">
            <div className="bg-white dark:bg-dark-800 rounded-2xl p-6 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Select Asset
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {mockAssets.slice(0, 6).map((asset) => (
                  <button
                    key={asset.id}
                    onClick={() => setSelectedAsset(asset)}
                    className={clsx(
                      'p-4 rounded-xl border-2 text-left transition-all',
                      selectedAsset.id === asset.id
                        ? 'border-primary-500 bg-primary-50 dark:border-solana-500 dark:bg-solana-900/20'
                        : 'border-gray-200 hover:border-gray-300 dark:border-gray-600 dark:hover:border-gray-500'
                    )}
                  >
                    <div className="font-medium text-gray-900 dark:text-white">
                      {asset.name}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {asset.ticker} • ${asset.price}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Order Book */}
            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-sm ring-1 ring-gray-200 dark:ring-gray-700 overflow-hidden">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                    <Activity className="mr-2 h-5 w-5" />
                    Order Book - {selectedAsset.name}
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2">
                  {/* Sell Orders */}
                  <div className="p-6 border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-700">
                    <h3 className="text-sm font-medium text-red-600 dark:text-red-400 mb-4 flex items-center">
                      <TrendingDown className="mr-1 h-4 w-4" />
                      Sell
                    </h3>
                    <div className="space-y-1">
                      <div className="grid grid-cols-3 gap-4 text-xs font-medium text-gray-500 dark:text-gray-400 pb-2">
                          <div>Price (USDC)</div>
                          <div className="text-right">Amount</div>
                          <div className="text-right">Total</div>
                        </div>
                      {sellOrders.map((order, index) => (
                        <motion.div
                          key={`sell-${index}`}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          className="grid grid-cols-3 gap-4 text-sm py-1 hover:bg-red-50 dark:hover:bg-red-900/10 rounded cursor-pointer"
                        >
                          <div className="text-red-600 dark:text-red-400 font-medium">
                            {order.price.toFixed(2)}
                          </div>
                          <div className="text-right text-gray-900 dark:text-white">
                            {order.amount}
                          </div>
                          <div className="text-right text-gray-600 dark:text-gray-400">
                            {(order.price * order.amount).toFixed(0)}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Buy Orders */}
                  <div className="p-6">
                    <h3 className="text-sm font-medium text-green-600 dark:text-green-400 mb-4 flex items-center">
                      <TrendingUp className="mr-1 h-4 w-4" />
                      Buy
                    </h3>
                    <div className="space-y-1">
                      <div className="grid grid-cols-3 gap-4 text-xs font-medium text-gray-500 dark:text-gray-400 pb-2">
                          <div>Price (USDC)</div>
                          <div className="text-right">Amount</div>
                          <div className="text-right">Total</div>
                        </div>
                      {buyOrders.map((order, index) => (
                        <motion.div
                          key={`buy-${index}`}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          className="grid grid-cols-3 gap-4 text-sm py-1 hover:bg-green-50 dark:hover:bg-green-900/10 rounded cursor-pointer"
                        >
                          <div className="text-green-600 dark:text-green-400 font-medium">
                            {order.price.toFixed(2)}
                          </div>
                          <div className="text-right text-gray-900 dark:text-white">
                            {order.amount}
                          </div>
                          <div className="text-right text-gray-600 dark:text-gray-400">
                            {(order.price * order.amount).toFixed(0)}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Trades */}
              <div className="mt-6 bg-white dark:bg-dark-800 rounded-2xl shadow-sm ring-1 ring-gray-200 dark:ring-gray-700 overflow-hidden">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                    <Clock className="mr-2 h-5 w-5" />
                    Recent Trades
                  </h2>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-dark-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Time
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Price
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {assetTrades.map((trade, index) => (
                        <motion.tr
                          key={trade.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          className="hover:bg-gray-50 dark:hover:bg-dark-700/50"
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                            {formatTime(trade.timestamp)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className={clsx(
                              'flex items-center text-sm font-medium',
                              trade.type === 'buy' 
                                ? 'text-green-600 dark:text-green-400' 
                                : 'text-red-600 dark:text-red-400'
                            )}>
                              {trade.type === 'buy' ? (
                                <ArrowUpRight className="mr-1 h-4 w-4" />
                              ) : (
                                <ArrowDownRight className="mr-1 h-4 w-4" />
                              )}
                              {trade.type === 'buy' ? 'Buy' : 'Sell'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            ${trade.price.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {trade.amount}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            ${(trade.price * trade.amount).toFixed(2)}
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Right Column - Place Order */}
            <div className="space-y-6">
              <div className="bg-white dark:bg-dark-800 rounded-2xl p-6 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                  <DollarSign className="mr-2 h-5 w-5" />
                  Place Order
                </h2>

                {/* Order Type Selector */}
                <div className="mb-6">
                  <div className="flex rounded-lg bg-gray-100 dark:bg-dark-700 p-1">
                    <button
                      onClick={() => setOrderType('buy')}
                      className={clsx(
                        'flex-1 py-2 px-4 text-sm font-medium rounded-md transition-all',
                        orderType === 'buy'
                          ? 'bg-green-500 text-white shadow-sm'
                          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                      )}
                    >
                        Buy
                      </button>
                    <button
                      onClick={() => setOrderType('sell')}
                      className={clsx(
                        'flex-1 py-2 px-4 text-sm font-medium rounded-md transition-all',
                        orderType === 'sell'
                          ? 'bg-red-500 text-white shadow-sm'
                          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                      )}
                    >
                        Sell
                      </button>
                  </div>
                </div>

                {/* Order Form */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Price (USDC)
                    </label>
                    <input
                      type="number"
                      placeholder="0.00"
                      className={clsx(
                        "w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1 dark:bg-dark-700 dark:text-white",
                        priceError 
                          ? "border-red-300 focus:border-red-500 focus:ring-red-500 dark:border-red-600" 
                          : "border-gray-300 bg-white focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600"
                      )}
                      value={orderPrice}
                      onChange={handlePriceChange}
                      onBlur={() => orderPrice && validatePrice(orderPrice)}
                    />
                    {priceError && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{priceError}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Amount
                    </label>
                    <input
                      type="number"
                      placeholder="0"
                      className={clsx(
                        "w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1 dark:bg-dark-700 dark:text-white",
                        amountError 
                          ? "border-red-300 focus:border-red-500 focus:ring-red-500 dark:border-red-600" 
                          : "border-gray-300 bg-white focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600"
                      )}
                      value={orderAmount}
                      onChange={handleAmountChange}
                      onBlur={() => orderAmount && validateAmount(orderAmount)}
                    />
                    {amountError && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{amountError}</p>
                    )}
                  </div>

                  <div className="bg-gray-50 dark:bg-dark-700 rounded-lg p-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600 dark:text-gray-400">Total Amount</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        ${totalCost} USDC
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Fee</span>
                      <span className="text-gray-600 dark:text-gray-400">0.01 SOL</span>
                    </div>
                  </div>

                  {orderError && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                      <div className="flex items-center">
                        <Activity className="h-4 w-4 text-red-600 dark:text-red-400 mr-2" />
                        <span className="text-sm text-red-600 dark:text-red-400">{orderError}</span>
                      </div>
                    </div>
                  )}

                  <Button
                    variant={orderType === 'buy' ? 'primary' : 'secondary'}
                    className={clsx(
                      'w-full',
                      orderType === 'sell' && 'bg-red-500 hover:bg-red-600 text-white'
                    )}
                    onClick={handlePlaceOrder}
                    disabled={!orderPrice || !orderAmount || isProcessing || !!priceError || !!amountError}
                  >
                    {isProcessing ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Processing...
                      </div>
                    ) : (
                      `${orderType === 'buy' ? 'Buy' : 'Sell'} ${selectedAsset.ticker}`
                    )}
                  </Button>

                  <div className="text-xs text-gray-500 dark:text-gray-400 text-center space-y-1">
                    <div>Demo mode: transactions are not real</div>
                    <div>Wallet signature is mocked</div>
                  </div>
                </div>
              </div>

              {/* Market Info */}
              <div className="bg-white dark:bg-dark-800 rounded-2xl p-6 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Market Information
                </h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Last Price</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      ${selectedAsset.price}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">24h Change</span>
                    <span className="text-sm font-medium text-green-600 dark:text-green-400">
                      +2.5%
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">24h Volume</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      $12,450
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Available</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {selectedAsset.availableSupply.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}