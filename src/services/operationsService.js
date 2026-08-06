import apiClient from '@/lib/axios'

function rows(data) {
  return Array.isArray(data) ? data : (data?.results || [])
}

export const operationsService = {
  async list(resource, params = {}) {
    const { data } = await apiClient.get(`/operations/${resource}/`, { params })
    return rows(data)
  },
  async get(resource, id) {
    const { data } = await apiClient.get(`/operations/${resource}/${id}/`)
    return data
  },
  async create(resource, payload, multipart = false) {
    const { data } = await apiClient.post(`/operations/${resource}/`, payload, multipart ? { headers: { 'Content-Type': 'multipart/form-data' } } : undefined)
    return data
  },
  async update(resource, id, payload, multipart = false) {
    const { data } = await apiClient.patch(`/operations/${resource}/${id}/`, payload, multipart ? { headers: { 'Content-Type': 'multipart/form-data' } } : undefined)
    return data
  },
  async remove(resource, id) {
    await apiClient.delete(`/operations/${resource}/${id}/`)
  },
  async action(resource, id, action, payload = {}) {
    const { data } = await apiClient.post(`/operations/${resource}/${id}/${action}/`, payload)
    return data
  },
  async report() {
    const { data } = await apiClient.get('/operations/reports/summary/')
    return data
  },
  async matches(leadId) {
    const { data } = await apiClient.get(`/operations/matching/leads/${leadId}/`)
    return data
  },
  async compare(ids) {
    const { data } = await apiClient.get('/operations/properties/compare/', { params: { ids: ids.join(',') } })
    return data
  },
  async adminSummary() {
    const { data } = await apiClient.get('/operations/admin/summary/')
    return data
  },
  async importLeadContacts() {
    const { data } = await apiClient.post('/operations/contacts/import-leads/')
    return data
  },
  async checkout(plan) {
    const { data } = await apiClient.post('/operations/subscriptions/checkout/', { plan })
    return data
  },
  async billingPortal() {
    const { data } = await apiClient.post('/operations/subscriptions/billing-portal/')
    return data
  },
  async readAllNotifications() {
    const { data } = await apiClient.post('/operations/notifications/read-all/')
    return data
  },
}

export default operationsService
