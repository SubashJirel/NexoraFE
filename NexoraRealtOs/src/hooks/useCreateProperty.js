import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createPropertyWithMedia } from '@/services/propertyService'
import { PROPERTIES_KEY } from '@/hooks/useProperties'
import toast from 'react-hot-toast'

/**
 * useMutation hook that:
 *  1. Posts property details to /api/properties/
 *  2. Uploads all media files to /api/properties/{id}/media/ in parallel
 *  3. Invalidates the properties list cache on success
 *
 * Usage:
 *   const { mutate, isPending } = useCreateProperty()
 *   mutate({ propertyPayload, mediaFiles })
 */
export function useCreateProperty({ onSuccess } = {}) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ propertyPayload, mediaFiles }) =>
      createPropertyWithMedia(propertyPayload, mediaFiles),

    onSuccess: (newProperty) => {
      // Optimistically prepend to cached list so the listing page
      // shows the new property immediately without a full refetch.
      queryClient.setQueryData(PROPERTIES_KEY, (old = []) => [newProperty, ...old])
      // Then invalidate to sync with the server in the background
      queryClient.invalidateQueries({ queryKey: PROPERTIES_KEY })
      toast.success('Property created successfully!')
      onSuccess?.(newProperty)
    },

    onError: (err) => {
      const msg =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        Object.values(err.response?.data || {})[0]?.[0] ||
        'Failed to create property. Please try again.'
      toast.error(msg)
    },
  })
}
