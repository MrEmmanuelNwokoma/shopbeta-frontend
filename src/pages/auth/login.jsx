import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { login } from '../../services/auth_service'

import '../../styles/auth-common.css'
import '../../styles/login.css'

const BRAND_GRADIENT =
  'linear-gradient(135deg, #0047CC 0%, #0066FF 55%, #00D4FF 100%)'



const BRAND_BLUE = '#0066FF'

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
      localStorage.setItem('token', response.data.access_token)
      navigate('/home')
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="auth-page"
      style={{ '--brand-gradient': BRAND_GRADIENT }}
    >
      {/* =====================================================
          LEFT / BRAND PANEL
          ===================================================== */}

      <div
        className="auth-left"
        style={{ background: BRAND_GRADIENT }}
      >
        {/* Decorative circles */}
        <div className="auth-circle auth-circle-top-large" />
        <div className="auth-circle auth-circle-top-small" />
        <div className="auth-circle auth-circle-bottom-large" />
        <div className="auth-circle auth-circle-bottom-small" />

        <div className="auth-left-content">

          {/* Brand */}
          <div className="auth-brand">
            <svg
              width="46"
              height="40"
              viewBox="0 17 100 86"
              aria-hidden="true"
            >
              <path
                d="M 35 24 Q 7 24 7 42 Q 7 56 35 58 Q 63 60 63 78 Q 63 96 33 96"
                fill="none"
                stroke="#99BFFF"
                strokeWidth="14"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              <rect
                x="56"
                y="24"
                width="14"
                height="72"
                rx="7"
                fill="#ffffff"
              />

              <path
                d="M 70 24 Q 89 24 89 42 Q 89 56 70 58"
                fill="none"
                stroke="#ffffff"
                strokeWidth="14"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              <path
                d="M 70 58 Q 93 60 93 78 Q 93 96 70 96 L 40 96"
                fill="none"
                stroke="#ffffff"
                strokeWidth="14"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>

            <span>
              Shop<span>Beta</span>
            </span>
          </div>

          {/* Hero */}
          <div className="auth-hero">

            <div className="auth-eyebrow">
              <span />
              SHOP SMARTER
            </div>

            <h1>
              Find the right price.
              <br />
              Make the smarter choice.
            </h1>

            <p>
              Compare prices from your favourite Nigerian stores in one
              place. Track products you care about and know when the
              price drops.
            </p>

          </div>

          {/* Features */}
          <div className="auth-features">

            <div className="auth-feature">
              <div className="auth-feature-icon">
                <i
                  className="ti ti-tag"
                  aria-hidden="true"
                />
              </div>

              <div className="auth-feature-title">
                Compare
              </div>

              <div className="auth-feature-description">
                See prices across stores
              </div>
            </div>

            <div className="auth-feature">
              <div className="auth-feature-icon">
                <i
                  className="ti ti-bell"
                  aria-hidden="true"
                />
              </div>

              <div className="auth-feature-title">
                Track
              </div>

              <div className="auth-feature-description">
                Watch prices over time
              </div>
            </div>

            <div className="auth-feature">
              <div className="auth-feature-icon">
                <i
                  className="ti ti-heart"
                  aria-hidden="true"
                />
              </div>

              <div className="auth-feature-title">
                Save
              </div>

              <div className="auth-feature-description">
                Keep favourites together
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* =====================================================
          RIGHT / LOGIN FORM
          ===================================================== */}

      <div className="auth-right">

        <div className="auth-form-container">

          <div className="auth-heading">

            <h2 style={{ color: BRAND_BLUE }}>
              Welcome back
            </h2>

            <p>
              Sign in to continue saving
            </p>

          </div>

          {error && (
            <div className="auth-error">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>

            {/* Email */}
            <div className="auth-field">
              <label htmlFor="email">
                Email address
              </label>

              <input
                id="email"
                type="email"
                name="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            {/* Password */}
            <div className="auth-field">
              <label htmlFor="password">
                Password
              </label>

              <input
                id="password"
                type="password"
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            {/* Remember / Forgot */}
            <div className="login-options">

              <label className="remember-me">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                />

                <span>
                  Remember me
                </span>
              </label>

              <Link to="/forgot-password">
                Forgot password?
              </Link>

            </div>

            {/* Submit */}
            <button
              type="submit"
              className="auth-submit"
              disabled={loading}
              style={{ background: BRAND_GRADIENT }}
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>

          </form>

          {/* Register */}
          <p className="auth-switch">
            Don't have an account?{' '}

            <Link to="/register">
              Sign up
            </Link>
          </p>

        </div>

      </div>
    </div>
  )
}

export default Login