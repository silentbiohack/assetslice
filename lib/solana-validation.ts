'use client'

import { PublicKey } from '@solana/web3.js';

/**
 * Advanced Solana public key validation using web3.js
 * @param key - The public key string to validate
 * @returns object with validation result and error message
 */
export function validateSolanaPublicKeyAdvanced(key: string): { isValid: boolean; error?: string } {
  if (!key || typeof key !== 'string') {
    return { isValid: false, error: 'Public key is required' };
  }

  try {
    // Use Solana web3.js to validate the public key
    const publicKey = new PublicKey(key);
    
    // Additional checks
    if (publicKey.toString() !== key) {
      return { isValid: false, error: 'Public key format is invalid' };
    }

    // Check if it's on the curve (valid Solana public key)
    if (!PublicKey.isOnCurve(publicKey.toBytes())) {
      return { isValid: false, error: 'Public key is not on the ed25519 curve' };
    }

    return { isValid: true };
  } catch (error) {
    return { isValid: false, error: 'Invalid public key format' };
  }
}

/**
 * Validates if a public key is a valid Program Derived Address (PDA)
 * @param key - The public key string to validate
 * @returns boolean indicating if the key is a valid PDA
 */
export function isValidPDA(key: string): boolean {
  try {
    const publicKey = new PublicKey(key);
    return !PublicKey.isOnCurve(publicKey.toBytes());
  } catch {
    return false;
  }
}

/**
 * Validates Solana address and determines its type
 * @param address - The address string to validate
 * @returns object with validation result and address type
 */
export function validateSolanaAddress(address: string): {
  isValid: boolean;
  type?: 'wallet' | 'pda' | 'program';
  error?: string;
} {
  const validation = validateSolanaPublicKeyAdvanced(address);
  
  if (!validation.isValid) {
    return validation;
  }

  try {
    const publicKey = new PublicKey(address);
    
    // Check if it's a PDA
    if (!PublicKey.isOnCurve(publicKey.toBytes())) {
      return { isValid: true, type: 'pda' };
    }

    // For now, we can't easily distinguish between wallet and program addresses
    // without additional context or on-chain data
    return { isValid: true, type: 'wallet' };
  } catch {
    return { isValid: false, error: 'Invalid address format' };
  }
}

/**
 * Validates multiple Solana addresses with detailed results
 * @param addresses - Array of address strings to validate
 * @returns object with validation results for each address
 */
export function validateMultipleSolanaAddresses(addresses: string[]): {
  isValid: boolean;
  results: Array<{
    address: string;
    index: number;
    isValid: boolean;
    type?: 'wallet' | 'pda' | 'program';
    error?: string;
  }>;
} {
  const results = addresses.map((address, index) => {
    const validation = validateSolanaAddress(address);
    return {
      address,
      index,
      ...validation
    };
  });

  return {
    isValid: results.every(result => result.isValid),
    results
  };
}

/**
 * Generates a Program Derived Address (PDA) and validates it
 * @param seeds - Array of seeds for PDA generation
 * @param programId - The program ID string
 * @returns object with PDA and validation result
 */
export function generateAndValidatePDA(
  seeds: (Buffer | Uint8Array | string)[],
  programId: string
): {
  isValid: boolean;
  pda?: string;
  bump?: number;
  error?: string;
} {
  try {
    const programPublicKey = new PublicKey(programId);
    
    // Convert string seeds to Buffer
    const processedSeeds = seeds.map(seed => {
      if (typeof seed === 'string') {
        return Buffer.from(seed, 'utf8');
      }
      return seed;
    });

    const [pda, bump] = PublicKey.findProgramAddressSync(
      processedSeeds,
      programPublicKey
    );

    return {
      isValid: true,
      pda: pda.toString(),
      bump
    };
  } catch (error) {
    return {
      isValid: false,
      error: error instanceof Error ? error.message : 'Failed to generate PDA'
    };
  }
}

/**
 * Validates if an address matches expected PDA for given seeds and program
 * @param address - The address to validate
 * @param seeds - Array of seeds used for PDA generation
 * @param programId - The program ID string
 * @returns boolean indicating if the address is the correct PDA
 */
export function validatePDAMatch(
  address: string,
  seeds: (Buffer | Uint8Array | string)[],
  programId: string
): boolean {
  const pdaResult = generateAndValidatePDA(seeds, programId);
  return pdaResult.isValid && pdaResult.pda === address;
}

/**
 * Batch validation utility for common Solana validation scenarios
 * @param data - Object containing various Solana addresses to validate
 * @returns object with validation results for each field
 */
export function batchValidateSolanaData(data: {
  wallet?: string;
  mint?: string;
  programId?: string;
  signatures?: string[];
}): {
  isValid: boolean;
  errors: Record<string, string>;
} {
  const errors: Record<string, string> = {};

  // Validate wallet address
  if (data.wallet) {
    const walletValidation = validateSolanaPublicKeyAdvanced(data.wallet);
    if (!walletValidation.isValid) {
      errors.wallet = walletValidation.error || 'Invalid wallet address';
    }
  }

  // Validate mint address
  if (data.mint) {
    const mintValidation = validateSolanaPublicKeyAdvanced(data.mint);
    if (!mintValidation.isValid) {
      errors.mint = mintValidation.error || 'Invalid mint address';
    }
  }

  // Validate program ID
  if (data.programId) {
    const programValidation = validateSolanaPublicKeyAdvanced(data.programId);
    if (!programValidation.isValid) {
      errors.programId = programValidation.error || 'Invalid program ID';
    }
  }

  // Validate transaction signatures
  if (data.signatures && data.signatures.length > 0) {
    data.signatures.forEach((signature, index) => {
      if (!/^[1-9A-HJ-NP-Za-km-z]{87,88}$/.test(signature)) {
        errors[`signature_${index}`] = `Invalid signature format at index ${index}`;
      }
    });
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}