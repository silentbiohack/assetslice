#![allow(unexpected_cfgs)]

use anchor_lang::prelude::*;
use anchor_spl::token::{self, Burn, Mint, MintTo, Token, TokenAccount, Transfer};
use rwa_registry::Asset;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnT");

#[program]
pub mod rwa_market {
    use super::*;

    pub fn buy_shares(ctx: Context<BuyShares>, amount: u64) -> Result<()> {
        let asset = &mut ctx.accounts.asset;

        require!(asset.free_float >= amount, RwaError::InsufficientFloat);

        // 1) списать USDC с покупателя в сейф
        let total = amount.checked_mul(asset.price_usdc).unwrap();
        let cpi_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.buyer_usdc.to_account_info(),
                to: ctx.accounts.vault_usdc.to_account_info(),
                authority: ctx.accounts.buyer.to_account_info(),
            },
        );
        token::transfer(cpi_ctx, total)?;

        // 2) заминтить доли покупателю от имени PDA
        let asset_mint_key = ctx.accounts.asset_mint.key();
        let seeds: &[&[u8]] = &[
            b"mint_auth",
            asset_mint_key.as_ref(),
            &[asset.bump_mint_auth],
        ];
        let signer = &[&seeds[..]];
        let cpi_ctx2 = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            MintTo {
                mint: ctx.accounts.asset_mint.to_account_info(),
                to: ctx.accounts.buyer_shares.to_account_info(),
                authority: ctx.accounts.mint_auth.to_account_info(),
            },
            signer,
        );
        token::mint_to(cpi_ctx2, amount)?;

        asset.free_float = asset.free_float.checked_sub(amount).unwrap();

        emit!(SharesBought {
            buyer: ctx.accounts.buyer.key(),
            mint: ctx.accounts.asset_mint.key(),
            amount,
            total_paid: total,
        });
        Ok(())
    }

    pub fn sell_shares(ctx: Context<SellShares>, amount: u64) -> Result<()> {
        let asset = &mut ctx.accounts.asset;
        let total = amount.checked_mul(asset.price_usdc).unwrap();

        // 1) сжечь доли
        let cpi1 = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Burn {
                mint: ctx.accounts.asset_mint.to_account_info(),
                from: ctx.accounts.seller_shares.to_account_info(),
                authority: ctx.accounts.seller.to_account_info(),
            },
        );
        token::burn(cpi1, amount)?;

        // 2) перевести USDC из сейфа продавцу (подписывает PDA сейфа)
        let asset_mint_key = ctx.accounts.asset_mint.key();
        let seeds: &[&[u8]] = &[
            b"vault_usdc",
            asset_mint_key.as_ref(),
            &[asset.bump_vault_usdc],
        ];
        let signer = &[&seeds[..]];
        let cpi2 = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.vault_usdc.to_account_info(),
                to: ctx.accounts.seller_usdc.to_account_info(),
                authority: ctx.accounts.vault_usdc_auth.to_account_info(),
            },
            signer,
        );
        token::transfer(cpi2, total)?;

        asset.free_float = asset.free_float.checked_add(amount).unwrap();

        emit!(SharesSold {
            seller: ctx.accounts.seller.key(),
            mint: ctx.accounts.asset_mint.key(),
            amount,
            total_received: total,
        });
        Ok(())
    }

    pub fn open_dividend(
        ctx: Context<OpenDividend>,
        total_amount: u64,
        supply_circ_at_open: u64,
    ) -> Result<()> {
        let dividend = &mut ctx.accounts.dividend;
        let asset = &ctx.accounts.asset;
        let issuer = &ctx.accounts.issuer;

        // Get dividend key before mutable borrow
        let dividend_key = dividend.key();

        // Initialize dividend account
        dividend.asset_mint = asset.asset_mint;
        dividend.index = dividend_key.to_bytes()[0] as u64; // Simple index generation
        dividend.total_amount = total_amount;
        dividend.supply_circ_at_open = supply_circ_at_open;
        dividend.created_at = Clock::get()?.unix_timestamp;
        dividend.is_closed = false;

        // Transfer USDC from issuer to dividend vault
        let cpi_accounts = Transfer {
            from: ctx.accounts.issuer_usdc_ata.to_account_info(),
            to: ctx.accounts.vault_usdc.to_account_info(),
            authority: issuer.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        token::transfer(cpi_ctx, total_amount)?;

        emit!(DividendOpened {
            dividend: dividend.key(),
            asset: asset.key(),
            total_amount,
            supply_circ_at_open,
        });

        Ok(())
    }

    pub fn claim_dividend(ctx: Context<ClaimDividend>) -> Result<()> {
        let dividend = &ctx.accounts.dividend;
        let claim = &mut ctx.accounts.claim;
        let holder = &ctx.accounts.holder;
        let asset = &ctx.accounts.asset;

        require!(!dividend.is_closed, RwaError::DividendClosed);

        // Calculate holder's share based on their balance
        let holder_balance = ctx.accounts.holder_shares_ata.amount;
        let claim_amount = (holder_balance as u128)
            .checked_mul(dividend.total_amount as u128)
            .ok_or(RwaError::MathOverflow)?
            .checked_div(dividend.supply_circ_at_open as u128)
            .ok_or(RwaError::MathOverflow)? as u64;

        // Initialize claim record
        claim.div = dividend.key();
        claim.holder = holder.key();
        claim.claimed_amount = claim_amount;

        // Transfer USDC from vault to holder
        let vault_seeds = &[
            b"vault_usdc",
            asset.asset_mint.as_ref(),
            &[asset.bump_vault_usdc],
        ];
        let signer = &[&vault_seeds[..]];

        let cpi_accounts = Transfer {
            from: ctx.accounts.vault_usdc.to_account_info(),
            to: ctx.accounts.holder_usdc_ata.to_account_info(),
            authority: ctx.accounts.vault_usdc.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer);
        token::transfer(cpi_ctx, claim_amount)?;

        emit!(DividendClaimed {
            dividend: dividend.key(),
            holder: holder.key(),
            amount: claim_amount,
        });

        Ok(())
    }

    pub fn close_dividend(ctx: Context<CloseDividend>) -> Result<()> {
        let dividend = &mut ctx.accounts.dividend;
        let asset = &ctx.accounts.asset;
        let _issuer = &ctx.accounts.issuer; // Prefix with underscore to suppress warning

        dividend.is_closed = true;

        // Return remaining USDC to issuer
        let remaining_balance = ctx.accounts.vault_usdc.amount;
        if remaining_balance > 0 {
            let vault_seeds = &[
                b"vault_usdc",
                asset.asset_mint.as_ref(),
                &[asset.bump_vault_usdc],
            ];
            let signer = &[&vault_seeds[..]];

            let cpi_accounts = Transfer {
                from: ctx.accounts.vault_usdc.to_account_info(),
                to: ctx.accounts.issuer_usdc_ata.to_account_info(),
                authority: ctx.accounts.vault_usdc.to_account_info(),
            };
            let cpi_program = ctx.accounts.token_program.to_account_info();
            let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer);
            token::transfer(cpi_ctx, remaining_balance)?;
        }

        emit!(DividendClosed {
            dividend: dividend.key(),
            remaining_amount: remaining_balance,
        });

        Ok(())
    }
}

#[derive(Accounts)]
pub struct BuyShares<'info> {
    #[account(mut, has_one = asset_mint, has_one = usdc_mint)]
    pub asset: Account<'info, Asset>,
    pub asset_mint: Account<'info, Mint>,
    pub usdc_mint: Account<'info, Mint>,

    #[account(mut)]
    pub buyer: Signer<'info>,
    #[account(mut, associated_token::mint = usdc_mint, associated_token::authority = buyer)]
    pub buyer_usdc: Account<'info, TokenAccount>,
    #[account(mut, associated_token::mint = asset_mint, associated_token::authority = buyer)]
    pub buyer_shares: Account<'info, TokenAccount>,

    /// PDA, владеющий правом mint
    /// CHECK: signer by seeds
    #[account(seeds = [b"mint_auth", asset_mint.key().as_ref()], bump = asset.bump_mint_auth)]
    pub mint_auth: UncheckedAccount<'info>,

    #[account(mut, token::mint = usdc_mint)]
    pub vault_usdc: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub associated_token_program: Program<'info, anchor_spl::associated_token::AssociatedToken>,
}

#[derive(Accounts)]
pub struct SellShares<'info> {
    #[account(mut, has_one = asset_mint, has_one = usdc_mint)]
    pub asset: Account<'info, Asset>,
    pub asset_mint: Account<'info, Mint>,
    pub usdc_mint: Account<'info, Mint>,

    #[account(mut)]
    pub seller: Signer<'info>,
    #[account(mut, associated_token::mint = usdc_mint, associated_token::authority = seller)]
    pub seller_usdc: Account<'info, TokenAccount>,
    #[account(mut, associated_token::mint = asset_mint, associated_token::authority = seller)]
    pub seller_shares: Account<'info, TokenAccount>,

    /// PDA, владеющий vault_usdc
    /// CHECK: signer by seeds
    #[account(seeds = [b"vault_usdc", asset_mint.key().as_ref()], bump = asset.bump_vault_usdc)]
    pub vault_usdc_auth: UncheckedAccount<'info>,

    #[account(mut, token::mint = usdc_mint)]
    pub vault_usdc: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub associated_token_program: Program<'info, anchor_spl::associated_token::AssociatedToken>,
}

#[derive(Accounts)]
#[instruction(total_amount: u64, supply_circ_at_open: u64)]
pub struct OpenDividend<'info> {
    #[account(mut)]
    pub issuer: Signer<'info>,

    #[account(
        seeds = [b"asset", issuer.key().as_ref(), asset.asset_mint.as_ref()],
        bump = asset.bump_asset,
        has_one = issuer,
    )]
    pub asset: Account<'info, Asset>,

    #[account(
        init,
        payer = issuer,
        space = 8 + Dividend::INIT_SPACE,
        seeds = [b"div", asset.asset_mint.as_ref(), &Clock::get().unwrap().unix_timestamp.to_le_bytes()],
        bump
    )]
    pub dividend: Account<'info, Dividend>,

    #[account(
        mut,
        token::mint = asset.usdc_mint,
        token::authority = issuer,
    )]
    pub issuer_usdc_ata: Account<'info, TokenAccount>,

    #[account(
        mut,
        seeds = [b"vault_usdc", asset.asset_mint.as_ref()],
        bump = asset.bump_vault_usdc,
    )]
    pub vault_usdc: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct ClaimDividend<'info> {
    #[account(mut)]
    pub holder: Signer<'info>,

    #[account(
        seeds = [b"asset", asset.issuer.as_ref(), asset.asset_mint.as_ref()],
        bump = asset.bump_asset,
    )]
    pub asset: Account<'info, Asset>,

    #[account(
        seeds = [b"div", asset.asset_mint.as_ref(), &dividend.created_at.to_le_bytes()],
        bump,
    )]
    pub dividend: Account<'info, Dividend>,

    #[account(
        init,
        payer = holder,
        space = 8 + Claim::INIT_SPACE,
        seeds = [b"claim", dividend.key().as_ref(), holder.key().as_ref()],
        bump
    )]
    pub claim: Account<'info, Claim>,

    #[account(
        token::mint = asset.asset_mint,
        token::authority = holder,
    )]
    pub holder_shares_ata: Account<'info, TokenAccount>,

    #[account(
        mut,
        token::mint = asset.usdc_mint,
        token::authority = holder,
    )]
    pub holder_usdc_ata: Account<'info, TokenAccount>,

    #[account(
        mut,
        seeds = [b"vault_usdc", asset.asset_mint.as_ref()],
        bump = asset.bump_vault_usdc,
    )]
    pub vault_usdc: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct CloseDividend<'info> {
    #[account(mut)]
    pub issuer: Signer<'info>,

    #[account(
        seeds = [b"asset", issuer.key().as_ref(), asset.asset_mint.as_ref()],
        bump = asset.bump_asset,
        has_one = issuer,
    )]
    pub asset: Account<'info, Asset>,

    #[account(
        mut,
        seeds = [b"div", asset.asset_mint.as_ref(), &dividend.created_at.to_le_bytes()],
        bump,
    )]
    pub dividend: Account<'info, Dividend>,

    #[account(
        mut,
        token::mint = asset.usdc_mint,
        token::authority = issuer,
    )]
    pub issuer_usdc_ata: Account<'info, TokenAccount>,

    #[account(
        mut,
        seeds = [b"vault_usdc", asset.asset_mint.as_ref()],
        bump = asset.bump_vault_usdc,
    )]
    pub vault_usdc: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
}

#[account]
#[derive(InitSpace)]
pub struct Dividend {
    pub asset_mint: Pubkey,           // 32 bytes
    pub index: u64,                   // 8 bytes
    pub total_amount: u64,            // 8 bytes
    pub supply_circ_at_open: u64,     // 8 bytes
    pub created_at: i64,              // 8 bytes
    pub is_closed: bool,              // 1 byte
}

#[account]
#[derive(InitSpace)]
pub struct Claim {
    pub div: Pubkey,                  // 32 bytes
    pub holder: Pubkey,               // 32 bytes
    pub claimed_amount: u64,          // 8 bytes
}

#[event]
pub struct SharesBought {
    pub buyer: Pubkey,
    pub mint: Pubkey,
    pub amount: u64,
    pub total_paid: u64,
}

#[event]
pub struct SharesSold {
    pub seller: Pubkey,
    pub mint: Pubkey,
    pub amount: u64,
    pub total_received: u64,
}

#[event]
pub struct DividendOpened {
    pub dividend: Pubkey,
    pub asset: Pubkey,
    pub total_amount: u64,
    pub supply_circ_at_open: u64,
}

#[event]
pub struct DividendClaimed {
    pub dividend: Pubkey,
    pub holder: Pubkey,
    pub amount: u64,
}

#[event]
pub struct DividendClosed {
    pub dividend: Pubkey,
    pub remaining_amount: u64,
}

#[error_code]
pub enum RwaError {
    #[msg("Not enough free float")]
    InsufficientFloat,
    #[msg("Math overflow")]
    MathOverflow,
    #[msg("Dividend is closed")]
    DividendClosed,
}