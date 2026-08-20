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
  const { data } = await apiClient.patch('/agencies/me/website-onboarding/', payload)
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

export async function getWebsiteVersions() {
  const { data } = await apiClient.get('/agencies/me/website/versions/')
  return data
}

export async function restoreWebsiteVersion(version) {
  const { data } = await apiClient.post(`/agencies/me/website/versions/${version}/restore/`)
  return data
}

export async function getWebsiteDomains() {
  const { data } = await apiClient.get('/agencies/me/website/domains/')
  return data
}

export async function claimWebsiteDomain(domain) {
  const { data } = await apiClient.post('/agencies/me/website/domains/', { domain })
  return data
}

export async function verifyWebsiteDomain(id) {
  const { data } = await apiClient.post(`/agencies/me/website/domains/${id}/verify/`)
  return data
}

export async function setPrimaryWebsiteDomain(id) {
  const { data } = await apiClient.post(`/agencies/me/website/domains/${id}/primary/`)
  return data
}

export async function removeWebsiteDomain(id) {
  await apiClient.delete(`/agencies/me/website/domains/${id}/`)
}

export async function uploadWebsiteMedia({ kind, file, onUploadProgress }) {
  const form = new FormData()
  form.append('kind', kind)
  form.append('file', file)
  const { data } = await apiClient.post('/agencies/me/website-onboarding/media/', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress,
  })
  return data
}

export async function removeWebsiteMedia(kind, path) {
  const { data } = await apiClient.delete('/agencies/me/website-onboarding/media/', { data: { kind, path } })
  return data
}

export async function validateWebsite() {
  const { data } = await apiClient.post('/agencies/me/website-onboarding/validate/')
  return data
}
