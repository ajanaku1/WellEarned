import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInAnonymously,
  signInWithCredential,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { auth } from '@/config/firebase';

type AuthValue = {
  user: any;
  loading: boolean;
  authBusy: boolean;
  authError: string | null;
  isGuest: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signInAsGuest: () => Promise<void>;
  signInWithWallet: (walletAddress: string) => Promise<void>;
  signInWithGoogleIdToken: (idToken: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthValue>({
  user: null,
  loading: true,
  authBusy: false,
  authError: null,
  isGuest: false,
  signIn: async () => {},
  signUp: async () => {},
  signInAsGuest: async () => {},
  signInWithWallet: async () => {},
  signInWithGoogleIdToken: async () => {},
  logout: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [authBusy, setAuthBusy] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const friendly = (message: string) => {
    if (message.includes('auth/email-already-in-use')) return 'Email already in use. Sign in instead.';
    if (message.includes('auth/invalid-credential') || message.includes('auth/wrong-password')) return 'Invalid email or password.';
    if (message.includes('auth/invalid-email')) return 'Invalid email address.';
    if (message.includes('auth/weak-password')) return 'Use a stronger password (min 6 chars).';
    if (message.includes('auth/user-not-found')) return 'No account found for this email.';
    return 'Authentication failed. Please try again.';
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (nextUser) => {
      if (nextUser) {
        setUser(nextUser);
        setLoading(false);
        return;
      }
      setUser(null);
      setLoading(false);
    });

    return unsub;
  }, []);

  const signIn = async (email: string, password: string) => {
    setAuthBusy(true);
    setAuthError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (e: any) {
      setAuthError(friendly(String(e?.message || '')));
    } finally {
      setAuthBusy(false);
    }
  };

  const signUp = async (email: string, password: string) => {
    setAuthBusy(true);
    setAuthError(null);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (e: any) {
      setAuthError(friendly(String(e?.message || '')));
    } finally {
      setAuthBusy(false);
    }
  };

  const signInAsGuest = async () => {
    setAuthBusy(true);
    setAuthError(null);
    try {
      await signInAnonymously(auth);
    } catch (e: any) {
      setAuthError(friendly(String(e?.message || '')));
    } finally {
      setAuthBusy(false);
    }
  };

  const signInWithWallet = async (address: string) => {
    setAuthBusy(true);
    setAuthError(null);
    try {
      // For hackathon: use anonymous auth tied to wallet address.
      // Production would use a custom token server that verifies a signed message.
      await signInAnonymously(auth);
    } catch (e: any) {
      setAuthError(friendly(String(e?.message || '')));
    } finally {
      setAuthBusy(false);
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  const signInWithGoogleIdToken = async (idToken: string) => {
    setAuthBusy(true);
    setAuthError(null);
    try {
      const credential = GoogleAuthProvider.credential(idToken);
      await signInWithCredential(auth, credential);
    } catch (e: any) {
      setAuthError(friendly(String(e?.message || '')));
    } finally {
      setAuthBusy(false);
    }
  };

  const isGuest = Boolean(user?.isAnonymous);

  const value = useMemo(
    () => ({ user, loading, authBusy, authError, isGuest, signIn, signUp, signInAsGuest, signInWithWallet, signInWithGoogleIdToken, logout }),
    [user, loading, authBusy, authError, isGuest],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
