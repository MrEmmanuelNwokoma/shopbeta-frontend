import { useCallback, useEffect, useState } from 'react'
import { getToken } from '../services/api'
import { getUnreadCount } from '../services/notification'

const POLL_MS = 60_000
export const NOTIFICATIONS_CHANGED = 'notifications:changed'

export function useUnreadCount(pathname) {
  const [count, setCount] = useState(0)

  const refresh = useCallback(async () => {
    if (!getToken()) {
      setCount(0)
      return
    }
    try {
      setCount(await getUnreadCount())
    } catch (err) {
      console.error('Failed to fetch unread count:', err)
    }
  }, [])

  // Refetch on every route change
  useEffect(() => {
    refresh()
  }, [refresh, pathname])

  // Poll, refetch when the tab regains focus, and react to changes made on the page
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === 'visible') refresh()
    }
    const id = setInterval(refresh, POLL_MS)
    document.addEventListener('visibilitychange', onVisible)
    window.addEventListener(NOTIFICATIONS_CHANGED, refresh)
    return () => {
      clearInterval(id)
      document.removeEventListener('visibilitychange', onVisible)
      window.removeEventListener(NOTIFICATIONS_CHANGED, refresh)
    }
  }, [refresh])

  return count
}