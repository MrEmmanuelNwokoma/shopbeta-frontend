import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import TopNav from '../components/top_nav'
import { getToken } from '../services/api'
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from '../services/notification'
import { NOTIFICATIONS_CHANGED } from '../hooks/notification_hooks'
import '../styles/notification.css'
import PushToggle from '../components/push_toggle'

const formatNaira = (value) =>
  `₦${Number(value).toLocaleString('en-NG', { maximumFractionDigits: 2 })}`

// Timestamps arrive without a timezone, so treat them as UTC
const parseDate = (value) => {
  if (!value) return null
  const hasZone = /[zZ]|[+-]\d{2}:?\d{2}$/.test(value)
  const date = new Date(hasZone ? value : `${value}Z`)
  return Number.isNaN(date.getTime()) ? null : date
}

const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })

const timeAgo = (date) => {
  if (!date) return ''
  const diff = (date.getTime() - Date.now()) / 1000
  const abs = Math.abs(diff)
  if (abs < 60) return 'Just now'
  if (abs < 3600) return rtf.format(Math.round(diff / 60), 'minute')
  if (abs < 86400) return rtf.format(Math.round(diff / 3600), 'hour')
  if (abs < 604800) return rtf.format(Math.round(diff / 86400), 'day')
  return date.toLocaleDateString('en-NG', { dateStyle: 'medium' })
}

const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()

const groupLabel = (date) => {
  if (!date) return 'Earlier'
  const days = Math.round((startOfDay(new Date()) - startOfDay(date)) / 86400000)
  if (days <= 0) return 'Today'
  if (days === 1) return 'Yesterday'
  return 'Earlier'
}

const KINDS = {
  drop: { icon: 'ti-trending-down', headline: 'Price dropped' },
  hit: { icon: 'ti-target-arrow', headline: 'Target price reached' },
  rise: { icon: 'ti-trending-up', headline: 'Price went up' },
  info: { icon: 'ti-bell', headline: 'Price alert' },
}

// First non-empty value among the given keys, looking through each source in order
const pick = (sources, keys) => {
  for (const source of sources) {
    if (!source || typeof source !== 'object') continue
    for (const key of keys) {
      const value = source[key]
      if (value !== undefined && value !== null && value !== '') return value
    }
  }
  return null
}

const toNumber = (value) => {
  if (value === null || value === undefined || value === '') return null
  const num = Number(value)
  return Number.isFinite(num) ? num : null
}

// Turns one row from the backend into what the page displays.
// The details can live in the nested notification's meta_data, on the item itself,
// or as flattened fields, so every place is checked.
const resolve = (n) => {
  const notif = n.notification || {}
  const sources = [notif.meta_data, n.meta_data, n.meta, n.data, n]

  let price = toNumber(pick(sources, ['current_price', 'price']))
  let targetPrice = toNumber(pick(sources, ['target_price', 'targetPrice']))

  // Last resort: read the two numbers out of the message text
  if (price == null || targetPrice == null) {
    const messageText = notif.message || n.message || ''
    const nums = (messageText.match(/\d+(?:\.\d+)?/g) || []).map(Number)
    if (nums.length >= 2) [price, targetPrice] = nums
  }

  let kind = 'info'
  if (price != null && targetPrice != null) {
    kind = price < targetPrice ? 'drop' : price > targetPrice ? 'rise' : 'hit'
  }

  return {
    price,
    targetPrice,
    kind,
    productTitle: pick(sources, ['store_product_name', 'product_name', 'product_title', 'productTitle']),
    storeName: pick(sources, ['store_name', 'storeName']),
    productImage: pick(sources, ['product_image', 'image_url', 'imageUrl', 'productImage', 'image']),
    productId: pick(sources, ['product_id', 'productId']),
    isRead: Boolean(n.is_read ?? n.isRead),
    createdAt: n.created_at ?? n.createdAt ?? notif.created_at ?? null,
    message: notif.message ?? n.message ?? '',
  }
}

function Notifications() {
  const navigate = useNavigate()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    if (!getToken()) {
      navigate('/login', { replace: true })
      return
    }

    let cancelled = false

    const load = async () => {
      try {
        const list = await getNotifications()
        if (!cancelled) setItems(list)
      } catch (err) {
        console.error('Failed to fetch notifications:', err)
        if (!cancelled) setError("We couldn't load your notifications. Try again in a moment.")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [navigate])

  const notifyChanged = () => window.dispatchEvent(new Event(NOTIFICATIONS_CHANGED))

  const setReadState = (ids, value) => {
    const idSet = new Set(ids)
    setItems((list) =>
      list.map((n) => (idSet.has(n.id) ? { ...n, is_read: value, isRead: value } : n))
    )
  }

  const handleOpen = async (item) => {
    if (!item.isRead) {
      setReadState([item.id], true)
      try {
        await markNotificationRead(item.id)
        notifyChanged()
      } catch (err) {
        console.error('Failed to mark notification as read:', err)
        setReadState([item.id], false)
      }
    }
    if (item.productId) navigate(`/products/${item.productId}/compare`)
  }

  const handleMarkAll = async () => {
    const unreadIds = items.filter((n) => !Boolean(n.is_read ?? n.isRead)).map((n) => n.id)

    setError(null)
    setReadState(unreadIds, true)
    try {
      await markAllNotificationsRead()
      notifyChanged()
    } catch (err) {
      console.error('Failed to mark all as read:', err)
      setReadState(unreadIds, false)
      setError("We couldn't mark them as read. Try again.")
    }
  }

  const unread = useMemo(
    () => items.filter((n) => !Boolean(n.is_read ?? n.isRead)).length,
    [items]
  )

  const groups = useMemo(() => {
    const rows = items
      .map((n) => ({ ...n, ...resolve(n) }))
      .filter((n) => filter === 'all' || !n.isRead)
      .map((n) => ({ ...n, date: parseDate(n.createdAt) }))
      .sort((a, b) => (b.date?.getTime() ?? 0) - (a.date?.getTime() ?? 0))

    const order = ['Today', 'Yesterday', 'Earlier']
    return order
      .map((label) => ({ label, rows: rows.filter((r) => groupLabel(r.date) === label) }))
      .filter((g) => g.rows.length > 0)
  }, [items, filter])

  return (
    <div className="notifications-page">
      <TopNav />

      <header className="notifications-header">
        <div className="container py-4">
          <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
            <div>
              <h1 className="fw-bold mb-1">Notifications</h1>
              <p className="mb-0 notifications-subtitle">
                {loading || error
                  ? 'Your price alerts'
                  : unread === 0
                    ? 'You are all caught up'
                    : `${unread} unread price alert${unread === 1 ? '' : 's'}`}
              </p>
            </div>
            {!loading && unread > 0 && (
              <button type="button" className="btn notifications-mark-btn" onClick={handleMarkAll}>
                <i className="ti ti-checks me-2" aria-hidden="true" />
                Mark all as read
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="container notifications-main">
        <PushToggle />
        {error && <div className="alert alert-danger" role="alert">{error}</div>}

        {!loading && items.length > 0 && (
          <div className="notifications-filter" role="tablist" aria-label="Filter notifications">
            {['all', 'unread'].map((f) => (
              <button
                key={f}
                type="button"
                role="tab"
                aria-selected={filter === f}
                className={`notifications-filter-btn${filter === f ? ' active' : ''}`}
                onClick={() => setFilter(f)}
              >
                {f === 'all' ? 'All' : `Unread${unread ? ` (${unread})` : ''}`}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="card border-0 notifications-card" role="status">
            <span className="visually-hidden">Loading notifications</span>
            <div className="card-body placeholder-glow" aria-hidden="true">
              {[0, 1, 2].map((i) => (
                <div key={i} className="d-flex gap-3 align-items-center py-3">
                  <span className="placeholder rounded-circle" style={{ width: 44, height: 44 }} />
                  <div className="flex-grow-1">
                    <span className="placeholder col-4 mb-2 d-block" />
                    <span className="placeholder col-7 d-block" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : groups.length === 0 ? (
          !error && (
            <div className="notifications-empty">
              <span className="notifications-empty-icon">
                <i className="ti ti-bell-off" aria-hidden="true" />
              </span>
              <h2 className="h5 fw-semibold mb-1">
                {filter === 'unread' ? 'Nothing unread' : 'No notifications yet'}
              </h2>
              <p className="text-muted mb-0">
                {filter === 'unread'
                  ? 'Switch to All to see past alerts.'
                  : 'When a price alert you set is reached, you will see it here.'}
              </p>
            </div>
          )
        ) : (
          groups.map((group) => (
            <section key={group.label} className="notifications-group">
              <h2 className="notifications-group-title">{group.label}</h2>
              <div className="card border-0 notifications-card">
                <ul className="list-unstyled mb-0">
                  {group.rows.map((item) => {
                    const meta = KINDS[item.kind]
                    return (
                      <li key={item.id}>
                        <button
                          type="button"
                          className={`notifications-item${item.isRead ? '' : ' notifications-item--unread'}`}
                          onClick={() => handleOpen(item)}
                        >
                          <div className="notifications-thumb-wrapper">
                            {item.productImage ? (
                              <img src={item.productImage} alt="" className="notifications-product-img" />
                            ) : (
                              <span className={`notifications-icon notifications-icon--${item.kind}`}>
                                <i className={`ti ${meta.icon}`} aria-hidden="true" />
                              </span>
                            )}
                          </div>

                          <span className="notifications-body">
                            <div className="d-flex align-items-center justify-content-between gap-2">
                              <span className="notifications-headline">
                                {meta.headline}
                                {!item.isRead && <span className="visually-hidden"> (unread)</span>}
                              </span>
                              {item.storeName && (
                                <span className="notifications-store-badge">{item.storeName}</span>
                              )}
                            </div>

                            {item.productTitle && (
                              <span className="notifications-product-title">{item.productTitle}</span>
                            )}

                            {item.price != null && (
                              <span className="notifications-prices">
                                <span className="notifications-price">{formatNaira(item.price)}</span>
                                {item.targetPrice != null && (
                                  <span className="notifications-target">
                                    Target {formatNaira(item.targetPrice)}
                                  </span>
                                )}
                              </span>
                            )}

                            <span
                              className="notifications-time"
                              title={item.date ? item.date.toLocaleString('en-NG') : undefined}
                            >
                              {timeAgo(item.date)}
                            </span>
                          </span>

                          {!item.isRead && <span className="notifications-dot" aria-hidden="true" />}
                          {item.productId && (
                            <i className="ti ti-chevron-right notifications-chevron" aria-hidden="true" />
                          )}
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </div>
            </section>
          ))
        )}
      </main>
    </div>
  )
}

export default Notifications