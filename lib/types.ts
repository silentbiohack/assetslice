export interface Asset {
  id: string
  name: string
  description: string
  category: 'real_estate' | 'equipment' | 'art'
  class?: 'real_estate' | 'equipment' | 'art' // Alternative property name for category
  images: string[]
  price: number // Price per share in USDC
  price_usdc?: number // Alternative price property
  totalSupply: number
  availableSupply: number
  apy: number
  risk: 'low' | 'medium' | 'high'
  ticker: string
  mint: string // Solana token mint address
  mintAddress: string // Alternative mint address property
  decimals: number
  issuer: string
  country: string
  location: string // Asset location
  expectedReturn: number // Expected return percentage
  sharePrice: number // Price per share
  availableShares: number // Number of available shares
  price_change_24h?: number // 24h price change percentage
  market_cap?: number // Market capitalization
  volume_24h?: number // 24h trading volume
  documents: Document[]
  performance: PerformanceData[]
  tokenomics: Tokenomics
  createdAt: string
  updatedAt: string
}

export interface Document {
  id: string
  name: string
  type: 'whitepaper' | 'kyc' | 'legal' | 'audit'
  url: string
  size: number
  uploadedAt: string
}

export interface PerformanceData {
  date: string
  price: number
  volume: number
  marketCap: number
}

export interface Tokenomics {
  totalSupply: number
  circulatingSupply: number
  founderShare: number
  vestingSchedule: VestingSchedule[]
}

export interface VestingSchedule {
  date: string
  amount: number
  recipient: 'founders' | 'team' | 'advisors' | 'public'
}

export interface PortfolioAsset {
  assetId: string
  asset?: Asset
  shares: number
  averagePrice: number
  currentPrice?: number
  currentValue?: number
  totalValue: number
  pnl: number
  pnlPercentage: number
  purchaseDate?: string
}

export interface Transaction {
  id: string
  type: 'buy' | 'sell' | 'dividend' | 'airdrop'
  assetId: string
  asset?: Asset
  amount: number
  price: number
  total: number
  totalAmount?: number // Total amount for the transaction
  fee: number
  signature: string
  status: 'pending' | 'confirmed' | 'failed' | 'completed'
  timestamp: string // Timestamp for the transaction
  createdAt: string
  confirmedAt?: string
}

export interface OrderBookEntry {
  price: number
  amount: number
  total: number
  side: 'buy' | 'sell'
  assetId?: string
  type?: 'buy' | 'sell'
}

export interface Trade {
  id: string
  assetId: string
  price: number
  amount: number
  total: number
  side: 'buy' | 'sell'
  type: 'buy' | 'sell' // Alternative property for side
  timestamp: string
  buyer: string
  seller: string
}

export interface User {
  id: string
  walletAddress: string
  country: string
  kycStatus: 'pending' | 'approved' | 'rejected'
  riskAcknowledged: boolean
  createdAt: string
  lastLoginAt: string
}

export interface WalletBalance {
  sol: number
  usdc: number
  totalValue?: number
  totalUsd: number // Total value in USD
}

export interface AssetFilter {
  category?: Asset['category']
  minApy?: number
  maxApy?: number
  risk?: Asset['risk']
  minPrice?: number
  maxPrice?: number
  search?: string
}

export interface TransactionFilter {
  type?: Transaction['type']
  status?: Transaction['status']
  asset?: string
  dateFrom?: string
  dateTo?: string
  search?: string
}