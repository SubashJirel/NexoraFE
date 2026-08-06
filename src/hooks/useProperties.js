import { useQuery } from '@tanstack/react-query'
import { getProperties, getProperty } from '@/services/propertyService'

export const PROPERTIES_KEY = ['properties']
export const PROPERTY_KEY = (id) => ['properties', id]

export function useProperties(filters = {}) {
  return useQuery({
    queryKey: [...PROPERTIES_KEY, filters],
    queryFn: () => getProperties(filters),
  })
}

export function useProperty(propertyId) {
  return useQuery({
    queryKey: PROPERTY_KEY(propertyId),
    queryFn: () => getProperty(propertyId),
    enabled: Boolean(propertyId),
  })
}
