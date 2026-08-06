import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { updatePropertyMedia } from '@/services/propertyService'
import { PROPERTIES_KEY, PROPERTY_KEY } from '@/hooks/useProperties'

export function useUpdatePropertyMedia(propertyId) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ mediaId, payload }) => updatePropertyMedia(mediaId, payload),
    onSuccess: (updated) => {
      const replaceMedia = (property) => property ? {
        ...property,
        media: (property.media || []).map((item) => String(item.id) === String(updated.id) ? updated : item),
      } : property
      queryClient.setQueryData(PROPERTY_KEY(propertyId), replaceMedia)
      queryClient.invalidateQueries({ queryKey: PROPERTY_KEY(propertyId) })
      queryClient.invalidateQueries({ queryKey: PROPERTIES_KEY })
      toast.success('Media updated.')
    },
    onError: (error) => toast.error(error.response?.data?.detail || 'Unable to update media.'),
  })
}
