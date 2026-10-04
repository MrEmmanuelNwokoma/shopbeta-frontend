import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import TopNav from '../components/top_nav'
import { getCurrentUser, logout } from '../services/auth_service'
import { getToken } from '../services/api'
import '../styles/profile.css'

const formatDate = (value) => {
  if (!value) return 'Not available'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Not available'
  return date.toLocaleString('en-NG', { dateStyle: 'medium', timeStyle: 'short' })
}

const formatRole = (role) =>
  String(role || 'user')
    .replace(/_/g, ' ')
    .toLowerCase()

const getInitials = (user) =>
  `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`.toUpperCase() || '?'

function ProfileSkeleton() {
  return (
    <div className="row g-4" aria-hidden="true">
      <div className="col-12 col-lg-4">
        <div className="card h-100 border-0 shadow-sm profile-card">
          <div className="card-body placeholder-glow text-center py-5">
            <span className="placeholder rounded-circle d-block mx-auto mb-3 profile-avatar" />
            <span className="placeholder col-6 mb-2 d-block mx-auto" />
            <span className="placeholder col-4 d-block mx-auto" />
          </div>
        </div>
      </div>
      <div className="col-12 col-lg-8">
        <div className="card h-100 border-0 shadow-sm profile-card">
          <div className="card-body placeholder-glow">
            {Array.from({ length: 4 }).map((_, i) => (
              <span key={i} className="placeholder col-12 mb-4 d-block" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function Profile() {
  const navigate = useNavigate()

  const [user, setUser] = useState(null)
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
        const data = await getCurrentUser()
        if (!cancelled) setUser(data)
      } catch (err) {
        console.error('Failed to fetch current user:', err)
        if (!cancelled) setError("We couldn't load your profile. Try again in a moment.")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [navigate])

  const details = user
    ? [
        { icon: 'ti-mail', label: 'Email', value: user.email },
        { icon: 'ti-phone', label: 'Phone number', value: user.phone_number || 'Not provided' },
        { icon: 'ti-map-pin', label: 'Location', value: user.location || 'Not provided' },
        { icon: 'ti-clock', label: 'Last login', value: formatDate(user.last_login) },
      ]
    : []

  return (
    <div className="profile-page">
      <TopNav />

      <header className="profile-header">
        <div className="container py-4 py-md-5">
          <h1 className="fw-bold mb-1">My Profile</h1>
          <p className="mb-0 profile-subtitle">Your account details</p>
        </div>
      </header>

      <main className="container py-5">
        {error ? (
          <div className="alert alert-danger" role="alert">{error}</div>
        ) : loading ? (
          <ProfileSkeleton />
        ) : (
          <div className="row g-4">
            <div className="col-12 col-lg-4">
              <div className="card h-100 border-0 shadow-sm profile-card">
                <div className="card-body d-flex flex-column align-items-center text-center py-5">
                  <div className="profile-avatar" aria-hidden="true">{getInitials(user)}</div>

                  <h2 className="h5 fw-semibold profile-name mt-3 mb-2">
                    {user.first_name} {user.last_name}
                  </h2>

                  <div className="d-flex flex-wrap justify-content-center gap-2 mb-4">
                    <span className="profile-badge profile-badge--role">{formatRole(user.role)}</span>
                    <span
                      className={`profile-badge ${
                        user.is_email_verified ? 'profile-badge--ok' : 'profile-badge--warn'
                      }`}
                    >
                      {user.is_email_verified ? 'Email verified' : 'Email not verified'}
                    </span>
                  </div>

                  <Link to="/favorites" className="btn profile-btn profile-btn--outline w-100 mb-2">
                    <i className="ti ti-heart" aria-hidden="true" /> My favorites
                  </Link>
                  <button type="button" className="btn profile-btn w-100" onClick={logout}>
                    <i className="ti ti-logout" aria-hidden="true" /> Log out
                  </button>
                </div>
              </div>
            </div>

            <div className="col-12 col-lg-8">
              <div className="card h-100 border-0 shadow-sm profile-card">
                <div className="card-body">
                  <h2 className="h6 fw-semibold profile-section-title mb-3">Account information</h2>
                  <dl className="profile-list mb-0">
                    {details.map((row) => (
                      <div className="profile-row" key={row.label}>
                        <dt className="small text-muted">
                          <i className={`ti ${row.icon}`} aria-hidden="true" /> {row.label}
                        </dt>
                        <dd className="mb-0 fw-semibold profile-value">{row.value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default Profile