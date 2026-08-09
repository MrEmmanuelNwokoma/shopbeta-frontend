import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { register } from '../../services/auth_service'
import { getErrorMessage } from '../../utils/get_error_message'
import '../../styles/auth-common.css'
import '../../styles/register.css'

const BRAND_GRADIENT =
  'linear-gradient(135deg, #0047CC 0%, #0066FF 55%, #00D4FF 100%)'

const BRAND_BLUE = '#0066FF'

function Register() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
  })

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
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    if (!formData.agreeToTerms) {
      setError('Please agree to the terms and conditions.')
      return
    }

    setLoading(true)

    try {
      await register({
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        phone_number: formData.phoneNumber,
        password: formData.password,
      })

      // Registered — take them to verify their email, passing the
      // address along so that page doesn't need it re-entered.
      navigate('/email-verification', { state: { email: formData.email } })
    } catch (err) {
      setError(getErrorMessage(err, 'Registration failed. Please try again.'))
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
              GET STARTED
            </div>

            <h1>
              Shop smarter.
              <br />
              Save more.
            </h1>

            <p>
              Create your ShopBeta account and start comparing prices,
              tracking products, and finding better deals across Nigeria.
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
          RIGHT / REGISTER FORM
          ===================================================== */}

      <div className="auth-right">

        <div className="auth-form-container">

          <div className="auth-heading">

            <h2 style={{ color: BRAND_BLUE }}>
              Create your account
            </h2>

            <p>
              Join ShopBeta and start shopping smarter
            </p>

          </div>

          {error && (
            <div className="auth-error">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>

            {/* First + Last name */}
            <div className="register-name-row">

              <div className="auth-field">
                <label htmlFor="firstName">
                  First name
                </label>

                <input
                  id="firstName"
                  type="text"
                  name="firstName"
                  placeholder="First name"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="auth-field">
                <label htmlFor="lastName">
                  Last name
                </label>

                <input
                  id="lastName"
                  type="text"
                  name="lastName"
                  placeholder="Last name"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                />
              </div>

            </div>

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

            {/* Phone number */}
            <div className="auth-field">
              <label htmlFor="phoneNumber">
                Phone number
              </label>

              <input
                id="phoneNumber"
                type="tel"
                name="phoneNumber"
                placeholder="e.g. 08012345678"
                value={formData.phoneNumber}
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
                placeholder="Create a password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            {/* Confirm password */}
            <div className="auth-field">
              <label htmlFor="confirmPassword">
                Confirm password
              </label>

              <input
                id="confirmPassword"
                type="password"
                name="confirmPassword"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>

            {/* Terms */}
            <label className="register-terms">

              <input
                type="checkbox"
                name="agreeToTerms"
                checked={formData.agreeToTerms}
                onChange={handleChange}
              />

              <span>
                I agree to the{' '}

                <Link to="/terms">
                  Terms of Service
                </Link>

                {' '}and{' '}

                <Link to="/privacy">
                  Privacy Policy
                </Link>
              </span>

            </label>

            {/* Submit */}
            <button
              type="submit"
              className="auth-submit"
              disabled={loading}
              style={{ background: BRAND_GRADIENT }}
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>

          </form>

          {/* Login */}
          <p className="auth-switch">
            Already have an account?{' '}

            <Link to="/login">
              Sign in
            </Link>
          </p>

        </div>

      </div>
    </div>
  )
}

export default Register
