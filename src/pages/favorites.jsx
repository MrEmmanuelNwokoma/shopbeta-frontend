import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import TopNav from '../components/top_nav'
import { getToken } from '../services/api'
import { getFavorites, removeFavorite, clearFavorites } from '../services/favorites_service'
import '../styles/favorites.css'

function FavoritesSkeletons() {
  return Array.from({ length: 4 }).map((_, i) => (
    <div className="col" key={i}>
      <div className="card h-100 border-0 shadow-sm" aria-hidden="true">
        <div className="favorites-thumb placeholder-glow">
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

const formatPrice = (price) =>
  typeof price === 'number'
    ? `₦${price.toLocaleString('en-NG')}`
    : price
      ? `₦${price}`
      : 'N/A'

function Favorites() {
  const navigate = useNavigate()
  const [favoriteItems, setFavoriteItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!getToken()) {
      navigate('/login', { replace: true })
      return
    }

    let cancelled = false

    const load = async () => {
      try {
        const list = await getFavorites()
        if (!cancelled) setFavoriteItems(list)
      } catch (err) {
        console.error('Failed to fetch favorites:', err)
        if (!cancelled) setError("We couldn't load your favorites. Try again in a moment.")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [navigate])

  const handleRemove = async (e, favoriteId) => {
    e.stopPropagation()
    e.preventDefault()
    setError(null)

    const previous = favoriteItems
    setFavoriteItems((items) => items.filter((item) => item.favoriteId !== favoriteId))

    try {
      await removeFavorite(favoriteId)
    } catch (err) {
      console.error('Failed to remove favorite:', err)
      setFavoriteItems(previous)
      setError("We couldn't remove that favorite. Try again.")
    }
  }

  const handleClearAll = async () => {
    setError(null)
    const ids = favoriteItems.map((item) => item.favoriteId)
    setFavoriteItems([])

    try {
      await clearFavorites(ids)
    } catch (err) {
      console.error('Failed to clear favorites:', err)
      setError("We couldn't clear all your favorites. Try again.")
      // Some may have been deleted, so show what the server actually has
      try {
        setFavoriteItems(await getFavorites())
      } catch {
        /* keep the list empty */
      }
    }
  }

  return (
    <div className="favorites-page">
      <TopNav />

      <header className="favorites-header">
        <div className="container py-4 py-md-5">
          <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
            <div>
              <h1 className="fw-bold mb-1">My Saved Products</h1>
              <p className="mb-0 favorites-subtitle">Quick access to your compared store deals</p>
            </div>
            {!loading && favoriteItems.length > 0 && (
              <button type="button" onClick={handleClearAll} className="btn favorites-clear-btn">
                Clear All
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="container py-5">
        {error && (
          <div className="alert alert-danger" role="alert">{error}</div>
        )}

        {loading ? (
          <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-3 row-cols-xl-4 g-4">
            <FavoritesSkeletons />
          </div>
        ) : favoriteItems.length === 0 ? (
          !error && (
            <div className="text-center text-muted py-5">
              <h2 className="h5 fw-semibold favorites-empty-title">No Saved Favorites Yet</h2>
              <p className="mb-3">
                Browse products and click the heart icon on any store listing to save items here.
              </p>
              <button type="button" className="btn favorites-btn" onClick={() => navigate('/')}>
                Explore Products
              </button>
            </div>
          )
        ) : (
          <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-3 row-cols-xl-4 g-4">
            {favoriteItems.map((item) => (
              <div className="col" key={item.favoriteId}>
                <div className="card h-100 border-0 shadow-sm favorites-card">
                  <div className="favorites-card-top">
                    <span className="favorites-store small fw-semibold text-uppercase">
                      {item.storeName}
                    </span>
                    <button
                      type="button"
                      className="favorites-remove"
                      onClick={(e) => handleRemove(e, item.favoriteId)}
                      title="Remove from favorites"
                      aria-label="Remove from favorites"
                    >
                      <i className="ti ti-heart-filled" aria-hidden="true" />
                    </button>
                  </div>

                  <div className="favorites-thumb">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.name} loading="lazy" />
                    ) : (
                      <i className="ti ti-device-laptop favorites-thumb-icon" aria-hidden="true" />
                    )}
                  </div>

                  <div className="card-body d-flex flex-column">
                    <h2 className="h6 fw-semibold favorites-title">{item.name}</h2>
                    <div className="favorites-price">{formatPrice(item.price)}</div>
                    <a
                      href={item.productUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn favorites-btn mt-auto"
                    >
                      Go to Store →
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

export default Favorites
