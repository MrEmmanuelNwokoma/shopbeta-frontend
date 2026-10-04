import api, { clearToken } from './api'

export const login = (data) => {
  const form = new URLSearchParams()
  form.append('username', data.email)
  form.append('password', data.password)

  return api.post('/auth/login', form, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  })
}

export const register = (data) => api.post('/auth/', data)

// Backend route: async def verify_email(token: str, ...)
// `token` is a bare str param, so FastAPI expects it as a query
// param, not JSON in the request body.
export const verifyEmail = (token) =>
  api.post('/auth/verify-email', null, { params: { token } })

// Backend route: async def request_verification_token(email: VerificationForm, ...)
// VerificationForm expects a JSON body shaped { "email": "..." },
// so the string passed in needs to be wrapped, not sent raw.
export const requestVerificationToken = (email) =>
  api.post('/auth/request-verification-token', { email })

export const forgotPassword = (email) =>
  api.post('/auth/forgot-password', { email })

// Returns the logged-in user. Needs the token, which the api interceptor attaches.
export const getCurrentUser = async () => {
  const response = await api.get('/users/me')
  return response.data?.data || response.data
}

// Clears the token from both stores and sends the user to the login page.
export const logout = () => {
  clearToken()
  window.location.assign('/login')
}