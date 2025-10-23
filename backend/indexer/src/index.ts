import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { database } from './database';
import { EventListener } from './eventListener';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API endpoints for querying indexed data
app.get('/api/assets', async (req, res) => {
  try {
    const result = await database.query('SELECT * FROM assets ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching assets:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/assets/:assetMint', async (req, res) => {
  try {
    const { assetMint } = req.params;
    const result = await database.query('SELECT * FROM assets WHERE asset_mint = $1', [assetMint]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Asset not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching asset:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/transactions', async (req, res) => {
  try {
    const { assetMint, userWallet, type, limit = 50, offset = 0 } = req.query;
    
    let query = 'SELECT * FROM transactions WHERE 1=1';
    const params: any[] = [];
    let paramIndex = 1;

    if (assetMint) {
      query += ` AND asset_mint = $${paramIndex}`;
      params.push(assetMint);
      paramIndex++;
    }

    if (userWallet) {
      query += ` AND user_wallet = $${paramIndex}`;
      params.push(userWallet);
      paramIndex++;
    }

    if (type) {
      query += ` AND transaction_type = $${paramIndex}`;
      params.push(type);
      paramIndex++;
    }

    query += ` ORDER BY block_time DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await database.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/portfolio/:userWallet', async (req, res) => {
  try {
    const { userWallet } = req.params;
    
    // Get user's current portfolio by aggregating transactions
    const result = await database.query(`
      SELECT 
        t.asset_mint,
        a.issuer,
        a.price_usdc,
        SUM(CASE WHEN t.transaction_type = 'buy' THEN t.amount ELSE -t.amount END) as balance,
        SUM(CASE WHEN t.transaction_type = 'buy' THEN t.amount ELSE -t.amount END) * a.price_usdc as value_usdc
      FROM transactions t
      JOIN assets a ON t.asset_mint = a.asset_mint
      WHERE t.user_wallet = $1 AND t.transaction_type IN ('buy', 'sell')
      GROUP BY t.asset_mint, a.issuer, a.price_usdc
      HAVING SUM(CASE WHEN t.transaction_type = 'buy' THEN t.amount ELSE -t.amount END) > 0
    `, [userWallet]);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching portfolio:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/dividends', async (req, res) => {
  try {
    const { assetMint } = req.query;
    
    let query = 'SELECT * FROM dividends WHERE 1=1';
    const params: any[] = [];
    
    if (assetMint) {
      query += ' AND asset_mint = $1';
      params.push(assetMint);
    }
    
    query += ' ORDER BY created_at DESC';
    
    const result = await database.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching dividends:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/claims/:userWallet', async (req, res) => {
  try {
    const { userWallet } = req.params;
    
    const result = await database.query(`
      SELECT c.*, d.asset_mint, d.total_amount, d.created_at as dividend_created_at
      FROM claims c
      JOIN dividends d ON c.dividend_pda = d.dividend_pda
      WHERE c.holder = $1
      ORDER BY c.claimed_at DESC
    `, [userWallet]);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching claims:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Mock orderbook endpoint for demo
app.get('/api/orderbook/:assetMint', (req, res) => {
  const { assetMint } = req.params;
  
  // Mock orderbook data for demo purposes
  const mockOrderbook = {
    bids: [
      { price: 0.99, amount: 1000, total: 990 },
      { price: 0.98, amount: 2000, total: 1960 },
      { price: 0.97, amount: 1500, total: 1455 },
    ],
    asks: [
      { price: 1.01, amount: 800, total: 808 },
      { price: 1.02, amount: 1200, total: 1224 },
      { price: 1.03, amount: 900, total: 927 },
    ],
    lastPrice: 1.00,
    priceChange24h: 0.02,
    volume24h: 15000
  };
  
  res.json(mockOrderbook);
});

async function startServer() {
  try {
    // Initialize database
    await database.connect();
    
    // Start event listener
    const eventListener = new EventListener();
    await eventListener.start();
    
    // Start Express server
    app.listen(port, () => {
      console.log(`RWA Indexer server running on port ${port}`);
      console.log(`Health check: http://localhost:${port}/health`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  await database.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Shutting down gracefully...');
  await database.close();
  process.exit(0);
});

startServer();