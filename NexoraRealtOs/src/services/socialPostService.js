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

/**
 * POST /api/social-posts/posts/
 * Create a new social post (draft or scheduled).
 *
 * @param {Object} payload
 * @param {number}      payload.social_account  - ID of the connected account
 * @param {string}      payload.platform        - e.g. "facebook"
 * @param {string}      payload.caption         - post caption / text
 * @param {string}      [payload.status]        - "draft" | "scheduled" (default: "draft")
 * @param {File|null}   [payload.image]         - image file to attach
 * @param {number|null} [payload.property]      - optional linked property ID
 * @param {string|null} [payload.scheduled_at]  - ISO datetime string if scheduling
 *
 * Sends as multipart/form-data so the image binary is included.
 */
export async function createSocialPost(payload) {
  const form = new FormData()

  form.append('social_account', payload.social_account)
  form.append('platform', payload.platform)
  form.append('caption', payload.caption)
  form.append('status', payload.status ?? 'draft')

  if (payload.image instanceof File) {
    form.append('image', payload.image)
  }
  if (payload.property != null) {
    form.append('property', payload.property)
  }
  if (payload.scheduled_at) {
    form.append('scheduled_at', payload.scheduled_at)
  }

  const { data } = await apiClient.post('/social-posts/posts/', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })

  return data
}

/**
 * GET /api/social-posts/posts/
 * Returns list of social posts for the current agency.
 */
export async function getSocialPosts(params = {}) {
  const { data } = await apiClient.get('/social-posts/posts/', { params })
  return data
}
