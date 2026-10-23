import { getToken, deleteToken, onMessage } from 'firebase/messaging'
import {
  firebaseConfig,
  vapidKey,
  isPushConfigured,
  getMessagingIfSupported,
} from '../firebase'
import { registerDeviceToken, removeDeviceToken } from './device_service.'
import { NOTIFICATIONS_CHANGED } from '../hooks/notification_hooks'

// Remembers this browser's token so logout can remove it from the backend
const TOKEN_KEY = 'shopbeta_push_token'

const browserCanPush = () =>
  isPushConfigured && 'Notification' in window && 'serviceWorker' in navigator

const registerWorker = () => {
  const query = new URLSearchParams({
    apiKey: firebaseConfig.apiKey,
    projectId: firebaseConfig.projectId,
    messagingSenderId: firebaseConfig.messagingSenderId,
    appId: firebaseConfig.appId,
  }).toString()
  return navigator.serviceWorker.register(`/firebase-messaging-sw.js?${query}`)
}

// Gets this device's token from Firebase and saves it for the logged-in user
const subscribeDevice = async (messaging) => {
  const registration = await registerWorker()
  const token = await getToken(messaging, { vapidKey, serviceWorkerRegistration: registration })
  if (!token) throw new Error('No push token was returned.')
  await registerDeviceToken(token)
  localStorage.setItem(TOKEN_KEY, token)
}

// 'unsupported' | 'denied' | 'off' | 'enabled'
export const pushStatus = async () => {
  if (!browserCanPush()) return 'unsupported'
  const messaging = await getMessagingIfSupported()
  if (!messaging) return 'unsupported'
  if (Notification.permission === 'denied') return 'denied'
  if (Notification.permission === 'granted' && localStorage.getItem(TOKEN_KEY)) return 'enabled'
  return 'off'
}

// Must run from a click, because the browser only allows the permission prompt after a user action
export const enablePush = async () => {
  const messaging = await getMessagingIfSupported()
  if (!messaging) throw new Error('Push is not supported in this browser.')

  const permission = await Notification.requestPermission()
  if (permission !== 'granted') return 'denied'

  await subscribeDevice(messaging)
  return 'enabled'
}

// Re-saves the token when permission was already given, for example after another user logs in here
export const syncPush = async () => {
  if (!browserCanPush() || Notification.permission !== 'granted') return
  const messaging = await getMessagingIfSupported()
  if (!messaging) return
  await subscribeDevice(messaging)
}

// Removes this device from the backend. Call it before the login token is cleared.
export const disablePush = async () => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (!token) return

  try {
    await removeDeviceToken(token)
  } finally {
    localStorage.removeItem(TOKEN_KEY)
  }

  try {
    const messaging = await getMessagingIfSupported()
    if (messaging) await deleteToken(messaging)
  } catch {
    /* the backend row is already gone, so a failed local cleanup is harmless */
  }
}

// While the site is open and visible, push messages arrive here. Refresh the nav badge.
export const listenForForegroundMessages = async () => {
  const messaging = await getMessagingIfSupported()
  if (!messaging) return () => {}
  return onMessage(messaging, () => window.dispatchEvent(new Event(NOTIFICATIONS_CHANGED)))
}