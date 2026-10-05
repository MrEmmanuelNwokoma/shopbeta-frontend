import api from './api'

const unwrap = (response) => response.data?.data || response.data

const ALERTS_PATH = '/price_alerts/'

// The only place that knows the shape of an alert from the backend.
// target_price arrives as a string because it is a Decimal.
export const normalizeAlert = (alert) => {
  const listing = alert.store_product || {}
  return {
    alertId: alert.id,
    storeProductId: alert.store_product_id ?? listing.id,
    storeProductName: alert.store_product_name ?? listing.name ?? 'Product',
    storeName: alert.store_name ?? listing.store?.name ?? '',
    targetPrice: Number(alert.target_price),
    currentPrice: listing.price != null ? Number(listing.price) : null,
    productId: listing.product_id ?? null,
  }
}

export const getPriceAlerts = async () => {
  const list = unwrap(await api.get(ALERTS_PATH))
  return Array.isArray(list) ? list.map(normalizeAlert) : []
}

// The user comes from the token, which the api interceptor attaches
export const createPriceAlert = async (storeProductId, targetPrice) => {
  const response = await api.post(ALERTS_PATH, {
    store_product_id: storeProductId,
    target_price: targetPrice,
  })
  return normalizeAlert(unwrap(response))
}

// A 404 means it is already gone, which is the result we wanted
export const deletePriceAlert = async (alertId) => {
  try {
    await api.delete(`${ALERTS_PATH}${alertId}`)
  } catch (err) {
    if (err.response?.status !== 404) throw err
  }
}