import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getDatabase } from 'firebase/database'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
}

let app = null
export let auth = null
export let db = null
export let firebaseInitError = null

try {
  if (!firebaseConfig.apiKey || !firebaseConfig.authDomain || !firebaseConfig.projectId) {
    throw new Error(
      'Firebase is not configured. Add VITE_FIREBASE_API_KEY, VITE_FIREBASE_AUTH_DOMAIN, and VITE_FIREBASE_PROJECT_ID to your .env, then restart the dev server.',
    )
  }
  if (!firebaseConfig.databaseURL) {
    throw new Error(
      'Firebase Realtime Database is not configured. Add VITE_FIREBASE_DATABASE_URL (from Firebase Console → Realtime Database) to your .env, then restart the dev server.',
    )
  }
  if (
    typeof firebaseConfig.databaseURL !== 'string' ||
    !/^https:\/\/.+\.(firebaseio\.com|firebasedatabase\.app)\/?$/i.test(firebaseConfig.databaseURL.trim())
  ) {
    throw new Error(
      'VITE_FIREBASE_DATABASE_URL is invalid. It must look like https://<db-name>.firebaseio.com or https://<db-name>.<region>.firebasedatabase.app (no extra path).',
    )
  }
  app = initializeApp(firebaseConfig)
  auth = getAuth(app)
  db = getDatabase(app)
} catch (err) {
  firebaseInitError = err
  // Keep exports as null so the app can render an error instead of blank screen.
}

