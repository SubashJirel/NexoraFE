import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { PROPERTIES_KEY, PROPERTY_KEY } from '@/hooks/useProperties'
import { updatePropertyPublication } from '@/services/propertyService'

const publishableStatuses = new Set(['available', 'reserved', 'under_negotiation'])

function replaceProperty(collection, updatedProperty) {
  if (!Array.isArray(collection)) return collection
  return collection.map((property) => (
    String(property.id) === String(updatedProperty.id) ? updatedProperty : property
  ))
}

function errorMessage(error) {
  const data = error.response?.data
  if (typeof data?.detail === 'string') return data.detail
  const first = data && Object.values(data)[0]
  if (Array.isArray(first)) return first[0]
  if (typeof first === 'string') return first
  return 'Could not update website publication. Please try again.'
}

export function usePropertyPublication(property) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (isPublished) => updatePropertyPublication(
      property.id,
      isPublished,
      property.status,
    ),
    onMutate: async (isPublished) => {
      await queryClient.cancelQueries({ queryKey: PROPERTIES_KEY })
      const previousLists = queryClient.getQueriesData({ queryKey: PROPERTIES_KEY })
      const optimistic = {
        ...property,
        is_published: isPublished,
        status: isPublished
          ? (publishableStatuses.has(property.status) ? property.status : 'available')
          : 'draft',
      }
      queryClient.setQueriesData({ queryKey: PROPERTIES_KEY }, (current) => (
        replaceProperty(current, optimistic)
      ))
      queryClient.setQueryData(PROPERTY_KEY(property.id), optimistic)
      return { previousLists }
    },
    onError: (error, _isPublished, context) => {
      context?.previousLists?.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data)
      })
      toast.error(errorMessage(error))
    },
    onSuccess: (updatedProperty) => {
      queryClient.setQueriesData({ queryKey: PROPERTIES_KEY }, (current) => (
        replaceProperty(current, updatedProperty)
      ))
      queryClient.setQueryData(PROPERTY_KEY(property.id), updatedProperty)
      toast.success(updatedProperty.is_published
        ? 'Property published to the website.'
        : 'Property removed from the website.')
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: PROPERTIES_KEY })
      queryClient.invalidateQueries({ queryKey: PROPERTY_KEY(property.id) })
    },
  })
}
