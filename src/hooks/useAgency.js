import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { getCurrentAgency, updateCurrentAgency } from '@/services/agencyService'

export const AGENCY_KEY = ['agency', 'me']

export function useCurrentAgency() {
  return useQuery({ queryKey: AGENCY_KEY, queryFn: getCurrentAgency })
}

export function useUpdateAgency() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: updateCurrentAgency,
    onSuccess: (agency) => {
      queryClient.setQueryData(AGENCY_KEY, agency)
      toast.success('Agency settings saved.')
    },
    onError: (error) => toast.error(apiError(error, 'Unable to save agency settings.')),
  })
}

function apiError(error, fallback) {
  const data = error.response?.data
  return data?.detail || data?.message || Object.values(data || {})[0]?.[0] || fallback
}
