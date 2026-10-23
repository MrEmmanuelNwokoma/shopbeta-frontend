import api from './api'

// Adjust this if your device router differs
const DEVICES_PATH = '/device_tokens/'

export const registerDeviceToken = (token) => api.post(DEVICES_PATH, { token })

// A 404 means it is already gone, which is the result we wanted
export const removeDeviceToken = async (token) => {
  try {
    await api.delete(`${DEVICES_PATH}${encodeURIComponent(token)}`)
  } catch (err) {
    if (err.response?.status !== 404) throw err
  }
}