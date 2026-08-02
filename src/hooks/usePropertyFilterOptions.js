import { useQuery } from '@tanstack/react-query'
import { getPropertyFilterOptions } from '@/services/propertyService'

export const PROPERTY_FILTER_OPTIONS_KEY = ['property-filter-options']

/**
 * Fetches the dynamic filter options from the backend:
 *   property_types, statuses, locations, agents
 *
 * Cached for 5 minutes — the list rarely changes mid-session.
 */
export function usePropertyFilterOptions() {
  return useQuery({
    queryKey: PROPERTY_FILTER_OPTIONS_KEY,
    queryFn:  getPropertyFilterOptions,
    staleTime: 5 * 60 * 1000,  // 5 min
    select: (data) => ({
      // Prepend "All …" blank option for each filter group
      propertyTypes: [
        { value: '', label: 'All Types' },
        ...(data.property_types ?? []),
      ],
      statuses: [
        { value: '', label: 'All Status' },
        ...(data.statuses ?? []),
      ],
      // locations come with a `type` field (province/district/city/neighbourhood)
      // The filter panel groups them — keep the raw array and also expose
      // a flat "All Locations" list for the single location dropdown.
      locations: [
        { value: '', label: 'All Areas' },
        ...(data.locations ?? []),
      ],
      agents: [
        { value: '', label: 'All Agents' },
        ...(data.agents ?? []),
      ],
    }),
  })
}
