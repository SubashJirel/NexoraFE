import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deleteProperty } from '@/services/propertyService'
import { PROPERTIES_KEY, PROPERTY_KEY } from '@/hooks/useProperties'
import toast from 'react-hot-toast'

export function useDeleteProperty(propertyId, { onSuccess } = {}) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => deleteProperty(propertyId),

    onSuccess: () => {
      queryClient.setQueryData(PROPERTIES_KEY, (old = []) =>
        old.filter((property) => String(property.id) !== String(propertyId))
      )
      queryClient.removeQueries({ queryKey: PROPERTY_KEY(propertyId) })
      queryClient.invalidateQueries({ queryKey: PROPERTIES_KEY })
      toast.success('Property deleted successfully!')
      onSuccess?.()
    },

    onError: (err) => {
      const msg =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        Object.values(err.response?.data || {})[0]?.[0] ||
        'Failed to delete property. Please try again.'
      toast.error(msg)
    },
  })
}