import { transact } from '@solana-mobile/mobile-wallet-adapter-protocol-web3js';
import { PublicKey, Transaction } from '@solana/web3.js';
import { env } from '@/config/env';

/**
 * Solana Mobile Stack (SMS) integration for WellEarned.
 *
 * SMS Features used:
 * 1. Mobile Wallet Adapter (MWA) - wallet connection & tx signing
 * 2. Seed Vault - secure key storage (Seeker hardware only)
 * 3. dApp Store - distribution channel
 *
 * On non-Seeker devices, falls back to standard MWA flow.
 */

export type SMSCapabilities = {
  hasMWA: boolean;
  hasSeedVault: boolean;
  walletName: string | null;
};

// Check what SMS capabilities are available on this device
export const checkSMSCapabilities = async (): Promise<SMSCapabilities> => {
  const caps: SMSCapabilities = {
    hasMWA: false,
    hasSeedVault: false,
    walletName: null,
  };

  try {
    // Test MWA availability by attempting authorization
    await transact(async (wallet) => {
      const auth = await wallet.authorize({
        cluster: env.solanaNetwork as any,
        identity: {
          name: 'WellEarned',
          uri: 'https://wellearned.app',
          icon: 'favicon.ico',
        },
      });
      caps.hasMWA = true;
      caps.walletName = auth.wallet_uri_base ?? 'Unknown Wallet';

      // Deauthorize immediately - this was just a capability check
      await wallet.deauthorize({ auth_token: auth.auth_token });
    });
  } catch {
    // MWA not available
  }

  // Seed Vault detection would go here on actual Seeker hardware
  // For now we mark it false
  caps.hasSeedVault = false;

  return caps;
};

// Sign a transaction using MWA (the core SMS signing flow)
export const signTransactionViaMWA = async (
  tx: Transaction,
  walletAddress: string,
): Promise<Transaction> => {
  const signedTx = await transact(async (wallet) => {
    const auth = await wallet.authorize({
      cluster: env.solanaNetwork as any,
      identity: {
        name: 'WellEarned',
        uri: 'https://wellearned.app',
        icon: 'favicon.ico',
      },
    });

    const signed = await wallet.signTransactions({
      transactions: [tx],
    });

    return signed[0];
  });

  return signedTx as unknown as Transaction;
};

// Get authorized wallet sessions info
export const getMWAWalletInfo = async (): Promise<{
  address: string;
  label: string | null;
} | null> => {
  try {
    const result = await transact(async (wallet) => {
      const auth = await wallet.authorize({
        cluster: env.solanaNetwork as any,
        identity: {
          name: 'WellEarned',
          uri: 'https://wellearned.app',
          icon: 'favicon.ico',
        },
      });
      return {
        address: auth.accounts[0].address,
        label: auth.accounts[0].label ?? null,
      };
    });
    return result;
  } catch {
    return null;
  }
};
