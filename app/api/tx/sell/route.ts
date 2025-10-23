import { NextRequest, NextResponse } from 'next/server';
import { Connection, PublicKey, Transaction, SystemProgram, SYSVAR_RENT_PUBKEY } from '@solana/web3.js';
import { AnchorProvider, Program, Wallet, BN } from '@coral-xyz/anchor';
import { TOKEN_PROGRAM_ID, getAssociatedTokenAddress, createAssociatedTokenAccountInstruction } from '@solana/spl-token';

const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || 'https://api.devnet.solana.com';
const MARKET_PROGRAM_ID = new PublicKey('Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnT');
const REGISTRY_PROGRAM_ID = new PublicKey('3ER5UsBMKiP81Giq45LD6dL5adF8vH8v2juiBGT4NHSg');

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { mint, amount, userWallet, minPrice } = body;

    console.log('Sell request received:', { mint, amount, userWallet, minPrice });

    // Валидация обязательных параметров
    if (!mint || !amount || !userWallet) {
      return NextResponse.json(
        { error: 'Missing required parameters: mint, amount, userWallet' },
        { status: 400 }
      );
    }

    // Валидация типов данных
    if (typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be a positive number' },
        { status: 400 }
      );
    }

    if (minPrice !== undefined && (typeof minPrice !== 'number' || minPrice <= 0)) {
      return NextResponse.json(
        { error: 'Min price must be a positive number' },
        { status: 400 }
      );
    }

    // Валидация формата публичных ключей
    try {
      new PublicKey(mint);
      new PublicKey(userWallet);
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid public key format for mint or userWallet' },
        { status: 400 }
      );
    }

    // Валидация разумных лимитов
    if (amount > 1000000) {
      return NextResponse.json(
        { error: 'Amount exceeds maximum limit (1,000,000)' },
        { status: 400 }
      );
    }

    // Создаем подключение к Solana
    const connection = new Connection(RPC_URL);
    
    // Создаем фиктивный кошелек для провайдера (не используется для подписи)
    const dummyWallet = {
      publicKey: new PublicKey(userWallet),
      signTransaction: async (tx: Transaction) => tx,
      signAllTransactions: async (txs: Transaction[]) => txs,
    } as Wallet;

    const provider = new AnchorProvider(connection, dummyWallet, {});
    
    // Создаем инструкцию для продажи акций
    const mintPubkey = new PublicKey(mint);
    const sellerPubkey = new PublicKey(userWallet);
    
    // Находим PDA для актива
    const [assetPda] = PublicKey.findProgramAddressSync(
      [Buffer.from('asset'), mintPubkey.toBuffer()],
      REGISTRY_PROGRAM_ID
    );
    
    // Находим PDA для mint authority
    const [mintAuthPda] = PublicKey.findProgramAddressSync(
      [Buffer.from('mint_auth'), mintPubkey.toBuffer()],
      MARKET_PROGRAM_ID
    );
    
    // Находим PDA для USDC vault
    const [vaultUsdcPda] = PublicKey.findProgramAddressSync(
      [Buffer.from('vault_usdc'), mintPubkey.toBuffer()],
      MARKET_PROGRAM_ID
    );
    
    // Находим PDA для vault authority
    const [vaultUsdcAuthPda] = PublicKey.findProgramAddressSync(
      [Buffer.from('vault_usdc'), mintPubkey.toBuffer()],
      MARKET_PROGRAM_ID
    );
    
    // Получаем associated token accounts
    const sellerUsdcAccount = await getAssociatedTokenAddress(
      new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'), // USDC mint на devnet
      sellerPubkey
    );
    
    const sellerSharesAccount = await getAssociatedTokenAddress(
      mintPubkey,
      sellerPubkey
    );

    // Создаем транзакцию
    const transaction = new Transaction();
    
    // Добавляем инструкцию для создания USDC ATA если нужно
    try {
      await connection.getAccountInfo(sellerUsdcAccount);
    } catch {
      transaction.add(
        createAssociatedTokenAccountInstruction(
          sellerPubkey,
          sellerUsdcAccount,
          sellerPubkey,
          new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v')
        )
      );
    }

    // Создаем инструкцию sell_shares
    const instruction = {
      keys: [
        { pubkey: sellerPubkey, isSigner: true, isWritable: false },
        { pubkey: assetPda, isSigner: false, isWritable: true },
        { pubkey: mintPubkey, isSigner: false, isWritable: true },
        { pubkey: sellerUsdcAccount, isSigner: false, isWritable: true },
        { pubkey: sellerSharesAccount, isSigner: false, isWritable: true },
        { pubkey: vaultUsdcPda, isSigner: false, isWritable: true },
        { pubkey: mintAuthPda, isSigner: false, isWritable: false },
        { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
        { pubkey: REGISTRY_PROGRAM_ID, isSigner: false, isWritable: false },
      ],
      programId: MARKET_PROGRAM_ID,
      data: Buffer.concat([
        Buffer.from([51, 230, 133, 164, 1, 127, 131, 173]), // sell_shares discriminator
        new BN(amount).toArrayLike(Buffer, 'le', 8)
      ])
    };

    transaction.add(instruction);

    // Получаем последний blockhash
    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = sellerPubkey;

    const serializedTransaction = transaction.serialize({
      requireAllSignatures: false,
      verifySignatures: false
    });

    const response = {
      transaction: serializedTransaction.toString('base64'),
      message: 'Sell shares transaction prepared successfully',
      instructions: [
        {
          programId: MARKET_PROGRAM_ID.toString(),
          instruction: 'sell_shares',
          accounts: {
            seller: userWallet,
            asset: assetPda.toString(),
            mint: mint,
            amount: amount,
            minPrice: minPrice || null
          }
        }
      ]
    };

    console.log('Sell transaction prepared successfully');
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error creating sell transaction:', error);
    
    // Более детальная обработка ошибок
    if (error instanceof Error) {
      if (error.message.includes('Invalid public key')) {
        return NextResponse.json(
          { error: 'Invalid wallet or mint address' },
          { status: 400 }
        );
      }
      
      if (error.message.includes('Insufficient funds') || error.message.includes('Insufficient balance')) {
        return NextResponse.json(
          { error: 'Insufficient shares to sell' },
          { status: 400 }
        );
      }
      
      if (error.message.includes('Account not found')) {
        return NextResponse.json(
          { error: 'Asset or account not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json(
        { error: 'Failed to create sell transaction', details: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}