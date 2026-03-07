import { Connection, PublicKey, Transaction, TransactionInstruction, SystemProgram } from '@solana/web3.js';
import {
  getAssociatedTokenAddressSync,
  createAssociatedTokenAccountInstruction,
  createTransferCheckedInstruction,
} from '@solana/spl-token';
import { Buffer } from 'buffer';
import { env } from '@/config/env';

// Program ID - will be updated after deployment
const WELLEARNED_PROGRAM_ID = new PublicKey(
  env.wellEarnedProgramId || '11111111111111111111111111111111'
);

export type RecentClaim = {
  signature: string;
  timestamp: string | null;
  explorerUrl: string;
};

const MEMO_PROGRAM_ID = new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr');
const SKR_MINT = new PublicKey(env.skrTokenMint || 'CxAyTrF99D9sZ7sE9638ANU41Vdpv9j7LSShDbhxnJuN');
const SKR_DECIMALS = 9;
const REWARD_POOL = new PublicKey(env.rewardPoolWallet || '229cvD8WSWJfWmnJwY2kZqUKi82uz4cf6zyeCVitMVRB');

export const getConnection = () =>
  new Connection(`https://api.${env.solanaNetwork}.solana.com`, 'confirmed');

/**
 * Build a reward claim transaction using the on-chain Anchor program.
 * Passes today's activity PDAs as remaining accounts so the program
 * can verify at least 2 activities were logged.
 */
export const buildRewardClaimTx = async (
  walletAddress: string,
  streak: number,
  reward: number,
): Promise<Transaction> => {
  const connection = getConnection();
  const payer = new PublicKey(walletAddress);
  const day = new Date().toISOString().slice(0, 10);
  const [rewardPda] = getUserRewardPDA(walletAddress);

  // Activity PDAs for today — passed as remaining accounts for on-chain verification
  const [mealPda] = getMealPDA(walletAddress, day);
  const [workoutPda] = getWorkoutPDA(walletAddress, day);
  const [moodPda] = getMoodPDA(walletAddress, day);

  // Encode: discriminator + day(string) + streak(u32) + reward(u64)
  const dayBytes = Buffer.from(day);
  const data = Buffer.alloc(8 + 4 + dayBytes.length + 4 + 8);
  let offset = 0;
  DISCRIMINATORS.claimDailyReward.copy(data, offset); offset += 8;
  data.writeUInt32LE(dayBytes.length, offset); offset += 4;
  dayBytes.copy(data, offset); offset += dayBytes.length;
  data.writeUInt32LE(streak, offset); offset += 4;
  data.writeBigUInt64LE(BigInt(reward), offset);

  const ix = new TransactionInstruction({
    keys: [
      { pubkey: rewardPda, isSigner: false, isWritable: true },
      { pubkey: payer, isSigner: true, isWritable: false },
      // Remaining accounts: activity PDAs for on-chain verification
      { pubkey: mealPda, isSigner: false, isWritable: false },
      { pubkey: workoutPda, isSigner: false, isWritable: false },
      { pubkey: moodPda, isSigner: false, isWritable: false },
    ],
    programId: WELLEARNED_PROGRAM_ID,
    data,
  });

  const tx = new Transaction().add(ix);
  const { blockhash } = await connection.getLatestBlockhash();
  tx.recentBlockhash = blockhash;
  tx.feePayer = payer;

  return tx;
};

/**
 * Distribute reward from the pool to a user.
 * Tries SPL token transfer first; falls back to SOL transfer for devnet testing.
 * In production, this would be a backend API or on-chain program instruction.
 */
export const distributeReward = async (
  userWallet: string,
  amount: number,
): Promise<string | null> => {
  try {
    if (!env.rewardPoolKeypair) return null;

    const { Keypair } = await import('@solana/web3.js');
    const poolKeypair = Keypair.fromSecretKey(Buffer.from(env.rewardPoolKeypair, 'base64'));
    const connection = getConnection();
    const user = new PublicKey(userWallet);

    // Try SPL token transfer first
    try {
      const poolAta = getAssociatedTokenAddressSync(SKR_MINT, poolKeypair.publicKey);
      const poolAtaInfo = await connection.getAccountInfo(poolAta);

      if (poolAtaInfo) {
        const userAta = getAssociatedTokenAddressSync(SKR_MINT, user);
        const tx = new Transaction();

        const userAtaInfo = await connection.getAccountInfo(userAta);
        if (!userAtaInfo) {
          tx.add(createAssociatedTokenAccountInstruction(poolKeypair.publicKey, userAta, user, SKR_MINT));
        }

        const tokenAmount = BigInt(amount) * BigInt(10 ** SKR_DECIMALS);
        tx.add(createTransferCheckedInstruction(
          poolAta, SKR_MINT, userAta, poolKeypair.publicKey, tokenAmount, SKR_DECIMALS,
        ));

        const { blockhash } = await connection.getLatestBlockhash();
        tx.recentBlockhash = blockhash;
        tx.feePayer = poolKeypair.publicKey;
        tx.sign(poolKeypair);

        const sig = await connection.sendRawTransaction(tx.serialize());
        await connection.confirmTransaction(sig, 'confirmed');
        return sig;
      }
    } catch (splErr: any) {
      console.warn('[distributeReward] SPL transfer unavailable, using SOL fallback:', splErr?.message);
    }

    // Fallback: send small SOL amount as reward (for devnet demo)
    // 1 SKR reward = 0.001 SOL equivalent for demo
    const solReward = Math.round(amount * 0.001 * 1_000_000_000);
    const tx = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: poolKeypair.publicKey,
        toPubkey: user,
        lamports: solReward,
      }),
    );

    const { blockhash } = await connection.getLatestBlockhash();
    tx.recentBlockhash = blockhash;
    tx.feePayer = poolKeypair.publicKey;
    tx.sign(poolKeypair);

    const sig = await connection.sendRawTransaction(tx.serialize());
    await connection.confirmTransaction(sig, 'confirmed');
    return sig;
  } catch (e: any) {
    console.warn('[distributeReward] Failed:', e?.message);
    return null;
  }
};

export const getTransactionExplorerUrl = (signature: string) =>
  `https://explorer.solana.com/tx/${signature}?cluster=${env.solanaNetwork}`;

export const getAddressExplorerUrl = (address: string) =>
  `https://explorer.solana.com/address/${address}?cluster=${env.solanaNetwork}`;

// --- On-chain program integration ---

export const getUserRewardPDA = (walletAddress: string): [PublicKey, number] => {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('reward'), new PublicKey(walletAddress).toBuffer()],
    WELLEARNED_PROGRAM_ID,
  );
};

export const getActivityPDA = (walletAddress: string, day: string): [PublicKey, number] => {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('activity'), new PublicKey(walletAddress).toBuffer(), Buffer.from(day)],
    WELLEARNED_PROGRAM_ID,
  );
};

export const getMealPDA = (walletAddress: string, day: string): [PublicKey, number] => {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('meal'), new PublicKey(walletAddress).toBuffer(), Buffer.from(day)],
    WELLEARNED_PROGRAM_ID,
  );
};

export const getWorkoutPDA = (walletAddress: string, day: string): [PublicKey, number] => {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('workout'), new PublicKey(walletAddress).toBuffer(), Buffer.from(day)],
    WELLEARNED_PROGRAM_ID,
  );
};

export const getMoodPDA = (walletAddress: string, day: string): [PublicKey, number] => {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('mood'), new PublicKey(walletAddress).toBuffer(), Buffer.from(day)],
    WELLEARNED_PROGRAM_ID,
  );
};

// Anchor discriminators (first 8 bytes of sha256("global:<method_name>"))
const DISCRIMINATORS = {
  initializeUser: Buffer.from([111, 17, 185, 250, 60, 122, 38, 254]),
  claimDailyReward: Buffer.from([24, 130, 79, 89, 83, 137, 178, 108]),
  logMeal: Buffer.from([14, 13, 96, 49, 190, 12, 73, 208]),
  logWorkout: Buffer.from([66, 41, 145, 130, 72, 89, 146, 228]),
  logMood: Buffer.from([253, 215, 68, 162, 5, 78, 234, 129]),
};

/** SHA-256 hash of a string (for content verification on-chain) */
const sha256Hash = async (input: string): Promise<Uint8Array> => {
  try {
    const { digestStringAsync, CryptoDigestAlgorithm } = await import('expo-crypto');
    const hex = await digestStringAsync(CryptoDigestAlgorithm.SHA256, input);
    const bytes = new Uint8Array(32);
    for (let i = 0; i < 32; i++) bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
    return bytes;
  } catch {
    // Fallback: simple hash
    const bytes = new Uint8Array(32);
    const str = input.slice(0, 64);
    for (let i = 0; i < str.length && i < 32; i++) bytes[i] = str.charCodeAt(i);
    return bytes;
  }
};

export const fetchUserRewardAccount = async (walletAddress: string) => {
  try {
    const connection = getConnection();
    const [pda] = getUserRewardPDA(walletAddress);
    const accountInfo = await connection.getAccountInfo(pda);
    if (!accountInfo) return null;

    const data = accountInfo.data;
    const authority = new PublicKey(data.slice(8, 40));
    const streak = data.readUInt32LE(40);
    const totalEarned = Number(data.readBigUInt64LE(44));
    const dayLen = data.readUInt32LE(52);
    const lastClaimDay = Buffer.from(data.slice(56, 56 + dayLen)).toString();
    const offset = 56 + dayLen;
    const totalMeals = data.readUInt32LE(offset);
    const totalWorkouts = data.readUInt32LE(offset + 4);
    const totalMoods = data.readUInt32LE(offset + 8);
    const bump = data[offset + 12];

    return { authority: authority.toBase58(), streak, totalEarned, lastClaimDay, totalMeals, totalWorkouts, totalMoods, bump };
  } catch {
    return null;
  }
};

export const ensureUserInitialized = async (walletAddress: string, signAndSend: (tx: Transaction) => Promise<string>): Promise<void> => {
  const existing = await fetchUserRewardAccount(walletAddress);
  if (existing) return;

  const connection = getConnection();
  const payer = new PublicKey(walletAddress);
  const [pda] = getUserRewardPDA(walletAddress);

  const ix = new TransactionInstruction({
    keys: [
      { pubkey: pda, isSigner: false, isWritable: true },
      { pubkey: payer, isSigner: true, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    programId: WELLEARNED_PROGRAM_ID,
    data: DISCRIMINATORS.initializeUser,
  });

  const tx = new Transaction().add(ix);
  const { blockhash } = await connection.getLatestBlockhash();
  tx.recentBlockhash = blockhash;
  tx.feePayer = payer;
  await signAndSend(tx);
};

/** Log a meal on-chain */
export const logMealOnChain = async (
  walletAddress: string,
  mealData: any,
  signAndSend: (tx: Transaction) => Promise<string>,
): Promise<string> => {
  const connection = getConnection();
  const payer = new PublicKey(walletAddress);
  const day = new Date().toISOString().slice(0, 10);
  const [activityPda] = getMealPDA(walletAddress, day);
  const [rewardPda] = getUserRewardPDA(walletAddress);

  const contentHash = await sha256Hash(JSON.stringify(mealData));
  const healthScore = mealData.healthScore ?? mealData.score ?? 7;
  const calories = mealData.calories ?? mealData.totalCalories ?? 0;

  // Encode: discriminator + day(string) + contentHash([u8;32]) + healthScore(u8) + calories(u16)
  const dayBytes = Buffer.from(day);
  const data = Buffer.alloc(8 + 4 + dayBytes.length + 32 + 1 + 2);
  let offset = 0;
  DISCRIMINATORS.logMeal.copy(data, offset); offset += 8;
  data.writeUInt32LE(dayBytes.length, offset); offset += 4;
  dayBytes.copy(data, offset); offset += dayBytes.length;
  Buffer.from(contentHash).copy(data, offset); offset += 32;
  data.writeUInt8(Math.min(healthScore, 255), offset); offset += 1;
  data.writeUInt16LE(Math.min(calories, 65535), offset);

  const ix = new TransactionInstruction({
    keys: [
      { pubkey: activityPda, isSigner: false, isWritable: true },
      { pubkey: rewardPda, isSigner: false, isWritable: true },
      { pubkey: payer, isSigner: true, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    programId: WELLEARNED_PROGRAM_ID,
    data,
  });

  const tx = new Transaction().add(ix);
  const { blockhash } = await connection.getLatestBlockhash();
  tx.recentBlockhash = blockhash;
  tx.feePayer = payer;
  return signAndSend(tx);
};

/** Log a workout on-chain */
export const logWorkoutOnChain = async (
  walletAddress: string,
  workoutData: any,
  signAndSend: (tx: Transaction) => Promise<string>,
): Promise<string> => {
  const connection = getConnection();
  const payer = new PublicKey(walletAddress);
  const day = new Date().toISOString().slice(0, 10);
  const [activityPda] = getWorkoutPDA(walletAddress, day);
  const [rewardPda] = getUserRewardPDA(walletAddress);

  const contentHash = await sha256Hash(JSON.stringify(workoutData));
  const formScore = workoutData.formScore ?? workoutData.score ?? 7;
  const durationSecs = workoutData.durationSecs ?? workoutData.duration ?? 0;

  const dayBytes = Buffer.from(day);
  const data = Buffer.alloc(8 + 4 + dayBytes.length + 32 + 1 + 2);
  let offset = 0;
  DISCRIMINATORS.logWorkout.copy(data, offset); offset += 8;
  data.writeUInt32LE(dayBytes.length, offset); offset += 4;
  dayBytes.copy(data, offset); offset += dayBytes.length;
  Buffer.from(contentHash).copy(data, offset); offset += 32;
  data.writeUInt8(Math.min(formScore, 255), offset); offset += 1;
  data.writeUInt16LE(Math.min(durationSecs, 65535), offset);

  const ix = new TransactionInstruction({
    keys: [
      { pubkey: activityPda, isSigner: false, isWritable: true },
      { pubkey: rewardPda, isSigner: false, isWritable: true },
      { pubkey: payer, isSigner: true, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    programId: WELLEARNED_PROGRAM_ID,
    data,
  });

  const tx = new Transaction().add(ix);
  const { blockhash } = await connection.getLatestBlockhash();
  tx.recentBlockhash = blockhash;
  tx.feePayer = payer;
  return signAndSend(tx);
};

/** Log a mood check-in on-chain */
export const logMoodOnChain = async (
  walletAddress: string,
  moodData: any,
  signAndSend: (tx: Transaction) => Promise<string>,
): Promise<string> => {
  const connection = getConnection();
  const payer = new PublicKey(walletAddress);
  const day = new Date().toISOString().slice(0, 10);
  const [activityPda] = getMoodPDA(walletAddress, day);
  const [rewardPda] = getUserRewardPDA(walletAddress);

  const contentHash = await sha256Hash(JSON.stringify(moodData));
  const moodScore = moodData.moodScore ?? moodData.score ?? 5;

  const dayBytes = Buffer.from(day);
  const data = Buffer.alloc(8 + 4 + dayBytes.length + 32 + 1 + 2);
  let offset = 0;
  DISCRIMINATORS.logMood.copy(data, offset); offset += 8;
  data.writeUInt32LE(dayBytes.length, offset); offset += 4;
  dayBytes.copy(data, offset); offset += dayBytes.length;
  Buffer.from(contentHash).copy(data, offset); offset += 32;
  data.writeUInt8(Math.min(moodScore, 255), offset); offset += 1;
  data.writeUInt16LE(0, offset); // unused

  const ix = new TransactionInstruction({
    keys: [
      { pubkey: activityPda, isSigner: false, isWritable: true },
      { pubkey: rewardPda, isSigner: false, isWritable: true },
      { pubkey: payer, isSigner: true, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    programId: WELLEARNED_PROGRAM_ID,
    data,
  });

  const tx = new Transaction().add(ix);
  const { blockhash } = await connection.getLatestBlockhash();
  tx.recentBlockhash = blockhash;
  tx.feePayer = payer;
  return signAndSend(tx);
};

export const buildInitializeUserTx = async (walletAddress: string): Promise<Transaction> => {
  const connection = getConnection();
  const payer = new PublicKey(walletAddress);
  const [pda] = getUserRewardPDA(walletAddress);

  const existing = await connection.getAccountInfo(pda);
  if (existing) throw new Error('Account already initialized');

  const ix = new TransactionInstruction({
    keys: [
      { pubkey: pda, isSigner: false, isWritable: true },
      { pubkey: payer, isSigner: true, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    programId: WELLEARNED_PROGRAM_ID,
    data: DISCRIMINATORS.initializeUser,
  });

  const tx = new Transaction().add(ix);
  const { blockhash } = await connection.getLatestBlockhash();
  tx.recentBlockhash = blockhash;
  tx.feePayer = payer;
  return tx;
};

export const getRecentClaims = async (walletAddress: string): Promise<RecentClaim[]> => {
  try {
    const connection = getConnection();
    const pubkey = new PublicKey(walletAddress);
    const sigs = await connection.getSignaturesForAddress(pubkey, { limit: 10 });
    return sigs.map((s) => ({
      signature: s.signature,
      timestamp: s.blockTime ? new Date(s.blockTime * 1000).toISOString() : null,
      explorerUrl: getTransactionExplorerUrl(s.signature),
    }));
  } catch {
    return [];
  }
};
