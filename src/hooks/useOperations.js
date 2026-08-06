import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import operationsService from '@/services/operationsService'

export function useResource(resource, params = {}, options = {}) {
  return useQuery({ queryKey: ['operations', resource, params], queryFn: () => operationsService.list(resource, params), ...options })
}

export function useCreateResource(resource) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ payload, multipart }) => operationsService.create(resource, payload, multipart),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['operations', resource] }); toast.success('Created successfully') },
    onError: (error) => toast.error(getApiError(error)),
  })
}

export function useUpdateResource(resource) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload, multipart }) => operationsService.update(resource, id, payload, multipart),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['operations', resource] }); toast.success('Saved successfully') },
    onError: (error) => toast.error(getApiError(error)),
  })
}

export function useDeleteResource(resource) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id) => operationsService.remove(resource, id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['operations', resource] }); toast.success('Deleted') },
    onError: (error) => toast.error(getApiError(error)),
  })
}

export function getApiError(error) {
  const data = error?.response?.data
  if (typeof data?.detail === 'string') return data.detail
  if (data && typeof data === 'object') {
    const first = Object.values(data)[0]
    return Array.isArray(first) ? first[0] : String(first)
  }
  return 'Something went wrong'
}
