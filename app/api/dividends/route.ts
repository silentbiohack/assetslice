import { NextRequest, NextResponse } from 'next/server';
import { PublicKey } from '@solana/web3.js';

const INDEXER_URL = process.env.INDEXER_SERVICE_URL || 'http://localhost:3001';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const mint = searchParams.get('mint');
    const wallet = searchParams.get('wallet');
    const status = searchParams.get('status');
    
    // Валидация формата публичных ключей
    if (mint) {
      try {
        new PublicKey(mint);
      } catch (error) {
        return NextResponse.json(
          { error: 'Invalid mint address format' },
          { status: 400 }
        );
      }
    }

    if (wallet) {
      try {
        new PublicKey(wallet);
      } catch (error) {
        return NextResponse.json(
          { error: 'Invalid wallet address format' },
          { status: 400 }
        );
      }
    }

    // Валидация статуса дивидендов
    if (status) {
      const validStatuses = ['pending', 'active', 'claimed', 'expired'];
      if (!validStatuses.includes(status)) {
        return NextResponse.json(
          { error: 'Invalid status. Must be one of: ' + validStatuses.join(', ') },
          { status: 400 }
        );
      }
    }
    
    const params = new URLSearchParams();
    if (mint) params.append('mint', mint);
    if (wallet) params.append('wallet', wallet);
    if (status) params.append('status', status);

    const url = `${INDEXER_URL}/api/dividends${params.toString() ? `?${params.toString()}` : ''}`;

    const response = await fetch(url);
    
    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: 'No dividends found' },
          { status: 404 }
        );
      }
      throw new Error(`Indexer service error: ${response.status}`);
    }

    const data = await response.json();
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching dividends:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: 'Failed to fetch dividends', details: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}