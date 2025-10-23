// API utility functions for frontend

export interface Asset {
  id: string;
  name: string;
  symbol: string;
  description: string;
  total_supply: number;
  price_per_share: number;
  creator: string;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  asset_id: string;
  user_wallet: string;
  transaction_type: 'buy' | 'sell';
  shares: number;
  price_per_share: number;
  total_amount: number;
  signature: string;
  created_at: string;
}

export interface Portfolio {
  asset_id: string;
  asset_name: string;
  asset_symbol: string;
  shares_owned: number;
  current_value: number;
  total_invested: number;
  profit_loss: number;
}

export interface Dividend {
  id: string;
  asset_id: string;
  amount_per_share: number;
  total_amount: number;
  status: 'open' | 'closed';
  created_at: string;
  closed_at?: string;
}

export interface Claim {
  id: string;
  dividend_id: string;
  user_wallet: string;
  amount: number;
  claimed_at: string;
}

export interface OrderBook {
  asset_id: string;
  bids: Array<{ price: number; quantity: number }>;
  asks: Array<{ price: number; quantity: number }>;
}

export interface TransactionRequest {
  mint: string;
  amount: number;
  userWallet: string;
  maxPrice?: number;
  minPrice?: number;
}

export interface TransactionResponse {
  transaction: string;
  message: string;
  instructions: Array<{
    programId: string;
    instruction: string;
    accounts: any;
  }>;
}

export interface HistoryEvent {
  id: string;
  wallet: string;
  type: 'trade' | 'dividend' | 'claim';
  data: any;
  created_at: string;
}

export interface ExchangeRates {
  USD: {
    USDC: number;
    SOL: number;
    lastUpdated: string;
  };
  USDC: {
    USD: number;
    SOL: number;
    lastUpdated: string;
  };
}

class ApiClient {
  private baseUrl: string;
  private indexerUrl: string;

  constructor() {
    this.baseUrl = process.env.NODE_ENV === 'production' 
      ? '' // Use relative URLs in production
      : 'http://localhost:3000'; // Use full URL in development
    
    this.indexerUrl = process.env.NODE_ENV === 'production'
      ? 'http://localhost:3001' // Indexer URL in production
      : 'http://localhost:3001'; // Indexer URL in development
  }

  // P&L Analytics methods
  async fetchPortfolioPnL(wallet: string) {
    const response = await fetch(`${this.indexerUrl}/api/pnl/portfolio?wallet=${wallet}`);
    if (!response.ok) {
      throw new Error('Failed to fetch portfolio P&L');
    }
    return response.json();
  }

  async fetchHistoricalPnL(wallet: string, days: number = 30) {
    const response = await fetch(`${this.indexerUrl}/api/pnl/history?wallet=${wallet}&days=${days}`);
    if (!response.ok) {
      throw new Error('Failed to fetch historical P&L');
    }
    return response.json();
  }

  async fetchAssetPerformance(mint: string, days: number = 30) {
    const response = await fetch(`${this.indexerUrl}/api/assets/${mint}/performance?days=${days}`);
    if (!response.ok) {
      throw new Error('Failed to fetch asset performance');
    }
    return response.json();
  }

  async fetchAssets(assetId?: string): Promise<Asset[]> {
    const url = assetId 
      ? `${this.indexerUrl}/api/assets?mint=${assetId}`
      : `${this.indexerUrl}/api/assets`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch assets');
    }
    return response.json();
  }

  async fetchTransactions(params?: {
    assetId?: string;
    userWallet?: string;
    limit?: number;
    offset?: number;
  }): Promise<Transaction[]> {
    const searchParams = new URLSearchParams();
    if (params?.assetId) searchParams.append('mint', params.assetId);
    if (params?.userWallet) searchParams.append('wallet', params.userWallet);
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.offset) searchParams.append('offset', params.offset.toString());

    const url = `${this.indexerUrl}/api/trades${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch transactions');
    }
    return response.json();
  }

  async fetchPortfolio(userWallet: string): Promise<Portfolio[]> {
    const response = await fetch(`${this.indexerUrl}/api/portfolio?wallet=${userWallet}`);
    if (!response.ok) {
      throw new Error('Failed to fetch portfolio');
    }
    return response.json();
  }

  async fetchDividends(params?: {
    assetId?: string;
    userWallet?: string;
    status?: string;
  }): Promise<Dividend[]> {
    const searchParams = new URLSearchParams();
    if (params?.assetId) searchParams.append('mint', params.assetId);
    if (params?.userWallet) searchParams.append('wallet', params.userWallet);
    if (params?.status) searchParams.append('status', params.status);

    const url = `${this.indexerUrl}/api/dividends${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch dividends');
    }
    return response.json();
  }

  async fetchClaims(userWallet: string): Promise<Claim[]> {
    const response = await fetch(`${this.indexerUrl}/api/claims?wallet=${userWallet}`);
    if (!response.ok) {
      throw new Error('Failed to fetch claims');
    }
    return response.json();
  }

  async fetchOrderBook(assetId: string): Promise<OrderBook> {
    const response = await fetch(`${this.indexerUrl}/api/orderbook?mint=${assetId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch order book');
    }
    return response.json();
  }

  async fetchExchangeRates(): Promise<ExchangeRates> {
    const response = await fetch(`${this.indexerUrl}/api/rates`);
    if (!response.ok) {
      throw new Error('Failed to fetch exchange rates');
    }
    return response.json();
  }

  async fetchHistory(userWallet: string): Promise<HistoryEvent[]> {
    const response = await fetch(`${this.indexerUrl}/api/history?wallet=${userWallet}`);
    if (!response.ok) {
      throw new Error('Failed to fetch history');
    }
    return response.json();
  }

  async buyShares(request: TransactionRequest): Promise<TransactionResponse> {
    const response = await fetch(`${this.baseUrl}/api/tx/buy`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    
    if (!response.ok) {
      throw new Error('Failed to create buy transaction');
    }
    return response.json();
  }

  async sellShares(request: TransactionRequest): Promise<TransactionResponse> {
    const response = await fetch(`${this.baseUrl}/api/tx/sell`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    
    if (!response.ok) {
      throw new Error('Failed to create sell transaction');
    }
    return response.json();
  }

  async createAsset(asset: Partial<Asset>): Promise<Asset> {
    const response = await fetch(`${this.baseUrl}/api/assets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(asset),
    });
    
    if (!response.ok) {
      throw new Error('Failed to create asset');
    }
    return response.json();
  }
}

export const api = new ApiClient();
export const apiClient = new ApiClient();