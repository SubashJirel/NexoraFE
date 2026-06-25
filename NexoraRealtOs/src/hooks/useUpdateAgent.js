import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateAgent } from '@/services/agentService'
import { AGENTS_KEY } from '@/hooks/useAgents'
import toast from 'react-hot-toast'

export function useUpdateAgent(agentId, { onSuccess } = {}) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload) => updateAgent(agentId, payload),

    onSuccess: (updated) => {
      queryClient.setQueryData(AGENTS_KEY, (old = []) =>
        old.map((a) => (String(a.id) === String(updated.id) ? updated : a))
      )
      queryClient.invalidateQueries({ queryKey: AGENTS_KEY })
      toast.success('Agent updated successfully!')
      onSuccess?.(updated)
    },

    onError: (err) => {
      const msg =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        Object.values(err.response?.data || {})[0]?.[0] ||
        'Failed to update agent. Please try again.'
      toast.error(msg)
    },
  })
}
