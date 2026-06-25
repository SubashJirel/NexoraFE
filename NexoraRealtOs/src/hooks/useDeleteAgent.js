import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deleteAgent } from '@/services/agentService'
import { AGENTS_KEY } from '@/hooks/useAgents'
import toast from 'react-hot-toast'

export function useDeleteAgent(agentId, { onSuccess } = {}) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => deleteAgent(agentId),

    onSuccess: () => {
      queryClient.setQueryData(AGENTS_KEY, (old = []) =>
        old.filter((a) => String(a.id) !== String(agentId))
      )
      queryClient.invalidateQueries({ queryKey: AGENTS_KEY })
      toast.success('Agent removed successfully!')
      onSuccess?.()
    },

    onError: (err) => {
      const msg =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        Object.values(err.response?.data || {})[0]?.[0] ||
        'Failed to remove agent. Please try again.'
      toast.error(msg)
    },
  })
}
