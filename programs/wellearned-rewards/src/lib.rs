use anchor_lang::prelude::*;

declare_id!("En9N1SXMDqCv7CkVV7ePq2AEjeJwXJofUYzZqgwR2Xk1");

#[program]
pub mod wellearned_rewards {
    use super::*;

    /// Initialize user profile PDA — stores streak and reward data
    pub fn initialize_user(ctx: Context<InitializeUser>) -> Result<()> {
        let account = &mut ctx.accounts.user_reward_account;
        account.authority = ctx.accounts.authority.key();
        account.streak = 0;
        account.total_earned = 0;
        account.last_claim_day = String::from("0000-00-00");
        account.total_meals = 0;
        account.total_workouts = 0;
        account.total_moods = 0;
        account.bump = ctx.bumps.user_reward_account;
        Ok(())
    }

    /// Claim daily reward — verifies at least 2 activities logged today on-chain
    pub fn claim_daily_reward(ctx: Context<ClaimReward>, day: String, streak: u32, reward: u64) -> Result<()> {
        let account = &mut ctx.accounts.user_reward_account;
        require!(account.last_claim_day != day, WellEarnedError::AlreadyClaimed);

        // Verify at least 2 activity PDAs exist for today
        let authority = ctx.accounts.authority.key();
        let program_id = ctx.program_id;
        let mut activity_count: u8 = 0;

        let (meal_pda, _) = Pubkey::find_program_address(
            &[b"meal", authority.as_ref(), day.as_bytes()],
            program_id,
        );
        let (workout_pda, _) = Pubkey::find_program_address(
            &[b"workout", authority.as_ref(), day.as_bytes()],
            program_id,
        );
        let (mood_pda, _) = Pubkey::find_program_address(
            &[b"mood", authority.as_ref(), day.as_bytes()],
            program_id,
        );

        for acc in ctx.remaining_accounts.iter() {
            let key = acc.key();
            if (key == meal_pda || key == workout_pda || key == mood_pda)
                && acc.owner == program_id
                && acc.data_len() > 0
            {
                activity_count += 1;
            }
        }

        require!(activity_count >= 2, WellEarnedError::InsufficientActivities);

        account.streak = streak;
        account.total_earned = account.total_earned.checked_add(reward).unwrap();
        account.last_claim_day = day;
        Ok(())
    }

    /// Log a meal on-chain with a content hash for verifiability
    pub fn log_meal(ctx: Context<LogMeal>, day: String, content_hash: [u8; 32], health_score: u8, calories: u16) -> Result<()> {
        let entry = &mut ctx.accounts.activity_entry;
        entry.authority = ctx.accounts.authority.key();
        entry.activity_type = ActivityType::Meal;
        entry.day = day;
        entry.content_hash = content_hash;
        entry.score = health_score;
        entry.extra = calories as u32;
        entry.timestamp = Clock::get()?.unix_timestamp;
        entry.bump = ctx.bumps.activity_entry;

        let user = &mut ctx.accounts.user_reward_account;
        user.total_meals = user.total_meals.checked_add(1).unwrap();
        Ok(())
    }

    /// Log a workout on-chain
    pub fn log_workout(ctx: Context<LogWorkout>, day: String, content_hash: [u8; 32], form_score: u8, duration_secs: u16) -> Result<()> {
        let entry = &mut ctx.accounts.activity_entry;
        entry.authority = ctx.accounts.authority.key();
        entry.activity_type = ActivityType::Workout;
        entry.day = day;
        entry.content_hash = content_hash;
        entry.score = form_score;
        entry.extra = duration_secs as u32;
        entry.timestamp = Clock::get()?.unix_timestamp;
        entry.bump = ctx.bumps.activity_entry;

        let user = &mut ctx.accounts.user_reward_account;
        user.total_workouts = user.total_workouts.checked_add(1).unwrap();
        Ok(())
    }

    /// Log a mood check-in on-chain
    pub fn log_mood(ctx: Context<LogMood>, day: String, content_hash: [u8; 32], mood_score: u8, _unused: u16) -> Result<()> {
        let entry = &mut ctx.accounts.activity_entry;
        entry.authority = ctx.accounts.authority.key();
        entry.activity_type = ActivityType::Mood;
        entry.day = day;
        entry.content_hash = content_hash;
        entry.score = mood_score;
        entry.extra = 0;
        entry.timestamp = Clock::get()?.unix_timestamp;
        entry.bump = ctx.bumps.activity_entry;

        let user = &mut ctx.accounts.user_reward_account;
        user.total_moods = user.total_moods.checked_add(1).unwrap();
        Ok(())
    }
}

// ─── Accounts ───────────────────────────────────────────────

#[derive(Accounts)]
pub struct InitializeUser<'info> {
    #[account(
        init,
        payer = authority,
        space = UserRewardAccount::SIZE,
        seeds = [b"reward", authority.key().as_ref()],
        bump,
    )]
    pub user_reward_account: Account<'info, UserRewardAccount>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ClaimReward<'info> {
    #[account(
        mut,
        seeds = [b"reward", authority.key().as_ref()],
        bump = user_reward_account.bump,
        has_one = authority,
    )]
    pub user_reward_account: Account<'info, UserRewardAccount>,
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
#[instruction(day: String)]
pub struct LogMeal<'info> {
    #[account(
        init,
        payer = authority,
        space = ActivityEntry::SIZE,
        seeds = [b"meal", authority.key().as_ref(), day.as_bytes()],
        bump,
    )]
    pub activity_entry: Account<'info, ActivityEntry>,
    #[account(
        mut,
        seeds = [b"reward", authority.key().as_ref()],
        bump = user_reward_account.bump,
        has_one = authority,
    )]
    pub user_reward_account: Account<'info, UserRewardAccount>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(day: String)]
pub struct LogWorkout<'info> {
    #[account(
        init,
        payer = authority,
        space = ActivityEntry::SIZE,
        seeds = [b"workout", authority.key().as_ref(), day.as_bytes()],
        bump,
    )]
    pub activity_entry: Account<'info, ActivityEntry>,
    #[account(
        mut,
        seeds = [b"reward", authority.key().as_ref()],
        bump = user_reward_account.bump,
        has_one = authority,
    )]
    pub user_reward_account: Account<'info, UserRewardAccount>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(day: String)]
pub struct LogMood<'info> {
    #[account(
        init,
        payer = authority,
        space = ActivityEntry::SIZE,
        seeds = [b"mood", authority.key().as_ref(), day.as_bytes()],
        bump,
    )]
    pub activity_entry: Account<'info, ActivityEntry>,
    #[account(
        mut,
        seeds = [b"reward", authority.key().as_ref()],
        bump = user_reward_account.bump,
        has_one = authority,
    )]
    pub user_reward_account: Account<'info, UserRewardAccount>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

// ─── State ──────────────────────────────────────────────────

#[account]
pub struct UserRewardAccount {
    pub authority: Pubkey,       // 32
    pub streak: u32,             // 4
    pub total_earned: u64,       // 8
    pub last_claim_day: String,  // 4 + 10
    pub total_meals: u32,        // 4
    pub total_workouts: u32,     // 4
    pub total_moods: u32,        // 4
    pub bump: u8,                // 1
}

impl UserRewardAccount {
    // discriminator(8) + 32 + 4 + 8 + (4+10) + 4 + 4 + 4 + 1 = 79
    pub const SIZE: usize = 8 + 32 + 4 + 8 + (4 + 10) + 4 + 4 + 4 + 1;
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum ActivityType {
    Meal,
    Workout,
    Mood,
}

#[account]
pub struct ActivityEntry {
    pub authority: Pubkey,          // 32
    pub activity_type: ActivityType, // 1 + (enum)
    pub day: String,                // 4 + 10
    pub content_hash: [u8; 32],     // 32  — SHA-256 of the activity data
    pub score: u8,                  // 1   — health/form/mood score
    pub extra: u32,                 // 4   — calories / duration / unused
    pub timestamp: i64,             // 8
    pub bump: u8,                   // 1
}

impl ActivityEntry {
    // discriminator(8) + 32 + 2 + (4+10) + 32 + 1 + 4 + 8 + 1 = 102
    pub const SIZE: usize = 8 + 32 + 2 + (4 + 10) + 32 + 1 + 4 + 8 + 1;
}

// ─── Errors ─────────────────────────────────────────────────

#[error_code]
pub enum WellEarnedError {
    #[msg("Already claimed today")]
    AlreadyClaimed,
    #[msg("Need at least 2 activities logged today to claim")]
    InsufficientActivities,
}
