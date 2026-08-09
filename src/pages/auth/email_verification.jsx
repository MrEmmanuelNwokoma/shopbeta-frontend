import { useState, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { verifyEmail, requestVerificationToken } from '../../services/auth_service'
import '../../styles/auth-common.css'
import '../../styles/email_verification.css'

const BRAND_BLUE = '#0066ff'

const CODE_LENGTH = 6

function EmailVerification() {
  // Swap this for the real signed-in user's email once auth state exists
  const userEmail = 'emmanuelnwokoma364@gmail.com'

  const [code, setCode] = useState(Array(CODE_LENGTH).fill(''))
  const [loading, setLoading] = useState(false)
  const [resendMessage, setResendMessage] = useState('')
  const [resending, setResending] = useState(false)
  const [error, setError] = useState('')

  const inputRefs = useRef([])
  const navigate = useNavigate()


  const handleChange = (index, e) => {
    const value = e.target.value.replace(/[^0-9]/g, '').slice(-1)

    setCode((prev) => {
      const next = [...prev]
      next[index] = value
      return next
    })

    if (value && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pasted = e.clipboardData
      .getData('text')
      .replace(/[^0-9]/g, '')
      .slice(0, CODE_LENGTH)

    if (!pasted) return

    const next = Array(CODE_LENGTH).fill('')
    pasted.split('').forEach((char, i) => {
      next[i] = char
    })
    setCode(next)

    const lastFilled = Math.min(pasted.length, CODE_LENGTH) - 1
    inputRefs.current[lastFilled]?.focus()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
  
    const fullCode = code.join('')
  
    if (fullCode.length < CODE_LENGTH) {
      setError('Enter the full 6-digit code')
      return
    }
  
    setLoading(true)
  
    try {
      await verifyEmail(fullCode)
  
      // Email confirmed — send them to sign in with their new account.
      navigate('/login')
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          'Invalid or expired code. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setError('')
    setResendMessage('')
    setResending(true)
  
    try {
      await requestVerificationToken(userEmail)
      setResendMessage('A new code has been sent to your email.')
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          'Could not resend the code. Please try again.'
      )
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="verify-page">
      <div className="verify-container">

        {/* Brand */}
        <div className="verify-brand">
          <svg
            width="30"
            height="26"
            viewBox="0 17 100 86"
            aria-hidden="true"
          >
            <path
              d="M 35 24 Q 7 24 7 42 Q 7 56 35 58 Q 63 60 63 78 Q 63 96 33 96"
              fill="none"
              stroke="#99bfff"
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
              fill={BRAND_BLUE}
            />

            <path
              d="M 70 24 Q 89 24 89 42 Q 89 56 70 58"
              fill="none"
              stroke={BRAND_BLUE}
              strokeWidth="14"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            <path
              d="M 70 58 Q 93 60 93 78 Q 93 96 70 96 L 40 96"
              fill="none"
              stroke={BRAND_BLUE}
              strokeWidth="14"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>

          <span>
            Shop<span style={{ color: BRAND_BLUE }}>Beta</span>
          </span>
        </div>

        {/* Card */}
        <div className="verify-card">

          <div className="verify-icon">
            <i className="ti ti-mail-opened" aria-hidden="true" />
          </div>

          <h2>Verify your email</h2>

          <p className="verify-subtitle">
            We sent a 6-digit code to
            <br />
            <span style={{ color: BRAND_BLUE, fontWeight: 700 }}>
              {userEmail}
            </span>
          </p>

          {error && (
            <div className="auth-error">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>

            <div className="verify-otp-group" onPaste={handlePaste}>
              {code.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className={`otp-input auth-input-base${digit ? ' filled' : ''}`}
                />
              ))}
            </div>

            <p className="verify-resend">
              Didn't receive the code?{' '}
              <button
                type="button"
                onClick={handleResend}
                disabled={resending}
                style={{ color: BRAND_BLUE }}
              >
                {resending ? 'Resending...' : 'Resend'}
              </button>
            </p>

            <button
              type="submit"
              className="auth-submit"
              disabled={loading}
              style={{
                background:
                  'linear-gradient(135deg, #0047CC 0%, #0066FF 55%, #00D4FF 100%)',
              }}
            >
              {loading ? 'Verifying...' : 'Verify email'}
            </button>

          </form>

          <p className="auth-switch">
            Wrong email? <Link to="/register">Go back</Link>
          </p>

        </div>

      </div>
    </div>
  )
}

export default EmailVerification
