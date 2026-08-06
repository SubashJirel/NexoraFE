import apiClient from '@/lib/axios'

/**
 * POST /api/auth/login/
 * @param {{ email: string, password: string }} credentials
 * @returns {{ message, access, refresh, user, agency }}
 */
export async function login(credentials) {
  const { data } = await apiClient.post('/auth/login/', credentials)
  return data
}

/**
 * POST /api/auth/register/
 * @param {{ full_name: string, email: string, password: string, agency_name: string, license_number: string }} payload
 * @returns {{ message, user, agency }}
 */
export async function register(payload) {
  const { data } = await apiClient.post('/auth/register/', payload)
  return data
}

export async function verifyLoginOTP(payload) {
  const { data } = await apiClient.post('/auth/verify-login-otp/', payload)
  return data
}

export async function resendLoginOTP(payload) {
  const { data } = await apiClient.post('/auth/resend-login-otp/', payload)
  return data
}

export async function requestPasswordReset(email) {
  const { data } = await apiClient.post('/auth/password-reset/', { email })
  return data
}

export async function confirmPasswordReset(payload) {
  const { data } = await apiClient.post('/auth/password-reset/confirm/', payload)
  return data
}
