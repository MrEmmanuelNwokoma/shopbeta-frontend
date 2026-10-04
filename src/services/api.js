import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
})

export const getToken = () =>
  localStorage.getItem('token') || sessionStorage.getItem('token')

export const clearToken = () => {
  localStorage.removeItem('token')
  sessionStorage.removeItem('token')
}

api.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const hadToken = Boolean(getToken())
    const onAuthPage = ['/login', '/register'].includes(window.location.pathname)

    // An expired or invalid token: clear it and send the user to log in again
    if (error.response?.status === 401 && hadToken && !onAuthPage) {
      clearToken()
      window.location.assign('/login')
    }
    return Promise.reject(error)
  }
)

export default api