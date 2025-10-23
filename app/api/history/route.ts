import { NextRequest, NextResponse } from 'next/server';

const INDEXER_URL = process.env.INDEXER_SERVICE_URL || 'http://localhost:3001';

// Utility function to validate Solana public key format
function isValidPublicKey(key: string): boolean {
  return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(key);
}

// Valid history types
const VALID_TYPES = ['trades', 'dividends', 'claims', 'all'];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const wallet = searchParams.get('wallet');
    const type = searchParams.get('type'); // 'trades', 'dividends', 'claims', 'all'
    const limit = searchParams.get('limit') || '50';
    const offset = searchParams.get('offset') || '0';
    
    if (!wallet) {
      return NextResponse.json(
        { error: 'wallet parameter is required' },
        { status: 400 }
      );
    }

    // Validate wallet format
    if (!isValidPublicKey(wallet)) {
      return NextResponse.json(
        { error: 'Invalid wallet public key format' },
        { status: 400 }
      );
    }

    // Validate type parameter
    if (type && !VALID_TYPES.includes(type)) {
      return NextResponse.json(
        { error: `Invalid type. Must be one of: ${VALID_TYPES.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate limit parameter
    const limitNum = parseInt(limit);
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 1000) {
      return NextResponse.json(
        { error: 'limit must be a number between 1 and 1000' },
        { status: 400 }
      );
    }

    // Validate offset parameter
    const offsetNum = parseInt(offset);
    if (isNaN(offsetNum) || offsetNum < 0) {
      return NextResponse.json(
        { error: 'offset must be a non-negative number' },
        { status: 400 }
      );
    }

    const params = new URLSearchParams();
    params.append('wallet', wallet);
    params.append('limit', limit);
    params.append('offset', offset);
    if (type && type !== 'all') params.append('type', type);

    const response = await fetch(`${INDEXER_URL}/history?${params.toString()}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: 'No history found for this wallet' },
          { status: 404 }
        );
      }
      throw new Error(`Indexer service error: ${response.status}`);
    }

    const data = await response.json();
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching history:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: `Failed to fetch history: ${error.message}` },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error while fetching history' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { wallet, type, data } = body;

    if (!wallet || !type || !data) {
      return NextResponse.json(
        { error: 'Missing required parameters: wallet, type, data' },
        { status: 400 }
      );
    }

    // Validate wallet format
    if (!isValidPublicKey(wallet)) {
      return NextResponse.json(
        { error: 'Invalid wallet public key format' },
        { status: 400 }
      );
    }

    // Validate type parameter (excluding 'all' for POST)
    const validPostTypes = VALID_TYPES.filter(t => t !== 'all');
    if (!validPostTypes.includes(type)) {
      return NextResponse.json(
        { error: `Invalid type. Must be one of: ${validPostTypes.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate data is an object
    if (typeof data !== 'object' || data === null) {
      return NextResponse.json(
        { error: 'data must be a valid object' },
        { status: 400 }
      );
    }

    // Отправляем событие в индексатор для записи
    const response = await fetch(`${INDEXER_URL}/history`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ wallet, type, data }),
    });

    if (!response.ok) {
      throw new Error(`Indexer service error: ${response.status}`);
    }

    const result = await response.json();
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error adding history event:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: `Failed to add history event: ${error.message}` },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error while adding history event' },
      { status: 500 }
    );
  }
}