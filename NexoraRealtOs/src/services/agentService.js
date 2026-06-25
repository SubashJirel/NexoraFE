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
