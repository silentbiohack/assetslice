#![allow(unexpected_cfgs)]

use anchor_lang::prelude::*;

declare_id!("3ER5UsBMKiP81Giq45LD6dL5adF8vH8v2juiBGT4NHSg");

#[program]
pub mod rwa_backend {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
