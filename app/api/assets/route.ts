import { NextRequest, NextResponse } from 'next/server';
import { PublicKey } from '@solana/web3.js';

const INDEXER_URL = process.env.INDEXER_SERVICE_URL || 'http://localhost:3001';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const mint = searchParams.get('mint');
    const assetClass = searchParams.get('class');
    const query = searchParams.get('q');
    const sort = searchParams.get('sort');
    
    // Валидация формата mint адреса
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

    // Валидация класса активов
    if (assetClass) {
      const validClasses = ['real_estate', 'commodities', 'stocks', 'bonds', 'other'];
      if (!validClasses.includes(assetClass)) {
        return NextResponse.json(
          { error: 'Invalid asset class. Must be one of: ' + validClasses.join(', ') },
          { status: 400 }
        );
      }
    }

    // Валидация поискового запроса
    if (query && query.length > 100) {
      return NextResponse.json(
        { error: 'Search query too long (max 100 characters)' },
        { status: 400 }
      );
    }

    // Валидация параметра сортировки
    if (sort) {
      const validSorts = ['name', 'price', 'volume', 'created_at', '-name', '-price', '-volume', '-created_at'];
      if (!validSorts.includes(sort)) {
        return NextResponse.json(
          { error: 'Invalid sort parameter. Must be one of: ' + validSorts.join(', ') },
          { status: 400 }
        );
      }
    }
    
    const params = new URLSearchParams();
    if (mint) params.append('mint', mint);
    if (assetClass) params.append('class', assetClass);
    if (query) params.append('q', query);
    if (sort) params.append('sort', sort);

    const url = `${INDEXER_URL}/api/assets${params.toString() ? `?${params.toString()}` : ''}`;

    const response = await fetch(url);
    
    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: 'No assets found' },
          { status: 404 }
        );
      }
      throw new Error(`Indexer service error: ${response.status}`);
    }

    const data = await response.json();
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching assets:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: 'Failed to fetch assets', details: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const response = await fetch(`${INDEXER_URL}/assets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`Indexer service error: ${response.status}`);
    }

    const data = await response.json();
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error creating asset:', error);
    return NextResponse.json(
      { error: 'Failed to create asset' },
      { status: 500 }
    );
  }
}