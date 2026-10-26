import api from './api'

const unwrap = (response) => response.data?.data || response.data

// Must match the prefix on your notification router
const NOTIFICATIONS_PATH = '/notification_recipients/'

// The only place that knows the shape of a notification from the backend.
// Each item is a recipient row with the notification content nested inside it.
export const normalizeNotification = (row) => {
  const n = row.notification ?? {}
  const data = n.meta_data ?? {}
  return {
    ...row, // keeps notification, meta_data and every other field the backend sent
    id: row.id, // the recipient row's id, which mark-as-read uses
    title: n.title ?? '',
    message: n.message ?? '',
    productId: data.product_id ?? null,
    productTitle: data.store_product_name ?? null,
    storeName: data.store_name ?? null,
    productImage: data.product_image ?? null,
    price: data.current_price != null ? Number(data.current_price) : null,
    targetPrice: data.target_price != null ? Number(data.target_price) : null,
    isRead: Boolean(row.is_read),
    createdAt: row.created_at ?? n.created_at ?? null,
  }
}

export const getNotifications = async () => {
  const list = unwrap(await api.get(NOTIFICATIONS_PATH))
  return Array.isArray(list) ? list.map(normalizeNotification) : []
}

export const getUnreadCount = async () => {
  const list = await getNotifications()
  return list.filter((n) => !n.isRead).length
}

export const markNotificationRead = (id) => api.patch(`${NOTIFICATIONS_PATH}${id}/read`)

export const markAllNotificationsRead = () => api.patch(`${NOTIFICATIONS_PATH}read_all`)