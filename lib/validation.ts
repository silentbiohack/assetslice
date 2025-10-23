'use client'

// Utility functions for validation

/**
 * Validates Solana public key format using regex
 * @param key - The public key string to validate
 * @returns boolean indicating if the key is valid
 */
export function isValidPublicKey(key: string): boolean {
  if (!key || typeof key !== 'string') return false;
  return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(key);
}

/**
 * Enhanced Solana public key validation with additional checks
 * @param key - The public key string to validate
 * @returns object with validation result and error message
 */
export function validateSolanaPublicKey(key: string): { isValid: boolean; error?: string } {
  if (!key || typeof key !== 'string') {
    return { isValid: false, error: 'Public key is required' };
  }

  // Check length
  if (key.length < 32 || key.length > 44) {
    return { isValid: false, error: 'Public key must be between 32 and 44 characters' };
  }

  // Check base58 format
  if (!/^[1-9A-HJ-NP-Za-km-z]+$/.test(key)) {
    return { isValid: false, error: 'Public key contains invalid characters' };
  }

  // Additional check for common invalid keys
  const invalidKeys = [
    '11111111111111111111111111111111', // System Program
    '1111111111111111111111111111111111111111111111', // Invalid padding
  ];

  if (invalidKeys.includes(key)) {
    return { isValid: false, error: 'Invalid public key format' };
  }

  return { isValid: true };
}

/**
 * Validates Solana transaction signature format
 * @param signature - The transaction signature to validate
 * @returns boolean indicating if the signature is valid
 */
export function isValidTransactionSignature(signature: string): boolean {
  if (!signature || typeof signature !== 'string') return false;
  // Solana transaction signatures are 88 characters long in base58
  return /^[1-9A-HJ-NP-Za-km-z]{87,88}$/.test(signature);
}

/**
 * Validates multiple Solana public keys
 * @param keys - Array of public key strings to validate
 * @returns object with validation results
 */
export function validateMultiplePublicKeys(keys: string[]): { 
  isValid: boolean; 
  errors: { index: number; key: string; error: string }[] 
} {
  const errors: { index: number; key: string; error: string }[] = [];

  keys.forEach((key, index) => {
    const validation = validateSolanaPublicKey(key);
    if (!validation.isValid) {
      errors.push({
        index,
        key,
        error: validation.error || 'Invalid public key'
      });
    }
  });

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validates Solana mint address (same as public key but with context)
 * @param mint - The mint address to validate
 * @returns boolean indicating if the mint is valid
 */
export function isValidMintAddress(mint: string): boolean {
  return isValidPublicKey(mint);
}

/**
 * Validates Solana wallet address (same as public key but with context)
 * @param wallet - The wallet address to validate
 * @returns boolean indicating if the wallet is valid
 */
export function isValidWalletAddress(wallet: string): boolean {
  return isValidPublicKey(wallet);
}

/**
 * Validates email format
 * @param email - The email string to validate
 * @returns boolean indicating if the email is valid
 */
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validates amount format (positive number with up to 6 decimal places)
 * @param amount - The amount string to validate
 * @returns boolean indicating if the amount is valid
 */
export function isValidAmount(amount: string): boolean {
  if (!amount || typeof amount !== 'string') return false;
  const num = parseFloat(amount);
  return !isNaN(num) && num > 0 && /^\d+(\.\d{1,6})?$/.test(amount);
}

/**
 * Validates price format (positive number with up to 8 decimal places)
 * @param price - The price string to validate
 * @returns boolean indicating if the price is valid
 */
export function isValidPrice(price: string): boolean {
  if (!price || typeof price !== 'string') return false;
  const num = parseFloat(price);
  return !isNaN(num) && num > 0 && /^\d+(\.\d{1,8})?$/.test(price);
}

/**
 * Validates search query (non-empty string with reasonable length)
 * @param query - The search query to validate
 * @returns boolean indicating if the query is valid
 */
export function isValidSearchQuery(query: string): boolean {
  if (!query || typeof query !== 'string') return false;
  return query.trim().length > 0 && query.trim().length <= 100;
}

/**
 * Validates limit parameter (positive integer within range)
 * @param limit - The limit value to validate
 * @param min - Minimum allowed value (default: 1)
 * @param max - Maximum allowed value (default: 1000)
 * @returns boolean indicating if the limit is valid
 */
export function isValidLimit(limit: string | number, min: number = 1, max: number = 1000): boolean {
  const num = typeof limit === 'string' ? parseInt(limit) : limit;
  return !isNaN(num) && Number.isInteger(num) && num >= min && num <= max;
}

/**
 * Validates offset parameter (non-negative integer)
 * @param offset - The offset value to validate
 * @returns boolean indicating if the offset is valid
 */
export function isValidOffset(offset: string | number): boolean {
  const num = typeof offset === 'string' ? parseInt(offset) : offset;
  return !isNaN(num) && Number.isInteger(num) && num >= 0;
}

/**
 * Validates currency code
 * @param currency - The currency code to validate
 * @param validCurrencies - Array of valid currency codes
 * @returns boolean indicating if the currency is valid
 */
export function isValidCurrency(currency: string, validCurrencies: string[] = ['USD', 'USDC', 'SOL']): boolean {
  if (!currency || typeof currency !== 'string') return false;
  return validCurrencies.includes(currency.toUpperCase());
}

/**
 * Validates asset class
 * @param assetClass - The asset class to validate
 * @returns boolean indicating if the asset class is valid
 */
export function isValidAssetClass(assetClass: string): boolean {
  const validClasses = ['real_estate', 'equipment', 'art', 'commodities', 'securities'];
  return validClasses.includes(assetClass);
}

/**
 * Validates sort parameter
 * @param sort - The sort parameter to validate
 * @param validSorts - Array of valid sort options
 * @returns boolean indicating if the sort is valid
 */
export function isValidSort(sort: string, validSorts: string[] = ['price_asc', 'price_desc', 'name_asc', 'name_desc', 'created_asc', 'created_desc']): boolean {
  if (!sort || typeof sort !== 'string') return false;
  return validSorts.includes(sort);
}

/**
 * Validates transaction type
 * @param type - The transaction type to validate
 * @returns boolean indicating if the type is valid
 */
export function isValidTransactionType(type: string): boolean {
  const validTypes = ['buy', 'sell', 'dividend', 'airdrop'];
  return validTypes.includes(type);
}

/**
 * Validates dividend status
 * @param status - The dividend status to validate
 * @returns boolean indicating if the status is valid
 */
export function isValidDividendStatus(status: string): boolean {
  const validStatuses = ['pending', 'active', 'claimed', 'expired'];
  return validStatuses.includes(status);
}

/**
 * Validates history type
 * @param type - The history type to validate
 * @returns boolean indicating if the type is valid
 */
export function isValidHistoryType(type: string): boolean {
  const validTypes = ['trades', 'dividends', 'claims', 'all'];
  return validTypes.includes(type);
}

/**
 * Sanitizes string input by trimming and removing potentially harmful characters
 * @param input - The input string to sanitize
 * @returns sanitized string
 */
export function sanitizeString(input: string): string {
  if (!input || typeof input !== 'string') return '';
  return input.trim().replace(/[<>]/g, '');
}

/**
 * Validates and formats amount for display
 * @param amount - The amount to format
 * @param decimals - Number of decimal places (default: 6)
 * @returns formatted amount string or null if invalid
 */
export function formatAmount(amount: string | number, decimals: number = 6): string | null {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num) || num < 0) return null;
  return num.toFixed(decimals);
}

/**
 * Validates form data object
 * @param data - The form data to validate
 * @param requiredFields - Array of required field names
 * @returns validation result with errors
 */
export function validateFormData(data: Record<string, any>, requiredFields: string[]): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  for (const field of requiredFields) {
    if (!data[field] || (typeof data[field] === 'string' && data[field].trim() === '')) {
      errors.push(`${field} is required`);
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}