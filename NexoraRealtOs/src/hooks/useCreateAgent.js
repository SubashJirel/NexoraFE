import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createAgent } from '@/services/agentService'
import { AGENTS_KEY } from '@/hooks/useAgents'
import toast from 'react-hot-toast'

export function useCreateAgent({ onSuccess } = {}) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload) => createAgent(payload),

    onSuccess: (newAgent) => {
      queryClient.setQueryData(AGENTS_KEY, (old = []) => [newAgent, ...old])
      queryClient.invalidateQueries({ queryKey: AGENTS_KEY })
      toast.success('Agent added successfully!')
      onSuccess?.(newAgent)
    },

    onError: (err) => {
      const msg =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        Object.values(err.response?.data || {})[0]?.[0] ||
        'Failed to add agent. Please try again.'
      toast.error(msg)
    },
  })
}
