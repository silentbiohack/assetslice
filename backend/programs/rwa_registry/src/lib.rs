#![allow(unexpected_cfgs)]

use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, Token, TokenAccount};

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod rwa_registry {
    use super::*;

    pub fn create_asset(
        ctx: Context<CreateAsset>,
        price_usdc: u64,
        total_supply: u64,
        free_float: u64,
        decimals: u8,
    ) -> Result<()> {
        let asset = &mut ctx.accounts.asset;
        let asset_mint = &ctx.accounts.asset_mint;
        let usdc_mint = &ctx.accounts.usdc_mint;
        let issuer = &ctx.accounts.issuer;

        // Initialize asset account
        asset.issuer = issuer.key();
        asset.asset_mint = asset_mint.key();
        asset.usdc_mint = usdc_mint.key();
        asset.decimals = decimals;
        asset.price_usdc = price_usdc;
        asset.total_supply = total_supply;
        asset.free_float = free_float;
        asset.bump_asset = ctx.bumps.asset;
        asset.bump_mint_auth = ctx.bumps.mint_authority;
        asset.bump_vault_usdc = ctx.bumps.vault_usdc;

        emit!(AssetCreated {
            asset: asset.key(),
            issuer: issuer.key(),
            asset_mint: asset_mint.key(),
            price_usdc,
            total_supply,
            free_float,
        });

        Ok(())
    }

    pub fn update_asset(
        ctx: Context<UpdateAsset>,
        new_price_usdc: Option<u64>,
        new_free_float: Option<u64>,
    ) -> Result<()> {
        let asset = &mut ctx.accounts.asset;

        if let Some(price) = new_price_usdc {
            asset.price_usdc = price;
        }

        if let Some(float) = new_free_float {
            require!(float <= asset.total_supply, ErrorCode::InvalidFreeFloat);
            asset.free_float = float;
        }

        emit!(AssetUpdated {
            asset: asset.key(),
            price_usdc: asset.price_usdc,
            free_float: asset.free_float,
        });

        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(price_usdc: u64, total_supply: u64, free_float: u64, decimals: u8)]
pub struct CreateAsset<'info> {
    #[account(mut)]
    pub issuer: Signer<'info>,

    #[account(
        init,
        payer = issuer,
        space = 8 + Asset::INIT_SPACE,
        seeds = [b"asset", issuer.key().as_ref(), asset_mint.key().as_ref()],
        bump
    )]
    pub asset: Account<'info, Asset>,

    #[account(
        init,
        payer = issuer,
        mint::decimals = decimals,
        mint::authority = mint_authority,
        mint::freeze_authority = mint_authority,
    )]
    pub asset_mint: Account<'info, Mint>,

    /// CHECK: This is the USDC mint address, validated by the client
    pub usdc_mint: Account<'info, Mint>,

    #[account(
        seeds = [b"mint_auth", asset_mint.key().as_ref()],
        bump
    )]
    /// CHECK: This is a PDA used as mint authority
    pub mint_authority: UncheckedAccount<'info>,

    #[account(
        init,
        payer = issuer,
        token::mint = usdc_mint,
        token::authority = vault_usdc,
        seeds = [b"vault_usdc", asset_mint.key().as_ref()],
        bump
    )]
    pub vault_usdc: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct UpdateAsset<'info> {
    #[account(mut)]
    pub issuer: Signer<'info>,

    #[account(
        mut,
        seeds = [b"asset", issuer.key().as_ref(), asset.asset_mint.as_ref()],
        bump = asset.bump_asset,
        has_one = issuer
    )]
    pub asset: Account<'info, Asset>,
}

#[account]
#[derive(InitSpace)]
pub struct Asset {
    pub issuer: Pubkey,        // 32 bytes
    pub asset_mint: Pubkey,    // 32 bytes
    pub usdc_mint: Pubkey,     // 32 bytes
    pub decimals: u8,          // 1 byte
    pub price_usdc: u64,       // 8 bytes
    pub total_supply: u64,     // 8 bytes
    pub free_float: u64,       // 8 bytes
    pub bump_asset: u8,        // 1 byte
    pub bump_mint_auth: u8,    // 1 byte
    pub bump_vault_usdc: u8,   // 1 byte
}

#[event]
pub struct AssetCreated {
    pub asset: Pubkey,
    pub issuer: Pubkey,
    pub asset_mint: Pubkey,
    pub price_usdc: u64,
    pub total_supply: u64,
    pub free_float: u64,
}

#[event]
pub struct AssetUpdated {
    pub asset: Pubkey,
    pub price_usdc: u64,
    pub free_float: u64,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Invalid free float amount")]
    InvalidFreeFloat,
}