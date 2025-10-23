import { Connection, PublicKey } from '@solana/web3.js';
import { prisma } from '../lib/prisma';

export class AssetService {
  private connection: Connection;
  private registryProgramId: PublicKey;

  constructor(rpcUrl: string, registryProgramId: string) {
    this.connection = new Connection(rpcUrl, 'confirmed');
    this.registryProgramId = new PublicKey(registryProgramId);
  }

  async syncAssets(): Promise<void> {
    console.log('Starting asset synchronization...');
    
    try {
      // Get all program accounts for the registry
      const accounts = await this.connection.getProgramAccounts(this.registryProgramId);
      
      console.log(`Found ${accounts.length} registry accounts`);

      for (const account of accounts) {
        try {
          await this.processAssetAccount(account.pubkey, account.account.data);
        } catch (error) {
          console.error(`Error processing asset account ${account.pubkey.toString()}:`, error);
        }
      }

      console.log('Asset synchronization completed');
    } catch (error) {
      console.error('Error during asset synchronization:', error);
      throw error;
    }
  }

  private async processAssetAccount(pubkey: PublicKey, data: Buffer): Promise<void> {
    try {
      // This is a simplified parser - you need to implement proper parsing
      // based on your program's account structure
      const assetData = this.parseAssetData(data);
      
      if (!assetData) {
        return;
      }

      // Check if asset already exists
      const existingAsset = await prisma.asset.findUnique({
        where: { mint: assetData.mint }
      });

      if (existingAsset) {
        // Update existing asset
        await prisma.asset.update({
          where: { mint: assetData.mint },
          data: {
            ticker: assetData.ticker,
            issuer: assetData.issuer,
            priceUsdc: assetData.priceUsdc,
            totalSupply: assetData.totalSupply,
            freeFloat: assetData.freeFloat,
          },
        });
        console.log(`Updated asset: ${assetData.ticker}`);
      } else {
        // Create new asset
        await prisma.asset.create({
          data: {
            mint: assetData.mint,
            ticker: assetData.ticker,
            issuer: assetData.issuer,
            priceUsdc: assetData.priceUsdc,
            totalSupply: assetData.totalSupply,
            freeFloat: assetData.freeFloat,
          },
        });
        console.log(`Created new asset: ${assetData.ticker}`);
      }
    } catch (error) {
      console.error(`Error processing asset account:`, error);
    }
  }

  private parseAssetData(data: Buffer): {
    mint: string;
    ticker: string;
    issuer: string;
    priceUsdc: bigint;
    totalSupply: bigint;
    freeFloat: bigint;
  } | null {
    try {
      // This is a mock implementation - you need to implement proper parsing
      // based on your program's account structure using Borsh or similar
      
      // For now, return mock data
      return {
        mint: 'mock_mint_' + Math.random().toString(36).substr(2, 9),
        ticker: 'MOCK',
        issuer: 'Mock Issuer',
        priceUsdc: BigInt(1000000), // $1 in micro USDC
        totalSupply: BigInt(1000000000000), // 1M shares
        freeFloat: BigInt(800000000000), // 800K shares available
      };
    } catch (error) {
      console.error('Error parsing asset data:', error);
      return null;
    }
  }

  async updateAssetPrice(mint: string, newPrice: bigint): Promise<void> {
    try {
      await prisma.asset.update({
        where: { mint },
        data: { priceUsdc: newPrice },
      });
      console.log(`Updated price for asset ${mint}: ${newPrice}`);
    } catch (error) {
      console.error(`Error updating asset price:`, error);
    }
  }

  async getAssetByMint(mint: string) {
    return await prisma.asset.findUnique({
      where: { mint }
    });
  }

  async getAllAssets() {
    return await prisma.asset.findMany({
      orderBy: { ticker: 'asc' }
    });
  }
}