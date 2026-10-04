import api from './api'

const unwrap = (response) => response.data?.data || response.data

// Adjust the path here if your router differs
const FAVORITES_PATH = '/favorites/'

// The only place that knows the shape of a favorite from the backend.
// Change the field names here if your response differs.
export const normalizeFavorite = (fav) => {
  const listing = fav.store_product || {}
  return {
    favoriteId: fav.id,
    storeProductId: fav.store_product_id ?? listing.id,
    name: listing.name ?? fav.name,
    price: listing.price ?? fav.price,
    imageUrl:
      listing.store_product_images?.[0]?.store_product_image_url ?? fav.image_url ?? '',
    storeName: listing.store?.name ?? fav.store_name ?? 'Retail Store',
    productUrl: listing.product_url ?? fav.product_url,
  }
}

export const getFavorites = async () => {
  const list = unwrap(await api.get(FAVORITES_PATH))
  return Array.isArray(list) ? list.map(normalizeFavorite) : []
}

// The user comes from the token, which the api interceptor attaches
export const addFavorite = async (storeProductId) => {
  const response = await api.post(FAVORITES_PATH, {
    store_product_id: storeProductId,
  })
  return unwrap(response)
}

// A 404 means it's already gone (deleted in another tab, say), which is the result we wanted
export const removeFavorite = async (favoriteId) => {
  try {
    await api.delete(`${FAVORITES_PATH}${favoriteId}`)
  } catch (err) {
    if (err.response?.status !== 404) throw err
  }
}

// No clear-all route, so delete each one. allSettled lets every request finish,
// then we report whether any failed.
export const clearFavorites = async (favoriteIds) => {
  const results = await Promise.allSettled(favoriteIds.map((id) => removeFavorite(id)))
  if (results.some((r) => r.status === 'rejected')) {
    throw new Error('Some favorites could not be removed')
  }
}