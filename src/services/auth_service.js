import api from './api'

export const login = (data) => {
    const form = new URLSearchParams()
    form.append('username', data.email)
    form.append('password', data.password)
  
    return api.post('/auth/login', form, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })
  }
export const register = (data) => api.post('/auth/', data)
export const verifyEmail = (token) =>
  api.post('/auth/verify-email', null, { params: { token } })   
export const requestVerificationToken = (data) => api.post('/auth/request-verification-token', data)