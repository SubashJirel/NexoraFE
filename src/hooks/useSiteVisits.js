import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getSiteVisits, getSiteVisit, createSiteVisit } from '@/services/siteVisitService'
import toast from 'react-hot-toast'

export const SITE_VISITS_KEY    = ['site-visits']
export const SITE_VISIT_KEY = (id) => ['site-visits', id]

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

/**
 * Fetches a single site visit by ID.
 *
 * @param {number|string} id
 */
export function useSiteVisit(id) {
  return useQuery({
    queryKey: SITE_VISIT_KEY(id),
    queryFn:  () => getSiteVisit(id),
    enabled:  Boolean(id),
    staleTime: 1000 * 60 * 2,
  })
}

/**
 * Mutation hook for POST /api/site-visits/
 * Optimistically prepends the new visit to all cached lists,
 * then invalidates to sync with the server.
 *
 * @param {{ onSuccess?: (visit: object) => void }} [options]
 */
export function useCreateSiteVisit({ onSuccess } = {}) {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (payload) => createSiteVisit(payload),

    onSuccess: (visit) => {
      // Prepend to every cached site-visits query (regardless of filters)
      qc.setQueriesData({ queryKey: SITE_VISITS_KEY }, (old = []) => [visit, ...old])
      qc.invalidateQueries({ queryKey: SITE_VISITS_KEY })
      toast.success('Site visit scheduled!')
      onSuccess?.(visit)
    },

    onError: (err) => {
      const msg =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        Object.values(err.response?.data || {})[0]?.[0] ||
        'Failed to schedule site visit. Please try again.'
      toast.error(msg)
    },
  })
}
