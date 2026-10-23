import { initializeApp } from 'firebase/app'
import { getMessaging, isSupported } from 'firebase/messaging'

export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

export const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY

// False until every value is in .env, so the page can hide the push controls instead of crashing
export const isPushConfigured = Boolean(
  firebaseConfig.apiKey &&
    firebaseConfig.projectId &&
    firebaseConfig.messagingSenderId &&
    firebaseConfig.appId &&
    vapidKey
)

let messagingPromise = null

// Resolves to the messaging object, or null where the browser can't do push
export const getMessagingIfSupported = () => {
  if (!isPushConfigured) return Promise.resolve(null)
  if (!messagingPromise) {
    messagingPromise = isSupported()
      .then((ok) => (ok ? getMessaging(initializeApp(firebaseConfig)) : null))
      .catch(() => null)
  }
  return messagingPromise
}