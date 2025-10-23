import { NextRequest, NextResponse } from 'next/server';

// Define types for better type safety
type CurrencyCode = 'USD' | 'USDC' | 'SOL';
type RateData = {
  [key in CurrencyCode]?: number;
} & {
  lastUpdated: string;
};
type RatesData = {
  [key in CurrencyCode]: RateData;
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const base = searchParams.get('base');
    const target = searchParams.get('target');
    
    // Valid currency codes
    const validCurrencies: CurrencyCode[] = ['USD', 'USDC', 'SOL'];
    
    // Validate base currency if provided
    if (base && !validCurrencies.includes(base.toUpperCase() as CurrencyCode)) {
      return NextResponse.json(
        { error: `Invalid base currency. Must be one of: ${validCurrencies.join(', ')}` },
        { status: 400 }
      );
    }
    
    // Validate target currency if provided
    if (target && !validCurrencies.includes(target.toUpperCase() as CurrencyCode)) {
      return NextResponse.json(
        { error: `Invalid target currency. Must be one of: ${validCurrencies.join(', ')}` },
        { status: 400 }
      );
    }
    
    // Мок-данные курсов валют
    const rates: RatesData = {
      USD: {
        USDC: 1.0,
        SOL: 0.0045, // примерный курс SOL/USD
        lastUpdated: new Date().toISOString()
      },
      USDC: {
        USD: 1.0,
        SOL: 0.0045,
        lastUpdated: new Date().toISOString()
      },
      SOL: {
        USD: 222.22, // примерный курс USD/SOL
        USDC: 222.22,
        lastUpdated: new Date().toISOString()
      }
    };

    // If specific currencies are requested, return only those rates
    if (base && target) {
      const baseUpper = base.toUpperCase() as CurrencyCode;
      const targetUpper = target.toUpperCase() as CurrencyCode;
      
      if (rates[baseUpper] && rates[baseUpper][targetUpper] !== undefined) {
        return NextResponse.json({
          [baseUpper]: {
            [targetUpper]: rates[baseUpper][targetUpper],
            lastUpdated: rates[baseUpper].lastUpdated
          }
        });
      } else {
        return NextResponse.json(
          { error: `Exchange rate not available for ${baseUpper}/${targetUpper}` },
          { status: 404 }
        );
      }
    }
    
    // If only base is specified, return all rates for that currency
    if (base) {
      const baseUpper = base.toUpperCase() as CurrencyCode;
      if (rates[baseUpper]) {
        return NextResponse.json({ [baseUpper]: rates[baseUpper] });
      } else {
        return NextResponse.json(
          { error: `Rates not available for currency: ${baseUpper}` },
          { status: 404 }
        );
      }
    }

    // Return all rates
    return NextResponse.json(rates);
  } catch (error) {
    console.error('Error fetching rates:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: `Failed to fetch rates: ${error.message}` },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error while fetching rates' },
      { status: 500 }
    );
  }
}