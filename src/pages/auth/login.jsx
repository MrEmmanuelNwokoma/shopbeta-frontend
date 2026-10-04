import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { login } from '../../services/auth_service'

import '../../styles/auth-common.css'
import '../../styles/login.css'

function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  })
  const navigate = useNavigate()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const response = await login({
        email: formData.email,
        password: formData.password
      })

      const token = response.data.access_token

      if (formData.rememberMe) {
        localStorage.setItem('token', token)
        sessionStorage.removeItem('token')
      } else {
        sessionStorage.setItem('token', token)
        localStorage.removeItem('token')
      }

      navigate('/categories')
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page login-page">
      {/* LEFT / BRAND PANEL — auth-left (shell) + login-brand-panel (login-specific gradient/padding) */}
      <div className="auth-left login-brand-panel">
        <div className="login-ring login-ring-top-large" />
        <div className="login-ring login-ring-top-small" />
        <div className="login-ring login-ring-bottom-large" />
        <div className="login-ring login-ring-bottom-small" />

        <div className="auth-brand login-brand">
          <svg
            className="login-brand-logo"
            viewBox="0 0 46 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect width="46" height="40" rx="8" fill="rgba(255,255,255,0.2)" />
          </svg>
          <span className="login-brand-name">ShopBeta</span>
        </div>

        <div className="login-brand-content">
          <div className="login-eyebrow">
            <span className="login-eyebrow-line"></span>
            PRICE COMPARISON, SIMPLIFIED
          </div>

          <h1 className="login-brand-heading">Shop smarter, spend less.</h1>

          <p className="login-brand-description">
            Compare prices across Nigeria's top stores in real time and
            never overpay again.
          </p>

          <div className="login-value-points">
            <span>No hidden fees</span>
            <span className="login-value-separator" />
            <span>Real-time updates</span>
            <span className="login-value-separator" />
            <span>Free forever</span>
          </div>

          <div className="login-features">
            <div className="login-feature">
              <div className="login-feature-icon">
                <i className="fa-solid fa-tags"></i>
              </div>
              <h3 className="login-feature-title">Compare</h3>
              <p className="login-feature-description">
                See prices from multiple stores side by side.
              </p>
            </div>

            <div className="login-feature">
              <div className="login-feature-icon">
                <i className="fa-solid fa-bell"></i>
              </div>
              <h3 className="login-feature-title">Track</h3>
              <p className="login-feature-description">
                Get alerts the moment prices drop.
              </p>
            </div>

            <div className="login-feature">
              <div className="login-feature-icon">
                <i className="fa-solid fa-heart"></i>
              </div>
              <h3 className="login-feature-title">Save</h3>
              <p className="login-feature-description">
                Bookmark favorites and revisit anytime.
              </p>
            </div>
          </div>
        </div>

        <div className="login-brand-footer">
          <span>© {new Date().getFullYear()} ShopBeta. All rights reserved.</span>
          <div className="login-brand-footer-points">
            <span>Secure</span>
            <span>·</span>
            <span>Private</span>
          </div>
        </div>
      </div>

      {/* RIGHT / FORM PANEL — auth-right (shell) + login-form-panel (login spacing) */}
      <div className="auth-right login-form-panel">
        <div className="auth-form-container login-form-container">
          <h2 className="login-form-title">Welcome back</h2>
          <p className="login-form-subtitle">Sign in to continue comparing prices.</p>

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="auth-field login-form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                required
              />
            </div>

            <div className="auth-field login-password-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
              />
            </div>

            <div className="login-form-options">
              <label className="login-remember">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                />
                Remember me
              </label>

              <Link to="/forgot-password" style={{ color: '#0066ff', fontWeight: 600, fontSize: '13px', textDecoration: 'none' }}>
                Forgot password?
              </Link>
            </div>

            <div className="login-submit">
              <button
                type="submit"
                className="auth-submit"
                style={{ background: 'linear-gradient(135deg, #0047CC 0%, #0066FF 55%, #00D4FF 100%)' }}
                disabled={loading}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </div>
          </form>

          <p className="login-signup">
            Don't have an account? <Link to="/register">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login