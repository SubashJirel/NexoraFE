import { useQuery } from '@tanstack/react-query'
import { getSiteVisits } from '@/services/siteVisitService'

export const SITE_VISITS_KEY = ['site-visits']

/**
 * Fetches site visits, optionally filtered.
 * Filters are included in the query key so React Query re-fetches
 * automatically whenever any filter value changes.
 *
 * @param {object} [filters]
 *   assigned_agent, date_from, date_to, lead, property, search, status
 */
export function useSiteVisits(filters = {}) {
  return useQuery({
    queryKey: [...SITE_VISITS_KEY, filters],
    queryFn:  () => getSiteVisits(filters),
    staleTime: 1000 * 60 * 2, // 2 min
  })
}
