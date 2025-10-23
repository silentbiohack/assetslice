import { prisma } from '../lib/prisma';

export class PnLService {
  /**
   * Calculates P&L for a specific position
   */
  async calculatePositionPnL(wallet: string, mint: string) {
    try {
      // Get current position
      const position = await prisma.position.findUnique({
        where: {
          wallet_mint: {
            wallet,
            mint
          }
        },
        include: {
          asset: true
        }
      });

      if (!position || position.shares <= 0) {
        return {
          totalInvested: 0,
          currentValue: 0,
          profitLoss: 0,
          profitLossPercent: 0
        };
      }

      // Get all trades for this position
      const trades = await prisma.trade.findMany({
        where: {
          wallet,
          mint
        },
        orderBy: {
          createdAt: 'asc'
        }
      });

      let totalInvested = 0;
      let totalShares = 0;

      // Calculate weighted average cost basis
      for (const trade of trades) {
        const tradeAmount = Number(trade.amount);
        const tradePriceUsdc = Number(trade.priceUsdc) / 1000000; // Convert from micro USDC

        if (trade.side === 'buy') {
          totalInvested += tradePriceUsdc;
          totalShares += tradeAmount;
        } else if (trade.side === 'sell') {
          // For sells, reduce the cost basis proportionally
          const sellRatio = tradeAmount / totalShares;
          totalInvested -= totalInvested * sellRatio;
          totalShares -= tradeAmount;
        }
      }

      const currentPrice = Number(position.asset.priceUsdc) / 1000000;
      const currentShares = Number(position.shares);
      const currentValue = currentShares * currentPrice;
      
      // Adjust total invested for current shares
      const avgCostBasis = totalShares > 0 ? totalInvested / totalShares : 0;
      const adjustedTotalInvested = currentShares * avgCostBasis;
      
      const profitLoss = currentValue - adjustedTotalInvested;
      const profitLossPercent = adjustedTotalInvested > 0 ? (profitLoss / adjustedTotalInvested) * 100 : 0;

      return {
        totalInvested: adjustedTotalInvested,
        currentValue,
        profitLoss,
        profitLossPercent
      };
    } catch (error) {
      console.error('Error calculating position P&L:', error);
      return {
        totalInvested: 0,
        currentValue: 0,
        profitLoss: 0,
        profitLossPercent: 0
      };
    }
  }

  /**
   * Calculates total portfolio P&L for a wallet
   */
  async calculatePortfolioPnL(wallet: string) {
    try {
      const positions = await prisma.position.findMany({
        where: {
          wallet,
          shares: { gt: 0 }
        }
      });

      let totalInvested = 0;
      let totalCurrentValue = 0;

      for (const position of positions) {
        const pnl = await this.calculatePositionPnL(wallet, position.mint);
        totalInvested += pnl.totalInvested;
        totalCurrentValue += pnl.currentValue;
      }

      const totalProfitLoss = totalCurrentValue - totalInvested;
      const totalProfitLossPercent = totalInvested > 0 ? (totalProfitLoss / totalInvested) * 100 : 0;

      return {
        totalInvested,
        totalCurrentValue,
        totalProfitLoss,
        totalProfitLossPercent
      };
    } catch (error) {
      console.error('Error calculating portfolio P&L:', error);
      return {
        totalInvested: 0,
        totalCurrentValue: 0,
        totalProfitLoss: 0,
        totalProfitLossPercent: 0
      };
    }
  }

  /**
   * Gets historical P&L data for charts
   */
  async getHistoricalPnL(wallet: string, days: number = 30) {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // Get all trades in the time period
      const trades = await prisma.trade.findMany({
        where: {
          wallet,
          createdAt: {
            gte: startDate,
            lte: endDate
          }
        },
        orderBy: {
          createdAt: 'asc'
        },
        include: {
          asset: true
        }
      });

      // Group trades by day and calculate daily P&L
      const dailyPnL: { [key: string]: number } = {};
      const positions: { [mint: string]: { shares: number, totalInvested: number } } = {};

      for (const trade of trades) {
        const dateKey = trade.createdAt.toISOString().split('T')[0];
        const tradeAmount = Number(trade.amount);
        const tradePriceUsdc = Number(trade.priceUsdc) / 1000000;

        if (!positions[trade.mint]) {
          positions[trade.mint] = { shares: 0, totalInvested: 0 };
        }

        if (trade.side === 'buy') {
          positions[trade.mint].shares += tradeAmount;
          positions[trade.mint].totalInvested += tradePriceUsdc;
        } else if (trade.side === 'sell') {
          const sellRatio = tradeAmount / positions[trade.mint].shares;
          positions[trade.mint].totalInvested -= positions[trade.mint].totalInvested * sellRatio;
          positions[trade.mint].shares -= tradeAmount;
        }

        // Calculate current value for this day
        const currentPrice = Number(trade.asset.priceUsdc) / 1000000;
        const currentValue = positions[trade.mint].shares * currentPrice;
        const pnl = currentValue - positions[trade.mint].totalInvested;

        if (!dailyPnL[dateKey]) {
          dailyPnL[dateKey] = 0;
        }
        dailyPnL[dateKey] += pnl;
      }

      // Convert to array format for charts
      const chartData = Object.entries(dailyPnL).map(([date, pnl]) => ({
        date,
        pnl,
        timestamp: new Date(date).getTime()
      })).sort((a, b) => a.timestamp - b.timestamp);

      return chartData;
    } catch (error) {
      console.error('Error getting historical P&L:', error);
      return [];
    }
  }

  /**
   * Gets asset performance data
   */
  async getAssetPerformance(mint: string, days: number = 30) {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // Get trades for price history
      const trades = await prisma.trade.findMany({
        where: {
          mint,
          createdAt: {
            gte: startDate,
            lte: endDate
          }
        },
        orderBy: {
          createdAt: 'asc'
        }
      });

      // Calculate daily average prices
      const dailyPrices: { [key: string]: { total: number, count: number } } = {};

      for (const trade of trades) {
        const dateKey = trade.createdAt.toISOString().split('T')[0];
        const pricePerShare = Number(trade.priceUsdc) / Number(trade.amount) / 1000000;

        if (!dailyPrices[dateKey]) {
          dailyPrices[dateKey] = { total: 0, count: 0 };
        }

        dailyPrices[dateKey].total += pricePerShare;
        dailyPrices[dateKey].count += 1;
      }

      // Convert to chart data
      const chartData = Object.entries(dailyPrices).map(([date, data]) => ({
        date,
        price: data.total / data.count,
        timestamp: new Date(date).getTime()
      })).sort((a, b) => a.timestamp - b.timestamp);

      // Calculate performance metrics
      const firstPrice = chartData[0]?.price || 0;
      const lastPrice = chartData[chartData.length - 1]?.price || 0;
      const performance = firstPrice > 0 ? ((lastPrice - firstPrice) / firstPrice) * 100 : 0;

      return {
        chartData,
        performance,
        firstPrice,
        lastPrice
      };
    } catch (error) {
      console.error('Error getting asset performance:', error);
      return {
        chartData: [],
        performance: 0,
        firstPrice: 0,
        lastPrice: 0
      };
    }
  }
}