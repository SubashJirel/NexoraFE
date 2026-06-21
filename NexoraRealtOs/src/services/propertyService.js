import apiClient from '@/lib/axios'

/**
 * GET /api/properties/
 * Returns the full list of properties for the authenticated agency.
 */
export async function getProperties() {
  const { data } = await apiClient.get('/properties/')
  return data
}
