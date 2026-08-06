import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { uploadPropertyMedia } from '@/services/propertyService'
import { PROPERTIES_KEY, PROPERTY_KEY } from '@/hooks/useProperties'

export function useUploadPropertyMedia(propertyId) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (file) => uploadPropertyMedia(propertyId, {
      file,
      media_type: file.type.startsWith('video/') ? 'video' : file.type === 'application/pdf' ? 'document' : 'image',
      title: file.name.replace(/\.[^.]+$/, ''),
      sort_order: 999,
      is_primary: false,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROPERTY_KEY(propertyId) })
      queryClient.invalidateQueries({ queryKey: PROPERTIES_KEY })
      toast.success('Media uploaded.')
    },
    onError: (error) => toast.error(error.response?.data?.detail || Object.values(error.response?.data || {})[0]?.[0] || 'Unable to upload media.'),
  })
}
