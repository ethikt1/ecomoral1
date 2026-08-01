import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const isFirebaseConfigured = Object.values(firebaseConfig).every(Boolean);

const app = isFirebaseConfigured
  ? (getApps().length ? getApp() : initializeApp(firebaseConfig))
  : null;

export const db = app ? getFirestore(app) : null;
const auth = app ? getAuth(app) : null;

let authPromise: Promise<void> | null = null;

export function ensureFirebaseAuth(): Promise<string> {
  if (!auth) {
    return Promise.reject(new Error('Firebase 환경변수가 설정되지 않았습니다.'));
  }
  if (auth.currentUser) return Promise.resolve(auth.currentUser.uid);

  if (!authPromise) {
    authPromise = signInAnonymously(auth)
      .then(() => undefined)
      .catch((error) => {
        authPromise = null;
        throw error;
      });
  }
  return authPromise.then(() => {
    if (!auth.currentUser) throw new Error('Firebase 익명 인증에 실패했습니다.');
    return auth.currentUser.uid;
  });
}
