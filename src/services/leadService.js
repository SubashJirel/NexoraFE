import apiClient from '@/lib/axios'

// ── Leads ─────────────────────────────────────────────────────

/** GET /api/leads/ */
export async function getLeads() {
  const { data } = await apiClient.get('/leads/')
  return data
}

/** POST /api/leads/ */
export async function createLead(payload) {
  const { data } = await apiClient.post('/leads/', payload)
  return data
}

/** PATCH /api/leads/{id}/ */
export async function updateLead(id, payload) {
  const { data } = await apiClient.patch(`/leads/${id}/`, payload)
  return data
}

/** DELETE /api/leads/{id}/ */
export async function deleteLead(id) {
  await apiClient.delete(`/leads/${id}/`)
}

// ── Interactions ──────────────────────────────────────────────

/** GET /api/leads/{leadId}/interactions/ */
export async function getInteractions(leadId) {
  const { data } = await apiClient.get(`/leads/${leadId}/interactions/`)
  return data
}

/** POST /api/leads/{leadId}/interactions/ */
export async function createInteraction(leadId, payload) {
  const { data } = await apiClient.post(`/leads/${leadId}/interactions/`, payload)
  return data
}

/** DELETE /api/leads/{leadId}/interactions/{id}/ */
export async function deleteInteraction(leadId, interactionId) {
  await apiClient.delete(`/leads/${leadId}/interactions/${interactionId}/`)
}

// ── Interests ─────────────────────────────────────────────────

/** GET /api/leads/{leadId}/interests/ */
export async function getInterests(leadId) {
  const { data } = await apiClient.get(`/leads/${leadId}/interests/`)
  return data
}

/** POST /api/leads/{leadId}/interests/ */
export async function createInterest(leadId, payload) {
  const { data } = await apiClient.post(`/leads/${leadId}/interests/`, payload)
  return data
}

/** DELETE /api/leads/{leadId}/interests/{id}/ */
export async function deleteInterest(leadId, interestId) {
  await apiClient.delete(`/leads/${leadId}/interests/${interestId}/`)
}
