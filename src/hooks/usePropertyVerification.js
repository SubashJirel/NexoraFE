import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getPropertyVerification, updatePropertyVerification, updatePropertyVerificationDocument } from '@/services/propertyService'
import { PROPERTY_KEY } from '@/hooks/useProperties'

export const VERIFICATION_KEY = (propertyId) => ['properties', propertyId, 'verification']

export function usePropertyVerification(propertyId) {
  return useQuery({
    queryKey: VERIFICATION_KEY(propertyId),
    queryFn: () => getPropertyVerification(propertyId),
    enabled: Boolean(propertyId),
  })
}

export function useUpdatePropertyVerification(propertyId) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload) => updatePropertyVerification(propertyId, payload),
    onSuccess: (data) => {
      queryClient.setQueryData(VERIFICATION_KEY(propertyId), data)
      queryClient.invalidateQueries({ queryKey: PROPERTY_KEY(propertyId) })
    },
  })
}

export function useUpdatePropertyVerificationDocument(propertyId) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ documentType, payload }) => updatePropertyVerificationDocument(propertyId, documentType, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: VERIFICATION_KEY(propertyId) })
      queryClient.invalidateQueries({ queryKey: PROPERTY_KEY(propertyId) })
    },
  })
}
