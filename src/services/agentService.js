import apiClient from '@/lib/axios'

/**
 * GET /api/agents/
 * Returns all agents belonging to the authenticated agency.
 *
 * Response shape:
 * [{ id, email, full_name, role, is_active, created_at }]
 */
export async function getAgents() {
  const { data } = await apiClient.get('/agents/')
  return data
}

/**
 * POST /api/agents/
 * Create a new agent.
 *
 * @param {{ full_name: string, email: string, password: string }} payload
 */
export async function createAgent(payload) {
  const { data } = await apiClient.post('/agents/', payload)
  return data
}

/**
 * PATCH /api/agents/{id}/
 * Update an existing agent (partial update).
 *
 * @param {number|string} id
 * @param {{ full_name?: string, email?: string, password?: string }} payload
 */
export async function updateAgent(id, payload) {
  const { data } = await apiClient.patch(`/agents/${id}/`, payload)
  return data
}

/**
 * DELETE /api/agents/{id}/
 * Remove an agent.
 *
 * @param {number|string} id
 */
export async function deleteAgent(id) {
  await apiClient.delete(`/agents/${id}/`)
}

export async function getMyAgentProfile() {
  const { data } = await apiClient.get('/agents/me/profile/')
  return data
}

export async function updateMyAgentProfile(payload) {
  if (!(payload.profile_image instanceof File)) {
    const jsonPayload = { ...payload }
    delete jsonPayload.profile_image
    const { data } = await apiClient.patch('/agents/me/profile/', jsonPayload)
    return data
  }

  const form = new FormData()
  Object.entries(payload).forEach(([key, value]) => {
    if (value instanceof File) form.append(key, value)
    else if (Array.isArray(value)) value.forEach((item, index) => form.append(`${key}[${index}]`, item))
    else if (value !== undefined && value !== null) form.append(key, value)
  })
  const { data } = await apiClient.patch('/agents/me/profile/', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}
