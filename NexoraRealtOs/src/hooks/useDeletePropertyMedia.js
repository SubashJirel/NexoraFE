import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deletePropertyMedia } from '@/services/propertyService'
import { PROPERTIES_KEY, PROPERTY_KEY } from '@/hooks/useProperties'
import toast from 'react-hot-toast'

export function useDeletePropertyMedia(propertyId, { onSuccess } = {}) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (mediaId) => deletePropertyMedia(mediaId),

    onSuccess: (_, mediaId) => {
      const removeMediaFromProperty = (property) => {
        if (!property) return property
        return {
          ...property,
          media: (property.media || []).filter((mediaItem) => String(mediaItem.id) !== String(mediaId)),
        }
      }

      queryClient.setQueryData(PROPERTY_KEY(propertyId), removeMediaFromProperty)
      queryClient.setQueryData(PROPERTIES_KEY, (old = []) =>
        old.map((property) => (String(property.id) === String(propertyId) ? removeMediaFromProperty(property) : property))
      )
      queryClient.invalidateQueries({ queryKey: PROPERTY_KEY(propertyId) })
      queryClient.invalidateQueries({ queryKey: PROPERTIES_KEY })
      toast.success('Media deleted successfully!')
      onSuccess?.(mediaId)
    },

    onError: (err) => {
      const msg =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        Object.values(err.response?.data || {})[0]?.[0] ||
        'Failed to delete media. Please try again.'
      toast.error(msg)
    },
  })
}