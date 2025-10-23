import { Asset, Transaction, Trade, OrderBookEntry } from './types'

export const mockAssets: Asset[] = [
  {
    id: '1',
    name: 'Commercial Loft – Berlin',
    description: 'Modern commercial loft in the center of Berlin. Area 250 sq.m, fully renovated in 2023. Long-term lease to an IT company.',
    category: 'real_estate',
    images: [
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1560448075-bb485b067938?w=800&h=600&fit=crop'
    ],
    price: 42,
    totalSupply: 10000,
    availableSupply: 3500,
    apy: 7.8,
    risk: 'low',
    ticker: 'RWA-REA-001',
    mint: 'BerlinLoft123456789',
    mintAddress: 'BerlinLoft123456789',
    decimals: 6,
    issuer: 'Berlin Real Estate GmbH',
    country: 'Germany',
    location: 'Berlin, Germany',
    expectedReturn: 7.8,
    sharePrice: 42,
    availableShares: 3500,
    documents: [
      {
        id: '1',
        name: 'Property Whitepaper',
        type: 'whitepaper',
        url: '/documents/berlin-loft-whitepaper.pdf',
        size: 2500000,
        uploadedAt: '2024-01-15T10:00:00Z'
      }
    ],
    performance: [
      { date: '2024-01-01', price: 40, volume: 1000, marketCap: 400000 },
      { date: '2024-01-15', price: 41, volume: 1200, marketCap: 410000 },
      { date: '2024-02-01', price: 42, volume: 800, marketCap: 420000 }
    ],
    tokenomics: {
      totalSupply: 10000,
      circulatingSupply: 6500,
      founderShare: 20,
      vestingSchedule: []
    },
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-02-01T00:00:00Z'
  },
  {
    id: '2',
    name: 'Vintage Art Collection',
    description: 'Collection of 20th century artworks by renowned European artists. Fully insured, stored in a climate-controlled facility.',
    category: 'art',
    images: [
      'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop'
    ],
    price: 125,
    totalSupply: 2000,
    availableSupply: 450,
    apy: 12.3,
    risk: 'high',
    ticker: 'RWA-ART-002',
    mint: 'VintageArt123456789',
    mintAddress: 'VintageArt123456789',
    decimals: 6,
    issuer: 'European Art Fund',
    country: 'Switzerland',
    location: 'Geneva, Switzerland',
    expectedReturn: 12.3,
    sharePrice: 125,
    availableShares: 450,
    documents: [
      {
        id: '2',
        name: 'Art Collection Appraisal',
        type: 'legal',
        url: '/documents/art-collection-appraisal.pdf',
        size: 5200000,
        uploadedAt: '2024-01-20T14:30:00Z'
      }
    ],
    performance: [
      { date: '2024-01-01', price: 120, volume: 200, marketCap: 240000 },
      { date: '2024-01-15', price: 123, volume: 150, marketCap: 246000 },
      { date: '2024-02-01', price: 125, volume: 180, marketCap: 250000 }
    ],
    tokenomics: {
      totalSupply: 2000,
      circulatingSupply: 1550,
      founderShare: 15,
      vestingSchedule: []
    },
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-02-01T00:00:00Z'
  },
  {
    id: '3',
    name: 'Industrial Equipment Portfolio',
    description: 'Portfolio of industrial equipment for semiconductor manufacturing. Leased to leading technology companies.',
    category: 'equipment',
    images: [
      'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1565043666747-69f6646db940?w=800&h=600&fit=crop'
    ],
    price: 78,
    totalSupply: 5000,
    availableSupply: 1200,
    apy: 9.1,
    risk: 'medium',
    ticker: 'RWA-EQP-003',
    mint: 'IndustrialEq123456789',
    mintAddress: 'IndustrialEq123456789',
    decimals: 6,
    issuer: 'TechEquip Leasing Ltd',
    country: 'Singapore',
    location: 'Singapore',
    expectedReturn: 9.1,
    sharePrice: 78,
    availableShares: 1200,
    documents: [
      {
        id: '3',
        name: 'Equipment Lease Agreement',
        type: 'legal',
        url: '/documents/equipment-lease.pdf',
        size: 1800000,
        uploadedAt: '2024-01-25T09:15:00Z'
      }
    ],
    performance: [
      { date: '2024-01-01', price: 75, volume: 500, marketCap: 375000 },
      { date: '2024-01-15', price: 76, volume: 600, marketCap: 380000 },
      { date: '2024-02-01', price: 78, volume: 450, marketCap: 390000 }
    ],
    tokenomics: {
      totalSupply: 5000,
      circulatingSupply: 3800,
      founderShare: 25,
      vestingSchedule: []
    },
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-02-01T00:00:00Z'
  },
  {
    id: '4',
    name: 'NYC Premium Office',
    description: 'Class A office building in Manhattan. 15 floors, total area 5000 sq.m. Tenants are financial companies with long-term contracts.',
    category: 'real_estate',
    images: [
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=600&fit=crop'
    ],
    price: 89,
    totalSupply: 15000,
    availableSupply: 2800,
    apy: 6.5,
    risk: 'low',
    ticker: 'RWA-REA-004',
    mint: 'NYCOffice123456789',
    mintAddress: 'NYCOffice123456789',
    decimals: 6,
    issuer: 'Manhattan Properties Inc',
    country: 'United States',
    location: 'Manhattan, New York',
    expectedReturn: 6.5,
    sharePrice: 89,
    availableShares: 2800,
    documents: [
      {
        id: '4',
        name: 'Building Investment Memo',
        type: 'whitepaper',
        url: '/documents/nyc-office-memo.pdf',
        size: 3200000,
        uploadedAt: '2024-01-30T16:45:00Z'
      }
    ],
    performance: [
      { date: '2024-01-01', price: 87, volume: 800, marketCap: 1305000 },
      { date: '2024-01-15', price: 88, volume: 900, marketCap: 1320000 },
      { date: '2024-02-01', price: 89, volume: 750, marketCap: 1335000 }
    ],
    tokenomics: {
      totalSupply: 15000,
      circulatingSupply: 12200,
      founderShare: 18,
      vestingSchedule: []
    },
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-02-01T00:00:00Z'
  }
]

export const mockTransactions: Transaction[] = [
  {
    id: '1',
    type: 'buy',
    assetId: '1',
    amount: 10,
    price: 42,
    total: 420,
    totalAmount: 420,
    fee: 2.1,
    signature: 'demo_signature_1abc123def456ghi789jkl012mno345pqr678stu901vwx234yz',
    status: 'completed',
    timestamp: '2024-02-01T10:30:00Z',
    createdAt: '2024-02-01T10:30:00Z'
  },
  {
    id: '2',
    type: 'buy',
    assetId: '2',
    amount: 2,
    price: 125,
    total: 250,
    totalAmount: 250,
    fee: 1.25,
    signature: 'demo_signature_2def456ghi789jkl012mno345pqr678stu901vwx234yz567abc',
    status: 'completed',
    timestamp: '2024-01-28T14:15:00Z',
    createdAt: '2024-01-28T14:15:00Z'
  },
  {
    id: '3',
    type: 'sell',
    assetId: '1',
    amount: 5,
    price: 41.8,
    total: 209,
    totalAmount: 209,
    fee: 1.05,
    signature: 'demo_signature_3ghi789jkl012mno345pqr678stu901vwx234yz567abc123def',
    status: 'pending',
    timestamp: '2024-02-02T09:45:00Z',
    createdAt: '2024-02-02T09:45:00Z'
  },
  {
    id: '4',
    type: 'dividend',
    assetId: '3',
    amount: 0.5,
    price: 78,
    total: 39,
    totalAmount: 39,
    fee: 0,
    signature: 'demo_signature_4jkl012mno345pqr678stu901vwx234yz567abc123def456ghi',
    status: 'completed',
    timestamp: '2024-01-30T12:00:00Z',
    createdAt: '2024-01-30T12:00:00Z'
  },
  {
    id: '5',
    type: 'airdrop',
    assetId: '4',
    amount: 1,
    price: 89,
    total: 89,
    totalAmount: 89,
    fee: 0,
    signature: 'demo_signature_5mno345pqr678stu901vwx234yz567abc123def456ghi789jkl',
    status: 'failed',
    timestamp: '2024-01-25T16:20:00Z',
    createdAt: '2024-01-25T16:20:00Z'
  }
]

export const mockOrderBook: OrderBookEntry[] = [
  // Sell orders (asks)
  { price: 42.5, amount: 100, total: 4250, side: 'sell' },
  { price: 42.3, amount: 250, total: 10575, side: 'sell' },
  { price: 42.1, amount: 150, total: 6315, side: 'sell' },
  { price: 42.0, amount: 300, total: 12600, side: 'sell' },
  
  // Buy orders (bids)
  { price: 41.9, amount: 200, total: 8380, side: 'buy' },
  { price: 41.8, amount: 180, total: 7524, side: 'buy' },
  { price: 41.7, amount: 220, total: 9174, side: 'buy' },
  { price: 41.5, amount: 300, total: 12450, side: 'buy' },
]

export const mockTrades: Trade[] = [
  {
    id: '1',
    assetId: '1',
    price: 42.0,
    amount: 50,
    total: 2100,
    side: 'buy',
    type: 'buy',
    timestamp: '2024-02-01T15:30:00Z',
    buyer: 'buyer_wallet_1',
    seller: 'seller_wallet_1'
  },
  {
    id: '2',
    assetId: '1',
    price: 41.9,
    amount: 25,
    total: 1047.5,
    side: 'sell',
    type: 'sell',
    timestamp: '2024-02-01T15:25:00Z',
    buyer: 'buyer_wallet_2',
    seller: 'seller_wallet_2'
  },
  {
    id: '3',
    assetId: '1',
    price: 42.1,
    amount: 75,
    total: 3157.5,
    side: 'buy',
    type: 'buy',
    timestamp: '2024-02-01T15:20:00Z',
    buyer: 'buyer_wallet_3',
    seller: 'seller_wallet_3'
  }
]