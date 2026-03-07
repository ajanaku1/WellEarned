import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';

type ChatMessage = { id: string; role: 'user' | 'assistant'; content: string };

export const saveChatHistory = async (uid: string, messages: ChatMessage[]) => {
  const trimmed = messages.slice(-50);
  await setDoc(
    doc(db, 'users', uid, 'chat', 'history'),
    { messages: trimmed, updatedAt: new Date().toISOString() },
    { merge: true },
  );
};

export const loadChatHistory = async (uid: string): Promise<ChatMessage[]> => {
  const snap = await getDoc(doc(db, 'users', uid, 'chat', 'history'));
  if (!snap.exists()) return [];
  return snap.data()?.messages || [];
};
