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
  await apiClient.delete(`/social-posts/accounts/${id}/disconnect/`)
}

export async function getMetaConnectionSession(token) {
  const { data } = await apiClient.get(`/social-posts/connections/meta/sessions/${token}/`)
  return data
}

export async function completeMetaConnectionSession(token, pageIds) {
  const { data } = await apiClient.post(
    `/social-posts/connections/meta/sessions/${token}/`,
    { page_ids: pageIds },
  )
  return data
}

export async function startWhatsAppConnection() {
  const { data } = await apiClient.get('/social-posts/connections/whatsapp/start/')
  return data
}

export async function completeWhatsAppConnection(payload) {
  const { data } = await apiClient.post(
    '/social-posts/connections/whatsapp/complete/',
    payload,
  )
  return data
}

let facebookSdkPromise

function loadFacebookSdk(appId, graphVersion) {
  if (!facebookSdkPromise) {
    facebookSdkPromise = new Promise((resolve, reject) => {
      const initialize = () => {
        window.FB.init({
          appId,
          cookie: true,
          xfbml: false,
          version: graphVersion,
        })
        resolve(window.FB)
      }
      if (window.FB) {
        initialize()
        return
      }
      const existing = document.getElementById('facebook-jssdk')
      window.fbAsyncInit = initialize
      if (!existing) {
        const script = document.createElement('script')
        script.id = 'facebook-jssdk'
        script.src = 'https://connect.facebook.net/en_US/sdk.js'
        script.async = true
        script.defer = true
        script.onerror = () => reject(new Error('Could not load Meta Embedded Signup.'))
        document.body.appendChild(script)
      }
    })
  }
  return facebookSdkPromise
}

export async function openWhatsAppEmbeddedSignup(config) {
  const FB = await loadFacebookSdk(config.app_id, config.graph_version)
  return new Promise((resolve, reject) => {
    let code = ''
    let signup = null
    let settled = false
    const finish = () => {
      if (!settled && code && signup?.waba_id && signup?.phone_number_id) {
        settled = true
        cleanup()
        resolve({
          state: config.state,
          code,
          business_account_id: String(signup.waba_id),
          phone_number_id: String(signup.phone_number_id),
        })
      }
    }
    const cleanup = () => {
      window.removeEventListener('message', onMessage)
      window.clearTimeout(timeout)
    }
    const fail = (message) => {
      if (settled) return
      settled = true
      cleanup()
      reject(new Error(message))
    }
    const onMessage = (event) => {
      if (!['https://www.facebook.com', 'https://web.facebook.com'].includes(event.origin)) return
      let payload = event.data
      if (typeof payload === 'string') {
        try { payload = JSON.parse(payload) } catch { return }
      }
      if (payload?.type !== 'WA_EMBEDDED_SIGNUP') return
      if (payload.event === 'FINISH') {
        signup = payload.data || {}
        finish()
      } else if (payload.event === 'CANCEL') {
        fail('WhatsApp connection was cancelled.')
      } else if (payload.event === 'ERROR') {
        fail(payload.data?.error_message || 'WhatsApp Embedded Signup failed.')
      }
    }
    const timeout = window.setTimeout(
      () => fail('WhatsApp connection timed out. Please try again.'),
      5 * 60 * 1000,
    )
    window.addEventListener('message', onMessage)
    FB.login(
      (response) => {
        code = response?.authResponse?.code || ''
        if (!code) {
          fail('Meta did not authorize the WhatsApp connection.')
          return
        }
        finish()
      },
      {
        config_id: config.config_id,
        response_type: 'code',
        override_default_response_type: true,
        extras: {
          setup: {},
          featureType: '',
          sessionInfoVersion: '3',
        },
      },
    )
  })
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
 * @param {File[]}      [payload.images]        - up to five ordered image files
 * @param {string[]}    [payload.media_order]   - existing/new image order tokens
 * @param {number|null} [payload.property]      - optional linked property ID
 * @param {string|null} [payload.scheduled_at]  - ISO datetime string if scheduling
 *
 * Sends as multipart/form-data so image binaries are included.
 */
export async function createSocialPost(payload) {
  const form = new FormData()

  form.append('social_account', payload.social_account)
  form.append('platform', payload.platform)
  form.append('caption', payload.caption)
  form.append('status', payload.status ?? 'draft')
  form.append('post_format', payload.post_format ?? 'image')
  payload.target_platforms?.forEach((platform) => form.append('target_platforms', platform))

  payload.images?.forEach((image) => form.append('images', image))
  if (payload.video) form.append('video', payload.video)
  if (payload.media_order !== undefined) {
    form.append('media_order', JSON.stringify(payload.media_order))
  }
  if (payload.property != null) {
    form.append('property', payload.property)
  }
  if (payload.scheduled_at) {
    form.append('scheduled_at', payload.scheduled_at)
  }

  const { data } = await apiClient.post('/social-posts/posts/', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 180000,
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

/**
 * POST /api/social-posts/posts/{id}/publish/
 * Publish a post (draft) to one or more platforms immediately.
 *
 * @param {number}   id        - post ID
 * @param {string[]} platforms - e.g. ["facebook"] or ["facebook", "instagram"]
 */
export async function publishSocialPost(id, platforms) {
  const { data } = await apiClient.post(
    `/social-posts/posts/${id}/publish/`,
    { platforms },
    // Meta image publication can legitimately take longer than the default
    // API timeout, especially while Instagram processes its media container.
    { timeout: 180000 },
  )
  return data
}

/**
 * PATCH /api/social-posts/posts/{id}/
 * Partially update a social post.
 * Sends as multipart/form-data so ordered image changes can be included.
 *
 * @param {number} id       - post ID to update
 * @param {Object} payload  - only the fields you want to change
 *   @param {string}      [payload.caption]
 *   @param {string}      [payload.status]       - "draft" | "scheduled"
 *   @param {File[]}      [payload.images]       - newly added image files
 *   @param {string[]}    [payload.media_order]  - complete ordered media-token list
 *   @param {string|null} [payload.scheduled_at]
 */
export async function updateSocialPost(id, payload) {
  const form = new FormData()

  if (payload.caption !== undefined) form.append('caption', payload.caption)
  if (payload.status  !== undefined) form.append('status',  payload.status)
  if (payload.post_format !== undefined) form.append('post_format', payload.post_format)
  payload.target_platforms?.forEach((platform) => form.append('target_platforms', platform))
  if (payload.scheduled_at !== undefined) form.append('scheduled_at', payload.scheduled_at ?? '')
  payload.images?.forEach((image) => form.append('images', image))
  if (payload.video) form.append('video', payload.video)
  if (payload.media_order !== undefined) {
    form.append('media_order', JSON.stringify(payload.media_order))
  }

  const { data } = await apiClient.patch(`/social-posts/posts/${id}/`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 180000,
  })

  return data
}

/**
 * DELETE /api/social-posts/posts/{id}/
 * Permanently delete a social post record.
 *
 * @param {number} id - post ID to delete
 */
export async function deleteSocialPost(id) {
  const { data } = await apiClient.delete(`/social-posts/posts/${id}/`)
  return data
}
