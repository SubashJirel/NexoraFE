import { useQuery } from '@tanstack/react-query'
import { getAgents } from '@/services/agentService'

export const AGENTS_KEY = ['agents']

export function useAgents() {
  return useQuery({
    queryKey: AGENTS_KEY,
    queryFn:  getAgents,
    staleTime: 1000 * 60 * 5, // agents list rarely changes mid-session
  })
}
