import { Connection, PublicKey, ParsedTransactionWithMeta, PartiallyDecodedInstruction } from '@solana/web3.js';
import { Program, AnchorProvider, Wallet, BN } from '@coral-xyz/anchor';
import { EventProcessor } from './eventProcessor';
import { ProgramEvent } from '../types/events';

export class SolanaListener {
  private connection: Connection;
  private eventProcessor: EventProcessor;
  private marketProgramId: PublicKey;
  private isListening = false;

  constructor(
    rpcUrl: string,
    marketProgramId: string,
    eventProcessor: EventProcessor
  ) {
    this.connection = new Connection(rpcUrl, 'confirmed');
    this.marketProgramId = new PublicKey(marketProgramId);
    this.eventProcessor = eventProcessor;
  }

  async startListening(): Promise<void> {
    if (this.isListening) {
      console.log('Already listening for events');
      return;
    }

    this.isListening = true;
    console.log(`Starting to listen for events from program: ${this.marketProgramId.toString()}`);

    // Subscribe to program logs
    const subscriptionId = this.connection.onLogs(
      this.marketProgramId,
      async (logs, context) => {
        try {
          await this.handleLogs(logs, context);
        } catch (error) {
          console.error('Error handling logs:', error);
        }
      },
      'confirmed'
    );

    console.log(`Subscribed to program logs with ID: ${subscriptionId}`);

    // Keep the process running
    process.on('SIGINT', () => {
      console.log('Shutting down...');
      this.connection.removeOnLogsListener(subscriptionId);
      this.isListening = false;
      process.exit(0);
    });
  }

  private async handleLogs(logs: any, context: any): Promise<void> {
    const signature = logs.signature;
    
    try {
      // Get the transaction details
      const transaction = await this.connection.getParsedTransaction(signature, {
        commitment: 'confirmed',
        maxSupportedTransactionVersion: 0,
      });

      if (!transaction) {
        console.log(`Transaction not found: ${signature}`);
        return;
      }

      // Parse events from transaction logs
      const events = this.parseEventsFromLogs(logs.logs);
      
      for (const event of events) {
        await this.eventProcessor.processEvent(event, signature, context.slot);
      }
    } catch (error) {
      console.error(`Error processing transaction ${signature}:`, error);
    }
  }

  private parseEventsFromLogs(logs: string[]): ProgramEvent[] {
    const events: ProgramEvent[] = [];

    for (const log of logs) {
      try {
        // Look for program event logs
        if (log.includes('Program data:')) {
          const eventData = this.parseEventFromLog(log);
          if (eventData) {
            events.push(eventData);
          }
        }
      } catch (error) {
        console.error('Error parsing log:', log, error);
      }
    }

    return events;
  }

  private parseEventFromLog(log: string): ProgramEvent | null {
    try {
      // This is a simplified parser - in a real implementation,
      // you would need to properly decode the base64 event data
      // using the program's IDL and event definitions
      
      if (log.includes('SharesBought')) {
        // Parse SharesBought event
        // This is a mock implementation - you need to implement proper parsing
        return {
          name: 'SharesBought',
          data: {
            buyer: 'mock_buyer_pubkey',
            mint: 'mock_mint_pubkey',
            amount: '1000000',
            totalPaid: '1000000000',
          }
        };
      }
      
      if (log.includes('SharesSold')) {
        // Parse SharesSold event
        return {
          name: 'SharesSold',
          data: {
            seller: 'mock_seller_pubkey',
            mint: 'mock_mint_pubkey',
            amount: '1000000',
            totalReceived: '1000000000',
          }
        };
      }

      if (log.includes('DividendOpened')) {
        // Parse DividendOpened event
        return {
          name: 'DividendOpened',
          data: {
            dividend: 'mock_dividend_pubkey',
            asset: 'mock_asset_pubkey',
            totalAmount: '1000000000',
            supplyCircAtOpen: '10000000000',
          }
        };
      }

      if (log.includes('DividendClaimed')) {
        // Parse DividendClaimed event
        return {
          name: 'DividendClaimed',
          data: {
            dividend: 'mock_dividend_pubkey',
            holder: 'mock_holder_pubkey',
            amount: '100000000',
          }
        };
      }

      return null;
    } catch (error) {
      console.error('Error parsing event from log:', error);
      return null;
    }
  }

  async stop(): Promise<void> {
    this.isListening = false;
    console.log('Stopped listening for events');
  }
}