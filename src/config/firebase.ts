import { getApp, getApps, initializeApp } from 'firebase/app';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAuth, initializeAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { env } from './env';

const firebaseConfig = {
  apiKey: env.firebaseApiKey,
  authDomain: env.firebaseAuthDomain,
  projectId: env.firebaseProjectId,
  storageBucket: env.firebaseStorageBucket,
  messagingSenderId: env.firebaseMessagingSenderId,
  appId: env.firebaseAppId,
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

const authModule = require('firebase/auth') as { getReactNativePersistence?: (storage: any) => any };
const persistence = authModule.getReactNativePersistence?.(AsyncStorage);

// Avoid auth re-initialization crashes during fast refresh / app reloads.
export const auth = (() => {
  try {
    if (persistence) {
      return initializeAuth(app, { persistence });
    }
    return initializeAuth(app);
  } catch {
    return getAuth(app);
  }
})();
export const db = getFirestore(app);
