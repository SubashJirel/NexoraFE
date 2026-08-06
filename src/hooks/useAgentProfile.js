import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { getMyAgentProfile, updateMyAgentProfile } from '@/services/agentService'

export const AGENT_PROFILE_KEY = ['agents', 'me', 'profile']

export function useAgentProfile() {
  return useQuery({ queryKey: AGENT_PROFILE_KEY, queryFn: getMyAgentProfile })
}

export function useUpdateAgentProfile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: updateMyAgentProfile,
    onSuccess: (profile) => {
      queryClient.setQueryData(AGENT_PROFILE_KEY, profile)
      toast.success('Profile updated.')
    },
    onError: (error) => toast.error(
      error.response?.data?.detail || Object.values(error.response?.data || {})[0]?.[0] || 'Unable to update profile.'
    ),
  })
}
