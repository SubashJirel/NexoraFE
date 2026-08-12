import apiClient from '@/lib/axios'

export async function getCurrentAgency() {
  const { data } = await apiClient.get('/agencies/me/')
  return data
}

export async function updateCurrentAgency(payload) {
  const form = new FormData()

  Object.entries(payload).forEach(([key, value]) => {
    if (value instanceof File) form.append(key, value)
    else if (typeof value === 'object' && value !== null) form.append(key, JSON.stringify(value))
    else if (value !== undefined && value !== null) form.append(key, value)
  })

  const { data } = await apiClient.patch('/agencies/me/', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}

export async function getWebsiteOnboarding() {
  const { data } = await apiClient.get('/agencies/me/website-onboarding/')
  return data
}

export async function updateWebsiteOnboarding(payload) {
  const form = new FormData()
  Object.entries(payload).forEach(([key, value]) => {
    if (value instanceof File) form.append(key, value)
    else if (typeof value === 'object' && value !== null) form.append(key, JSON.stringify(value))
    else if (value !== undefined && value !== null) form.append(key, value)
  })
  const { data } = await apiClient.patch('/agencies/me/website-onboarding/', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}

export async function publishWebsite() {
  const { data } = await apiClient.post('/agencies/me/website/publish/')
  return data
}

export async function unpublishWebsite() {
  const { data } = await apiClient.post('/agencies/me/website/unpublish/')
  return data
}
