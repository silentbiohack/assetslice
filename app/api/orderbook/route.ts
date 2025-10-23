import { NextRequest, NextResponse } from 'next/server';

const INDEXER_URL = process.env.INDEXER_SERVICE_URL || 'http://localhost:3001';

// Utility function to validate Solana public key format
function isValidPublicKey(key: string): boolean {
  return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(key);
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const assetId = searchParams.get('assetId');
    
    if (!assetId) {
      return NextResponse.json(
        { error: 'assetId parameter is required' },
        { status: 400 }
      );
    }

    // Validate assetId format
    if (!isValidPublicKey(assetId)) {
      return NextResponse.json(
        { error: 'Invalid asset ID format' },
        { status: 400 }
      );
    }

    const response = await fetch(`${INDEXER_URL}/orderbook?assetId=${assetId}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: 'Orderbook not found for this asset' },
          { status: 404 }
        );
      }
      throw new Error(`Indexer service error: ${response.status}`);
    }

    const data = await response.json();
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching orderbook:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: `Failed to fetch orderbook: ${error.message}` },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error while fetching orderbook' },
      { status: 500 }
    );
  }
}