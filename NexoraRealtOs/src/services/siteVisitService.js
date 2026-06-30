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
