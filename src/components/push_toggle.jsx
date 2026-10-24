import { useState, useEffect } from 'react'
import { getToken as getLoginToken } from '../services/api'
import {
  pushStatus,
  enablePush,
  disablePush,
  syncPush,
  listenForForegroundMessages,
} from '../services/push_service'

function PushToggle() {
  const [status, setStatus] = useState('loading')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!getLoginToken()) {
      setStatus('unsupported')
      return undefined
    }

    let cancelled = false
    let stopListening = () => {}

    const init = async () => {
      try {
        await syncPush()
      } catch (err) {
        console.error('Failed to sync push token:', err)
      }
      const current = await pushStatus()
      if (!cancelled) setStatus(current)

      stopListening = await listenForForegroundMessages()
      if (cancelled) stopListening()
    }

    init()
    return () => {
      cancelled = true
      stopListening()
    }
  }, [])

  const handleEnable = async () => {
    setBusy(true)
    setError(null)
    try {
      setStatus(await enablePush())
    } catch (err) {
      console.error('Failed to enable push:', err)
      // TEMPORARY: show the real error on screen so it can be read on a phone
      const httpStatus = err.response?.status
      const detail = err.response?.data?.detail
      setError(
        `${err.code || err.name}: ${err.message}` +
          (httpStatus ? ` | HTTP ${httpStatus}` : '') +
          (detail ? ` | ${JSON.stringify(detail)}` : '')
      )
    } finally {
      setBusy(false)
    }
  }

  const handleDisable = async () => {
    setBusy(true)
    setError(null)
    try {
      await disablePush()
      setStatus(await pushStatus())
    } catch (err) {
      console.error('Failed to disable push:', err)
      setError("We couldn't turn off push alerts. Try again.")
    } finally {
      setBusy(false)
    }
  }

  if (status === 'loading') return null

  return (
    <div className="notifications-push">
      <div className="notifications-push-text">
        <i className="ti ti-device-mobile-message" aria-hidden="true" />
        <span>
          {status === 'enabled' && 'Push alerts are on for this device.'}
          {status === 'off' && 'Get a push alert on this device when a price is reached.'}
          {status === 'denied' &&
            'Push alerts are blocked. Allow notifications for this site in your browser settings.'}
          {status === 'unsupported' && 'Push alerts are not available in this browser.'}
        </span>
      </div>

      {status === 'off' && (
        <button type="button" className="notifications-push-btn" onClick={handleEnable} disabled={busy}>
          {busy ? 'Turning on...' : 'Turn on'}
        </button>
      )}
      {status === 'enabled' && (
        <button
          type="button"
          className="notifications-push-btn notifications-push-btn--ghost"
          onClick={handleDisable}
          disabled={busy}
        >
          {busy ? 'Turning off...' : 'Turn off'}
        </button>
      )}

      {error && (
        <div className="small text-danger w-100" role="alert">
          {error}
        </div>
      )}
    </div>
  )
}

export default PushToggle