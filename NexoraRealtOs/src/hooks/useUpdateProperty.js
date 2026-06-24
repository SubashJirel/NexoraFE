import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateProperty } from '@/services/propertyService'
import { PROPERTIES_KEY, PROPERTY_KEY } from '@/hooks/useProperties'
import toast from 'react-hot-toast'

export function useUpdateProperty(propertyId, { onSuccess } = {}) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ propertyPayload }) => updateProperty(propertyId, propertyPayload),

    onSuccess: (updatedProperty) => {
      queryClient.setQueryData(PROPERTIES_KEY, (old = []) =>
        old.map((property) => (String(property.id) === String(updatedProperty.id) ? updatedProperty : property))
      )
      queryClient.setQueryData(PROPERTY_KEY(propertyId), updatedProperty)
      queryClient.invalidateQueries({ queryKey: PROPERTIES_KEY })
      queryClient.invalidateQueries({ queryKey: PROPERTY_KEY(propertyId) })
      toast.success('Property updated successfully!')
      onSuccess?.(updatedProperty)
    },

    onError: (err) => {
      const msg =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        Object.values(err.response?.data || {})[0]?.[0] ||
        'Failed to update property. Please try again.'
      toast.error(msg)
    },
  })
}
