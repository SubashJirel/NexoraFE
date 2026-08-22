import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getSiteVisits,
  getSiteVisit,
  createSiteVisit,
  updateSiteVisit,
  deleteSiteVisit,
} from '@/services/siteVisitService'
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
    // Public website requests are created outside this React application, so
    // there is no local mutation available to invalidate this cache. Always
    // refresh when staff open or return to the page, and poll while it is open.
    staleTime: 15_000,
    refetchOnMount: 'always',
    refetchOnWindowFocus: 'always',
    refetchInterval: 30_000,
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

export function useUpdateSiteVisit(id, { onSuccess } = {}) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload) => updateSiteVisit(id, payload),
    onSuccess: (visit) => {
      qc.setQueryData(SITE_VISIT_KEY(id), visit)
      qc.invalidateQueries({ queryKey: SITE_VISITS_KEY })
      toast.success('Site visit updated.')
      onSuccess?.(visit)
    },
    onError: (err) => toast.error(siteVisitError(err, 'Failed to update site visit.')),
  })
}

export function useDeleteSiteVisit(id, { onSuccess } = {}) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => deleteSiteVisit(id),
    onSuccess: () => {
      qc.removeQueries({ queryKey: SITE_VISIT_KEY(id) })
      qc.invalidateQueries({ queryKey: SITE_VISITS_KEY })
      toast.success('Site visit deleted.')
      onSuccess?.()
    },
    onError: (err) => toast.error(siteVisitError(err, 'Failed to delete site visit.')),
  })
}

function siteVisitError(err, fallback) {
  return err.response?.data?.detail || err.response?.data?.message || Object.values(err.response?.data || {})[0]?.[0] || fallback
}
