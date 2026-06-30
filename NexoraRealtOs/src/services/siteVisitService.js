import apiClient from '@/lib/axios'

/**
 * GET /api/site-visits/
 * Accepts optional filter params:
 *   assigned_agent, date_from, date_to, lead, property, search, status
 * Empty/falsy values are stripped before sending.
 *
 * @param {object} [params]
 * @returns {Array} list of site visit objects
 */
export async function getSiteVisits(params = {}) {
  const clean = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== '' && v !== null && v !== undefined)
  )
  const { data } = await apiClient.get('/site-visits/', { params: clean })
  return data
}

/**
 * POST /api/site-visits/
 * Creates a new site visit and returns the full created object.
 *
 * @param {object} payload
 *   { lead, property, assigned_agent, scheduled_at, status, notes,
 *     scheduled_email_sent_at, scheduled_email_error }
 * @returns {object} created site visit
 */
export async function createSiteVisit(payload) {
  const { data } = await apiClient.post('/site-visits/', payload)
  return data
}
