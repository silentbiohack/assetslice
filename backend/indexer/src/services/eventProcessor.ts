import { ProgramEvent, SharesBoughtEvent, SharesSoldEvent, DividendOpenedEvent, DividendClaimedEvent } from '../types/events';
import { prisma } from '../lib/prisma';
import { PublicKey } from '@solana/web3.js';

export class EventProcessor {
  async processEvent(event: ProgramEvent, signature: string, slot: number): Promise<void> {
    console.log(`Processing event: ${event.name}`, event.data);

    try {
      switch (event.name) {
        case 'SharesBought':
          await this.processSharesBought(event.data, signature, slot);
          break;
        case 'SharesSold':
          await this.processSharesSold(event.data, signature, slot);
          break;
        case 'DividendOpened':
          await this.processDividendOpened(event.data, signature, slot);
          break;
        case 'DividendClaimed':
          await this.processDividendClaimed(event.data, signature, slot);
          break;
        default:
          console.log(`Unknown event type: ${(event as any).name}`);
      }
    } catch (error) {
      console.error(`Error processing event ${event.name}:`, error);
      throw error;
    }
  }

  private async processSharesBought(data: SharesBoughtEvent, signature: string, slot: number): Promise<void> {
    const { buyer, mint, amount, totalPaid } = data;
    
    // Create trade record
    await prisma.trade.create({
      data: {
        sig: signature,
        ts: new Date(),
        mint,
        side: 'buy',
        priceUsdc: BigInt(totalPaid),
        amount: BigInt(amount),
        wallet: buyer,
      },
    });

    // Update or create position
    await this.updatePosition(buyer, mint, BigInt(amount), 'add');

    // Update asset free float
    await this.updateAssetFreeFloat(mint, BigInt(amount), 'subtract');
  }

  private async processSharesSold(data: SharesSoldEvent, signature: string, slot: number): Promise<void> {
    const { seller, mint, amount, totalReceived } = data;
    
    // Create trade record
    await prisma.trade.create({
      data: {
        sig: signature,
        ts: new Date(),
        mint,
        side: 'sell',
        priceUsdc: BigInt(totalReceived),
        amount: BigInt(amount),
        wallet: seller,
      },
    });

    // Update position
    await this.updatePosition(seller, mint, BigInt(amount), 'subtract');

    // Update asset free float
    await this.updateAssetFreeFloat(mint, BigInt(amount), 'add');
  }

  private async processDividendOpened(data: DividendOpenedEvent, signature: string, slot: number): Promise<void> {
    const { dividend, asset, totalAmount, supplyCircAtOpen } = data;
    
    // Find asset by mint
    const assetRecord = await prisma.asset.findUnique({
      where: { mint: asset }
    });

    if (!assetRecord) {
      console.error(`Asset not found for mint: ${asset}`);
      return;
    }

    // Create dividend record
    await prisma.dividend.create({
      data: {
        mint: asset,
        index: BigInt(0), // You might need to derive this from the dividend account
        totalAmount: BigInt(totalAmount),
        ts: new Date(),
      },
    });
  }

  private async processDividendClaimed(data: DividendClaimedEvent, signature: string, slot: number): Promise<void> {
    const { dividend, holder, amount } = data;
    
    // Find dividend record
    const dividendRecord = await prisma.dividend.findFirst({
      where: { id: dividend } // You might need to adjust this based on how you identify dividends
    });

    if (!dividendRecord) {
      console.error(`Dividend not found: ${dividend}`);
      return;
    }

    // Create claim record
    await prisma.claim.create({
      data: {
        dividendId: dividendRecord.id,
        wallet: holder,
        amount: BigInt(amount),
        ts: new Date(),
      },
    });
  }

  private async updatePosition(wallet: string, mint: string, amount: bigint, operation: 'add' | 'subtract'): Promise<void> {
    const existingPosition = await prisma.position.findUnique({
      where: {
        wallet_mint: {
          wallet,
          mint,
        },
      },
    });

    if (existingPosition) {
      const newShares = operation === 'add' 
        ? existingPosition.shares + amount
        : existingPosition.shares - amount;

      if (newShares <= 0) {
        // Delete position if shares become zero or negative
        await prisma.position.delete({
          where: {
            wallet_mint: {
              wallet,
              mint,
            },
          },
        });
      } else {
        // Update existing position
        await prisma.position.update({
          where: {
            wallet_mint: {
              wallet,
              mint,
            },
          },
          data: {
            shares: newShares,
          },
        });
      }
    } else if (operation === 'add') {
      // Create new position
      await prisma.position.create({
        data: {
          wallet,
          mint,
          shares: amount,
        },
      });
    }
  }

  private async updateAssetFreeFloat(mint: string, amount: bigint, operation: 'add' | 'subtract'): Promise<void> {
    const asset = await prisma.asset.findUnique({
      where: { mint }
    });

    if (asset) {
      const newFreeFloat = operation === 'add' 
        ? asset.freeFloat + amount
        : asset.freeFloat - amount;

      await prisma.asset.update({
        where: { mint },
        data: {
          freeFloat: newFreeFloat,
        },
      });
    }
  }
}