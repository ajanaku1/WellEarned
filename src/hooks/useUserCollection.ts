import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { addUserItem, listenUserCollection } from '@/services/firestore';

export function useUserCollection(name: string) {
  const { user } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.uid) {
      setItems([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    let unsub: (() => void) | undefined;
    try {
      unsub = listenUserCollection(
        user.uid,
        name,
        (next) => {
          setItems(next);
          setLoading(false);
        },
        (err) => {
          console.warn(`[useUserCollection:${name}]`, err?.message);
          setError(err?.message ?? 'Failed to load data');
          setItems([]);
          setLoading(false);
        },
      );
    } catch (err: any) {
      console.warn(`[useUserCollection:${name}] setup failed:`, err?.message);
      setItems([]);
      setLoading(false);
    }

    return () => unsub?.();
  }, [user?.uid, name]);

  const addItem = async (payload: any) => {
    if (!user?.uid) return null;
    return addUserItem(user.uid, name, payload);
  };

  return { items, loading, error, addItem };
}
