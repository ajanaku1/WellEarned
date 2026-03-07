import { Connection, Keypair, PublicKey, Transaction } from '@solana/web3.js';
import { getAssociatedTokenAddress, getAccount } from '@solana/spl-token';
import { transact } from '@solana-mobile/mobile-wallet-adapter-protocol-web3js';
import * as SecureStore from 'expo-secure-store';
import { Buffer } from 'buffer';
import { env } from '@/config/env';

/* ── connection helper ─────────────────────────────────────── */
let _connection: Connection | null = null;

export const getConnection = (): Connection => {
  if (!_connection) {
    _connection = new Connection(
      `https://api.${env.solanaNetwork}.solana.com`,
      'confirmed',
    );
  }
  return _connection;
};

/* ── module-level wallet state ─────────────────────────────── */
let walletAddress: string | null = null;
let _demoKeypair: Keypair | null = null;
let _demoMode = false;

export const setConnectedWallet = (address: string | null) => {
  walletAddress = address;
};
export const getConnectedWallet = () => walletAddress;
export const isDemoMode = () => _demoMode;

/* ── demo keypair (expo-secure-store) ─────────────────────── */
const DEMO_KEY = 'wellearned_demo_keypair';

export const getOrCreateDemoKeypair = async (): Promise<Keypair> => {
  if (_demoKeypair) return _demoKeypair;
  try {
    const stored = await SecureStore.getItemAsync(DEMO_KEY);
    if (stored) {
      _demoKeypair = Keypair.fromSecretKey(Buffer.from(stored, 'base64'));
      return _demoKeypair;
    }
  } catch {
    // first launch or corrupted – generate fresh
  }
  const kp = Keypair.generate();
  await SecureStore.setItemAsync(
    DEMO_KEY,
    Buffer.from(kp.secretKey).toString('base64'),
  );
  _demoKeypair = kp;
  return kp;
};

/* ── MWA connect (with demo fallback) ─────────────────────── */
export const connectWalletMobile = async (): Promise<string> => {
  // Try real MWA first
  try {
    const authResult = await transact(async (wallet) => {
      const auth = await wallet.authorize({
        cluster: env.solanaNetwork as any,
        identity: {
          name: 'WellEarned',
          uri: 'https://wellearned.app',
          icon: 'favicon.ico',
        },
      });
      return auth;
    });
    _demoMode = false;
    const address = authResult.accounts[0].address;
    walletAddress = address;
    return address;
  } catch (mwaError: any) {
    // MWA not available – fall back to demo keypair
    console.warn('MWA unavailable, falling back to demo keypair:', mwaError?.message);
    const kp = await getOrCreateDemoKeypair();
    _demoMode = true;
    const address = kp.publicKey.toBase58();
    walletAddress = address;
    return address;
  }
};

/* ── sign + send via MWA (or demo keypair) ────────────────── */
export const signAndSendTransaction = async (
  tx: Transaction,
): Promise<string> => {
  const connection = getConnection();

  if (_demoMode && _demoKeypair) {
    // Demo mode: sign locally with the generated keypair
    tx.partialSign(_demoKeypair);
    const rawTx = tx.serialize();
    const signature = await connection.sendRawTransaction(rawTx, {
      skipPreflight: false,
      preflightCommitment: 'confirmed',
    });
    await connection.confirmTransaction(signature, 'confirmed');
    return signature;
  }

  // Real MWA path
  const signature = await transact(async (wallet) => {
    await wallet.authorize({
      cluster: env.solanaNetwork as any,
      identity: {
        name: 'WellEarned',
        uri: 'https://wellearned.app',
        icon: 'favicon.ico',
      },
    });
    const signedTxs = await wallet.signAndSendTransactions({
      transactions: [tx],
    });
    return signedTxs[0];
  });

  // signAndSendTransactions returns Uint8Array signatures
  const sigStr =
    typeof signature === 'string'
      ? signature
      : Buffer.from(signature as Uint8Array).toString('base64');

  return sigStr;
};

/* ── balances ─────────────────────────────────────────────── */
export const getSolBalance = async (address: string): Promise<number> => {
  const connection = getConnection();
  const lamports = await connection.getBalance(new PublicKey(address));
  return lamports / 1_000_000_000;
};

export const getTokenBalance = async (
  walletAddr: string,
  mintAddress: string,
): Promise<number> => {
  try {
    const connection = getConnection();
    const owner = new PublicKey(walletAddr);
    const mint = new PublicKey(mintAddress);
    const ata = await getAssociatedTokenAddress(mint, owner, true);
    const account = await getAccount(connection, ata);
    // SKR uses 9 decimals
    return Number(account.amount) / 1_000_000_000;
  } catch {
    // token account doesn't exist yet → zero balance
    return 0;
  }
};

/* ── airdrop (devnet only) — sends from reward pool ──────── */
export const requestDevnetAirdrop = async (
  address: string,
  solAmount = 0.1,
): Promise<string> => {
  const connection = getConnection();

  // Use reward pool keypair to send SOL directly (avoids faucet rate limits)
  if (env.rewardPoolKeypair) {
    const { SystemProgram, Transaction } = await import('@solana/web3.js');
    const poolKeypair = Keypair.fromSecretKey(Buffer.from(env.rewardPoolKeypair, 'base64'));
    const tx = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: poolKeypair.publicKey,
        toPubkey: new PublicKey(address),
        lamports: Math.round(solAmount * 1_000_000_000),
      }),
    );
    const { blockhash } = await connection.getLatestBlockhash();
    tx.recentBlockhash = blockhash;
    tx.feePayer = poolKeypair.publicKey;
    tx.sign(poolKeypair);
    const sig = await connection.sendRawTransaction(tx.serialize());
    await connection.confirmTransaction(sig, 'confirmed');
    return sig;
  }

  // Fallback to faucet
  const sig = await connection.requestAirdrop(
    new PublicKey(address),
    solAmount * 1_000_000_000,
  );
  await connection.confirmTransaction(sig, 'confirmed');
  return sig;
};

/* ── raw submit (kept for backwards compat) ───────────────── */
export const submitSignedTransaction = async (tx: Transaction) => {
  const connection = getConnection();
  const signature = await connection.sendRawTransaction(tx.serialize());
  await connection.confirmTransaction(signature, 'confirmed');
  return signature;
};
