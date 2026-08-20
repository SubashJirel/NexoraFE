import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { uploadPropertyMediaFiles } from '@/services/propertyService'
import { PROPERTIES_KEY, PROPERTY_KEY } from '@/hooks/useProperties'

export function useUploadPropertyMedia(propertyId) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input) => {
      const files = Array.isArray(input) ? input : [input]
      const property = queryClient.getQueryData(PROPERTY_KEY(propertyId))
      const currentMedia = property?.media || []
      const hasPrimaryImage = currentMedia.some(
        (item) => item.media_type === 'image' && item.is_primary
      )
      const nextSortOrder = currentMedia.reduce(
        (maximum, item) => Math.max(maximum, Number(item.sort_order) || 0),
        -1,
      ) + 1
      return uploadPropertyMediaFiles(propertyId, files, {
        sortOffset: nextSortOrder,
        makeFirstImagePrimary: !hasPrimaryImage,
      })
    },
    onSuccess: ({ uploaded, failures }) => {
      queryClient.invalidateQueries({ queryKey: PROPERTY_KEY(propertyId) })
      queryClient.invalidateQueries({ queryKey: PROPERTIES_KEY })
      if (uploaded.length) {
        toast.success(`${uploaded.length} media file${uploaded.length === 1 ? '' : 's'} uploaded.`)
      }
      if (failures.length) {
        toast.error(`${failures.length} media file${failures.length === 1 ? '' : 's'} failed to upload.`)
      }
    },
    onError: (error) => toast.error(error.response?.data?.detail || Object.values(error.response?.data || {})[0]?.[0] || 'Unable to upload media.'),
  })
}
