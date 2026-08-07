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

export async function registerCustomer(slug, payload) {
  const { data } = await apiClient.post(`/public/agencies/${slug}/customers/`, payload)
  saveCustomerSession(slug, data)
  return data
}

export async function loginCustomer(slug, payload) {
  const { data } = await apiClient.post(`/public/agencies/${slug}/customers/login/`, payload)
  saveCustomerSession(slug, data)
  return data
}

export function getCustomerSession(slug) {
  try { return JSON.parse(localStorage.getItem(`nexora_customer_${slug}`)) } catch { return null }
}

export function saveCustomerSession(slug, data) {
  localStorage.setItem(`nexora_customer_${slug}`, JSON.stringify(data))
}

export function clearCustomerSession(slug) {
  localStorage.removeItem(`nexora_customer_${slug}`)
}

function customerConfig(slug) {
  const token = getCustomerSession(slug)?.access_token
  return { headers: { 'X-Customer-Token': token || '' } }
}

export async function getSavedProperties(slug) {
  const { data } = await apiClient.get(`/public/agencies/${slug}/customer/saved-properties/`, customerConfig(slug))
  return data
}

export async function toggleSavedProperty(slug, property) {
  const { data } = await apiClient.post(`/public/agencies/${slug}/customer/saved-properties/`, { property }, customerConfig(slug))
  return data
}

export async function getSavedSearches(slug) {
  const { data } = await apiClient.get(`/public/agencies/${slug}/customer/saved-searches/`, customerConfig(slug))
  return data
}

export async function createSavedSearch(slug, payload) {
  const { data } = await apiClient.post(`/public/agencies/${slug}/customer/saved-searches/`, payload, customerConfig(slug))
  return data
}

export async function getPublicAvailability(slug) {
  const { data } = await apiClient.get(`/public/agencies/${slug}/appointments/`)
  return data
}

export async function createPublicAppointment(slug, payload) {
  const { data } = await apiClient.post(`/public/agencies/${slug}/appointments/`, payload, customerConfig(slug))
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
