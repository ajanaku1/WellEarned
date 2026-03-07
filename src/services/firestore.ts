import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  where,
} from 'firebase/firestore';
import { db } from '@/config/firebase';

export const userCollection = (uid: string, name: string) => collection(db, 'users', uid, name);

export const addUserItem = async (uid: string, name: string, data: any) => {
  const result = await addDoc(userCollection(uid, name), { ...data, timestamp: new Date().toISOString() });

  // Log on-chain in background (non-blocking — doesn't fail the Firestore write)
  logActivityOnChain(name, data).catch(() => {});

  return result;
};

/** Attempt to log the activity on Solana (best-effort, non-blocking) */
const logActivityOnChain = async (collectionName: string, data: any) => {
  try {
    const { getConnectedWallet, isDemoMode } = await import('@/services/wallet');
    const walletAddress = getConnectedWallet();
    if (!walletAddress) return;

    const { signAndSendTransaction } = await import('@/services/wallet');
    const { ensureUserInitialized, logMealOnChain, logWorkoutOnChain, logMoodOnChain } = await import('@/services/solanaProgram');

    const signAndSend = async (tx: any) => signAndSendTransaction(tx);

    // Ensure user PDA is initialized
    await ensureUserInitialized(walletAddress, signAndSend);

    if (collectionName === 'meals') {
      await logMealOnChain(walletAddress, data, signAndSend);
    } else if (collectionName === 'workouts') {
      await logWorkoutOnChain(walletAddress, data, signAndSend);
    } else if (collectionName === 'moods') {
      await logMoodOnChain(walletAddress, data, signAndSend);
    }
    console.log(`[onChain] ${collectionName} logged on Solana`);
  } catch (e: any) {
    console.warn(`[onChain] ${collectionName} log failed:`, e?.message);
  }
};

export const saveUserDoc = async (uid: string, path: string, data: any) => {
  await setDoc(doc(db, 'users', uid, ...path.split('/')), data, { merge: true });
};

export const listenUserCollection = (
  uid: string,
  name: string,
  cb: (items: any[]) => void,
  errorCb?: (err: any) => void,
) => {
  const q = query(userCollection(uid, name), orderBy('timestamp', 'desc'));
  return onSnapshot(
    q,
    (snapshot) => {
      cb(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
    },
    errorCb,
  );
};

export const getTodayClaim = async (uid: string, dayKey: string) => {
  const claimRef = doc(db, 'users', uid, 'rewards', dayKey);
  const snapshot = await getDoc(claimRef);
  return snapshot.exists() ? snapshot.data() : null;
};

export const recordClaim = async (uid: string, dayKey: string, data: any) => {
  const claimRef = doc(db, 'users', uid, 'rewards', dayKey);
  await setDoc(claimRef, { ...data, claimedAt: serverTimestamp() }, { merge: true });
};

export const getCollectionForToday = async (uid: string, name: string, isoDay: string) => {
  const q = query(
    userCollection(uid, name),
    where('timestamp', '>=', `${isoDay}T00:00:00.000Z`),
    where('timestamp', '<=', `${isoDay}T23:59:59.999Z`),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};
