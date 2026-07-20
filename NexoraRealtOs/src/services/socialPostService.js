import apiClient from '@/lib/axios'

/**
 * GET /api/social-posts/connections/meta/start/
 * Returns { auth_url } — redirect user to this URL to begin OAuth flow.
 */
export async function startMetaConnection() {
  const { data } = await apiClient.get('/social-posts/connections/meta/start/')
  return data
}

/**
 * GET /api/social-posts/connections/
 * Returns all active social connections for the current agency.
 */
export async function getSocialConnections() {
  const { data } = await apiClient.get('/social-posts/connections/')
  return data
}

/**
 * DELETE /api/social-posts/connections/{id}/
 * Disconnect a social account.
 */
export async function deleteSocialConnection(id) {
  await apiClient.delete(`/social-posts/connections/${id}/`)
}
