import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

if (!config.projectId) {
  console.warn(
    'Firebase config is missing. Copy .env.example to .env.local and fill in your Firebase project values.'
  );
}

export const app = initializeApp(config);
export const db = getFirestore(app);

export const COMPETITION_DOC_PATH = ['competition', 'main'] as const;
