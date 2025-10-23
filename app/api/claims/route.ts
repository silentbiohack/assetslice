import { NextRequest, NextResponse } from 'next/server';

const INDEXER_URL = process.env.INDEXER_SERVICE_URL || 'http://localhost:3001';

// Utility function to validate Solana public key format
function isValidPublicKey(key: string): boolean {
  return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(key);
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const wallet = searchParams.get('wallet');
    const dividendId = searchParams.get('dividendId');
    
    // Validate wallet parameter if provided
    if (wallet && !isValidPublicKey(wallet)) {
      return NextResponse.json(
        { error: 'Invalid wallet public key format' },
        { status: 400 }
      );
    }

    // Validate dividendId parameter if provided
    if (dividendId && !isValidPublicKey(dividendId)) {
      return NextResponse.json(
        { error: 'Invalid dividend ID format' },
        { status: 400 }
      );
    }
    
    const params = new URLSearchParams();
    if (wallet) params.append('wallet', wallet);
    if (dividendId) params.append('dividendId', dividendId);

    const url = `${INDEXER_URL}/api/claims${params.toString() ? `?${params.toString()}` : ''}`;

    const response = await fetch(url);
    
    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: 'No claims found' },
          { status: 404 }
        );
      }
      throw new Error(`Indexer service error: ${response.status}`);
    }

    const data = await response.json();
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching claims:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: `Failed to fetch claims: ${error.message}` },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error while fetching claims' },
      { status: 500 }
    );
  }
}