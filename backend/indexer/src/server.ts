import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { SolanaListener } from './services/solanaListener';
import { EventProcessor } from './services/eventProcessor';
import { AssetService } from './services/assetService';
import { PnLService } from './services/pnlService';
import { prisma } from './lib/prisma';
import { Asset, Trade, Position, Dividend, Claim } from '@prisma/client';

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize services
const eventProcessor = new EventProcessor();
const solanaListener = new SolanaListener(
  process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com',
  process.env.RWA_MARKET_PROGRAM_ID || '',
  eventProcessor
);
const assetService = new AssetService(
  process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com',
  process.env.RWA_REGISTRY_PROGRAM_ID || ''
);
const pnlService = new PnLService();

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'rwa-indexer'
  });
});

// Assets endpoint
app.get('/assets', async (req, res) => {
  try {
    const { assetId, class: assetClass, q: query, sort } = req.query;
    
    let whereClause: any = {};
    
    if (assetId) {
      whereClause.id = assetId;
    }
    
    if (query) {
      whereClause.OR = [
        { ticker: { contains: query as string, mode: 'insensitive' } },
        { issuer: { contains: query as string, mode: 'insensitive' } }
      ];
    }

    let orderBy: any = { createdAt: 'desc' };
    if (sort === 'name') {
      orderBy = { ticker: 'asc' };
    } else if (sort === 'price') {
      orderBy = { priceUsdc: 'desc' };
    }

    const assets = await prisma.asset.findMany({
      where: whereClause,
      orderBy
    });

    // Transform to match frontend expectations
    const transformedAssets = assets.map((asset: Asset) => ({
      id: asset.id,
      name: asset.ticker, // Using ticker as name for now
      symbol: asset.ticker,
      description: `Asset issued by ${asset.issuer}`,
      total_supply: Number(asset.totalSupply),
      price_per_share: Number(asset.priceUsdc) / 1000000, // Convert from micro USDC
      creator: asset.issuer,
      created_at: asset.createdAt.toISOString(),
      updated_at: asset.updatedAt.toISOString()
    }));

    res.json(transformedAssets);
  } catch (error) {
    console.error('Error fetching assets:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/assets', async (req, res) => {
  try {
    const { mint, ticker, issuer, priceUsdc, totalSupply } = req.body;

    if (!mint || !ticker || !issuer) {
      return res.status(400).json({ error: 'Missing required fields: mint, ticker, issuer' });
    }

    const asset = await prisma.asset.create({
      data: {
        mint,
        ticker,
        issuer,
        priceUsdc: BigInt(priceUsdc || 0),
        totalSupply: BigInt(totalSupply || 0),
        freeFloat: BigInt(totalSupply || 0)
      }
    });

    const transformedAsset = {
      id: asset.id,
      name: asset.ticker,
      symbol: asset.ticker,
      description: `Asset issued by ${asset.issuer}`,
      total_supply: Number(asset.totalSupply),
      price_per_share: Number(asset.priceUsdc) / 1000000,
      creator: asset.issuer,
      created_at: asset.createdAt.toISOString(),
      updated_at: asset.updatedAt.toISOString()
    };

    res.json(transformedAsset);
  } catch (error) {
    console.error('Error creating asset:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Transactions endpoint
app.get('/transactions', async (req, res) => {
  try {
    const { assetId, userWallet, limit = '50', offset = '0' } = req.query;
    
    let whereClause: any = {};
    
    if (assetId) {
      whereClause.mint = assetId;
    }
    
    if (userWallet) {
      whereClause.wallet = userWallet;
    }

    const trades = await prisma.trade.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit as string),
      skip: parseInt(offset as string),
      include: {
        asset: {
          select: { ticker: true }
        }
      }
    });

    // Transform to match frontend expectations
    const transformedTrades = trades.map((trade: Trade & { asset?: { ticker: string } }) => ({
      id: trade.id,
      asset_id: trade.mint,
      user_wallet: trade.wallet,
      transaction_type: trade.side,
      shares: Number(trade.amount),
      price_per_share: Number(trade.priceUsdc) / Number(trade.amount) / 1000000, // Calculate price per share
      total_amount: Number(trade.priceUsdc) / 1000000, // Convert from micro USDC
      signature: trade.sig,
      created_at: trade.createdAt.toISOString(),
      asset_name: trade.asset?.ticker
    }));

    res.json(transformedTrades);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Portfolio endpoint
app.get('/portfolio', async (req, res) => {
  try {
    const { userWallet } = req.query;
    
    if (!userWallet) {
      return res.status(400).json({ error: 'userWallet parameter is required' });
    }

    const positions = await prisma.position.findMany({
      where: { 
        wallet: userWallet as string,
        shares: { gt: 0 }
      },
      include: {
        asset: true
      }
    });

    // Transform to match frontend expectations with P&L calculations
    const portfolio = await Promise.all(positions.map(async (position: Position & { asset: { ticker: string } }) => {
      const pnl = await pnlService.calculatePositionPnL(userWallet as string, position.mint);
      
      return {
        asset_id: position.mint,
        asset_name: position.asset.ticker,
        asset_symbol: position.asset.ticker,
        shares_owned: Number(position.shares),
        current_value: pnl.currentValue,
        total_invested: pnl.totalInvested,
        profit_loss: pnl.profitLoss
      };
    }));

    res.json(portfolio);
  } catch (error) {
    console.error('Error fetching portfolio:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Dividends endpoint
app.get('/dividends', async (req, res) => {
  try {
    const { assetId, userWallet, status } = req.query;
    
    let whereClause: any = {};
    
    if (assetId) {
      whereClause.mint = assetId;
    }

    const dividends = await prisma.dividend.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      include: {
        asset: {
          select: { ticker: true }
        }
      }
    });

    // Transform to match frontend expectations
    const transformedDividends = dividends.map((dividend: Dividend & { asset?: { ticker: string } }) => ({
      id: dividend.id,
      asset_id: dividend.mint,
      amount_per_share: 0, // TODO: Calculate from totalAmount and supply
      total_amount: Number(dividend.totalAmount) / 1000000,
      status: 'open', // TODO: Add status field to schema
      created_at: dividend.createdAt.toISOString(),
      asset_name: dividend.asset?.ticker
    }));

    res.json(transformedDividends);
  } catch (error) {
    console.error('Error fetching dividends:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Claims endpoint
app.get('/claims', async (req, res) => {
  try {
    const { userWallet, dividendId } = req.query;
    
    let whereClause: any = {};
    
    if (userWallet) {
      whereClause.wallet = userWallet;
    }
    
    if (dividendId) {
      whereClause.dividendId = dividendId;
    }

    const claims = await prisma.claim.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      include: {
        dividend: {
          include: {
            asset: {
              select: { ticker: true }
            }
          }
        }
      }
    });

    // Transform to match frontend expectations
    const transformedClaims = claims.map((claim: Claim & { dividend: { asset?: { ticker: string }; mint: string } }) => ({
      id: claim.id,
      dividend_id: claim.dividendId,
      user_wallet: claim.wallet,
      amount: Number(claim.amount) / 1000000,
      claimed_at: claim.createdAt.toISOString(),
      asset_name: claim.dividend.asset?.ticker
    }));

    res.json(transformedClaims);
  } catch (error) {
    console.error('Error fetching claims:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Orderbook endpoint
app.get('/orderbook', async (req, res) => {
  try {
    const { assetId } = req.query;
    
    if (!assetId) {
      return res.status(400).json({ error: 'assetId parameter is required' });
    }

    // Mock orderbook data for now
    const orderbook = {
      asset_id: assetId,
      bids: [
        { price: 100, quantity: 50 },
        { price: 99, quantity: 75 },
        { price: 98, quantity: 100 }
      ],
      asks: [
        { price: 101, quantity: 25 },
        { price: 102, quantity: 50 },
        { price: 103, quantity: 75 }
      ]
    };

    res.json(orderbook);
  } catch (error) {
    console.error('Error fetching orderbook:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Manual sync endpoint
app.post('/api/sync/assets', async (req, res) => {
  try {
    await assetService.syncAssets();
    res.json({ message: 'Asset synchronization completed' });
  } catch (error) {
    console.error('Error syncing assets:', error);
    res.status(500).json({ error: 'Asset synchronization failed' });
  }
});

// Statistics endpoint
app.get('/api/stats', async (req, res) => {
  try {
    const [assetCount, tradeCount, positionCount, dividendCount] = await Promise.all([
      prisma.asset.count(),
      prisma.trade.count(),
      prisma.position.count(),
      prisma.dividend.count(),
    ]);

    const stats = {
      assets: assetCount,
      trades: tradeCount,
      positions: positionCount,
      dividends: dividendCount,
      timestamp: new Date().toISOString(),
    };

    res.json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// History endpoint
app.get('/history', async (req, res) => {
  try {
    const { wallet, type, limit = '50', offset = '0' } = req.query;
    
    if (!wallet) {
      return res.status(400).json({ error: 'wallet parameter is required' });
    }

    const limitNum = parseInt(limit as string);
    const offsetNum = parseInt(offset as string);

    // Получаем различные типы событий в зависимости от параметра type
    let events: any[] = [];

    if (!type || type === 'all' || type === 'trades') {
      // Получаем транзакции (trades)
      const trades = await prisma.trade.findMany({
        where: { wallet: wallet as string },
        orderBy: { createdAt: 'desc' },
        take: limitNum,
        skip: offsetNum,
        include: {
          asset: {
            select: { ticker: true }
          }
        }
      });

      const tradeEvents = trades.map((trade: Trade & { asset?: { ticker: string } }) => ({
        id: trade.id,
        wallet: trade.wallet,
        type: 'trade' as const,
        data: {
          mint: trade.mint,
          asset_ticker: trade.asset?.ticker,
          side: trade.side,
          amount: trade.amount.toString(),
          price_usdc: trade.priceUsdc.toString(),
          signature: trade.sig
        },
        created_at: trade.createdAt
      }));

      events.push(...tradeEvents);
    }

    if (!type || type === 'all' || type === 'claims') {
      // Получаем claims
      const claims = await prisma.claim.findMany({
        where: { wallet: wallet as string },
        orderBy: { createdAt: 'desc' },
        take: limitNum,
        skip: offsetNum,
        include: {
          dividend: {
            include: {
              asset: {
                select: { ticker: true }
              }
            }
          }
        }
      });

      const claimEvents = claims.map((claim: Claim & { dividend: { asset?: { ticker: string }; mint: string } }) => ({
        id: claim.id,
        wallet: claim.wallet,
        type: 'claim' as const,
        data: {
          dividend_id: claim.dividendId,
          mint: claim.dividend.mint,
          asset_ticker: claim.dividend.asset?.ticker,
          amount: claim.amount.toString()
        },
        created_at: claim.createdAt
      }));

      events.push(...claimEvents);
    }

    if (!type || type === 'all' || type === 'dividends') {
      // Получаем дивиденды для активов пользователя
      const userPositions = await prisma.position.findMany({
        where: { 
          wallet: wallet as string,
          shares: { gt: 0 }
        },
        select: { mint: true }
      });

      if (userPositions.length > 0) {
        const mints = userPositions.map((p) => p.mint);
        const dividends = await prisma.dividend.findMany({
          where: { mint: { in: mints } },
          orderBy: { createdAt: 'desc' },
          take: limitNum,
          skip: offsetNum,
          include: {
            asset: {
              select: { ticker: true }
            }
          }
        });

        const dividendEvents = dividends.map((dividend: Dividend & { asset?: { ticker: string } }) => ({
          id: dividend.id,
          wallet: wallet as string,
          type: 'dividend' as const,
          data: {
            mint: dividend.mint,
            asset_ticker: dividend.asset?.ticker,
            index: dividend.index.toString(),
            total_amount: dividend.totalAmount.toString()
          },
          created_at: dividend.createdAt
        }));

        events.push(...dividendEvents);
      }
    }

    // Сортируем все события по дате
    events.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    // Ограничиваем результат
    events = events.slice(0, limitNum);

    res.json(events);
  } catch (error) {
    console.error('Error fetching history:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/history', async (req, res) => {
  try {
    const { wallet, type, data } = req.body;

    if (!wallet || !type || !data) {
      return res.status(400).json({ error: 'Missing required parameters: wallet, type, data' });
    }

    // Создаем запись в истории (можно добавить отдельную таблицу для истории)
    // Пока что просто возвращаем успешный ответ
    const historyEvent = {
      id: `hist_${Date.now()}`,
      wallet,
      type,
      data,
      created_at: new Date().toISOString()
    };

    res.json(historyEvent);
  } catch (error) {
    console.error('Error adding history event:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// P&L Analytics endpoints
app.get('/api/pnl/portfolio', async (req, res) => {
  try {
    const { wallet } = req.query;
    
    if (!wallet) {
      return res.status(400).json({ error: 'wallet parameter is required' });
    }

    const portfolioPnL = await pnlService.calculatePortfolioPnL(wallet as string);
    res.json(portfolioPnL);
  } catch (error) {
    console.error('Error fetching portfolio P&L:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/pnl/history', async (req, res) => {
  try {
    const { wallet, days = '30' } = req.query;
    
    if (!wallet) {
      return res.status(400).json({ error: 'wallet parameter is required' });
    }

    const historicalPnL = await pnlService.getHistoricalPnL(wallet as string, parseInt(days as string));
    res.json(historicalPnL);
  } catch (error) {
    console.error('Error fetching historical P&L:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/assets/:mint/performance', async (req, res) => {
  try {
    const { mint } = req.params;
    const { days = '30' } = req.query;
    
    const performance = await pnlService.getAssetPerformance(mint, parseInt(days as string));
    res.json(performance);
  } catch (error) {
    console.error('Error fetching asset performance:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start the server
async function startServer() {
  try {
    // Test database connection
    await prisma.$connect();
    console.log('Connected to database');

    // Start HTTP server
    app.listen(port, () => {
      console.log(`Indexer server running on port ${port}`);
    });

    // Initial asset sync
    console.log('Performing initial asset sync...');
    await assetService.syncAssets();

    // Start listening for Solana events
    console.log('Starting Solana event listener...');
    await solanaListener.startListening();

  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  await solanaListener.stop();
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Shutting down gracefully...');
  await solanaListener.stop();
  await prisma.$disconnect();
  process.exit(0);
});

// Start the server
startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});