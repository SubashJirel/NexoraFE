import apiClient from '@/lib/axios'

/**
 * GET /api/social-posts/connections/meta/start/
 * Returns { auth_url } — redirect the user to Facebook's OAuth dialog.
 */
export async function startMetaConnection() {
  const { data } = await apiClient.get('/social-posts/connections/meta/start/')
  return data
}

/**
 * GET /api/social-posts/connections/
 * Returns all connected social accounts for the current agency.
 * Shape: [{ id, provider, platform, name, username, page_id, status, ... }]
 */
export async function getSocialConnections() {
  const { data } = await apiClient.get('/social-posts/accounts/')
  return data
}

/**
 * DELETE /api/social-posts/connections/{id}/
 * Disconnect a social account.
 */
export async function deleteSocialConnection(id) {
  await apiClient.delete(`/social-posts/connections/${id}/`)
}
