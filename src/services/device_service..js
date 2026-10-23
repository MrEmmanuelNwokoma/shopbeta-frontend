import api from './api'

const DEVICES_PATH = '/api/v1/device-token/'

export const registerDeviceToken = (token) =>
  api.post(DEVICES_PATH, { token, platform: 'web' })

// A 404 means it is already gone, which is the result we wanted
export const removeDeviceToken = async (token) => {
  try {
    await api.delete(DEVICES_PATH, { data: [token] })
  } catch (err) {
    if (err.response?.status !== 404) throw err
  }
}