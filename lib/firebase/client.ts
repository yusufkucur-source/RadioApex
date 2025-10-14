import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

let firebaseApp: FirebaseApp | null = null;
let firebaseAuth: Auth | null = null;
let firebaseDb: Firestore | null = null;

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

function hasValidConfig(): boolean {
  return Boolean(
    firebaseConfig.apiKey &&
      firebaseConfig.authDomain &&
      firebaseConfig.projectId &&
      firebaseConfig.appId
  );
}

export function getFirebaseApp(): FirebaseApp | null {
  if (firebaseApp) {
    return firebaseApp;
  }

  if (!hasValidConfig()) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        "Firebase config is missing. Admin panel and dynamic data will be disabled."
      );
    }
    return null;
  }

  firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  return firebaseApp;
}

export function getFirebaseAuthInstance(): Auth | null {
  if (firebaseAuth) {
    return firebaseAuth;
  }
  const app = getFirebaseApp();
  if (!app) {
    return null;
  }
  firebaseAuth = getAuth(app);
  return firebaseAuth;
}

export function getFirestoreInstance(): Firestore | null {
  if (firebaseDb) {
    return firebaseDb;
  }
  const app = getFirebaseApp();
  if (!app) {
    return null;
  }
  firebaseDb = getFirestore(app);
  return firebaseDb;
}
