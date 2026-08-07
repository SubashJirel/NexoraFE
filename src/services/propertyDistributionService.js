import apiClient from '@/lib/axios'

export async function getPropertyDistribution(propertyId) {
  const { data } = await apiClient.get(`/properties/${propertyId}/distribution/`)
  return data
}

export async function createDistributionLink(propertyId, payload) {
  const { data } = await apiClient.post(`/properties/${propertyId}/distribution/links/`, payload)
  return data
}

export async function updateDistributionLink(id, payload) {
  const { data } = await apiClient.patch(`/properties/distribution/links/${id}/`, payload)
  return data
}

export async function deleteDistributionLink(id) {
  await apiClient.delete(`/properties/distribution/links/${id}/`)
}

export async function downloadDistributionAsset(propertyId, assetType, linkId = '') {
  const response = await apiClient.get(
    `/properties/${propertyId}/distribution/assets/${assetType}/`,
    { params: linkId ? { link: linkId } : {}, responseType: 'blob' }
  )
  const header = response.headers['content-disposition'] || ''
  const filename = header.match(/filename="?([^";]+)"?/i)?.[1] || `property-${assetType}`
  const url = URL.createObjectURL(response.data)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
  return filename
}

export async function createDistributionSocialDraft(propertyId, payload) {
  const { data } = await apiClient.post(
    `/properties/${propertyId}/distribution/social-draft/`, payload
  )
  return data
}

export async function downloadPortalExport(propertyIds = []) {
  const response = await apiClient.get('/properties/distribution/portal-export/', {
    params: propertyIds.length ? { ids: propertyIds.join(',') } : {},
    responseType: 'blob',
  })
  const url = URL.createObjectURL(response.data)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = 'nexora-property-portal-export.csv'
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}
