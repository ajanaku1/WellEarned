const value = (key: string, fallback = ''): string => {
  const v = process.env[key] ?? fallback;
  return String(v).trim();
};

export const env = {
  firebaseApiKey: value('EXPO_PUBLIC_FIREBASE_API_KEY'),
  firebaseAuthDomain: value('EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN'),
  firebaseProjectId: value('EXPO_PUBLIC_FIREBASE_PROJECT_ID'),
  firebaseStorageBucket: value('EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET'),
  firebaseMessagingSenderId: value('EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID'),
  firebaseAppId: value('EXPO_PUBLIC_FIREBASE_APP_ID'),
  googleWebClientId: value('EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID'),
  googleAndroidClientId: value('EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID'),
  googleIosClientId: value('EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID'),
  geminiApiKey: value('EXPO_PUBLIC_GEMINI_API_KEY', value('GEMINI_API_KEY')),
  apiBaseUrl: value('EXPO_PUBLIC_API_BASE_URL', 'http://10.0.2.2:3000'),
  solanaNetwork: value('EXPO_PUBLIC_SOLANA_NETWORK', value('SOLANA_NETWORK', 'devnet')),
  rewardPoolWallet: value('EXPO_PUBLIC_REWARD_POOL_WALLET', value('REWARD_POOL_WALLET')),
  skrTokenMint: value('EXPO_PUBLIC_SKR_TOKEN_MINT', value('SKR_TOKEN_MINT')),
  wellEarnedProgramId: value('EXPO_PUBLIC_WELLEARNED_PROGRAM_ID', value('WELLEARNED_PROGRAM_ID')),
  rewardPoolKeypair: value('EXPO_PUBLIC_REWARD_POOL_KEYPAIR', value('REWARD_POOL_KEYPAIR')),
};
