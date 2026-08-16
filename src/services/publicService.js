import apiClient from '@/lib/axios'

export async function getPublicAgency(slug) {
  const { data } = await apiClient.get(`/public/agencies/by-slug/${slug}/`)
  return data
}

export async function getPublicAgents(licenseNumber) {
  const { data } = await apiClient.get(`/public/agencies/${licenseNumber}/agents/`)
  return data
}

export async function getPublicAgent(licenseNumber, id) {
  const { data } = await apiClient.get(`/public/agencies/${licenseNumber}/agents/${id}/`)
  return data
}

export async function getPublicProperties(licenseNumber, params = {}) {
  const clean = Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== '' && value != null)
  )
  const { data } = await apiClient.get(`/public/agencies/${licenseNumber}/properties/`, {
    params: clean,
  })
  return data
}

export async function getPublicPropertyOptions(licenseNumber) {
  const { data } = await apiClient.get(
    `/public/agencies/${licenseNumber}/properties/filter-options/`
  )
  return data
}

export async function getPublicProperty(licenseNumber, id) {
  const { data } = await apiClient.get(`/public/agencies/${licenseNumber}/properties/${id}/`)
  return data
}

export async function getPublicPropertyByShareSlug(slug, shareSlug) {
  const { data } = await apiClient.get(`/public/agencies/by-slug/${slug}/listings/${shareSlug}/`)
  return data
}

export async function getSimilarProperties(licenseNumber, id) {
  const { data } = await apiClient.get(
    `/public/agencies/${licenseNumber}/properties/${id}/similar/`
  )
  return data.results ?? []
}

export async function submitPropertyInquiry(licenseNumber, id, payload) {
  const { data } = await apiClient.post(
    `/public/agencies/${licenseNumber}/properties/${id}/inquire/`,
    payload
  )
  return data
}

export async function requestPublicSiteVisit(licenseNumber, id, payload) {
  const { data } = await apiClient.post(
    `/public/agencies/${licenseNumber}/properties/${id}/request-site-visit/`,
    payload
  )
  return data
}

export async function contactPublicAgency(licenseNumber, payload) {
  const { data } = await apiClient.post(
    `/public/agencies/${licenseNumber}/contact/`,
    payload
  )
  return data
}

export async function trackPublicPropertyEvent(licenseNumber, id, eventType) {
  const visitorId = getVisitorId()
  const { data } = await apiClient.post(
    `/public/agencies/${licenseNumber}/properties/${id}/events/`,
    { event_type: eventType, visitor_id: visitorId }
  )
  return data
}

export async function reportPublicListing(agencySlug, propertyId, payload) {
  const { data } = await apiClient.post(`/public/agencies/${agencySlug}/submissions/`, {
    kind: 'listing_report', property: propertyId, ...payload,
  })
  return data
}

function getVisitorId() {
  const key = 'nexora_visitor_id'
  let value = localStorage.getItem(key)
  if (!value) {
    value = crypto.randomUUID()
    localStorage.setItem(key, value)
  }
  return value
}
