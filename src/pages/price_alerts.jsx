import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import TopNav from '../components/top_nav'
import { getToken } from '../services/api'
import { getPriceAlerts, deletePriceAlert } from '../services/price_alert_service'
import '../styles/price_alert.css'

const formatNaira = (value) => `₦${Number(value).toLocaleString('en-NG')}`

function PriceAlerts() {
  const navigate = useNavigate()
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [removing, setRemoving] = useState({})

  useEffect(() => {
    if (!getToken()) {
      navigate('/login', { replace: true })
      return
    }

    let cancelled = false

    const load = async () => {
      try {
        const list = await getPriceAlerts()
        if (!cancelled) setAlerts(list)
      } catch (err) {
        console.error('Failed to fetch price alerts:', err)
        if (!cancelled) setError("We couldn't load your price alerts. Try again in a moment.")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [navigate])

  const handleRemove = async (alertId) => {
    if (removing[alertId]) return
    setError(null)
    setRemoving((prev) => ({ ...prev, [alertId]: true }))

    try {
      await deletePriceAlert(alertId)
      setAlerts((items) => items.filter((a) => a.alertId !== alertId))
    } catch (err) {
      console.error('Failed to remove price alert:', err)
      setError("We couldn't remove that alert. Try again.")
    } finally {
      setRemoving((prev) => ({ ...prev, [alertId]: false }))
    }
  }

  return (
    <div className="price-alerts-page">
      <TopNav />

      <header className="price-alerts-header">
        <div className="container py-4 py-md-5">
          <Link to="/profile" className="price-alerts-back small">
            <i className="ti ti-chevron-left" aria-hidden="true" /> Profile
          </Link>
          <h1 className="fw-bold mt-2 mb-1">My Price Alerts</h1>
          {!loading && !error && (
            <p className="mb-0 price-alerts-subtitle">
              {alerts.length.toLocaleString('en-NG')} {alerts.length === 1 ? 'alert' : 'alerts'} set
            </p>
          )}
        </div>
      </header>

      <main className="container py-5">
        {error && <div className="alert alert-danger" role="alert">{error}</div>}

        {loading ? (
          <div className="card border-0 shadow-sm price-alerts-card" aria-hidden="true">
            <div className="card-body placeholder-glow">
              <span className="placeholder col-12 mb-4 d-block" />
              <span className="placeholder col-12 mb-4 d-block" />
              <span className="placeholder col-12 d-block" />
            </div>
          </div>
        ) : alerts.length === 0 ? (
          !error && (
            <div className="text-center text-muted py-5">
              <h2 className="h5 fw-semibold price-alerts-empty-title">No price alerts yet</h2>
              <p className="mb-3">
                Open a product comparison and tap "Set price alert" on a store listing.
              </p>
              <Link to="/categories" className="btn price-alerts-btn">
                Browse categories
              </Link>
            </div>
          )
        ) : (
          <div className="card border-0 shadow-sm price-alerts-card">
            <ul className="list-unstyled mb-0">
              {alerts.map((alert) => (
                <li className="price-alerts-row" key={alert.alertId}>
                  <div className="price-alerts-info">
                    {alert.storeName && (
                      <div className="price-alerts-store small fw-semibold text-uppercase">
                        {alert.storeName}
                      </div>
                    )}
                    <div className="fw-semibold price-alerts-name">{alert.storeProductName}</div>
                    <div className="small text-muted">
                      Alert at <strong>{formatNaira(alert.targetPrice)}</strong>
                      {alert.currentPrice != null && <> · Now {formatNaira(alert.currentPrice)}</>}
                    </div>
                  </div>

                  <div className="price-alerts-actions">
                    {alert.productId && (
                      <Link
                        to={`/products/${alert.productId}/compare`}
                        className="price-alerts-link"
                      >
                        View
                      </Link>
                    )}
                    <button
                      type="button"
                      className="price-alerts-link price-alerts-link--danger"
                      onClick={() => handleRemove(alert.alertId)}
                      disabled={Boolean(removing[alert.alertId])}
                    >
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </main>
    </div>
  )
}

export default PriceAlerts