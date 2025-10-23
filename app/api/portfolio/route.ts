import { NextRequest, NextResponse } from 'next/server';
import { PublicKey } from '@solana/web3.js';

const INDEXER_URL = process.env.INDEXER_SERVICE_URL || 'http://localhost:3001';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const wallet = searchParams.get('wallet');
    
    // Валидация обязательных параметров
    if (!wallet) {
      return NextResponse.json(
        { error: 'wallet parameter is required' },
        { status: 400 }
      );
    }

    // Валидация формата кошелька
    try {
      new PublicKey(wallet);
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid wallet address format' },
        { status: 400 }
      );
    }

    const response = await fetch(`${INDEXER_URL}/api/portfolio?wallet=${wallet}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: 'Portfolio not found for this wallet' },
          { status: 404 }
        );
      }
      throw new Error(`Indexer service error: ${response.status}`);
    }

    const data = await response.json();
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching portfolio:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: 'Failed to fetch portfolio', details: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}