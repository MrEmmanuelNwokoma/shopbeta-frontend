import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import TopNav from '../components/top_nav'
import api, { getToken } from '../services/api'
import { getFavorites, addFavorite, removeFavorite } from '../services/favorites_service'
import '../styles/product_compare.css'

function CompareSkeletons() {
  return Array.from({ length: 3 }).map((_, i) => (
    <div className="col" key={i}>
      <div className="card h-100 border-0 shadow-sm" aria-hidden="true">
        <div className="product-compare-thumb placeholder-glow">
          <span className="placeholder w-100 h-100" />
        </div>
        <div className="card-body placeholder-glow">
          <span className="placeholder col-8 mb-2 d-block" />
          <span className="placeholder col-4 mb-3 d-block" />
          <span className="placeholder col-12 d-block" style={{ height: '2.5rem' }} />
        </div>
      </div>
    </div>
  ))
}

function ProductCompareDetail() {
  const { productId } = useParams()
  const navigate = useNavigate()

  const [productDetails, setProductDetails] = useState({})
  const [storeProducts, setStoreProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [favoritesMap, setFavoritesMap] = useState({}) // store_product_id -> favorite_id
  const [pending, setPending] = useState({})

  // Rebuilds the map from the backend, so it always matches what is saved
  const loadFavoritesMap = async () => {
    const list = await getFavorites()
    const map = {}
    list.forEach((fav) => {
      map[fav.storeProductId] = fav.favoriteId
    })
    setFavoritesMap(map)
  }

  useEffect(() => {
    const fetchPriceComparisons = async () => {
      try {
        setLoading(true)
        const response = await api.get(`/products/${productId}/compare_stores`)

        const productObj = response.data?.data || response.data || {}
        setProductDetails(productObj)
        const stores = Array.isArray(productObj.stores) ? productObj.stores : []
        setStoreProducts(stores)

        // A failed favorites call shouldn't break the comparison page
        if (getToken()) {
          try {
            await loadFavoritesMap()
          } catch (favErr) {
            console.error('Failed to load favorites:', favErr)
          }
        }
      } catch (err) {
        console.error('Failed to fetch price comparisons:', err)
        setError('Failed to load store price comparisons for this product.')
      } finally {
        setLoading(false)
      }
    }

    if (productId) {
      fetchPriceComparisons()
    }
  }, [productId])

  const handleToggleFavorite = async (item) => {
    if (!getToken()) {
      navigate('/login')
      return
    }

    const key = item.id
    if (pending[key]) return
    setPending((prev) => ({ ...prev, [key]: true }))

    try {
      const favoriteId = favoritesMap[key]
      if (favoriteId) {
        await removeFavorite(favoriteId)
        setFavoritesMap((prev) => {
          const next = { ...prev }
          delete next[key]
          return next
        })
      } else {
        await addFavorite(key)
        await loadFavoritesMap() // picks up the new favorite's id
      }
    } catch (err) {
      console.error('Failed to update favorite:', err)
      // Resync so the hearts match what the server actually has
      try {
        await loadFavoritesMap()
      } catch {
        /* keep the current hearts */
      }
    } finally {
      setPending((prev) => ({ ...prev, [key]: false }))
    }
  }

  const brandName = productDetails.brand?.name || ''
  const productName = productDetails.display_name || productDetails.model || 'Product Comparison'

  return (
    <div className="product-compare-page">
      <TopNav />

      <header className="product-compare-header">
        <div className="container py-4 py-md-5">
          <button
            type="button"
            className="product-compare-back small"
            onClick={() => navigate(-1)}
          >
            <i className="ti ti-chevron-left" aria-hidden="true" /> Back
          </button>
          {!loading && !error && brandName && (
            <div className="product-compare-brand small text-uppercase mt-3">{brandName}</div>
          )}
          {!loading && !error && (
            <h1 className="fw-bold mt-2 mb-1">{productName}</h1>
          )}
        </div>
      </header>

      <main className="container py-5">
        {error ? (
          <div className="alert alert-danger" role="alert">{error}</div>
        ) : (
          <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
            {loading ? (
              <CompareSkeletons />
            ) : storeProducts.length === 0 ? (
              <div className="col-12 text-center text-muted py-5">
                No store listings found for this product yet.
              </div>
            ) : (
              storeProducts.map((item, index) => {
                const storeObj = item.store || {}
                const imageUrl =
                  item.store_product_images?.[0]?.store_product_image_url ||
                  productDetails.product_image?.store_product_image_url
                const storeListingName = item.name || productName
                const formattedPrice =
                  typeof item.price === 'number'
                    ? `₦${item.price.toLocaleString('en-NG')}`
                    : item.price
                      ? `₦${item.price}`
                      : 'N/A'

                const isFav = Boolean(favoritesMap[item.id])

                return (
                  <div className="col" key={item.id || index}>
                    <div
                      className={`card h-100 border-0 shadow-sm product-compare-card ${
                        item.is_best_price ? 'product-compare-card--best' : ''
                      }`}
                    >
                      <div className="product-compare-card-top">
                        <span className="product-compare-store small fw-semibold text-uppercase">
                          {storeObj.name || 'Retail Store'}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleToggleFavorite(item)}
                          disabled={Boolean(pending[item.id])}
                          className={`product-compare-fav ${isFav ? 'active' : ''}`}
                          aria-pressed={isFav}
                          aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
                          title={isFav ? 'Remove from favorites' : 'Add to favorites'}
                        >
                          <i className={`ti ${isFav ? 'ti-heart-filled' : 'ti-heart'}`} aria-hidden="true" />
                        </button>
                      </div>

                      <div className="product-compare-thumb">
                        {item.is_best_price && (
                          <span className="product-compare-badge">Best Price</span>
                        )}
                        {imageUrl ? (
                          <img src={imageUrl} alt={storeListingName} loading="lazy" />
                        ) : (
                          <i className="ti ti-device-laptop product-compare-thumb-icon" aria-hidden="true" />
                        )}
                      </div>

                      <div className="card-body d-flex flex-column">
                        <h2 className="h6 fw-semibold product-compare-title">{storeListingName}</h2>
                        <div className="product-compare-price">{formattedPrice}</div>
                        <a
                          href={item.product_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn product-compare-btn mt-auto"
                        >
                          Go to Store →
                        </a>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        )}
      </main>
    </div>
  )
}

export default ProductCompareDetail