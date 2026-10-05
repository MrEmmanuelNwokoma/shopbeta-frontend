import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { login } from '../../services/auth_service'

import '../../styles/login.css'

function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

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
        password: formData.password,
      })

      const token = response.data.access_token

      if (formData.rememberMe) {
        localStorage.setItem('token', token)
        sessionStorage.removeItem('token')
      } else {
        sessionStorage.setItem('token', token)
        localStorage.removeItem('token')
      }

      navigate('/home')
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <section className="login-hero">
        <div className="container">
          <Link to="/" className="login-brand text-white text-decoration-none fw-bold fs-4">
            ShopBeta
          </Link>

          <div className="row align-items-center g-5 login-row">
            {/* Pitch, same voice as the home hero */}
            <div className="col-lg-6 text-white text-center text-lg-start">
              <h1 className="login-hero-title fw-bold mb-3">Shop smarter, spend less.</h1>
              <p className="lead mb-4">
                Sign in to track prices, save favourites, and get alerts when Nigerian
                stores drop their prices.
              </p>

              <ul className="list-unstyled login-perks mb-0">
                <li>
                  <i className="ti ti-tag" aria-hidden="true" />
                  <span>Compare prices across stores side by side</span>
                </li>
                <li>
                  <i className="ti ti-bell" aria-hidden="true" />
                  <span>Get alerts the moment a price drops</span>
                </li>
                <li>
                  <i className="ti ti-heart" aria-hidden="true" />
                  <span>Save favourites and come back anytime</span>
                </li>
              </ul>
            </div>

            {/* Form card */}
            <div className="col-lg-6">
              <div className="card border-0 shadow login-card mx-auto">
                <div className="card-body p-4 p-md-5">
                  <h2 className="h3 fw-bold login-card-title mb-1">Welcome back</h2>
                  <p className="text-muted mb-4">Sign in to continue comparing prices.</p>

                  {error && (
                    <div className="alert alert-danger" role="alert">
                      {error}
                    </div>
                  )}

                  <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                      <label htmlFor="email" className="form-label small fw-semibold">
                        Email
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        className="form-control login-input"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="you@example.com"
                        autoComplete="email"
                        required
                      />
                    </div>

                    <div className="mb-3">
                      <label htmlFor="password" className="form-label small fw-semibold">
                        Password
                      </label>
                      <div className="input-group">
                        <input
                          id="password"
                          name="password"
                          type={showPassword ? 'text' : 'password'}
                          className="form-control login-input"
                          value={formData.password}
                          onChange={handleChange}
                          placeholder="Enter your password"
                          autoComplete="current-password"
                          required
                        />
                        <button
                          type="button"
                          className="btn btn-outline-secondary login-toggle"
                          onClick={() => setShowPassword((v) => !v)}
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                          aria-pressed={showPassword}
                        >
                          <i
                            className={`ti ${showPassword ? 'ti-eye-off' : 'ti-eye'}`}
                            aria-hidden="true"
                          />
                        </button>
                      </div>
                    </div>

                    <div className="d-flex align-items-center justify-content-between mb-4">
                      <div className="form-check mb-0">
                        <input
                          id="rememberMe"
                          name="rememberMe"
                          type="checkbox"
                          className="form-check-input login-check"
                          checked={formData.rememberMe}
                          onChange={handleChange}
                        />
                        <label htmlFor="rememberMe" className="form-check-label small text-muted">
                          Remember me
                        </label>
                      </div>

                      <Link to="/forgot-password" className="login-link small fw-semibold">
                        Forgot password?
                      </Link>
                    </div>

                    <button
                      type="submit"
                      className="btn login-submit w-100 rounded-pill text-white"
                      disabled={loading}
                    >
                      {loading ? 'Signing in...' : 'Sign in'}
                    </button>
                  </form>

                  <p className="text-center text-muted small mt-4 mb-0">
                    Don't have an account?{' '}
                    <Link to="/register" className="login-link fw-semibold">
                      Sign up
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Login
