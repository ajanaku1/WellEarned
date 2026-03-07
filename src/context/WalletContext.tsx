import { createContext, useContext, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import { saveUserDoc } from '@/services/firestore';
import {
  connectWalletMobile,
  getSolBalance,
  getTokenBalance,
  setConnectedWallet,
  isDemoMode,
  requestDevnetAirdrop,
} from '@/services/wallet';
import { env } from '@/config/env';
import { useAuth } from './AuthContext';

type WalletValue = {
  walletAddress: string | null;
  balance: number | null;
  tokenBalance: number | null;
  connecting: boolean;
  demoMode: boolean;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  refreshBalances: () => Promise<void>;
  requestAirdrop: () => Promise<void>;
};

const WalletContext = createContext<WalletValue>({
  walletAddress: null,
  balance: null,
  tokenBalance: null,
  connecting: false,
  demoMode: false,
  connect: async () => {},
  disconnect: async () => {},
  refreshBalances: async () => {},
  requestAirdrop: async () => {},
});

export const WalletProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<number | null>(null);
  const [tokenBalance, setTokenBalance] = useState<number | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [demoMode, setDemoMode] = useState(false);

  const refreshBalances = async () => {
    if (!walletAddress) return;
    try {
      const [sol, skr] = await Promise.all([
        getSolBalance(walletAddress),
        getTokenBalance(walletAddress, env.skrTokenMint),
      ]);
      setBalance(sol);
      setTokenBalance(skr);
    } catch (e: any) {
      console.warn('Balance refresh failed:', e?.message);
    }
  };

  const connect = async () => {
    setConnecting(true);
    try {
      const address = await connectWalletMobile();
      setConnectedWallet(address);
      setWalletAddress(address);
      setDemoMode(isDemoMode());

      // Fetch balances
      const [sol, skr] = await Promise.all([
        getSolBalance(address).catch(() => 0),
        getTokenBalance(address, env.skrTokenMint).catch(() => 0),
      ]);
      setBalance(sol);
      setTokenBalance(skr);

      if (user?.uid) {
        await saveUserDoc(user.uid, 'profile/data', {
          solanaWallet: address,
          demoMode: isDemoMode(),
        });
      }

      if (isDemoMode()) {
        Alert.alert(
          'Demo Wallet Connected',
          'No MWA wallet found. A demo keypair was generated for testing. Request devnet SOL from your Profile to start.',
        );
      }
    } catch (e: any) {
      Alert.alert('Connection failed', e?.message ?? 'Unable to connect wallet.');
    } finally {
      setConnecting(false);
    }
  };

  const disconnect = async () => {
    setConnectedWallet(null);
    setWalletAddress(null);
    setBalance(null);
    setTokenBalance(null);
    setDemoMode(false);
  };

  const requestAirdrop = async () => {
    if (!walletAddress) {
      Alert.alert('No wallet', 'Connect a wallet first.');
      return;
    }
    try {
      const sig = await requestDevnetAirdrop(walletAddress, 0.1);
      Alert.alert('Devnet SOL sent!', `0.1 SOL sent to your wallet.\nSignature: ${sig.slice(0, 20)}...`);
      await refreshBalances();
    } catch (e: any) {
      Alert.alert('Airdrop failed', e?.message ?? 'Devnet airdrop unavailable right now.');
    }
  };

  const value = useMemo(
    () => ({
      walletAddress,
      balance,
      tokenBalance,
      connecting,
      demoMode,
      connect,
      disconnect,
      refreshBalances,
      requestAirdrop,
    }),
    [walletAddress, balance, tokenBalance, connecting, demoMode],
  );

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
};

export const useWallet = () => useContext(WalletContext);
