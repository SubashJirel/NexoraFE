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
