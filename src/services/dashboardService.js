import apiClient from '@/lib/axios'

/** GET /api/dashboard/summary/ */
export async function getDashboardSummary() {
  const { data } = await apiClient.get('/dashboard/summary/')
  return data
}
