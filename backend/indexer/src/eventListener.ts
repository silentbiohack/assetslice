import { Connection, PublicKey, ParsedTransactionWithMeta, PartiallyDecodedInstruction } from '@solana/web3.js';
import { Program, AnchorProvider, Wallet, BN } from '@coral-xyz/anchor';
import { database } from './database';
import dotenv from 'dotenv';

dotenv.config();

export class EventListener {
  private connection: Connection;
  private registryProgramId: PublicKey;
  private marketProgramId: PublicKey;

  constructor() {
    this.connection = new Connection(
      process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com',
      'confirmed'
    );
    this.registryProgramId = new PublicKey(process.env.RWA_REGISTRY_PROGRAM_ID!);
    this.marketProgramId = new PublicKey(process.env.RWA_MARKET_PROGRAM_ID!);
  }

  async start(): Promise<void> {
    console.log('Starting event listener...');
    
    // Listen to registry program events
    this.connection.onLogs(
      this.registryProgramId,
      (logs, context) => this.handleRegistryLogs(logs, context),
      'confirmed'
    );

    // Listen to market program events
    this.connection.onLogs(
      this.marketProgramId,
      (logs, context) => this.handleMarketLogs(logs, context),
      'confirmed'
    );

    console.log('Event listeners started successfully');
  }

  private async handleRegistryLogs(logs: any, context: any): Promise<void> {
    try {
      const signature = logs.signature;
      const transaction = await this.connection.getParsedTransaction(signature, {
        commitment: 'confirmed',
        maxSupportedTransactionVersion: 0
      });

      if (!transaction) return;

      // Parse AssetCreated events
      if (logs.logs.some((log: string) => log.includes('AssetCreated'))) {
        await this.handleAssetCreated(transaction, signature);
      }

      // Parse AssetUpdated events
      if (logs.logs.some((log: string) => log.includes('AssetUpdated'))) {
        await this.handleAssetUpdated(transaction, signature);
      }
    } catch (error) {
      console.error('Error handling registry logs:', error);
    }
  }

  private async handleMarketLogs(logs: any, context: any): Promise<void> {
    try {
      const signature = logs.signature;
      const transaction = await this.connection.getParsedTransaction(signature, {
        commitment: 'confirmed',
        maxSupportedTransactionVersion: 0
      });

      if (!transaction) return;

      // Parse SharesBought events
      if (logs.logs.some((log: string) => log.includes('SharesBought'))) {
        await this.handleSharesBought(transaction, signature);
      }

      // Parse SharesSold events
      if (logs.logs.some((log: string) => log.includes('SharesSold'))) {
        await this.handleSharesSold(transaction, signature);
      }

      // Parse DividendOpened events
      if (logs.logs.some((log: string) => log.includes('DividendOpened'))) {
        await this.handleDividendOpened(transaction, signature);
      }

      // Parse DividendClaimed events
      if (logs.logs.some((log: string) => log.includes('DividendClaimed'))) {
        await this.handleDividendClaimed(transaction, signature);
      }

      // Parse DividendClosed events
      if (logs.logs.some((log: string) => log.includes('DividendClosed'))) {
        await this.handleDividendClosed(transaction, signature);
      }
    } catch (error) {
      console.error('Error handling market logs:', error);
    }
  }

  private async handleAssetCreated(transaction: ParsedTransactionWithMeta, signature: string): Promise<void> {
    try {
      // Extract asset creation data from transaction
      const instruction = this.findProgramInstruction(transaction, this.registryProgramId);
      if (!instruction) return;

      // Parse accounts to extract asset data
      const accounts = transaction.transaction.message.accountKeys;
      
      // This is a simplified version - in production, you'd decode the instruction data properly
      const assetMint = accounts[2]?.pubkey.toString(); // Assuming asset mint is at index 2
      const issuer = accounts[0]?.pubkey.toString(); // Assuming issuer is at index 0
      const usdcMint = accounts[3]?.pubkey.toString(); // Assuming USDC mint is at index 3

      if (assetMint && issuer && usdcMint) {
        await database.query(`
          INSERT INTO "Asset" (mint, issuer, "usdcMint", decimals, "priceUsdc", "totalSupply", "freeFloat", ticker)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          ON CONFLICT (mint) DO NOTHING
        `, [assetMint, issuer, usdcMint, 6, 1000000, 1000000, 1000000, 'DEMO']); // Default values for demo

        console.log(`Asset created: ${assetMint}`);
      }
    } catch (error) {
      console.error('Error handling AssetCreated event:', error);
    }
  }

  private async handleAssetUpdated(transaction: ParsedTransactionWithMeta, signature: string): Promise<void> {
    try {
      const instruction = this.findProgramInstruction(transaction, this.registryProgramId);
      if (!instruction) return;

      const accounts = transaction.transaction.message.accountKeys;
      const assetMint = accounts[1]?.pubkey.toString(); // Assuming asset account is at index 1

      if (assetMint) {
        await database.query(`
          UPDATE "Asset" SET "updatedAt" = CURRENT_TIMESTAMP WHERE mint = $1
        `, [assetMint]);

        console.log(`Asset updated: ${assetMint}`);
      }
    } catch (error) {
      console.error('Error handling AssetUpdated event:', error);
    }
  }

  private async handleSharesBought(transaction: ParsedTransactionWithMeta, signature: string): Promise<void> {
    try {
      const instruction = this.findProgramInstruction(transaction, this.marketProgramId);
      if (!instruction) return;

      const accounts = transaction.transaction.message.accountKeys;
      const buyer = accounts[0]?.pubkey.toString();
      const assetMint = accounts[2]?.pubkey.toString();

      if (buyer && assetMint && transaction.blockTime) {
        await database.query(`
          INSERT INTO "Trade" (sig, mint, side, wallet, amount, "priceUsdc", slot, "createdAt")
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          ON CONFLICT (sig) DO NOTHING
        `, [
          signature,
          assetMint,
          'buy',
          buyer,
          100, // Default amount for demo
          100000000, // Default price for demo (100 USDC in micro USDC)
          transaction.slot,
          new Date(transaction.blockTime * 1000)
        ]);

        console.log(`Shares bought: ${buyer} -> ${assetMint}`);
      }
    } catch (error) {
      console.error('Error handling SharesBought event:', error);
    }
  }

  private async handleSharesSold(transaction: ParsedTransactionWithMeta, signature: string): Promise<void> {
    try {
      const instruction = this.findProgramInstruction(transaction, this.marketProgramId);
      if (!instruction) return;

      const accounts = transaction.transaction.message.accountKeys;
      const seller = accounts[0]?.pubkey.toString();
      const assetMint = accounts[2]?.pubkey.toString();

      if (seller && assetMint && transaction.blockTime) {
        await database.query(`
          INSERT INTO "Trade" (sig, mint, side, wallet, amount, "priceUsdc", slot, "createdAt")
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          ON CONFLICT (sig) DO NOTHING
        `, [
          signature,
          assetMint,
          'sell',
          seller,
          100, // Default amount for demo
          100000000, // Default price for demo (100 USDC in micro USDC)
          transaction.slot,
          new Date(transaction.blockTime * 1000)
        ]);

        console.log(`Shares sold: ${seller} -> ${assetMint}`);
      }
    } catch (error) {
      console.error('Error handling SharesSold event:', error);
    }
  }

  private async handleDividendOpened(transaction: ParsedTransactionWithMeta, signature: string): Promise<void> {
    try {
      const instruction = this.findProgramInstruction(transaction, this.marketProgramId);
      if (!instruction) return;

      const accounts = transaction.transaction.message.accountKeys;
      const dividendPda = accounts[2]?.pubkey.toString(); // Assuming dividend PDA is at index 2
      const assetMint = accounts[1]?.pubkey.toString();

      if (dividendPda && assetMint && transaction.blockTime) {
        await database.query(`
          INSERT INTO "Dividend" (pda, mint, "index", "totalAmount", "supplyCircAtOpen", "createdAt")
          VALUES ($1, $2, $3, $4, $5, $6)
          ON CONFLICT (pda) DO NOTHING
        `, [
          dividendPda,
          assetMint,
          1, // Default index for demo
          1000000, // Default total amount for demo
          1000000, // Default supply for demo
          new Date(transaction.blockTime * 1000)
        ]);

        console.log(`Dividend opened: ${dividendPda}`);
      }
    } catch (error) {
      console.error('Error handling DividendOpened event:', error);
    }
  }

  private async handleDividendClaimed(transaction: ParsedTransactionWithMeta, signature: string): Promise<void> {
    try {
      const instruction = this.findProgramInstruction(transaction, this.marketProgramId);
      if (!instruction) return;

      const accounts = transaction.transaction.message.accountKeys;
      const holder = accounts[0]?.pubkey.toString();
      const claimPda = accounts[3]?.pubkey.toString(); // Assuming claim PDA is at index 3
      const dividendPda = accounts[2]?.pubkey.toString();

      if (holder && claimPda && dividendPda && transaction.blockTime) {
        await database.query(`
          INSERT INTO "Claim" (pda, "dividendId", wallet, amount, "createdAt")
          VALUES ($1, (SELECT id FROM "Dividend" WHERE pda = $2), $3, $4, $5)
          ON CONFLICT (pda) DO NOTHING
        `, [
          claimPda,
          dividendPda,
          holder,
          50000, // Default claimed amount for demo
          new Date(transaction.blockTime * 1000)
        ]);

        console.log(`Dividend claimed: ${holder} -> ${claimPda}`);
      }
    } catch (error) {
      console.error('Error handling DividendClaimed event:', error);
    }
  }

  private async handleDividendClosed(transaction: ParsedTransactionWithMeta, signature: string): Promise<void> {
    try {
      const instruction = this.findProgramInstruction(transaction, this.marketProgramId);
      if (!instruction) return;

      const accounts = transaction.transaction.message.accountKeys;
      const dividendPda = accounts[2]?.pubkey.toString();

      if (dividendPda && transaction.blockTime) {
        await database.query(`
          UPDATE "Dividend" SET "isClosed" = TRUE, "closedAt" = $1 WHERE pda = $2
        `, [new Date(transaction.blockTime * 1000), dividendPda]);

        console.log(`Dividend closed: ${dividendPda}`);
      }
    } catch (error) {
      console.error('Error handling DividendClosed event:', error);
    }
  }

  private findProgramInstruction(transaction: ParsedTransactionWithMeta, programId: PublicKey): PartiallyDecodedInstruction | null {
    const instructions = transaction.transaction.message.instructions;
    
    for (const instruction of instructions) {
      if ('programId' in instruction && instruction.programId.equals(programId)) {
        return instruction as PartiallyDecodedInstruction;
      }
    }
    
    return null;
  }
}